'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useUIStore } from '@/lib/store/ui'

const navLinks = [
  { label: 'Parfums', href: '/categorie/parfums' },
  { label: 'Cosmétiques', href: '/categorie/cosmetiques' },
  { label: 'Soin Visage', href: '/categorie/soin-visage' },
  { label: 'Corps & Bain', href: '/categorie/corps-et-bain' },
  { label: 'Cheveux', href: '/categorie/cheveux' },
]

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore()

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-graphite/95 backdrop-blur-xl flex flex-col pt-24 px-8 pb-8 lg:hidden border-l border-white/8"
        >
          <button
            onClick={closeMobileMenu}
            className="absolute top-6 right-6 p-2 text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber"
            aria-label="Fermer le menu"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <nav className="flex flex-col gap-6 mt-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={link.href}
                  className="text-3xl font-display text-light hover:text-amber transition-colors tracking-wide focus-visible:outline-2 focus-visible:outline-amber"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-auto flex flex-col gap-4 text-sm"
          >
            <Link
              href="/compte"
              onClick={closeMobileMenu}
              className="text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber"
            >
              Mon Compte
            </Link>
            <Link
              href="/wishlist"
              onClick={closeMobileMenu}
              className="text-quartz hover:text-amber transition-colors focus-visible:outline-2 focus-visible:outline-amber"
            >
              Mes Favoris
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
