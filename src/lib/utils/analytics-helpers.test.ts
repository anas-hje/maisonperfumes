import { describe, it, expect } from 'vitest'
import {
  computeKPIs,
  computeCategoryRevenue,
  computeCityOrders,
  computeStatusDistribution,
  computeTopProducts,
  computePaymentSplit,
  deriveCustomers,
} from './analytics-helpers'
import type { Order, Product } from '@/lib/types'

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-1',
    items: [{ productId: 'p1', variantId: 'v1', quantity: 1, unitPrice: 100 }],
    shippingAddress: {
      firstName: 'Fatima',
      lastName: 'Zahra',
      phone: '0612345678',
      city: 'Casablanca',
      address: '12 Rue des Fleurs',
    },
    paymentMethod: 'cod',
    subtotal: 100,
    shippingCost: 0,
    total: 100,
    status: 'delivered',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

const products: Product[] = [
  {
    id: 'p1',
    slug: 'a',
    name: 'Parfum A',
    brand: 'Maison',
    description: '',
    category: 'parfums',
    subcategory: '',
    gender: 'unisexe',
    variants: [{ id: 'v1', label: '50ml', price: 100, stock: 1, sku: 'A' }],
    images: [],
    tags: [],
    isFeatured: false,
    isOnSale: false,
    isNewArrival: false,
    rating: 5,
    reviewCount: 1,
    createdAt: '2026-01-01',
  },
  {
    id: 'p2',
    slug: 'b',
    name: 'Crème B',
    brand: 'Maison',
    description: '',
    category: 'cosmetiques',
    subcategory: '',
    gender: 'unisexe',
    variants: [{ id: 'v2', label: '30ml', price: 200, stock: 1, sku: 'B' }],
    images: [],
    tags: [],
    isFeatured: false,
    isOnSale: false,
    isNewArrival: false,
    rating: 4,
    reviewCount: 2,
    createdAt: '2026-01-01',
  },
]

describe('computeKPIs', () => {
  it('excludes cancelled orders from revenue', () => {
    const kpis = computeKPIs([
      makeOrder({ id: '1', total: 100 }),
      makeOrder({ id: '2', total: 500, status: 'cancelled' }),
    ])

    expect(kpis.totalRevenue).toBe(100)
  })

  it('counts cancelled orders in the order count', () => {
    const kpis = computeKPIs([
      makeOrder({ id: '1' }),
      makeOrder({ id: '2', status: 'cancelled' }),
    ])

    expect(kpis.totalOrders).toBe(2)
  })

  it('counts unique customers by phone, not per order', () => {
    const kpis = computeKPIs([
      makeOrder({ id: '1' }),
      makeOrder({ id: '2' }), // same phone
      makeOrder({
        id: '3',
        shippingAddress: { ...makeOrder().shippingAddress, phone: '0700000000' },
      }),
    ])

    expect(kpis.activeCustomers).toBe(2)
  })

  it('reports zero change instead of dividing by zero with no prior period', () => {
    const kpis = computeKPIs([makeOrder()])

    expect(Number.isFinite(kpis.revenueChange)).toBe(true)
    expect(kpis.revenueChange).toBe(0)
    expect(kpis.ordersChange).toBe(0)
  })

  it('handles an empty order list without producing NaN', () => {
    const kpis = computeKPIs([])

    expect(kpis.totalRevenue).toBe(0)
    expect(kpis.totalOrders).toBe(0)
    expect(kpis.activeCustomers).toBe(0)
    expect(Number.isNaN(kpis.revenueChange)).toBe(false)
  })
})

