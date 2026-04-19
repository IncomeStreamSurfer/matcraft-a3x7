import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url!, key!, {
  auth: { persistSession: false },
});

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string | null;
  price_pence: number;
  currency: string;
  image_url: string | null;
  gallery: string[];
  category: string | null;
  collections: string[];
  features: { title: string; body: string }[];
  specs: Record<string, string>;
  badge: string | null;
  is_featured: boolean;
  in_stock: boolean;
};

export type Content = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  excerpt: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  cover_image_url: string | null;
  tags: string[];
};

export const formatPrice = (pence: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(pence / 100);

export async function getProducts() {
  const { data } = await supabase.from('matcraft_products').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  return (data || []) as Product[];
}

export async function getProductBySlug(slug: string) {
  const { data } = await supabase.from('matcraft_products').select('*').eq('slug', slug).maybeSingle();
  return data as Product | null;
}

export async function getProductsByCollection(collection: string) {
  const { data } = await supabase.from('matcraft_products').select('*').contains('collections', [collection]);
  return (data || []) as Product[];
}

export async function getPublishedPosts() {
  const { data } = await supabase.from('matcraft_content').select('*').not('published_at', 'is', null).order('published_at', { ascending: false });
  return (data || []) as Content[];
}

export async function getPostBySlug(slug: string) {
  const { data } = await supabase.from('matcraft_content').select('*').eq('slug', slug).not('published_at', 'is', null).maybeSingle();
  return data as Content | null;
}
