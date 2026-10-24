'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ProductCard from '@/components/product/ProductCard'
import Button from '@/components/ui/Button'
import { useProducts } from '@/lib/adapters/product-source'
import { useAdminContentStore } from '@/lib/store/admin-content'
import { categories } from '@/lib/data/categories'
import { categoryImageUrl } from '@/lib/data/product-images'
import ProductImage from '@/components/ui/ProductImage'
import { toast } from 'sonner'
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
}

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

const brands = ['Dior', 'Chanel', 'Tom Ford', 'YSL', 'Lancôme', 'Guerlain', 'MAC', 'NARS']

export default function HomeSections() {
  const products = useProducts()
  const { content } = useAdminContentStore()
  const [email, setEmail] = useState('')

  const bestSellers = products.filter(p => content.bestSellerProductIds.includes(p.id))
  const newArrivals = products.filter(p => p.isNewArrival)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success('Merci de votre inscription à notre newsletter !')
    setEmail('')
  }

  const renderTrustIcon = (iconName: string) => {
    switch (iconName) {
      case 'truck': return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-amber">
          <path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          <path d="M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
        </svg>
      );
      case 'headphones': return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-amber">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
        </svg>
      );
      case 'shield': return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-amber">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      );
      case 'star': return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-amber">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
      );
      default: return null;
    }
  }

  return (
    <div className="overflow-hidden bg-graphite">
      {/* ─── HERO ─── */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Layered background: drifting aurora, technical grid, fine dot texture. */}
        <div className="aurora z-0" aria-hidden="true" />
        <div className="absolute inset-0 grid-veil z-0" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.05] z-0"
          aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
        {/* Fade the hero into the section below so the seam isn't a hard line. */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-graphite z-0" aria-hidden="true" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-5xl mx-auto space-y-8"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="inline-flex items-center gap-2.5 rounded-full glass-surface px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-quartz"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_10px_var(--color-aqua)]" />
            Parfumerie · Maroc
          </motion.p>

          <h1 className="font-display text-6xl md:text-8xl lg:text-[8.5rem] leading-[0.92] text-light tracking-[0.04em] uppercase">
            {content.hero.title}
          </h1>

          <div className="rule-fade mx-auto max-w-sm" />

          <p className="text-lg md:text-xl font-light tracking-wide text-quartz max-w-2xl mx-auto leading-relaxed">
            {content.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href={content.hero.ctaLink} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto ring-iridescent rounded-full px-10">
                {content.hero.ctaText}
              </Button>
            </Link>
            <Link href="#best-sellers" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto rounded-full px-10">
                Nos Best-Sellers
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-quartz/50 rounded-full flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-2.5 bg-amber rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── BRANDS LOGOS ─── */}
      <section className="py-12 border-y border-quartz/10 bg-obsidian">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            {brands.map((brand, i) => (
              <motion.span
                key={brand}
                {...stagger}
                transition={{ delay: i * 0.1 }}
                className="font-display text-2xl md:text-3xl uppercase tracking-widest text-light"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED CATEGORIES ─── */}
      <section className="py-24 px-6 md:px-12 bg-obsidian">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            {...fadeUp}
            className="font-display text-3xl md:text-4xl text-light text-center mb-16 uppercase tracking-[0.2em]"
          >
            Nos Catégories
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={`/categorie/${cat.slug}`}
                  className="group block focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
                >
                  {/* The card previously ignored cat.image and rendered an empty
                      panel; it now shows real photography behind the label. */}
                  <div className="relative h-64 overflow-hidden rounded-xl border border-white/8 bg-obsidian transition-all duration-500 hover:-translate-y-2 hover:border-amber/35 hover:shadow-[0_24px_60px_-24px_rgba(217,164,65,0.4)]">
                    <ProductImage
                      src={categoryImageUrl(cat.slug)}
                      alt=""
                      fallbackLabel={cat.name.charAt(0)}
                      fallbackLabelClassName="text-6xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/55 to-transparent"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="font-display text-2xl text-amber mb-2">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-quartz/85 font-light line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEST SELLERS ─── */}
      <section id="best-sellers" className="py-24 px-6 md:px-12 bg-graphite">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <motion.h2
              {...fadeUp}
              className="font-display text-3xl md:text-4xl text-light uppercase tracking-[0.2em]"
            >
              Best-Sellers
            </motion.h2>
            <Link
              href="/bestsellers"
              className="text-amber hover:text-brass text-sm uppercase tracking-wider underline underline-offset-8 transition-colors focus-visible:outline-2 focus-visible:outline-amber"
            >
              Voir tout
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory -mx-6 px-6 scrollbar-thin scrollbar-thumb-amber/50 scrollbar-track-transparent">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                className="min-w-[260px] md:min-w-[300px] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEW ARRIVALS ─── */}
      {newArrivals.length > 0 && (
        <section className="py-24 px-6 md:px-12 bg-obsidian">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <motion.h2
                {...fadeUp}
                className="font-display text-3xl md:text-4xl text-light uppercase tracking-[0.2em]"
              >
                Nouveautés
              </motion.h2>
              <Link
                href="/nouveautes"
                className="text-amber hover:text-brass text-sm uppercase tracking-wider underline underline-offset-8 transition-colors focus-visible:outline-2 focus-visible:outline-amber"
              >
                Voir tout
              </Link>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory -mx-6 px-6 scrollbar-thin scrollbar-thumb-amber/50 scrollbar-track-transparent">
              {newArrivals.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[260px] md:min-w-[300px] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PROMOTIONS BANNER ─── */}
      {content.promo.active && (
        <section className="py-20 px-6 bg-gradient-to-r from-brass via-amber to-brass text-white text-center">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl mb-6 uppercase tracking-wider text-white">
              {content.promo.title}
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              {content.promo.description} {content.promo.discountPercent > 0 && <span>(-{content.promo.discountPercent}%)</span>}
            </p>
            <Link href="/categorie/parfums">
              <Button
                size="lg"
                className="bg-obsidian text-amber hover:glass-surface-strong border-none"
              >
                Profiter de l&apos;offre
              </Button>
            </Link>
          </motion.div>
        </section>
      )}

      {/* ─── NEWSLETTER ─── */}
      <section className="py-24 px-6 md:px-12 bg-graphite border-b border-quartz/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl text-light uppercase tracking-[0.2em] mb-4">
              Restez Informé
            </h2>
            <p className="text-quartz/80 mb-8 max-w-xl mx-auto">
              Inscrivez-vous à notre newsletter pour recevoir des offres exclusives, découvrir nos nouveautés et profiter de conseils beauté.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-obsidian border border-quartz/20 px-4 py-3 rounded-none focus:outline-none focus:border-amber transition-colors text-quartz"
              />
              <Button type="submit" className="rounded-none">S&apos;inscrire</Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="py-16 bg-obsidian">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {content.trustBadges.map((badge, idx) => (
            <motion.div key={idx} {...stagger} transition={{ duration: 0.5, delay: idx * 0.1 }} className="space-y-3">
              {renderTrustIcon(badge.icon)}
              <h4 className="font-display text-base text-light uppercase tracking-wide">
                {badge.title}
              </h4>
              <p className="text-xs text-quartz/60 uppercase tracking-[0.15em]">
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
