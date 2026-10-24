import type {
  Order as DbOrder,
  OrderItem as DbOrderItem,
  Product as DbProduct,
  Variant as DbVariant,
  OrderStatus as DbOrderStatus,
  PaymentMethod as DbPaymentMethod,
} from '@prisma/client'
import type {
  CategorySlug,
  Gender,
  Order,
  OrderStatus,
  Product,
  Variant,
} from '@/lib/types'

// The database uses SCREAMING_CASE enums and a flat address; the app's domain types
// (src/lib/types.ts) use lowercase unions and a nested shippingAddress. Converting
// here keeps every existing component working against the types it already expects.

const ORDER_STATUS_TO_DOMAIN: Record<DbOrderStatus, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

const ORDER_STATUS_TO_DB: Record<OrderStatus, DbOrderStatus> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
}

export function toDomainOrderStatus(status: DbOrderStatus): OrderStatus {
  return ORDER_STATUS_TO_DOMAIN[status]
}

export function toDbOrderStatus(status: OrderStatus): DbOrderStatus {
  return ORDER_STATUS_TO_DB[status]
}

export function toDomainPaymentMethod(method: DbPaymentMethod): 'cod' | 'card' {
  return method === 'COD' ? 'cod' : 'card'
}

export function toDbPaymentMethod(method: 'cod' | 'card'): DbPaymentMethod {
  return method === 'cod' ? 'COD' : 'CARD'
}

export function toDomainVariant(variant: DbVariant): Variant {
  return {
    id: variant.id,
    label: variant.label,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? undefined,
    stock: variant.stock,
    sku: variant.sku,
  }
}

export function toDomainProduct(product: DbProduct & { variants: DbVariant[] }): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    category: product.category as CategorySlug,
    subcategory: product.subcategory,
    gender: product.gender as Gender,
    variants: product.variants.map(toDomainVariant),
    images: product.images,
    tags: product.tags,
    isFeatured: product.isFeatured,
    isOnSale: product.isOnSale,
    isNewArrival: product.isNewArrival,
    rating: product.rating,
    reviewCount: product.reviewCount,
    createdAt: product.createdAt.toISOString(),
  }
}

export function toDomainOrder(order: DbOrder & { items: DbOrderItem[] }): Order {
  return {
    // The app surfaces the human-facing reference as the order id — that's the value
    // customers quote and the tracking page looks up.
    id: order.reference,
    items: order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    shippingAddress: {
      firstName: order.firstName,
      lastName: order.lastName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      postalCode: order.postalCode ?? undefined,
    },
    paymentMethod: toDomainPaymentMethod(order.paymentMethod),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    status: toDomainOrderStatus(order.status),
    createdAt: order.createdAt.toISOString(),
  }
}
