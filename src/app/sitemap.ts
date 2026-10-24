import type { MetadataRoute } from 'next';
// Import the seed data directly rather than via product-source.ts: that module is
// marked 'use client' (it also exposes client hooks backed by the admin store), which
// taints every export — including getServerProducts — as client-only and unusable here.
import { products } from '@/lib/data/products';
import { categories } from '@/lib/data/categories';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Static, publicly indexable content pages. Transactional/account pages (checkout,
// panier, compte, wishlist, suivi-commande) and /admin are intentionally excluded.
const staticRoutes = [
  '',
  '/a-propos',
  '/bestsellers',
  '/boutiques',
  '/cadeaux',
  '/contact',
  '/faq',
  '/livraison',
  '/nouveautes',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/categorie/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/produit/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
