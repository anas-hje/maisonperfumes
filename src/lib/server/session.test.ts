import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createSessionToken, verifySessionToken, SESSION_COOKIE_MAX_AGE_SECONDS } from './session'

const SECRET = 'test-secret-0123456789abcdef'

beforeEach(() => {
  process.env.SESSION_SECRET = SECRET
})

afterEach(() => {
  vi.useRealTimers()
})

describe('session tokens', () => {
  it('round-trips a valid token', async () => {
    const token = await createSessionToken('admin@maison.ma')
    const session = await verifySessionToken(token)

    expect(session).not.toBeNull()
    expect(session?.email).toBe('admin@maison.ma')
    expect(session?.role).toBe('admin')
  })

  it('rejects a token whose payload was tampered with', async () => {
    const token = await createSessionToken('admin@maison.ma')
    const [, signature] = token.split('.')

    // Re-encode a payload claiming a different identity, keeping the original signature.
    const forgedPayload = Buffer.from(
      JSON.stringify({ email: 'attacker@evil.com', role: 'admin', exp: Date.now() + 100_000 })
    )
      .toString('base64url')

    expect(await verifySessionToken(`${forgedPayload}.${signature}`)).toBeNull()
  })

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken('admin@maison.ma')

    process.env.SESSION_SECRET = 'a-completely-different-secret'
    expect(await verifySessionToken(token)).toBeNull()
  })

  it('rejects an expired token', async () => {
    const token = await createSessionToken('admin@maison.ma')

    // Jump past the token's lifetime.
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + (SESSION_COOKIE_MAX_AGE_SECONDS + 60) * 1000)

    expect(await verifySessionToken(token)).toBeNull()
  })

  it.each([
    ['empty string', ''],
    ['undefined', undefined],
    ['null', null],
    ['no separator', 'garbage'],
    ['payload only', 'eyJhIjoxfQ'],
    ['non-base64 segments', '!!!.???'],
  ])('rejects malformed input: %s', async (_label, input) => {
    expect(await verifySessionToken(input as string | undefined | null)).toBeNull()
  })

  it('throws when SESSION_SECRET is not configured', async () => {
    delete process.env.SESSION_SECRET
    await expect(createSessionToken('admin@maison.ma')).rejects.toThrow(/SESSION_SECRET/)
  })
})
