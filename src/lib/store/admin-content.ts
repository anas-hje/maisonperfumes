'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CMSContent, HeroContent, AnnouncementBar, PromoBanner, TrustBadge } from '@/lib/types'

interface AdminContentStore {
  content: CMSContent
  updateHero: (hero: Partial<HeroContent>) => void
  updateAnnouncement: (announcement: Partial<AnnouncementBar>) => void
  updatePromo: (promo: Partial<PromoBanner>) => void
  updateTrustBadges: (badges: TrustBadge[]) => void
  updateFeaturedProducts: (ids: string[]) => void
  updateBestSellers: (ids: string[]) => void
  resetToDefaults: () => void
}

const defaultContent: CMSContent = {
  hero: {
    title: "L'Art du Parfum",
    subtitle: "Découvrez notre collection exclusive de parfums et cosmétiques de luxe, livrés partout au Maroc.",
    ctaText: "Explorer la Collection",
    ctaLink: "/categorie/parfums"
  },
  announcement: {
    text: "Livraison GRATUITE à Casablanca, Rabat et Marrakech 🚚",
    link: "/livraison",
    enabled: true,
    colorPreset: "amber"
  },
  promo: {
    title: "Soldes d'Été",
    description: "Jusqu'à -30% sur une sélection de parfums",
    discountPercent: 30,
    active: true,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
  },
  trustBadges: [
    { title: 'Livraison Rapide', icon: 'truck', description: 'Partout au Maroc' },
    { title: 'Support 24/7', icon: 'headphones', description: 'À votre écoute' },
    { title: 'Garantie Authenticité', icon: 'shield', description: 'Produits 100% originaux' }
  ],
  featuredProductIds: ['p001', 'p002', 'p003', 'p005', 'p009', 'p014', 'p022'],
  bestSellerProductIds: ['p001', 'p002', 'p009', 'p015', 'p022']
}

export const useAdminContentStore = create<AdminContentStore>()(
  persist(
    (set) => ({
      content: defaultContent,
      updateHero: (hero) => set((state) => ({ content: { ...state.content, hero: { ...state.content.hero, ...hero } } })),
      updateAnnouncement: (announcement) => set((state) => ({ content: { ...state.content, announcement: { ...state.content.announcement, ...announcement } } })),
      updatePromo: (promo) => set((state) => ({ content: { ...state.content, promo: { ...state.content.promo, ...promo } } })),
      updateTrustBadges: (badges) => set((state) => ({ content: { ...state.content, trustBadges: badges } })),
      updateFeaturedProducts: (ids) => set((state) => ({ content: { ...state.content, featuredProductIds: ids } })),
      updateBestSellers: (ids) => set((state) => ({ content: { ...state.content, bestSellerProductIds: ids } })),
      resetToDefaults: () => set({ content: defaultContent })
    }),
    {
      name: 'maison-admin-content',
      skipHydration: true,
    }
  )
)
