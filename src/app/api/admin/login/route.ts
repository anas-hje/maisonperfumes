import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE_SECONDS } from '@/lib/server/session'

// Minimal in-memory rate limit. This resets on server restart and is per-instance
// (won't coordinate across multiple serverless instances) — good enough to blunt
// casual brute-forcing today; replace with a shared store (e.g. Upstash Redis) once
// deployed behind multiple instances. See MAISON_SECURITY_AUDIT.md S-7.
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

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

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    console.error('[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not configured')
    return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 })
  }

  const emailMatches = email.toLowerCase() === adminEmail.toLowerCase()
  // Always run bcrypt.compare, even on an email mismatch, so response timing
  // doesn't reveal whether the email exists (avoid account enumeration).
  const passwordMatches = await bcrypt.compare(password || ' ', adminPasswordHash)

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
  }

  const token = await createSessionToken(adminEmail)
  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  })
  return response
}
