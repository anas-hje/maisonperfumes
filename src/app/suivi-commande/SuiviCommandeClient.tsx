'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useProducts } from '@/lib/adapters/product-source'
import { formatPrice, formatDate } from '@/lib/utils'
import { Order } from '@/lib/types'

type TrackingStep = {
  title: string
  date?: string
  status: 'completed' | 'current' | 'upcoming'
}

export default function SuiviCommandeClient() {
  const [searchOrderId, setSearchOrderId] = useState('')
  const [contact, setContact] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [foundOrder, setFoundOrder] = useState<Order | null>(null)

  const products = useProducts()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchOrderId || !contact) return

    setIsSearching(true)
    setHasSearched(false)

    try {
      // The server requires the reference *and* the phone it was placed with, so a
      // reference alone can't be used to read someone else's order.
      const response = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: searchOrderId, phone: contact }),
      })

      setFoundOrder(response.ok ? (await response.json()).order : null)
    } catch {
      setFoundOrder(null)
    } finally {
      setIsSearching(false)
      setHasSearched(true)
    }
  }

  const getStepsForOrder = (order: Order): TrackingStep[] => {
    const baseSteps = [
      { id: 'pending', title: 'Commande reçue' },
      { id: 'processing', title: 'En préparation' },
      { id: 'shipped', title: 'Expédiée' },
      { id: 'delivered', title: 'Livrée' },
    ]

    const statusMap: Record<string, number> = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1,
      'refunded': -1
    }

    const currentIdx = statusMap[order.status] ?? 0

    if (currentIdx === -1) {
      return [
        { title: 'Commande reçue', date: formatDate(order.createdAt), status: 'completed' },
        { title: order.status === 'cancelled' ? 'Annulée' : 'Remboursée', status: 'completed' }
      ]
    }

    return baseSteps.map((step, idx) => {
      let status: 'completed' | 'current' | 'upcoming' = 'upcoming'
      if (idx < currentIdx) status = 'completed'
      else if (idx === currentIdx) status = 'current'

      return {
        title: step.title,
        date: idx === 0 ? formatDate(order.createdAt) : undefined,
        status
      }
    })
  }

  const steps = foundOrder ? getStepsForOrder(foundOrder) : []

  return (
    <div className="min-h-screen bg-graphite py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display text-light mb-4">Suivi de Commande</h1>
          <p className="text-quartz">Entrez vos informations ci-dessous pour suivre l&apos;état de votre livraison.</p>
        </motion.div>

        <div className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10 mb-10">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="searchOrderId" className="sr-only">Numéro de commande</label>
              <input
                type="text"
                id="searchOrderId"
                placeholder="N° de commande (ex: ORD-123456)"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                required
                className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-3.5 text-light focus:outline-none focus:border-amber transition-colors"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="contact" className="sr-only">Email ou Téléphone</label>
              <input
                type="text"
                id="contact"
                placeholder="Téléphone"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-3.5 text-light focus:outline-none focus:border-amber transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-amber hover:bg-brass text-white font-medium py-3.5 px-8 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
            >
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </div>

        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {foundOrder ? (
              <div className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/8 pb-6 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-light mb-1">Commande #{foundOrder.id.toUpperCase()}</h2>
                    <p className="text-sm text-quartz">Effectuée le {formatDate(foundOrder.createdAt)}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-left md:text-right">
                    <p className="text-sm text-quartz">Montant Total</p>
                    <p className="font-semibold text-amber text-lg">{formatPrice(foundOrder.total)}</p>
                  </div>
                </div>

                {/* Stepper */}
                <div className="relative py-4">
                  {/* Progress Line */}
                  <div className="absolute top-8 left-4 right-4 h-1 bg-graphite rounded-full hidden md:block">
                    <div className="absolute top-0 left-0 h-full bg-amber rounded-full" style={{ width: `${(steps.findIndex(s => s.status === 'current' || s.status === 'upcoming') === -1 ? steps.length : steps.findIndex(s => s.status === 'current' || s.status === 'upcoming')) / (steps.length - 1) * 100}%` }}></div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                    {steps.map((step, idx) => (
                      <div key={idx} className="relative flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center z-10 w-full">
                        {/* Mobile Line */}
                        {idx !== steps.length - 1 && (
                          <div className={`absolute left-[15px] top-10 bottom-[-32px] w-0.5 md:hidden ${step.status === 'completed' ? 'bg-amber' : 'bg-graphite'}`}></div>
                        )}
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                          step.status === 'completed' ? 'bg-amber border-amber text-white' :
                          step.status === 'current' ? 'bg-obsidian border-amber text-amber' :
                          'bg-obsidian border-white/10 text-quartz'
                        }`}>
                          {step.status === 'completed' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                          )}
                        </div>
                        
                        <div>
                          <p className={`font-medium text-sm md:text-base ${step.status === 'upcoming' ? 'text-quartz' : 'text-light'}`}>
                            {step.title}
                          </p>
                          {step.date && (
                            <p className="text-xs text-quartz mt-0.5">{step.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 bg-graphite rounded-lg p-6 flex flex-col md:flex-row items-start gap-8">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-obsidian rounded-full flex items-center justify-center shrink-0 text-amber shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-light mb-1">Adresse de livraison</h3>
                      <p className="text-quartz text-sm leading-relaxed">
                        {foundOrder.shippingAddress.firstName} {foundOrder.shippingAddress.lastName}<br />
                        {foundOrder.shippingAddress.address}<br />
                        {foundOrder.shippingAddress.city}, Maroc<br />
                        {foundOrder.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-obsidian rounded-full flex items-center justify-center shrink-0 text-amber shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <div className="w-full">
                      <h3 className="font-medium text-light mb-1">Articles</h3>
                      <div className="space-y-2 mt-2">
                        {foundOrder.items.map((item, idx) => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-quartz">{product?.name || 'Produit'} x{item.quantity}</span>
                              <span className="text-light">{formatPrice(item.unitPrice * item.quantity)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-obsidian p-12 rounded-xl shadow-sm border border-white/10 text-center">
                <div className="w-16 h-16 bg-graphite rounded-full flex items-center justify-center mx-auto mb-4 text-quartz">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
                <h3 className="text-xl font-medium text-light mb-2">Aucune commande trouvée</h3>
                <p className="text-quartz">Aucune commande trouvée avec ce numéro.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
