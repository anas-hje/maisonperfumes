'use client'

import React from 'react'

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'En attente' },
    confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Confirmée' },
    shipped: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Expédiée' },
    delivered: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Livrée' },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Annulée' },
  }

  const { bg, text, label } = config[status] || config.pending

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text} font-[family-name:var(--font-inter)] border border-current/20`}>
      {label}
    </span>
  )
}
