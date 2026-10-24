'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductImage from '@/components/ui/ProductImage'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { useOrders } from '@/lib/hooks/useOrders'
import { useProducts } from '@/lib/adapters/product-source'
import { formatPrice } from '@/lib/utils'
import StatusBadge from '@/components/admin/StatusBadge'
import { OrderStatus } from '@/lib/types'

export default function CommandeDetailPage() {
  const { id } = useParams()
  const orderId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : ''
  
  const { orders, isLoading, updateStatus } = useOrders()
  const products = useProducts()

  const order = orders.find((o) => o.id === orderId)

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.status || 'pending')

  // selectedStatus is locally editable (the dropdown below) before saving, so it can't
  // be a pure derivation of order.status — it must resync when the order itself changes,
  // e.g. navigating from one order's detail page to another without a full remount.
  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [order])

  if (isLoading) {
    return (
      <div className="p-6 bg-[#0F0F11] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C8923C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 bg-[#0F0F11] min-h-screen text-[#E8E4DF] flex flex-col items-center justify-center font-[family-name:var(--font-inter)]">
        <h2 className="text-xl font-bold mb-4">Commande introuvable</h2>
        <Link href="/admin/commandes" className="text-[#C8923C] hover:underline">
          ← Retour aux commandes
        </Link>
      </div>
    )
  }

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) return

    const succeeded = await updateStatus(order.id, selectedStatus)

    if (succeeded) {
      toast.success('Statut mis à jour', {
        description: `La commande est maintenant: ${selectedStatus}`
      })
    } else {
      toast.error('Impossible de mettre à jour le statut', {
        description: 'Vérifiez votre connexion et réessayez.'
      })
    }
  }

  const statusFlow: { id: OrderStatus, label: string }[] = [
    { id: 'pending', label: 'En attente' },
    { id: 'confirmed', label: 'Confirmée' },
    { id: 'shipped', label: 'Expédiée' },
    { id: 'delivered', label: 'Livrée' }
  ]
  
  // Basic calculation of timeline progress based on index
  const currentIndex = statusFlow.findIndex(s => s.id === order.status)
  
  return (
    <div className="p-6 bg-[#0F0F11] min-h-screen text-[#E8E4DF] font-[family-name:var(--font-inter)] pb-20">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-6">
          <Link href="/admin/commandes" className="text-[#9A9A9E] hover:text-[#E8E4DF] text-sm transition-colors flex items-center w-fit">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux commandes
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Commande {order.id}
              <StatusBadge status={order.status} />
            </h1>
            <p className="text-[#9A9A9E] mt-1">
              Passée le {format(new Date(order.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
          </div>
          <div>
            <button
              className="bg-[#141416] border border-[#2A2A2E] hover:border-[#C8923C]/50 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
              onClick={() => window.print()}
            >
              Imprimer
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - 2/3 */}
          <div className="lg:w-2/3 space-y-6">
            
            {/* Articles commandés */}
            <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] p-6">
              <h2 className="text-lg font-bold mb-4">Articles commandés</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2A2A2E] text-xs uppercase tracking-wider text-[#9A9A9E]">
                      <th className="pb-3 font-medium">Produit</th>
                      <th className="pb-3 font-medium text-center">Quantité</th>
                      <th className="pb-3 font-medium text-right">Prix Unitaire</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2E]/50 text-sm">
                    {order.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId)
                      const variant = product?.variants.find(v => v.id === item.variantId)
                      
                      return (
                        <tr key={idx}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-[#141416]">
                                <ProductImage
                                  src={product?.images?.[0]}
                                  alt={product?.name ?? 'Produit'}
                                  fallbackLabel={product?.brand.charAt(0)}
                                  fallbackLabelClassName="text-lg"
                                  sizes="48px"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-[#E8E4DF]">{product?.name || 'Produit inconnu'}</div>
                                <div className="text-xs text-[#9A9A9E]">{variant?.label || item.variantId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">{item.quantity}</td>
                          <td className="py-4 text-right text-[#9A9A9E]">{formatPrice(item.unitPrice)}</td>
                          <td className="py-4 text-right font-medium">{formatPrice(item.quantity * item.unitPrice)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#2A2A2E]">
                      <td colSpan={3} className="py-4 text-right text-[#9A9A9E]">Sous-total</td>
                      <td className="py-4 text-right font-medium">{formatPrice(order.subtotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Chronologie */}
            <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] p-6">
              <h2 className="text-lg font-bold mb-6">Chronologie</h2>
              
              {order.status === 'cancelled' ? (
                <div className="flex items-start mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border-2 border-[#1E1E22] ring-2 ring-[#2A2A2E] z-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-red-400">Commande annulée</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[#2A2A2E]"></div>
                  
                  {statusFlow.map((step, idx) => {
                    const isCompleted = currentIndex >= idx;
                    const isCurrent = currentIndex === idx;
                    
                    return (
                      <div key={step.id} className="relative flex items-start mb-8 last:mb-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#1E1E22] z-10 ${
                          isCompleted ? 'bg-[#C8923C] text-[#0F0F11]' : 'bg-[#141416] text-[#6B6B70] ring-2 ring-[#2A2A2E]'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-[#6B6B70]"></div>
                          )}
                        </div>
                        <div className="ml-4 pt-1">
                          <p className={`font-medium ${isCurrent ? 'text-[#C8923C]' : isCompleted ? 'text-[#E8E4DF]' : 'text-[#6B6B70]'}`}>
                            {step.label}
                          </p>
                          {idx === 0 && (
                            <p className="text-xs text-[#9A9A9E] mt-1">
                              {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: fr })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:w-1/3 space-y-6">
            
            {/* Update Status */}
            <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] p-6">
              <h2 className="text-lg font-bold mb-4">Mettre à jour le Statut</h2>
              <div className="space-y-3">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
                <button 
                  onClick={handleStatusUpdate}
                  disabled={selectedStatus === order.status}
                  className="w-full bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmer
                </button>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] p-6">
              <h2 className="text-lg font-bold mb-4">Client</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C8923C]/20 text-[#C8923C] flex items-center justify-center font-bold text-lg">
                    {order.shippingAddress.firstName.charAt(0)}{order.shippingAddress.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-[#E8E4DF]">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#2A2A2E] flex justify-between">
                  <span className="text-[#9A9A9E]">Email</span>
                  <span className="text-[#E8E4DF]">client@example.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9A9A9E]">Téléphone</span>
                  <span className="text-[#E8E4DF]">{order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] p-6">
              <h2 className="text-lg font-bold mb-4">Adresse de Livraison</h2>
              <div className="text-sm text-[#E8E4DF] leading-relaxed">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.postalCode && `${order.shippingAddress.postalCode} `}{order.shippingAddress.city}</p>
                <p>Maroc</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] p-6">
              <h2 className="text-lg font-bold mb-4">Résumé Financier</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9A9A9E]">Sous-total</span>
                  <span className="text-[#E8E4DF]">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9A9A9E]">Frais de livraison</span>
                  <span className="text-[#E8E4DF]">{order.shippingCost === 0 ? 'Gratuit' : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="pt-3 border-t border-[#2A2A2E] flex justify-between font-bold text-base">
                  <span className="text-[#E8E4DF]">Total</span>
                  <span className="text-[#C8923C]">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] p-6">
              <h2 className="text-lg font-bold mb-4">Méthode de Paiement</h2>
              <div className="flex items-center gap-3">
                {order.paymentMethod === 'cod' ? (
                  <>
                    <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </div>
                    <div>
                      <div className="font-medium">Paiement à la livraison</div>
                      <div className="text-xs text-[#9A9A9E]">Espèces</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                    </div>
                    <div>
                      <div className="font-medium">Carte Bancaire</div>
                      <div className="text-xs text-[#9A9A9E]">En ligne</div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
