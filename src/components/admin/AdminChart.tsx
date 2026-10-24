'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'

const BRAND_COLORS = {
  primary: '#C8923C', // Amber
  secondary: '#A67D4B', // Brass
  tertiary: '#D4A853', // Gold
  quaternary: '#B87333', // Copper
  quinary: '#8B7355', // Bronze
  textPrimary: '#E8E4DF',
  textMuted: '#9A9A9E',
  bgCard: '#1E1E22',
  border: 'rgba(200,146,60,0.15)'
}

const STATUS_COLORS = {
  pending: '#F59E0B', // Amber 500
  confirmed: '#3B82F6', // Blue 500
  shipped: '#8B5CF6', // Purple 500
  delivered: '#10B981', // Emerald 500
  cancelled: '#EF4444' // Red 500
}

const PIE_COLORS = [BRAND_COLORS.primary, BRAND_COLORS.secondary, BRAND_COLORS.tertiary, BRAND_COLORS.quaternary, BRAND_COLORS.quinary]

interface ChartTooltipPayloadEntry {
  color?: string
  name?: string
  value?: number
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayloadEntry[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.2)] p-3 rounded-lg shadow-xl">
        <p className="text-[#E8E4DF] font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center" style={{ color: entry.color || BRAND_COLORS.primary }}>
            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color || BRAND_COLORS.primary }}></span>
            {entry.name}: <span className="font-semibold ml-1">{entry.value?.toLocaleString('fr-MA')}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function RevenueAreaChart({ data }: { data: { month: string; revenue: number; previousRevenue?: number }[] }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={BRAND_COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={BRAND_COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke={BRAND_COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={BRAND_COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          {data[0]?.previousRevenue !== undefined && (
            <Area type="monotone" dataKey="previousRevenue" name="Période précédente" stroke={BRAND_COLORS.textMuted} strokeDasharray="5 5" fill="none" />
          )}
          <Area type="monotone" dataKey="revenue" name="Revenus" stroke={BRAND_COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryPieChart({ data }: { data: { category: string; revenue: number; percentage: number }[] }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="revenue"
            nameKey="category"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-[#9A9A9E] text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function OrdersBarChart({ data }: { data: { city: string; orders: number }[] }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" stroke={BRAND_COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis dataKey="city" type="category" stroke={BRAND_COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" name="Commandes" fill={BRAND_COLORS.primary} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ConversionFunnelChart({ data }: { data: { stage: string; count: number; percentage: number }[] }) {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="stage" type="category" stroke={BRAND_COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Visiteurs" fill={BRAND_COLORS.primary} radius={4} barSize={30}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BRAND_COLORS.primary} fillOpacity={1 - index * 0.15} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StatusDistributionChart({ data }: { data: { status: string; count: number }[] }) {
  const getStatusColor = (status: string) => {
    const key = status.toLowerCase();
    if (key.includes('attente') || key === 'pending') return STATUS_COLORS.pending;
    if (key.includes('confirm') || key === 'confirmed') return STATUS_COLORS.confirmed;
    if (key.includes('expédi') || key === 'shipped') return STATUS_COLORS.shipped;
    if (key.includes('livr') || key === 'delivered') return STATUS_COLORS.delivered;
    if (key.includes('annul') || key === 'cancelled') return STATUS_COLORS.cancelled;
    return BRAND_COLORS.primary;
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="count"
            nameKey="status"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-[#9A9A9E] text-xs capitalize">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
