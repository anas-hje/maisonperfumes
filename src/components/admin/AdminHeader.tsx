'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminHeaderProps {
  isSidebarCollapsed: boolean
}

export default function AdminHeader({ isSidebarCollapsed }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getPageTitle = () => {
    if (!pathname || pathname === '/admin') return 'Tableau de Bord'
    if (pathname.includes('/produits')) return 'Produits'
    if (pathname.includes('/commandes')) return 'Commandes'
    if (pathname.includes('/clients')) return 'Clients'
    if (pathname.includes('/contenu')) return 'Contenu CMS'
    if (pathname.includes('/statistiques')) return 'Statistiques'
    if (pathname.includes('/parametres')) return 'Paramètres'
    return 'Administration'
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    ...(pathname !== '/admin' ? [{ label: getPageTitle(), href: pathname }] : [])
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className={`fixed top-0 right-0 h-16 bg-[#1E1E22] border-b border-[rgba(200,146,60,0.08)] z-40 transition-all duration-300 flex items-center justify-between px-6 font-[family-name:var(--font-inter)] ${
      isSidebarCollapsed ? 'left-20' : 'left-64'
    }`}>
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-semibold text-[#E8E4DF]">{getPageTitle()}</h1>
        <div className="flex items-center text-xs text-[#6B6B70] mt-0.5 space-x-1">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <Link href={crumb.href} className="hover:text-[#C8923C] transition-colors">
                {crumb.label}
              </Link>
              {index < breadcrumbs.length - 1 && <span>›</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-[#9A9A9E] hover:text-[#E8E4DF] hover:bg-[#252529] rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#1E1E22]"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-[#252529] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8923C] focus:ring-opacity-50"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C8923C] to-[#A67D4B] flex items-center justify-center text-white font-semibold text-sm">
              AD
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1E1E22] border border-[rgba(200,146,60,0.15)] rounded-lg shadow-xl py-1 z-50">
              <Link href="/admin/profil" className="block px-4 py-2 text-sm text-[#E8E4DF] hover:bg-[#252529] hover:text-[#C8923C] transition-colors">
                Mon Profil
              </Link>
              <Link href="/admin/parametres" className="block px-4 py-2 text-sm text-[#E8E4DF] hover:bg-[#252529] hover:text-[#C8923C] transition-colors">
                Paramètres
              </Link>
              <div className="h-px bg-[rgba(200,146,60,0.08)] my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#252529] transition-colors"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
