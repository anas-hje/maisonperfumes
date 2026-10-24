'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

import StatCard from '@/components/admin/StatCard'
import { RevenueAreaChart, CategoryPieChart } from '@/components/admin/AdminChart'
import DataTable from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'

import { computeKPIs, computeMonthlyRevenue, computeCategoryRevenue } from '@/lib/utils/analytics-helpers'
import { useOrders } from '@/lib/hooks/useOrders'
import { useProducts } from '@/lib/adapters/product-source'
import { formatPrice } from '@/lib/utils'
import { Order } from '@/lib/types'
import { useMounted } from '@/lib/hooks/useMounted'

export default function AdminDashboardPage() {
  const router = useRouter()
  const mounted = useMounted()

  const { orders, isLoading: ordersLoading } = useOrders()
  const products = useProducts()


  if (!mounted || ordersLoading) return null

  // Sort orders descending by date for recent orders
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8)
  const currentDate = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })

  const kpis = computeKPIs(orders)
  const revenueChartData = computeMonthlyRevenue(orders)
  const categoryChartData = computeCategoryRevenue(orders, products)

  const orderColumns = [
    { key: 'id', label: 'ID Commande' },
    { 
      key: 'createdAt', 
      label: 'Date', 
      render: (order: Order) => format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm') 
    },
    { 
      key: 'customer', 
      label: 'Client',
      render: (order: Order) => `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
    },
    {
      key: 'articles',
      label: 'Articles',
      render: (order: Order) => {
        const itemNames = order.items.map(item => {
          const product = products.find(p => p.id === item.productId)
          return product ? product.name : 'Produit inconnu'
        })
        return <span className="text-sm truncate max-w-[150px] inline-block" title={itemNames.join(', ')}>{itemNames.join(', ')}</span>
      }
    },
    { 
      key: 'total', 
      label: 'Total',
      render: (order: Order) => formatPrice(order.total)
    },
    { 
      key: 'status', 
      label: 'Statut',
      render: (order: Order) => <StatusBadge status={order.status} />
    }
  ]

  const handleExport = () => {
    toast.success('Rapport exporté avec succès')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#E8E4DF] font-[family-name:var(--font-inter)]">Tableau de Bord</h1>
          <p className="text-[#9A9A9E] mt-1 capitalize">Bienvenue, Administrateur • {currentDate}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenu Total" 
          value={formatPrice(kpis.totalRevenue)} 
          change={kpis.revenueChange}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          title="Commandes" 
          value={kpis.totalOrders.toLocaleString('fr-MA')} 
          change={kpis.ordersChange}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard 
          title="Clients Actifs" 
          value={kpis.activeCustomers.toLocaleString('fr-MA')} 
          change={kpis.customersChange}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard 
          title="Taux de Conversion" 
          value={`${kpis.conversionRate}%`} 
          change={kpis.conversionChange}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Évolution du Chiffre d&apos;Affaires</h2>
          <RevenueAreaChart data={revenueChartData} />
        </div>
        <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Répartition par Catégorie</h2>
          <CategoryPieChart data={categoryChartData} />
        </div>
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#E8E4DF]">Dernières Commandes</h2>
            <Link href="/admin/commandes" className="text-sm text-[#C8923C] hover:text-[#D4A853] transition-colors">
              Voir tout
            </Link>
          </div>
          <DataTable
            data={recentOrders}
            columns={orderColumns}
            searchable={false}
            onRowClick={(order) => router.push(`/admin/commandes/${order.id}`)}
          />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Actions Rapides</h2>
          
          <Link href="/admin/produits/nouveau" className="flex items-center p-4 bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-xl hover:bg-[#252529] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-[#C8923C]/10 flex items-center justify-center text-[#C8923C] mr-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#E8E4DF]">Ajouter un Produit</h3>
              <p className="text-xs text-[#9A9A9E] mt-0.5">Créer un nouvel article</p>
            </div>
          </Link>
          
          <Link href="/admin/commandes" className="flex items-center p-4 bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-xl hover:bg-[#252529] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mr-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#E8E4DF]">Voir les Commandes</h3>
              <p className="text-xs text-[#9A9A9E] mt-0.5">Gérer les commandes</p>
            </div>
          </Link>
          
          <button onClick={handleExport} className="w-full flex items-center p-4 bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-xl hover:bg-[#252529] transition-colors group text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mr-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#E8E4DF]">Exporter le Rapport</h3>
              <p className="text-xs text-[#9A9A9E] mt-0.5">Télécharger en PDF/CSV</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
