# MatCraft — Premium Mousemats Store

A production-grade Astro ecommerce store built for MatCraft. Sells cloth, hard, RGB and custom mousemats with a dynamic-pricing Stripe checkout, Resend order confirmations, and a Harbor-ready `matcraft_content` Supabase table for future SEO articles.

## Stack

- **Framework**: Astro 5 (server output) with the Vercel adapter
- **Styling**: Tailwind v4 via `@tailwindcss/vite`
- **Database**: Supabase (tables: `matcraft_products`, `matcraft_orders`, `matcraft_subscribers`, `matcraft_contact_submissions`, `matcraft_content`)
- **Payments**: Stripe Checkout — prices live in Supabase and are built into `price_data` line-items at request time
- **Email**: Resend (order confirmations + contact acknowledgements)
- **SEO**: `@astrojs/sitemap`, JSON-LD on every page, semantic HTML, canonical URLs

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage with hero, bestsellers, collections, craft story |
| `/shop` | Full product catalogue |
| `/collections` | Collection hub |
| `/collections/[slug]` | One of 8 collections: gaming, desk, extended, xl, small, custom, rgb, hard |
| `/products/[slug]` | Dynamic product detail page (from Supabase) |
| `/cart` | Local-storage cart + Stripe checkout launcher |
| `/checkout/success` | Post-payment confirmation |
| `/about`, `/contact`, `/faq`, `/shipping` | Info pages |
| `/blog` + `/blog/[slug]` | Dynamic blog index (empty state rendered until Harbor writes into `matcraft_content`) |
| `/api/checkout` | POST — creates a Stripe Checkout Session |
| `/api/stripe/webhook` | Handles `checkout.session.completed` → writes an order row + sends a Resend email |
| `/api/subscribe` | Email capture for the footer newsletter |
| `/api/contact` | Contact form handler |
| `/robots.txt` | Dynamic robots.txt |

## Environment variables

```
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
PUBLIC_SITE_URL
```

All are set on the Vercel project already.

## Next steps (manual)

- Connect a custom domain in Vercel (Project Settings → Domains) and update `PUBLIC_SITE_URL`.
- Verify a custom sending domain in Resend (Domains → Add) and replace `onboarding@resend.dev` inside `src/lib/email.ts`.
- Flip the Stripe account to live mode + add live keys to Vercel when you're ready to take real payments.
- Harbor will populate `matcraft_content` automatically when you run the Writer.
