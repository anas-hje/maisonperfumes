'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminProductStore } from '@/lib/store/admin-products'
import { useAdminContentStore } from '@/lib/store/admin-content'
import { useAdminSettingsStore } from '@/lib/store/admin-settings'
import { useMounted } from '@/lib/hooks/useMounted'
import { Toaster } from 'sonner'

// Access control for everything under /admin (except /admin/login) is enforced
// server-side in src/proxy.ts via a signed session cookie — this layout only
// hydrates the (still client-only) product/order/content/settings stores and
// renders the admin shell. It does not gate access; by the time this renders,
// middleware has already verified the request.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isHydrated = useMounted()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    useAdminProductStore.persist.rehydrate()
    useAdminContentStore.persist.rehydrate()
    useAdminSettingsStore.persist.rehydrate()
  }, [])

  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: { background: '#1E1E22', color: '#E8E4DF', border: '1px solid rgba(200,146,60,0.1)' },
          }}
        />
      </>
    )
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C8923C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F11] font-[family-name:var(--font-inter)]">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <AdminHeader isSidebarCollapsed={isSidebarCollapsed} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#1E1E22',
            color: '#E8E4DF',
            border: '1px solid rgba(200,146,60,0.1)',
          },
        }}
      />
    </div>
  )
}
