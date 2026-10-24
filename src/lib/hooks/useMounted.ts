'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * True once the component has mounted on the client. Use to gate rendering that
 * depends on client-only state (e.g. Zustand stores created with `skipHydration: true`)
 * until after the first client render, avoiding a server/client markup mismatch.
 *
 * Implemented with useSyncExternalStore (server snapshot: false, client snapshot: true)
 * rather than a useState+useEffect pair, so it doesn't need an extra render — or trip
 * the react-hooks/set-state-in-effect lint rule — the way `useEffect(() => setX(true), [])`
 * does.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
