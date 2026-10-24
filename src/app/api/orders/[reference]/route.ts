import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { isAdminRequest } from '@/lib/server/require-admin'
import { toDbOrderStatus, toDomainOrder } from '@/lib/server/mappers'

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
})

/** GET /api/orders/:reference — full order detail. Admin only. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { reference } = await params
  const order = await prisma.order.findUnique({
    where: { reference },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
  }

  return NextResponse.json({ order: toDomainOrder(order) })
}

/** PATCH /api/orders/:reference — change order status. Admin only. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 })
  }

  const { reference } = await params

  const existing = await prisma.order.findUnique({ where: { reference } })
  if (!existing) {
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
  }

  const order = await prisma.order.update({
    where: { reference },
    data: { status: toDbOrderStatus(parsed.data.status) },
    include: { items: true },
  })

  return NextResponse.json({ order: toDomainOrder(order) })
}
