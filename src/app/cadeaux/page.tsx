'use client'

import { useProducts } from '@/lib/adapters/product-source'
import ProductCard from '@/components/product/ProductCard'
import Link from 'next/link'

export default function CadeauxPage() {
  const products = useProducts()

  const featured = products.filter(p => p.isFeatured).slice(0, 4)
  const pourElle = products.filter(p => p.gender === 'femme').slice(0, 4)
  const pourLui = products.filter(p => p.gender === 'homme').slice(0, 4)

  return (
    <div className="min-h-screen bg-graphite text-light font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl text-light uppercase tracking-widest mb-4">
            Idées Cadeaux
          </h1>
          <p className="text-lg text-quartz font-light">Trouvez le cadeau parfait</p>
        </div>

        <div className="space-y-24">
          {/* Coffrets Découverte (Featured) */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl text-light uppercase tracking-widest">
                Coffrets Découverte
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Pour Elle */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl text-light uppercase tracking-widest">
                Pour Elle
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {pourElle.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Pour Lui */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl text-light uppercase tracking-widest">
                Pour Lui
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {pourLui.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-32 bg-obsidian border border-white/10 p-12 text-center rounded-lg shadow-sm">
          <h3 className="font-display text-2xl text-light uppercase tracking-widest mb-4">
            Besoin d&apos;aide pour choisir ?
          </h3>
          <p className="text-quartz mb-8 max-w-lg mx-auto">
            Nos experts en parfumerie sont à votre disposition pour vous guider et vous aider à 
            trouver la fragrance idéale.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-amber hover:bg-brass text-white px-8 py-4 uppercase tracking-widest text-sm transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  )
}
