'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import ProductImage from '@/components/ui/ProductImage'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'
import { useProducts } from '@/lib/adapters/product-source'
import { formatPrice } from '@/lib/utils'

export default function CartPanel() {
  const { isCartOpen, closeCart } = useUIStore()
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()
  const products = useProducts()
  
  const total = getTotal(products)

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-graphite/80 z-50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-obsidian border-l border-white/8 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/8 flex items-center justify-between">
              <h2 className="font-display text-2xl text-light">Votre Panier</h2>
              <button
                onClick={closeCart}
                className="p-2 text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber"
                aria-label="Fermer le panier"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-quartz/30">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                  </svg>
                  <p className="text-quartz">Votre panier est vide.</p>
                  <button
                    onClick={closeCart}
                    className="text-amber hover:text-light transition-colors underline underline-offset-4 mt-4 focus-visible:outline-2 focus-visible:outline-amber"
                  >
                    Continuer mes achats
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => {
                    const product = products.find((p) => p.id === item.productId)
                    if (!product) return null
                    const variant = product.variants.find((v) => v.id === item.variantId)
                    if (!variant) return null
                    
                    const image = product.images?.[0]

                    return (
                      <motion.div
                        key={`${item.productId}-${item.variantId}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4"
                      >
                        {/* Product image */}
                        <div
                          className="w-20 h-20 rounded bg-gradient-to-br from-amber/5 to-brass/10 border border-white/8 flex items-center justify-center shrink-0 relative overflow-hidden"
                        >
                          <ProductImage
                            src={image}
                            alt={product.name}
                            fallbackLabel={product.brand.charAt(0)}
                            fallbackLabelClassName="text-2xl"
                            sizes="80px"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-quartz/70 uppercase tracking-wider small-caps">
                            {product.brand}
                          </p>
                          <Link href={`/produit/${product.slug}`} onClick={closeCart} className="text-sm text-light hover:text-amber transition-colors truncate block">
                            {product.name}
                          </Link>
                          <p className="text-xs text-quartz mt-0.5">{variant.label}</p>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-2 border border-white/10 rounded">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.variantId, item.quantity - 1)
                                }
                                className="w-8 h-8 flex items-center justify-center text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber"
                                aria-label="Diminuer la quantité"
                              >
                                −
                              </button>
                              <span className="text-sm text-light w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.variantId, item.quantity + 1)
                                }
                                disabled={item.quantity >= variant.stock}
                                className="w-8 h-8 flex items-center justify-center text-quartz hover:text-amber transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-amber"
                                aria-label="Augmenter la quantité"
                              >
                                +
                              </button>
                            </div>

                            {/* Price */}
                            <span className="text-sm font-medium text-amber">
                              {formatPrice(variant.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="p-1 text-quartz/60 hover:text-red-500 transition-colors self-start focus-visible:outline-2 focus-visible:outline-amber"
                          aria-label="Retirer du panier"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/8 bg-graphite/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-quartz">Sous-total</span>
                  <span className="text-xl font-medium text-light">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-xs text-quartz/70">
                  Frais de livraison calculés à l&apos;étape suivante
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-amber text-white py-4 rounded font-medium flex justify-center hover:bg-brass transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber uppercase tracking-widest text-xs"
                >
                  Commander
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber uppercase tracking-wider text-xs"
                >
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
