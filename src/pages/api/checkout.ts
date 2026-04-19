import type { APIRoute } from 'astro';
import { stripe } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const cartItems: { slug: string; qty: number }[] = body.items || [];
    if (!cartItems.length) return new Response(JSON.stringify({ error: 'empty cart' }), { status: 400 });

    const { data: products } = await supabase
      .from('matcraft_products')
      .select('*')
      .in('slug', cartItems.map(i => i.slug));

    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ error: 'no products' }), { status: 400 });
    }

    const bySlug = new Map(products.map(p => [p.slug, p]));
    const line_items = cartItems
      .map(ci => {
        const p = bySlug.get(ci.slug);
        if (!p) return null;
        return {
          price_data: {
            currency: (p.currency || 'GBP').toLowerCase(),
            product_data: {
              name: p.name,
              description: p.description || undefined,
              images: p.image_url ? [p.image_url] : undefined,
              metadata: { slug: p.slug },
            },
            unit_amount: p.price_pence,
          },
          quantity: Math.max(1, Math.min(10, ci.qty)),
        };
      })
      .filter(Boolean) as any[];

    const origin = request.headers.get('origin') || import.meta.env.PUBLIC_SITE_URL || 'https://matcraft-a3x7.vercel.app';

    const subtotal = line_items.reduce((s: number, li: any) => s + (li.price_data.unit_amount * li.quantity), 0);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: { allowed_countries: ['GB', 'US', 'CA', 'IE', 'FR', 'DE', 'NL', 'BE', 'ES', 'IT', 'AU', 'NZ', 'SE', 'NO', 'DK', 'FI'] },
      shipping_options: subtotal >= 3000
        ? [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 0, currency: 'gbp' }, display_name: 'Free UK shipping' } }]
        : [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 499, currency: 'gbp' }, display_name: 'Standard shipping' } }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { items: JSON.stringify(cartItems) },
    });

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('checkout error', err);
    return new Response(JSON.stringify({ error: err.message || 'checkout failed' }), { status: 500 });
  }
};
