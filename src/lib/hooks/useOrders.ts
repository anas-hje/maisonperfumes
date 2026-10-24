'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Order, OrderStatus } from '@/lib/types'

interface UseOrdersResult {
  orders: Order[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateStatus: (reference: string, status: OrderStatus) => Promise<boolean>
}

/**
 * Admin order list, served from the database via /api/orders.
 *
 * Replaces the old localStorage-backed Zustand store, which could only ever show
 * orders placed in the same browser — meaning a customer's order never reached the
 * shop owner. The endpoint is admin-only; an unauthenticated call returns 401.
 */
export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/orders')

      if (!response.ok) {
        setError(
          response.status === 401
            ? 'Session expirée. Reconnectez-vous.'
            : 'Impossible de charger les commandes.'
        )
        return
      }

      const payload = await response.json()
      setOrders(payload.orders as Order[])
      setError(null)
    } catch {
      setError('Connexion au serveur impossible.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch on mount. The state updates happen in refresh()'s async continuations rather
  // than synchronously in the effect body, which is what the rule is actually guarding
  // against; there's no synchronous render cascade here.
  useEffect(() => {
    void refresh() // eslint-disable-line react-hooks/set-state-in-effect
  }, [refresh])

  const updateStatus = useCallback(
    async (reference: string, status: OrderStatus) => {
      const response = await fetch(`/api/orders/${encodeURIComponent(reference)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) return false

      const payload = await response.json()
      const updated = payload.order as Order
      setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)))
      return true
    },
    []
  )

  return { orders, isLoading, error, refresh, updateStatus }
}
