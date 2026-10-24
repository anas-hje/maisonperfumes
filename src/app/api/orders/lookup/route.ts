import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { toDomainOrder } from '@/lib/server/mappers'

const lookupSchema = z.object({
  reference: z.string().trim().min(1).max(40),
  phone: z.string().trim().min(1).max(30),
})

// Public, guessable-input endpoint: throttle per IP so references can't be brute-forced.
// Per-instance and in-memory — replace with a shared store when running multi-instance.
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 20

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_ATTEMPTS
}

/** Compare ignoring spaces/dashes so "+212 600-112233" matches "+212600112233". */
function normalisePhone(value: string): string {
  return value.replace(/[\s-]/g, '')
}

/**
 * POST /api/orders/lookup — customer order tracking. Public.
 *
 * Requires the reference *and* the phone number it was placed with. Reference alone
 * would let anyone page through other customers' orders and read their name, address
 * and purchase history.
 */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de recherches. Réessayez plus tard.' },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = lookupSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Référence ou téléphone manquant.' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { reference: parsed.data.reference.trim().toUpperCase() },
    include: { items: true },
  })

  // One generic message whether the reference is unknown or the phone doesn't match,
  // so the response can't be used to confirm that a given reference exists.
  const phoneMatches =
    order !== null && normalisePhone(order.phone) === normalisePhone(parsed.data.phone)

  if (!order || !phoneMatches) {
    return NextResponse.json(
      { error: 'Aucune commande ne correspond à ces informations.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ order: toDomainOrder(order) })
}
