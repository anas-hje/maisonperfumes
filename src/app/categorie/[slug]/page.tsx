import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { categories } from '@/lib/data/categories'
import CategoryContent from './CategoryContent'

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }))
}

// The category list is static and fully known at build time, so anything outside it
// is a genuine 404. Next resolves this at the routing layer, which is what actually
// yields a 404 status — calling notFound() during render only produces not-found
// markup served with a 200 (a soft 404).
export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)

  // Unreachable given dynamicParams = false; kept to narrow the type.
  if (!category) {
    notFound()
  }

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/categorie/${category.slug}` },
    openGraph: {
      type: 'website',
      title: `${category.name} — Maison`,
      description: category.description,
      url: `/categorie/${category.slug}`,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)

  // Unreachable given dynamicParams = false; kept to narrow the type.
  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-graphite text-quartz font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-display text-4xl md:text-5xl text-light uppercase tracking-widest mb-4">
          {category.name}
        </h1>
        <p className="text-quartz/70 font-light mb-12 max-w-2xl">
          {category.description}
        </p>
        <CategoryContent categorySlug={slug} />
      </div>
    </div>
  )
}
