const RESEND_API = 'https://api.resend.com/emails';

export async function sendEmail(opts: { to: string; subject: string; html: string; from?: string }) {
  const from = opts.from || 'MatCraft <onboarding@resend.dev>';
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
  });
  return res.json();
}
