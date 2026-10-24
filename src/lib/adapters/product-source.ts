'use client'

import { Product } from '@/lib/types'
import { products as seedProducts } from '@/lib/data/products'
import { useAdminProductStore } from '@/lib/store/admin-products'

/**
 * Get products from the unified source.
 * On the client, returns products from the admin store (which may have been edited).
 * Falls back to seed data if the store hasn't been initialized yet.
 */
export function useProducts(): Product[] {
  const storeProducts = useAdminProductStore((s) => s.products)
  const initialized = useAdminProductStore((s) => s.initialized)
  return initialized && storeProducts.length > 0 ? storeProducts : seedProducts
}

/**
 * Get a single product by slug from the unified source.
 */
export function useProductBySlug(slug: string): Product | null {
  const products = useProducts()
  return products.find((p) => p.slug === slug) || null
}

/**
 * Get a single product by ID from the unified source.
 */
export function useProductById(id: string): Product | null {
  const products = useProducts()
  return products.find((p) => p.id === id) || null
}

/**
 * Server-side fallback: returns seed products.
 * Use this in server components where hooks can't be called.
 */
export function getServerProducts(): Product[] {
  return seedProducts
}
