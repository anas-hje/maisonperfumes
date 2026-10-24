'use client'

import { useProducts } from '@/lib/adapters/product-source'
import ProductCard from '@/components/product/ProductCard'

export default function BestsellersPage() {
  const products = useProducts()
  
  const bestsellers = products.filter(p => p.tags.includes('best-seller') || p.tags.includes('bestseller'))
  
  let displayProducts = [...bestsellers]
  
  if (displayProducts.length < 4) {
    const topRated = [...products]
      .filter(p => !displayProducts.find(b => b.id === p.id))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4 - displayProducts.length)
      
    displayProducts = [...displayProducts, ...topRated]
  }

  return (
    <div className="min-h-screen bg-graphite text-light font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl text-light uppercase tracking-widest mb-4">
            Bestsellers
          </h1>
          <p className="text-lg text-quartz font-light">Les favoris de nos clients</p>
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
