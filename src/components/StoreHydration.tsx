'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useAdminProductStore } from '@/lib/store/admin-products'
import { useAdminContentStore } from '@/lib/store/admin-content'
import { useAdminSettingsStore } from '@/lib/store/admin-settings'
import { products as seedProducts } from '@/lib/data/products'
import type { Product } from '@/lib/types'

// Rehydrates the stores that are still client-side. Cart and wishlist belong in the
// browser; the CMS content and settings stores are pending the same move to the
// database that orders have already had (see MAISON_LAUNCH_PLAN.md).
export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useWishlistStore.persist.rehydrate()
    useAdminProductStore.persist.rehydrate()
    useAdminContentStore.persist.rehydrate()
    useAdminSettingsStore.persist.rehydrate()

    // Load the catalogue from the database once rehydration has settled. The static
    // seed is only a fallback for when the API can't be reached — it carries the old
    // /images/products/*.jpg paths that were never backed by real files.
    let cancelled = false

    const timer = setTimeout(async () => {
      const productStore = useAdminProductStore.getState()

      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const { products } = (await response.json()) as { products: Product[] }
        if (!cancelled && products.length > 0) {
          // Replace rather than merge: initializeProducts preserves whatever is already
          // in localStorage, which would keep a stale catalogue (and its dead image
          // paths) on every return visit.
          productStore.setProducts(products)
          return
        }
      } catch (error) {
        console.error('[StoreHydration] Falling back to seed catalogue', error)
      }

      if (!cancelled && !productStore.initialized) {
        productStore.initializeProducts(seedProducts)
      }
    }, 50)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return null
}
