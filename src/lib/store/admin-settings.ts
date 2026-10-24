'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminSettingsStore {
  storeName: string
  contactEmail: string
  contactPhone: string
  socialLinks: { instagram: string; facebook: string; tiktok: string; whatsapp: string }
  shippingConfig: { freeShippingCities: string[]; defaultShippingCost: number; freeShippingThreshold: number }
  paymentConfig: { codEnabled: boolean; cardEnabled: boolean; codFee: number }
  notifications: { emailOnOrder: boolean; whatsappOnOrder: boolean }
  updateSettings: (updates: Partial<Omit<AdminSettingsStore, 'updateSettings'>>) => void
}

export const useAdminSettingsStore = create<AdminSettingsStore>()(
  persist(
    (set) => ({
      storeName: 'Maison',
      contactEmail: 'contact@maison.ma',
      contactPhone: '+212 5XX-XXXXXX',
      socialLinks: {
        instagram: '@maison.ma',
        facebook: 'maisonparfumerie',
        tiktok: '@maison.ma',
        whatsapp: '+212600000000'
      },
      shippingConfig: {
        freeShippingCities: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'],
        defaultShippingCost: 35,
        freeShippingThreshold: 500
      },
      paymentConfig: {
        codEnabled: true,
        cardEnabled: true,
        codFee: 0
      },
      notifications: {
        emailOnOrder: true,
        whatsappOnOrder: true
      },
      updateSettings: (updates) => {
        set((state) => ({ ...state, ...updates }))
      }
    }),
    {
      name: 'maison-admin-settings',
      skipHydration: true,
    }
  )
)
