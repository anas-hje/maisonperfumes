'use client'

import React from 'react'

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  changeLabel?: string
}

export default function StatCard({ title, value, change, icon, changeLabel = 'vs mois précédent' }: StatCardProps) {
  const isPositive = change >= 0
  const isNeutral = change === 0

  return (
    <div className="bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-xl p-6 font-[family-name:var(--font-inter)] hover:bg-[#252529] transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-[#C8923C]/10 flex items-center justify-center text-[#C8923C]">
          {icon}
        </div>
        <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${
          isNeutral ? 'bg-gray-500/10 text-gray-400' : isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {!isNeutral && (
            <svg 
              className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-[#E8E4DF] mb-1">{value}</h3>
        <p className="text-[#9A9A9E] text-sm font-medium">{title}</p>
        <p className="text-[#6B6B70] text-xs mt-2">{changeLabel}</p>
      </div>
    </div>
  )
}
