import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { isAdminRequest } from '@/lib/server/require-admin'
import { toDbPaymentMethod, toDomainOrder } from '@/lib/server/mappers'
import { shippingAdapter } from '@/lib/adapters/shipping'

// Moroccan mobile/landline, with or without the +212 country code.
const PHONE_PATTERN = /^(?:\+212|0)[5-7]\d{8}$/

const createOrderSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, ''))
    .refine((value) => PHONE_PATTERN.test(value), 'Numéro de téléphone marocain invalide'),
  city: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(300),
  postalCode: z.string().trim().max(20).optional(),
  paymentMethod: z.enum(['cod', 'card']),
  // Only identifiers and quantities are accepted. Prices are deliberately NOT part of
  // this payload — see the recomputation below.
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1, 'Le panier est vide'),
})

function orderReference(): string {
  return `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

/** POST /api/orders — place an order. Public. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = createOrderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Commande invalide.', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const input = parsed.data

  // Prices come from the database, never from the request. Trusting a client-supplied
  // total would let anyone buy the catalogue for 1 MAD by editing the payload.
  const variants = await prisma.variant.findMany({
    where: { id: { in: input.items.map((item) => item.variantId) } },
    include: { product: true },
  })

  const pricedItems: { productId: string; variantId: string; quantity: number; unitPrice: number }[] = []

  for (const item of input.items) {
    const variant = variants.find((v) => v.id === item.variantId)

    if (!variant || variant.productId !== item.productId) {
      return NextResponse.json(
        { error: "Un article de votre panier n'est plus disponible." },
        { status: 409 }
      )
    }

    if (variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuffisant pour ${variant.product.name} (${variant.label}).` },
        { status: 409 }
      )
    }

    pricedItems.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: variant.price,
    })
  }

  const subtotal = pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const { cost: shippingCost } = await shippingAdapter.calculateShipping(input.city)
  const total = subtotal + shippingCost

  // One transaction: the order and the stock decrements must both land, or neither.
  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of pricedItems) {
        // Guard against two orders racing for the last unit: the conditional update
        // only matches while enough stock remains.
        const decremented = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })

        if (decremented.count === 0) {
          throw new Error('OUT_OF_STOCK')
        }
      }

      return tx.order.create({
        data: {
          reference: orderReference(),
          status: 'PENDING',
          paymentMethod: toDbPaymentMethod(input.paymentMethod),
          subtotal,
          shippingCost,
          total,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          city: input.city,
          address: input.address,
          postalCode: input.postalCode ?? null,
          items: { create: pricedItems },
        },
        include: { items: true },
      })
    })

    return NextResponse.json({ order: toDomainOrder(order) }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'OUT_OF_STOCK') {
      return NextResponse.json(
        { error: 'Un article vient de passer en rupture de stock.' },
        { status: 409 }
      )
    }

    console.error('[api/orders] Failed to create order', error)
    return NextResponse.json({ error: 'Impossible de finaliser la commande.' }, { status: 500 })
  }
}

/** GET /api/orders — list all orders. Admin only. */
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  return NextResponse.json({ orders: orders.map(toDomainOrder) })
}
