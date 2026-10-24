'use client'

import React, { useState, useMemo } from 'react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  pageSize?: number
}

export default function DataTable<T extends object>({
  data,
  columns,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  emptyMessage = 'Aucune donnée trouvée.',
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((item) => {
      return Object.values(item as Record<string, unknown>).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [data, searchTerm])

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortConfig.key]
      const bValue = (b as Record<string, unknown>)[sortConfig.key]

      if (aValue == null || bValue == null) return 0
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="w-full bg-[#1E1E22] border border-[rgba(200,146,60,0.08)] rounded-xl overflow-hidden font-[family-name:var(--font-inter)] flex flex-col shadow-lg">
      {searchable && (
        <div className="p-4 border-b border-[rgba(200,146,60,0.08)] flex justify-between items-center bg-[#1E1E22]">
          <div className="relative w-64">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg pl-10 pr-4 py-2 text-sm text-[#E8E4DF] placeholder-[#6B6B70] focus:outline-none focus:ring-1 focus:ring-[#C8923C] focus:border-[#C8923C] transition-colors"
            />
            <div className="absolute left-3 top-2.5 text-[#6B6B70]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#E8E4DF]">
          <thead className="text-xs uppercase bg-[#18181B] text-[#9A9A9E] border-b border-[rgba(200,146,60,0.08)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 font-semibold ${col.sortable ? 'cursor-pointer hover:text-[#E8E4DF] select-none transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="flex flex-col text-[8px] opacity-50 ml-1">
                        <svg className={`w-2.5 h-2.5 ${sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'text-[#C8923C] opacity-100' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                        <svg className={`w-2.5 h-2.5 -mt-1 ${sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'text-[#C8923C] opacity-100' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`border-b border-[rgba(200,146,60,0.04)] hover:bg-[#252529] transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#18181B]/50'}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(item) : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-[#9A9A9E]">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-[rgba(200,146,60,0.08)] bg-[#18181B] flex items-center justify-between">
          <span className="text-sm text-[#9A9A9E]">
            Page <span className="font-medium text-[#E8E4DF]">{currentPage}</span> sur <span className="font-medium text-[#E8E4DF]">{totalPages}</span>
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-[#141416] text-[#E8E4DF] border border-[#2A2A2E] hover:bg-[#252529] hover:border-[#C8923C]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-[#141416] text-[#E8E4DF] border border-[#2A2A2E] hover:bg-[#252529] hover:border-[#C8923C]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
