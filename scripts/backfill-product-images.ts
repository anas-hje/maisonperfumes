/**
 * Assigns stock photography to every product that doesn't have a usable image.
 *
 *   npx tsx scripts/backfill-product-images.ts          # fill in missing/broken only
 *   npx tsx scripts/backfill-product-images.ts --force  # reassign every product
 *
 * Idempotent. The original seed pointed at /images/products/*.jpg, none of which
 * exist on disk, so those local paths count as "missing" and get replaced.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadEnv } from 'dotenv'
import { productImageUrl } from '../src/lib/data/product-images'

loadEnv({ path: '.env.local', quiet: true })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Run ./scripts/db-setup.sh first.')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
const force = process.argv.includes('--force')

function needsImage(images: string[]): boolean {
  if (images.length === 0) return true
  // The placeholder paths from the original seed were never backed by real files.
  return images.every((url) => url.startsWith('/images/products/'))
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, category: true, images: true },
  })

  let updated = 0
  const positionInCategory = new Map<string, number>()

  for (const product of products) {
    // Count position regardless of whether this one is skipped, so the cycle stays
    // aligned with how the catalogue is ordered.
    const position = positionInCategory.get(product.category) ?? 0
    positionInCategory.set(product.category, position + 1)

    if (!force && !needsImage(product.images)) continue

    await prisma.product.update({
      where: { id: product.id },
      data: { images: [productImageUrl(product.category, product.slug, { index: position })] },
    })
    updated++
  }

  console.log(`${updated} of ${products.length} products given photography`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
