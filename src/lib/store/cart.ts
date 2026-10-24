'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '../types'

interface CartStore {
  items: CartItem[]
  addItem: (productId: string, variantId: string, quantity?: number) => void
  removeItem: (productId: string, variantId: string) => void
  updateQuantity: (productId: string, variantId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getTotal: (products: Product[]) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, variantId, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === productId && item.variantId === variantId
          )

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId && item.variantId === variantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { productId, variantId, quantity }],
          }
        })
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productId === productId && item.variantId === variantId)
          ),
        }))
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotal: (products: Product[]) => {
        return get().items.reduce((total, item) => {
          const product = products.find((p) => p.id === item.productId)
          if (!product) return total
          const variant = product.variants.find((v) => v.id === item.variantId)
          if (!variant) return total
          return total + variant.price * item.quantity
        }, 0)
      },
    }),
    {
      name: 'maison-cart',
      skipHydration: true,
    }
  )
)
