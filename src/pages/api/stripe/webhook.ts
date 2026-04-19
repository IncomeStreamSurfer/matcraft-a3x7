import type { APIRoute } from 'astro';
import { stripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabase';
import { sendEmail } from '../../../lib/email';

export const prerender = false;
export const config = { runtime: 'nodejs' };

export const POST: APIRoute = async ({ request }) => {
  const sig = request.headers.get('stripe-signature');
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  const raw = await request.text();

  let event: any;
  try {
    if (sig && secret) {
      event = stripe.webhooks.constructEvent(raw, sig, secret);
    } else {
      event = JSON.parse(raw);
    }
  } catch (e: any) {
    console.error('webhook verify failed', e.message);
    return new Response(`Webhook Error: ${e.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    try {
      const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
      const items = (full.line_items?.data || []).map((li: any) => ({
        description: li.description,
        quantity: li.quantity,
        amount_total: li.amount_total,
      }));

      await supabase.from('matcraft_orders').insert({
        stripe_session_id: full.id,
        customer_email: full.customer_details?.email,
        customer_name: full.customer_details?.name,
        amount_total: full.amount_total,
        currency: full.currency,
        line_items: items,
        status: 'paid',
      });

      if (full.customer_details?.email) {
        const rows = items.map((it: any) => `<tr><td style="padding:8px 0">${it.description}</td><td style="padding:8px 0;text-align:right">×${it.quantity}</td><td style="padding:8px 0;text-align:right">£${(it.amount_total/100).toFixed(2)}</td></tr>`).join('');
        await sendEmail({
          to: full.customer_details.email,
          subject: 'Your MatCraft order is confirmed',
          html: `
            <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#0a0a0a">
              <h1 style="font-size:22px">Thanks for your order 🎉</h1>
              <p>Hi ${full.customer_details.name || 'there'}, your MatCraft mousemat order is confirmed and heading into production. You'll get a tracking link as soon as it ships.</p>
              <table style="width:100%;border-top:1px solid #e6e3dc;border-bottom:1px solid #e6e3dc;margin:16px 0">${rows}</table>
              <p style="font-weight:600">Total: £${((full.amount_total||0)/100).toFixed(2)}</p>
              <p style="color:#6b6b6b;font-size:13px;margin-top:24px">Questions? Reply to this email or visit our <a href="${import.meta.env.PUBLIC_SITE_URL}/faq">FAQ</a>.</p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error('order persist error', err);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
