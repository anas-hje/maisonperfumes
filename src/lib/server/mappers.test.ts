import { describe, it, expect } from 'vitest'
import {
  toDomainOrder,
  toDomainOrderStatus,
  toDbOrderStatus,
  toDomainPaymentMethod,
  toDbPaymentMethod,
  toDomainProduct,
  toDomainVariant,
} from './mappers'
import type { OrderStatus } from '@/lib/types'

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

describe('enum mapping', () => {
  it.each(ALL_STATUSES)('round-trips the %s status', (status) => {
    expect(toDomainOrderStatus(toDbOrderStatus(status))).toBe(status)
  })

  it.each(['cod', 'card'] as const)('round-trips the %s payment method', (method) => {
    expect(toDomainPaymentMethod(toDbPaymentMethod(method))).toBe(method)
  })

  it('maps database casing to the lowercase domain union', () => {
    // The UI matches on these exact lowercase values, so a drift here would silently
    // break every status badge and filter.
    expect(toDomainOrderStatus('DELIVERED')).toBe('delivered')
    expect(toDbOrderStatus('delivered')).toBe('DELIVERED')
  })
})

describe('toDomainVariant', () => {
  it('converts a null compareAtPrice to undefined', () => {
    // The domain type uses an optional property; leaking null breaks `variant.compareAtPrice &&`
    // checks that drive sale badges.
    const variant = toDomainVariant({
      id: 'v1',
      productId: 'p1',
      label: '50ml',
      price: 500,
      compareAtPrice: null,
      stock: 3,
      sku: 'SKU-1',
    })

    expect(variant.compareAtPrice).toBeUndefined()
  })

  it('preserves a real compareAtPrice', () => {
    const variant = toDomainVariant({
      id: 'v1',
      productId: 'p1',
      label: '50ml',
      price: 500,
      compareAtPrice: 700,
      stock: 3,
      sku: 'SKU-1',
    })

    expect(variant.compareAtPrice).toBe(700)
  })
})

describe('toDomainProduct', () => {
  it('serialises createdAt to an ISO string and nests variants', () => {
    const product = toDomainProduct({
      id: 'p1',
      slug: 'test',
      name: 'Test',
      brand: 'Maison',
      description: '',
      category: 'parfums',
      subcategory: 'homme',
      gender: 'homme',
      images: ['/a.jpg'],
      tags: ['x'],
      isFeatured: true,
      isOnSale: false,
      isNewArrival: false,
      rating: 4.5,
      reviewCount: 12,
      createdAt: new Date('2026-01-02T03:04:05.000Z'),
      updatedAt: new Date('2026-01-02T03:04:05.000Z'),
      variants: [
        {
          id: 'v1',
          productId: 'p1',
          label: '50ml',
          price: 500,
          compareAtPrice: null,
          stock: 1,
          sku: 'S1',
        },
      ],
    })

    expect(product.createdAt).toBe('2026-01-02T03:04:05.000Z')
    expect(product.variants).toHaveLength(1)
    expect(product.variants[0].sku).toBe('S1')
  })
})

describe('toDomainOrder', () => {
  const row = {
    id: 'internal-cuid',
    reference: 'ORD-ABCD1234',
    status: 'SHIPPED' as const,
    paymentMethod: 'COD' as const,
    subtotal: 1000,
    shippingCost: 35,
    total: 1035,
    firstName: 'Amina',
    lastName: 'Tazi',
    phone: '0655443322',
    city: 'Agadir',
    address: '8 Avenue Mohammed V',
    postalCode: null,
    createdAt: new Date('2026-02-03T00:00:00.000Z'),
    updatedAt: new Date('2026-02-03T00:00:00.000Z'),
    items: [
      {
        id: 'oi1',
        orderId: 'internal-cuid',
        productId: 'p1',
        variantId: 'v1',
        quantity: 2,
        unitPrice: 500,
      },
    ],
  }

  it('exposes the human-facing reference as the order id, not the internal cuid', () => {
    // Customers quote the reference and the tracking page looks it up; surfacing the
    // internal id instead would make every order untraceable.
    expect(toDomainOrder(row).id).toBe('ORD-ABCD1234')
  })

  it('rebuilds the nested shipping address from the flat columns', () => {
    const order = toDomainOrder(row)

    expect(order.shippingAddress).toEqual({
      firstName: 'Amina',
      lastName: 'Tazi',
      phone: '0655443322',
      city: 'Agadir',
      address: '8 Avenue Mohammed V',
      postalCode: undefined,
    })
  })

  it('maps items and keeps the price captured at purchase time', () => {
    const order = toDomainOrder(row)

    expect(order.items).toEqual([
      { productId: 'p1', variantId: 'v1', quantity: 2, unitPrice: 500 },
    ])
  })

  it('maps status and payment method into the domain unions', () => {
    const order = toDomainOrder(row)

    expect(order.status).toBe('shipped')
    expect(order.paymentMethod).toBe('cod')
  })
})
