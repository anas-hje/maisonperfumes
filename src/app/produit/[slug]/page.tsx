import type { Metadata } from 'next'
import { products } from '@/lib/data/products'
import { categories } from '@/lib/data/categories'
import { getLowestPrice } from '@/lib/utils'
import ProductDetail from './ProductDetail'

// Pre-render every catalogue product at build time. Slugs outside the catalogue
// (e.g. a product an admin created locally) still render on demand.
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)

  // Slugs outside the catalogue stay renderable on purpose, so an admin can preview a
  // product they just created locally. They must not be indexable though: without a
  // backend the server can't confirm such a product exists, so the page would otherwise
  // be a soft 404 (not-found markup served with a 200).
  if (!product) {
    return { title: 'Produit introuvable', robots: { index: false, follow: false } }
  }

  const categoryName = categories.find((c) => c.slug === product.category)?.name ?? product.category
  const description = `${product.brand} — ${product.name}. ${product.description}`.slice(0, 160)

  return {
    title: `${product.name} — ${product.brand}`,
    description,
    alternates: { canonical: `/produit/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} — ${product.brand}`,
      description,
      url: `/produit/${product.slug}`,
      images: product.images?.length ? product.images : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${product.brand}`,
      description,
    },
    other: { 'product:category': categoryName },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          // Structured data is generated from our own catalogue, not user input.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              brand: { '@type': 'Brand', name: product.brand },
              description: product.description,
              sku: product.variants[0]?.sku,
              image: product.images,
              aggregateRating: product.reviewCount
                ? {
                    '@type': 'AggregateRating',
                    ratingValue: product.rating,
                    reviewCount: product.reviewCount,
                  }
                : undefined,
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'MAD',
                lowPrice: getLowestPrice(product),
                availability: product.variants.some((v) => v.stock > 0)
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              },
            }),
          }}
        />
      )}
      <ProductDetail slug={slug} />
    </>
  )
}
