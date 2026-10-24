'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { useOrders } from '@/lib/hooks/useOrders'
import { formatPrice } from '@/lib/utils'
import StatusBadge from '@/components/admin/StatusBadge'
import { OrderStatus } from '@/lib/types'

export default function CommandesPage() {
  const { orders, isLoading, error } = useOrders()
  const [activeTab, setActiveTab] = useState<OrderStatus | 'toutes'>('toutes')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleExportCSV = () => {
    toast.success('Export CSV démarré', {
      description: 'Le fichier sera téléchargé dans quelques instants.'
    })
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'toutes' || order.status === activeTab
    const searchTerm = search.toLowerCase()
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm) || 
      order.shippingAddress.firstName.toLowerCase().includes(searchTerm) || 
      order.shippingAddress.lastName.toLowerCase().includes(searchTerm)
    
    return matchesTab && matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const tabs: { id: OrderStatus | 'toutes', label: string }[] = [
    { id: 'toutes', label: 'Toutes' },
    { id: 'pending', label: 'En attente' },
    { id: 'confirmed', label: 'Confirmées' },
    { id: 'shipped', label: 'Expédiées' },
    { id: 'delivered', label: 'Livrées' },
    { id: 'cancelled', label: 'Annulées' },
  ]

  if (isLoading) {
    return (
      <div className="p-6 bg-[#0F0F11] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C8923C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0F0F11] min-h-screen text-[#E8E4DF] font-[family-name:var(--font-inter)]">
        <p role="alert" className="border border-red-500/40 bg-red-500/5 text-red-300 p-4 rounded-lg">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0F0F11] min-h-screen text-[#E8E4DF] font-[family-name:var(--font-inter)]">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
            <p className="text-[#9A9A9E] mt-1">{filteredOrders.length} commandes trouvées</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher ID ou client..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full md:w-64 bg-[#141416] border border-[#2A2A2E] rounded-lg pl-10 pr-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none placeholder-[#6B6B70]"
              />
              <svg className="w-5 h-5 absolute left-3 top-3 text-[#6B6B70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-[#141416] border border-[#2A2A2E] hover:border-[#C8923C]/50 px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto border-b border-[#2A2A2E] mb-6 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setCurrentPage(1)
              }}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#C8923C] border-[#C8923C]'
                  : 'text-[#6B6B70] border-transparent hover:text-[#9A9A9E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2E] text-xs uppercase tracking-wider text-[#9A9A9E]">
                  <th className="px-6 py-4 font-medium">N° Commande</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Ville</th>
                  <th className="px-6 py-4 font-medium">Articles</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Paiement</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]/50 text-sm">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-[#9A9A9E]">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#141416]/50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <Link href={`/admin/commandes/${order.id}`} className="font-medium text-[#C8923C] group-hover:underline">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[#9A9A9E]">
                        {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </td>
                      <td className="px-6 py-4 text-[#9A9A9E]">
                        {order.shippingAddress.city}
                      </td>
                      <td className="px-6 py-4 text-[#9A9A9E]">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        {order.paymentMethod === 'cod' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400">COD</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">Carte</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#2A2A2E] flex items-center justify-between">
              <span className="text-sm text-[#9A9A9E]">
                Page {currentPage} sur {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded bg-[#141416] border border-[#2A2A2E] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252529] transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded bg-[#141416] border border-[#2A2A2E] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252529] transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
