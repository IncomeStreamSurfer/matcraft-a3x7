import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendEmail } from '../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const fd = await request.formData();
  const name = String(fd.get('name') || '');
  const email = String(fd.get('email') || '');
  const subject = String(fd.get('subject') || '');
  const message = String(fd.get('message') || '');
  if (!name || !email || !message) return new Response('Missing fields', { status: 400 });

  await supabase.from('matcraft_contact_submissions').insert({ name, email, subject, message });
  try {
    await sendEmail({
      to: email,
      subject: 'We got your message — MatCraft',
      html: `<div style="font-family:Inter,sans-serif;max-width:560px">
        <h2>Thanks ${name} — we're on it</h2>
        <p>Your message landed in our inbox. We reply within one working day (usually much sooner).</p>
        <p style="color:#6b6b6b;font-size:13px;border-top:1px solid #e6e3dc;padding-top:12px;margin-top:20px">Your message:<br/>${message.replace(/</g, '&lt;')}</p>
      </div>`,
    });
  } catch (e) { console.error('contact email', e); }
  return redirect('/contact?sent=1');
};
