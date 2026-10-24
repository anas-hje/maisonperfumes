'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/types'

interface AdminProductStore {
  products: Product[]
  initialized: boolean
  initializeProducts: (seedProducts: Product[]) => void
  /** Replace the catalogue outright with the server's copy (the source of truth). */
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProductById: (id: string) => Product | undefined
  getProductBySlug: (slug: string) => Product | undefined
}

export const useAdminProductStore = create<AdminProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      initialized: false,
      initializeProducts: (seedProducts) => {
        const existing = get().products
        if (existing.length > 0) {
          // Already has data (from localStorage) — only add new seed products
          const existingIds = new Set(existing.map((p) => p.id))
          const newSeedProducts = seedProducts.filter((p) => !existingIds.has(p.id))
          if (newSeedProducts.length > 0) {
            set({ products: [...existing, ...newSeedProducts], initialized: true })
          } else {
            set({ initialized: true })
          }
        } else {
          set({ products: seedProducts, initialized: true })
        }
      },
      setProducts: (products) => {
        set({ products, initialized: true })
      },
      addProduct: (product) => {
        set((state) => ({ products: [...state.products, product] }))
      },
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p))
        }))
      },
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        }))
      },
      getProductById: (id) => {
        return get().products.find((p) => p.id === id)
      },
      getProductBySlug: (slug) => {
        return get().products.find((p) => p.slug === slug)
      }
    }),
    {
      name: 'maison-admin-products',
      skipHydration: true,
    }
  )
)
