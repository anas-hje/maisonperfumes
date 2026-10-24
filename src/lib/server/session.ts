// Server-only. Never import this from a 'use client' component.
// Signs/verifies the admin session cookie with HMAC-SHA256 using Web Crypto,
// which works identically in Node.js route handlers and Edge middleware —
// unlike Node's `crypto` module, which isn't available in the Edge runtime.

export const SESSION_COOKIE_NAME = 'maison_admin_session'
const SESSION_TTL_SECONDS = 8 * 60 * 60 // 8 hours

interface SessionPayload {
  email: string
  role: 'admin'
  exp: number
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set. See .env.example.')
  }
  return secret
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes)
  let binary = ''
  for (const byte of arr) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = {
    email,
    role: 'admin',
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  }
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload))
  const key = await importHmacKey(getSecret())
  const signature = await crypto.subtle.sign('HMAC', key, payloadBytes)
  return `${bytesToBase64Url(payloadBytes.buffer as ArrayBuffer)}.${bytesToBase64Url(signature)}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null
  const [payloadPart, signaturePart] = token.split('.')
  if (!payloadPart || !signaturePart) return null

  try {
    const payloadBytes = base64UrlToBytes(payloadPart)
    const signatureBytes = base64UrlToBytes(signaturePart)
    const key = await importHmacKey(getSecret())
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      payloadBytes as BufferSource
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export const SESSION_COOKIE_MAX_AGE_SECONDS = SESSION_TTL_SECONDS
