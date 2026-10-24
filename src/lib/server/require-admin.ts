import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, verifySessionToken } from './session'

/**
 * Returns the admin session for the current request, or null.
 *
 * src/proxy.ts only guards the `/admin/*` pages — it does not match `/api/*`, so every
 * admin API route must call this itself. Authorising in the route (rather than relying
 * on the proxy) also means a future matcher change can't silently expose data.
 */
export async function getAdminSession() {
  const cookieStore = await cookies()
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)
}

export async function isAdminRequest(): Promise<boolean> {
  return (await getAdminSession()) !== null
}
