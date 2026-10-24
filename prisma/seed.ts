import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { products } from '../src/lib/data/products'
import { ordersData } from '../src/lib/data/orders-data'
import { toDbOrderStatus, toDbPaymentMethod } from '../src/lib/server/mappers'
import { productImageUrl } from '../src/lib/data/product-images'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Run ./scripts/db-setup.sh first.')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

// Idempotent: upserts so re-running never duplicates rows, and never clobbers
// catalogue edits an admin has made to an existing product beyond the seeded fields.
async function seedProducts() {
  // Cycle photos by position within each category so neighbouring products in a grid
  // never land on the same image.
  const positionInCategory = new Map<string, number>()

  for (const product of products) {
    const position = positionInCategory.get(product.category) ?? 0
    positionInCategory.set(product.category, position + 1)

    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        gender: product.gender,
        // The static catalogue still lists /images/products/*.jpg paths that were
        // never backed by real files; resolve real photography instead.
        images: [productImageUrl(product.category, product.slug, { index: position })],
        tags: product.tags,
        isFeatured: product.isFeatured,
        isOnSale: product.isOnSale,
        isNewArrival: product.isNewArrival,
        rating: product.rating,
        reviewCount: product.reviewCount,
        createdAt: new Date(product.createdAt),
        variants: {
          create: product.variants.map((variant) => ({
            id: variant.id,
            label: variant.label,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice ?? null,
            stock: variant.stock,
            sku: variant.sku,
          })),
        },
      },
      update: {},
    })
  }

  return products.length
}

async function seedOrders() {
  let created = 0

  for (const order of ordersData) {
    const existing = await prisma.order.findUnique({ where: { reference: order.id } })
    if (existing) continue

    // Skip demo orders that reference a product/variant not in the catalogue —
    // the foreign keys would reject them and abort the whole seed.
    const resolvable = await Promise.all(
      order.items.map(async (item) => {
        const variant = await prisma.variant.findUnique({ where: { id: item.variantId } })
        return variant?.productId === item.productId
      })
    )
    if (!resolvable.every(Boolean)) {
      console.warn(`  skipped ${order.id}: references a product or variant that doesn't exist`)
      continue
    }

    await prisma.order.create({
      data: {
        reference: order.id,
        status: toDbOrderStatus(order.status),
        paymentMethod: toDbPaymentMethod(order.paymentMethod),
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        firstName: order.shippingAddress.firstName,
        lastName: order.shippingAddress.lastName,
        phone: order.shippingAddress.phone,
        city: order.shippingAddress.city,
        address: order.shippingAddress.address,
        postalCode: order.shippingAddress.postalCode ?? null,
        createdAt: new Date(order.createdAt),
        items: {
          create: order.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })
    created++
  }

  return created
}

async function main() {
  const productCount = await seedProducts()
  console.log(`  ${productCount} products upserted`)

  const orderCount = await seedOrders()
  console.log(`  ${orderCount} demo orders created`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
