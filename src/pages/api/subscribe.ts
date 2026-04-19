import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const ct = request.headers.get('content-type') || '';
  let email = '';
  if (ct.includes('application/json')) {
    const b = await request.json();
    email = b.email;
  } else {
    const fd = await request.formData();
    email = String(fd.get('email') || '');
  }
  if (!email) return new Response(JSON.stringify({ error: 'missing email' }), { status: 400 });
  const { error } = await supabase.from('matcraft_subscribers').insert({ email, source: 'footer' });
  if (error && !error.message.includes('duplicate')) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (ct.includes('application/json')) return new Response(JSON.stringify({ ok: true }), { status: 200 });
  return redirect('/?subscribed=1');
};
