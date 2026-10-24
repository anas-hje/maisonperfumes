'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Badge from '@/components/ui/Badge'
import ProductImage from '@/components/ui/ProductImage'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useCartStore } from '@/lib/store/cart'
import { Product } from '@/lib/types'
import { formatPriceRange, hasDiscount } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleItem } = useWishlistStore()
  const addItem = useCartStore((state) => state.addItem)
  const wishlisted = isInWishlist(product.id)
  

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product.id)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.variants.length > 0) {
      addItem(product.id, product.variants[0].id, 1)
    }
  }

  const inStock = product.variants.some((v) => v.stock > 0)
  const isSale = product.isOnSale || hasDiscount(product)
  const firstVariant = product.variants[0]

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col relative"
    >
      <Link
        href={`/produit/${product.slug}`}
        className="block relative aspect-[4/5] overflow-hidden rounded-xl bg-obsidian mb-4 border border-white/8 transition-all duration-500 group-hover:border-amber/35 group-hover:shadow-[0_24px_60px_-24px_rgba(217,164,65,0.45)] focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
      >
        {/* Product image */}
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          fallbackLabel={product.brand.charAt(0)}
          fallbackLabelClassName="text-7xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Darkens the lower half so the white product text stays readable over any
            photograph, and deepens on hover to lift the quick-add button. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-graphite/85 via-graphite/15 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95"
          aria-hidden="true"
        />

        {/* Sheen that sweeps across the card on hover. */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-full motion-reduce:hidden"
          aria-hidden="true"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!inStock && <Badge variant="soldout">Épuisé</Badge>}
          {product.isNewArrival && inStock && <Badge variant="new">Nouveau</Badge>}
          {isSale && inStock && firstVariant?.compareAtPrice && (
            <Badge variant="sale">
              -{Math.round((1 - firstVariant.price / firstVariant.compareAtPrice) * 100)}%
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2.5 rounded-full glass-surface backdrop-blur-md shadow-sm border border-white/8 text-quartz hover:text-amber transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:outline-2 focus-visible:outline-amber"
          aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className={wishlisted ? 'text-amber' : ''}
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z" />
          </svg>
        </button>

        {/* Quick Add Button */}
        {inStock && (
          <div className="absolute bottom-3 left-3 right-3 translate-y-[150%] group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              className="w-full glass-surface-strong text-light font-medium py-2.5 rounded-lg shadow-lg border border-white/15 hover:bg-amber hover:text-graphite hover:border-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber text-sm uppercase tracking-[0.15em]"
            >
              Ajout rapide
            </button>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-1 px-1">
        <span className="text-[11px] font-medium tracking-[0.15em] text-quartz/70 uppercase small-caps">
          {product.brand}
        </span>
        <Link
          href={`/produit/${product.slug}`}
          className="text-lg font-display text-light hover:text-amber transition-colors line-clamp-1 focus-visible:outline-2 focus-visible:outline-amber"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-amber">
            {formatPriceRange(product)}
          </span>
          {isSale && firstVariant?.compareAtPrice && (
            <span className="text-xs text-quartz/50 line-through">
              {firstVariant.compareAtPrice} MAD
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                className={
                  i < Math.floor(product.rating || 0)
                    ? 'text-amber'
                    : 'text-quartz/20'
                }
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className="text-[11px] text-quartz/60">({product.reviewCount || 0})</span>
        </div>
      </div>
    </motion.div>
  )
}
