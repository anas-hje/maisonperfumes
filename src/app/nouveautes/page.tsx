'use client'

import { useProducts } from '@/lib/adapters/product-source'
import ProductCard from '@/components/product/ProductCard'

export default function NouveautesPage() {
  const products = useProducts()

  const newProducts = products.filter(p => p.isNewArrival)
  const displayProducts = newProducts.length > 0 
    ? newProducts 
    : [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12)

  return (
    <div className="min-h-screen bg-graphite text-light font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl text-light uppercase tracking-widest mb-4">
            Nouveautés
          </h1>
          <p className="text-lg text-quartz font-light">Découvrez nos dernières arrivées</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
