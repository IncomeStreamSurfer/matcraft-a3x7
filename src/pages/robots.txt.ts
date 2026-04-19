import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') || 'https://matcraft-a3x7.vercel.app';
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /cart\nDisallow: /checkout\nSitemap: ${base}/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
