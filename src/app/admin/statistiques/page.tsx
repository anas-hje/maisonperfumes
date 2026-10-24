'use client'

import React, { useState } from 'react'
import { subDays, subMonths, isAfter, parseISO } from 'date-fns'
import {
  RevenueAreaChart,
  CategoryPieChart,
  OrdersBarChart,
  ConversionFunnelChart,
  StatusDistributionChart
} from '@/components/admin/AdminChart'
import DataTable from '@/components/admin/DataTable'
import {
  computeMonthlyRevenue,
  computeCategoryRevenue,
  computeCityOrders,
  computeTopProducts,
  computeStatusDistribution,
  computePaymentSplit
} from '@/lib/utils/analytics-helpers'
import { useOrders } from '@/lib/hooks/useOrders'
import { useProducts } from '@/lib/adapters/product-source'
import { formatPrice } from '@/lib/utils'
import { useMounted } from '@/lib/hooks/useMounted'

// Static data for conversion funnel (since we don't have traffic analytics yet)
const conversionFunnel = [
  { stage: 'Visites', count: 12500, percentage: 100 },
  { stage: 'Vues Produit', count: 8400, percentage: 67.2 },
  { stage: 'Ajout Panier', count: 3200, percentage: 25.6 },
  { stage: 'Paiement', count: 1850, percentage: 14.8 },
  { stage: 'Achat', count: 1245, percentage: 10.0 }
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30j')
  const mounted = useMounted()

  const { orders, isLoading: ordersLoading } = useOrders()
  const products = useProducts()


  const timeRanges = [
    { id: '7j', label: '7 Jours' },
    { id: '30j', label: '30 Jours' },
    { id: '90j', label: '90 Jours' },
    { id: '12m', label: '12 Mois' },
  ]

  if (!mounted || ordersLoading) return null

  // Filter orders based on time range
  const now = new Date()
  let filteredOrders = orders
  if (timeRange === '7j') {
    filteredOrders = orders.filter(o => isAfter(parseISO(o.createdAt), subDays(now, 7)))
  } else if (timeRange === '30j') {
    filteredOrders = orders.filter(o => isAfter(parseISO(o.createdAt), subDays(now, 30)))
  } else if (timeRange === '90j') {
    filteredOrders = orders.filter(o => isAfter(parseISO(o.createdAt), subDays(now, 90)))
  } else if (timeRange === '12m') {
    filteredOrders = orders.filter(o => isAfter(parseISO(o.createdAt), subMonths(now, 12)))
  }

  const revenueChartData = computeMonthlyRevenue(filteredOrders)
  const categoryChartData = computeCategoryRevenue(filteredOrders, products)
  const cityChartData = computeCityOrders(filteredOrders)
  const statusDonutData = computeStatusDistribution(filteredOrders)
  const topProductsData = computeTopProducts(filteredOrders, products)
  const paymentSplitData = computePaymentSplit(filteredOrders)

  type TopProduct = ReturnType<typeof computeTopProducts>[number]

  const productColumns = [
    { key: 'name', label: 'Produit', sortable: true },
    {
      key: 'revenue',
      label: 'Revenu',
      sortable: true,
      render: (item: TopProduct) => formatPrice(item.revenue)
    },
    {
      key: 'unitsSold',
      label: 'Unités Vendues',
      sortable: true,
      render: (item: TopProduct) => (
        <div className="flex items-center">
          <span className="font-medium">{item.unitsSold}</span>
          <span className="text-xs text-[#9A9A9E] ml-1">unités</span>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 font-[family-name:var(--font-inter)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#E8E4DF]">Statistiques</h1>
          <p className="text-[#9A9A9E] mt-1">Analyse détaillée de vos performances</p>
        </div>
        <div className="flex bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                timeRange === range.id
                  ? 'bg-[#C8923C]/10 text-[#C8923C]'
                  : 'text-[#9A9A9E] hover:text-[#E8E4DF] hover:bg-[#252529]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Section */}
      <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#E8E4DF] mb-6">Évolution du Chiffre d&apos;Affaires</h2>
        <div className="h-[300px]">
          <RevenueAreaChart data={revenueChartData} />
        </div>
      </div>

      {/* Two Columns: Category Pie & City Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-6">Répartition par Catégorie</h2>
          <div className="h-[300px]">
            <CategoryPieChart data={categoryChartData} />
          </div>
        </div>
        <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-6">Commandes par Ville</h2>
          <div className="h-[300px]">
            <OrdersBarChart data={cityChartData.slice(0, 5)} />
          </div>
        </div>
      </div>

      {/* Three Columns: Status, Funnel, Payment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-6">Statut des Commandes</h2>
          <div className="h-[300px]">
            <StatusDistributionChart data={statusDonutData} />
          </div>
        </div>
        <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-6">Entonnoir de Conversion</h2>
          <div className="h-[300px]">
            <ConversionFunnelChart data={conversionFunnel} />
          </div>
        </div>
        <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-2xl p-6 shadow-lg flex flex-col">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-6">Méthodes de Paiement</h2>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {paymentSplitData.map((method) => {
              const isCOD = method.method === 'cod';
              return (
                <div key={method.method} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-[#E8E4DF] uppercase">
                      {isCOD ? 'Paiement à la livraison' : 'Carte Bancaire'}
                    </span>
                    <span className="text-[#C8923C] font-semibold">{method.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#141416] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isCOD ? 'bg-[#C8923C]' : 'bg-[#D4A853]'}`}
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#9A9A9E]">{method.count.toLocaleString('fr-MA')} commandes</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#E8E4DF] mb-6">Meilleurs Produits</h2>
        <DataTable
          data={topProductsData}
          columns={productColumns}
          searchable={false}
        />
      </div>

      {/* Geographic Distribution (Table format) */}
      <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#E8E4DF] mb-6">Répartition Géographique</h2>
        <div className="space-y-4">
          {cityChartData.map((city, index) => {
            const maxOrders = Math.max(...cityChartData.map(c => c.orders));
            const percentage = maxOrders > 0 ? (city.orders / maxOrders) * 100 : 0;
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm text-[#E8E4DF] font-medium truncate">{city.city}</div>
                <div className="flex-1 h-6 bg-[#141416] rounded-md overflow-hidden relative group">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C8923C]/50 to-[#C8923C] rounded-md"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-white mix-blend-difference">{formatPrice(city.revenue)}</span>
                  </div>
                </div>
                <div className="w-24 text-right text-sm text-[#9A9A9E]">
                  {city.orders.toLocaleString('fr-MA')} cmd
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  )
}
