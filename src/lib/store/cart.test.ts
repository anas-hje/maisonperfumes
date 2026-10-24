import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cart'
import type { Product } from '@/lib/types'

const product: Product = {
  id: 'p1',
  slug: 'test-parfum',
  name: 'Test Parfum',
  brand: 'Maison',
  description: '',
  category: 'parfums',
  subcategory: 'homme',
  gender: 'homme',
  variants: [
    { id: 'v50', label: '50ml', price: 500, stock: 5, sku: 'SKU-50' },
    { id: 'v100', label: '100ml', price: 900, stock: 2, sku: 'SKU-100' },
  ],
  images: [],
  tags: [],
  isFeatured: false,
  isOnSale: false,
  isNewArrival: false,
  rating: 4,
  reviewCount: 10,
  createdAt: '2026-01-01',
}

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

describe('cart store', () => {
  it('adds an item', () => {
    useCartStore.getState().addItem('p1', 'v50', 2)

    expect(useCartStore.getState().items).toEqual([
      { productId: 'p1', variantId: 'v50', quantity: 2 },
    ])
  })

  it('merges quantity when the same variant is added twice', () => {
    const { addItem } = useCartStore.getState()
    addItem('p1', 'v50', 2)
    addItem('p1', 'v50', 3)

    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('keeps different variants of the same product as separate lines', () => {
    const { addItem } = useCartStore.getState()
    addItem('p1', 'v50', 1)
    addItem('p1', 'v100', 1)

    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('removes an item', () => {
    const { addItem, removeItem } = useCartStore.getState()
    addItem('p1', 'v50', 1)
    removeItem('p1', 'v50')

    expect(useCartStore.getState().items).toEqual([])
  })

  it('removes the line when quantity is updated to zero or below', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    addItem('p1', 'v50', 3)
    updateQuantity('p1', 'v50', 0)

    expect(useCartStore.getState().items).toEqual([])
  })

  it('counts total units across lines', () => {
    const { addItem } = useCartStore.getState()
    addItem('p1', 'v50', 2)
    addItem('p1', 'v100', 3)

    expect(useCartStore.getState().getItemCount()).toBe(5)
  })

  it('totals using each variant price', () => {
    const { addItem } = useCartStore.getState()
    addItem('p1', 'v50', 2) // 2 x 500
    addItem('p1', 'v100', 1) // 1 x 900

    expect(useCartStore.getState().getTotal([product])).toBe(1900)
  })

  it('ignores cart lines whose product or variant no longer exists', () => {
    const { addItem } = useCartStore.getState()
    addItem('p1', 'v50', 1)
    addItem('deleted-product', 'v1', 1)
    addItem('p1', 'deleted-variant', 1)

    // Only the still-resolvable line contributes.
    expect(useCartStore.getState().getTotal([product])).toBe(500)
  })

  it('clears the cart', () => {
    const { addItem, clearCart } = useCartStore.getState()
    addItem('p1', 'v50', 1)
    clearCart()

    expect(useCartStore.getState().items).toEqual([])
  })
})
