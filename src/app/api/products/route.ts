import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { toDomainProduct } from '@/lib/server/mappers'

/** GET /api/products — the catalogue. Public. */
export async function GET() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ products: products.map(toDomainProduct) })
}
