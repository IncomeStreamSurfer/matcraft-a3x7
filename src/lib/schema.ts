export const SITE_NAME = 'MatCraft';
export const SITE_TAGLINE = 'Precision surfaces for every setup.';

export function siteUrl(path = '/') {
  const base = import.meta.env.PUBLIC_SITE_URL || 'https://matcraft-a3x7.vercel.app';
  return new URL(path, base).toString();
}

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: siteUrl('/'),
  logo: siteUrl('/favicon.svg'),
  sameAs: [],
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: siteUrl('/'),
  description: SITE_TAGLINE,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl('/shop')}?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbSchema = (crumbs: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: siteUrl(c.path),
  })),
});

export const productSchema = (p: {
  name: string; description: string; image: string; price_pence: number; currency: string; slug: string; in_stock: boolean;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.name,
  description: p.description,
  image: p.image,
  offers: {
    '@type': 'Offer',
    price: (p.price_pence / 100).toFixed(2),
    priceCurrency: p.currency,
    availability: p.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: siteUrl(`/products/${p.slug}`),
  },
});

export const collectionSchema = (name: string, url: string, items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  url,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((i, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: i.name,
      url: i.url,
    })),
  },
});

export const faqSchema = (qa: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: qa.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
