'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatPrice } from '@/lib/utils'
import { deriveCustomers } from '@/lib/utils/analytics-helpers'
import { useOrders } from '@/lib/hooks/useOrders'
import { useMounted } from '@/lib/hooks/useMounted'

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const itemsPerPage = 10

  const { orders, isLoading: ordersLoading } = useOrders()
  const mounted = useMounted()


  if (!mounted || ordersLoading) return null

  const customersData = deriveCustomers(orders)

  // Handle Sort
  const sortedCustomers = [...customersData]
  if (sortBy === 'recent') {
    sortedCustomers.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
  } else if (sortBy === 'spent') {
    sortedCustomers.sort((a, b) => b.totalSpent - a.totalSpent)
  } else if (sortBy === 'orders') {
    sortedCustomers.sort((a, b) => b.totalOrders - a.totalOrders)
  }

  // Handle Search
  const filteredCustomers = sortedCustomers.filter((c) => {
    const term = search.toLowerCase()
    return (
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone.includes(term)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const maxSpent = customersData.length > 0 ? Math.max(...customersData.map(c => c.totalSpent)) : 0

  return (
    <div className="p-6 bg-[#0F0F11] min-h-screen text-[#E8E4DF] font-[family-name:var(--font-inter)]">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Clients</h1>
            <p className="text-[#9A9A9E] mt-1">{filteredCustomers.length} clients trouvés</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Nom, email, tél..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full sm:w-64 bg-[#141416] border border-[#2A2A2E] rounded-lg pl-10 pr-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none placeholder-[#6B6B70]"
              />
              <svg className="w-5 h-5 absolute left-3 top-3 text-[#6B6B70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-auto bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
            >
              <option value="recent">Plus récent</option>
              <option value="spent">Plus dépensé</option>
              <option value="orders">Plus de commandes</option>
            </select>
          </div>
        </div>

        <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2E] text-xs uppercase tracking-wider text-[#9A9A9E]">
                  <th className="px-6 py-4 font-medium w-12"></th>
                  <th className="px-6 py-4 font-medium">Nom Complet</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Email</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">Téléphone</th>
                  <th className="px-6 py-4 font-medium">Ville</th>
                  <th className="px-6 py-4 font-medium text-right">Commandes</th>
                  <th className="px-6 py-4 font-medium text-right">Total Dépensé</th>
                  <th className="px-6 py-4 font-medium text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]/50 text-sm">
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-[#9A9A9E]">
                      Aucun client trouvé.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <React.Fragment key={customer.id}>
                      <tr 
                        className="hover:bg-[#141416]/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === customer.id ? null : customer.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 rounded-full bg-[#C8923C]/20 text-[#C8923C] flex items-center justify-center font-bold text-xs">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {customer.firstName} {customer.lastName}
                        </td>
                        <td className="px-6 py-4 text-[#9A9A9E] hidden md:table-cell">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 text-[#9A9A9E] hidden lg:table-cell">
                          {customer.phone}
                        </td>
                        <td className="px-6 py-4 text-[#9A9A9E]">
                          {customer.city}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {customer.totalOrders}
                        </td>
                        <td className="px-6 py-4 font-medium text-right text-[#C8923C]">
                          {formatPrice(customer.totalSpent)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {customer.status === 'active' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                              Inactif
                            </span>
                          )}
                        </td>
                      </tr>
                      {expandedRow === customer.id && (
                        <tr className="bg-[#141416]">
                          <td colSpan={8} className="px-6 py-6 border-b border-[#2A2A2E]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-xs uppercase text-[#9A9A9E] font-medium">Statistiques</h4>
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#9A9A9E]">Valeur Moyenne Commande</span>
                                  <span className="text-sm font-medium">{customer.totalOrders > 0 ? formatPrice(customer.totalSpent / customer.totalOrders) : '0 MAD'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#9A9A9E]">Dernière commande</span>
                                  <span className="text-sm font-medium">{format(new Date(customer.lastOrderAt), 'dd MMM yyyy', { locale: fr })}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#9A9A9E]">Inscrit le</span>
                                  <span className="text-sm font-medium">{format(new Date(customer.joinedAt), 'dd MMM yyyy', { locale: fr })}</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-xs uppercase text-[#9A9A9E] font-medium">Préférences</h4>
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#9A9A9E]">Catégories préférées</span>
                                  <span className="text-sm font-medium">Parfums, Soins</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-xs uppercase text-[#9A9A9E] font-medium">Valeur relative client</h4>
                                <div className="h-2 w-full bg-[#2A2A2E] rounded-full overflow-hidden mt-2">
                                  <div 
                                    className="h-full bg-[#C8923C] rounded-full" 
                                    style={{ width: `${Math.min(100, maxSpent > 0 ? (customer.totalSpent / maxSpent) * 100 : 0)}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-[#9A9A9E] text-right mt-1">
                                  {Math.round(maxSpent > 0 ? (customer.totalSpent / maxSpent) * 100 : 0)}% du top client
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