describe('revenue breakdowns', () => {
  it('attributes revenue to the right category and percentages sum to ~100', () => {
    const orders = [
      makeOrder({
        id: '1',
        items: [
          { productId: 'p1', variantId: 'v1', quantity: 1, unitPrice: 100 },
          { productId: 'p2', variantId: 'v2', quantity: 2, unitPrice: 200 },
        ],
      }),
    ]

    const byCategory = computeCategoryRevenue(orders, products)
    const parfums = byCategory.find((c) => c.category === 'parfums')
    const cosmetiques = byCategory.find((c) => c.category === 'cosmetiques')

    expect(parfums?.revenue).toBe(100)
    expect(cosmetiques?.revenue).toBe(400)
    expect(byCategory.reduce((sum, c) => sum + c.percentage, 0)).toBeGreaterThanOrEqual(99)
  })

  it('excludes cancelled orders from category revenue', () => {
    const byCategory = computeCategoryRevenue([makeOrder({ status: 'cancelled' })], products)

    expect(byCategory).toEqual([])
  })

  it('ranks top products by revenue and resolves their names', () => {
    const orders = [
      makeOrder({
        id: '1',
        items: [
          { productId: 'p1', variantId: 'v1', quantity: 1, unitPrice: 100 },
          { productId: 'p2', variantId: 'v2', quantity: 3, unitPrice: 200 },
        ],
      }),
    ]

    const top = computeTopProducts(orders, products)

    expect(top[0].name).toBe('Crème B')
    expect(top[0].revenue).toBe(600)
    expect(top[0].unitsSold).toBe(3)
  })

  it('labels unknown products rather than dropping their revenue', () => {
    const orders = [
      makeOrder({ items: [{ productId: 'ghost', variantId: 'v', quantity: 1, unitPrice: 50 }] }),
    ]

    const top = computeTopProducts(orders, products)

    expect(top[0].name).toBe('Produit inconnu')
    expect(top[0].revenue).toBe(50)
  })

  it('counts cancelled orders per city but excludes their revenue', () => {
    const byCity = computeCityOrders([
      makeOrder({ id: '1', total: 100 }),
      makeOrder({ id: '2', total: 900, status: 'cancelled' }),
    ])

    expect(byCity[0].city).toBe('Casablanca')
    expect(byCity[0].orders).toBe(2)
    expect(byCity[0].revenue).toBe(100)
  })

  it('reports every status, including those with no orders', () => {
    const distribution = computeStatusDistribution([makeOrder({ status: 'pending' })])

    expect(distribution).toHaveLength(5)
    expect(distribution.find((d) => d.status === 'pending')?.count).toBe(1)
    expect(distribution.find((d) => d.status === 'shipped')?.count).toBe(0)
  })

  it('splits payment methods into percentages', () => {
    const split = computePaymentSplit([
      makeOrder({ id: '1', paymentMethod: 'cod' }),
      makeOrder({ id: '2', paymentMethod: 'cod' }),
      makeOrder({ id: '3', paymentMethod: 'card' }),
    ])

    expect(split.find((s) => s.method === 'cod')?.percentage).toBe(67)
    expect(split.find((s) => s.method === 'card')?.percentage).toBe(33)
  })

  it('avoids NaN percentages when there are no orders', () => {
    const split = computePaymentSplit([])

    expect(split.every((s) => s.percentage === 0)).toBe(true)
  })
})

describe('deriveCustomers', () => {
  it('collapses multiple orders from one phone into a single customer', () => {
    const customers = deriveCustomers([
      makeOrder({ id: '1', total: 100 }),
      makeOrder({ id: '2', total: 250 }),
    ])

    expect(customers).toHaveLength(1)
    expect(customers[0].totalOrders).toBe(2)
    expect(customers[0].totalSpent).toBe(350)
  })

  it('excludes cancelled order value from total spent', () => {
    const customers = deriveCustomers([
      makeOrder({ id: '1', total: 100 }),
      makeOrder({ id: '2', total: 900, status: 'cancelled' }),
    ])

    expect(customers[0].totalOrders).toBe(2)
    expect(customers[0].totalSpent).toBe(100)
  })

  it('marks a customer inactive when their last order is over 30 days old', () => {
    const old = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    const customers = deriveCustomers([makeOrder({ createdAt: old })])

    expect(customers[0].status).toBe('inactive')
  })

  it('marks a customer active on a recent order', () => {
    const customers = deriveCustomers([makeOrder()])

    expect(customers[0].status).toBe('active')
  })
})
