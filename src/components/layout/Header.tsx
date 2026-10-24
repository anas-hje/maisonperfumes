'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useAdminContentStore } from '@/lib/store/admin-content'

const navLinks = [
  { label: 'Parfums', href: '/categorie/parfums' },
  { label: 'Cosmétiques', href: '/categorie/cosmetiques' },
  { label: 'Soin Visage', href: '/categorie/soin-visage' },
  { label: 'Corps & Bain', href: '/categorie/corps-et-bain' },
  { label: 'Cheveux', href: '/categorie/cheveux' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const cartItems = useCartStore((s) => s.items)
  const wishlistItems = useWishlistStore((s) => s.items)
  const { openMobileMenu, openSearch, openCart } = useUIStore()
  
  const content = useAdminContentStore((s) => s.content)
  const [showAnnouncement, setShowAnnouncement] = useState(false)

  // Intentionally an effect, not a derived value: showAnnouncement also has a local
  // "dismissed" state (the close button below), so it isn't a pure function of
  // content.announcement.enabled — it needs to reset only when enabled itself changes.
  useEffect(() => {
    setShowAnnouncement(Boolean(content?.announcement?.enabled)) // eslint-disable-line react-hooks/set-state-in-effect
  }, [content?.announcement?.enabled])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistItems.length

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Tinted translucent bars rather than solid fills — a full-width block of saturated
  // colour reads as a browser warning strip against the dark theme.
  const getAnnouncementColor = (preset?: string) => {
    switch (preset) {
      case 'red': return 'bg-red-500/12 text-red-200 border-red-400/20'
      case 'green': return 'bg-emerald-500/12 text-emerald-200 border-emerald-400/20'
      case 'blue': return 'bg-sky-500/12 text-sky-200 border-sky-400/20'
      case 'amber':
      default: return 'bg-amber/12 text-amber border-amber/20'
    }
  }

  return (
    <>
      <AnimatePresence>
        {showAnnouncement && content?.announcement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`fixed top-0 left-0 right-0 w-full border-b backdrop-blur-xl ${getAnnouncementColor(content.announcement.colorPreset)} text-xs tracking-wide py-2 px-4 z-50`}
          >
            <div className="container mx-auto flex items-center justify-center relative">
              <Link href={content.announcement.link || '#'} className="hover:underline text-center">
                {content.announcement.text}
              </Link>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="absolute right-0 p-1 hover:opacity-70 transition-opacity"
                aria-label="Fermer l'annonce"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ top: showAnnouncement ? '32px' : '0' }}
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            // Near-opaque rather than the shared glass token: large display type
            // scrolling underneath stayed legible through an 82%-opaque bar.
            ? 'bg-graphite/95 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.85)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* Three columns rather than a centred-absolute logo: the logo used to be
            positioned over a left-aligned nav row and the two collided around 1024px.
            A grid gives the logo its own track, so they can never overlap. */}
        <div className="container mx-auto px-6 h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Mobile hamburger */}
          <div className="flex items-center gap-4 xl:hidden">
            <button
              onClick={openMobileMenu}
              className="p-2 text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              aria-label="Ouvrir le menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-quartz hover:text-amber transition-colors tracking-wide whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link
            href="/"
            className="justify-self-center flex items-center focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
          >
            <span className="font-display text-xl sm:text-2xl tracking-[0.28em] sm:tracking-[0.34em] text-light uppercase whitespace-nowrap">
              Maison
            </span>
          </Link>

          {/* Right icons */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 xl:gap-5">
            {/* Search */}
            <button
              onClick={openSearch}
              className="p-2 text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              aria-label="Rechercher"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-quartz hover:text-amber transition-colors relative focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              aria-label={`Favoris (${wishlistCount})`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/compte"
              className="p-2 text-quartz hover:text-amber transition-colors hidden sm:block focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              aria-label="Mon compte"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="p-2 text-quartz hover:text-amber transition-colors relative focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              aria-label={`Panier (${cartCount} articles)`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-amber text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </motion.header>
    </>
  )
}
