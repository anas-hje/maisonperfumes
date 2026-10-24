'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import ProductImage from '@/components/ui/ProductImage'
import { useUIStore } from '@/lib/store/ui'
import { products } from '@/lib/data/products'
import { Product } from '@/lib/types'
import { formatPriceRange } from '@/lib/utils'

function SearchResultThumbnail({ product }: { product: Product }) {
  return (
    <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
      <ProductImage
        src={product.images?.[0]}
        alt={product.name}
        fallbackLabel={product.brand.charAt(0)}
        fallbackLabelClassName="text-xl"
        sizes="64px"
      />
    </div>
  )
}

export default function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    const lower = q.toLowerCase()
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.tags.some((t) => t.toLowerCase().includes(lower))
    )
    setResults(filtered)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, handleSearch])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    if (isSearchOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isSearchOpen, closeSearch])

  // Reset on close so the field is blank the next time it opens, without a visible
  // flash during the close animation (which resetting on open would cause instead).
  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('') // eslint-disable-line react-hooks/set-state-in-effect
      setResults([])
    }
  }, [isSearchOpen])

  const popularTerms = ['Dior', 'Oud', 'Niche', 'Sérum', 'Argan', 'Coffret']

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-graphite/95 backdrop-blur-xl overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto w-full px-6 pt-12">
            {/* Close button */}
            <button
              onClick={closeSearch}
              className="absolute top-6 right-6 p-2 text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber"
              aria-label="Fermer la recherche"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Search input */}
            <div className="relative border-b border-quartz/20 pb-4 mt-8">
              <svg
                className="absolute left-0 bottom-6 text-quartz/40"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un parfum, une marque..."
                className="w-full bg-transparent border-none text-2xl lg:text-4xl font-display text-light focus:outline-none pl-10 placeholder-quartz/30"
              />
            </div>

            {/* Results / Popular terms */}
            <div className="mt-10 pb-20">
              {query.trim() ? (
                <>
                  <p className="text-sm text-quartz/50 mb-6">
                    {results.length} résultat{results.length !== 1 ? 's' : ''} pour &ldquo;{query}&rdquo;
                  </p>
                  {results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.slice(0, 8).map((product) => (
                        <Link
                          key={product.id}
                          href={`/produit/${product.slug}`}
                          onClick={closeSearch}
                          className="flex gap-4 p-4 rounded-lg bg-obsidian/50 border border-white/5 hover:border-amber/30 transition-colors group focus-visible:outline-2 focus-visible:outline-amber"
                        >
                          <SearchResultThumbnail product={product} />
                          <div className="min-w-0">
                            <p className="text-[11px] text-quartz/50 uppercase tracking-wider">
                              {product.brand}
                            </p>
                            <p className="text-sm text-light group-hover:text-amber transition-colors truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-amber mt-1">
                              {formatPriceRange(product)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-quartz/50">Aucun résultat trouvé.</p>
                      <p className="text-sm text-quartz/30 mt-2">
                        Essayez avec d&apos;autres termes de recherche.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <h3 className="text-xs font-medium text-quartz/40 uppercase tracking-[0.2em] mb-6">
                    Recherches Populaires
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {popularTerms.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-5 py-2.5 rounded-full border border-white/10 text-quartz hover:border-amber/50 hover:text-amber transition-colors text-sm focus-visible:outline-2 focus-visible:outline-amber"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
