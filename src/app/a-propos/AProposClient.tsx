'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AProposClient() {
  return (
    <div className="min-h-screen bg-graphite">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-obsidian border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-display text-light mb-6">Notre Histoire</h1>
            <p className="text-xl text-amber font-display italic mb-8">
              L&apos;essence du luxe à la marocaine, où la tradition rencontre la modernité.
            </p>
            <div className="w-16 h-px bg-white/10 mx-auto mb-8"></div>
            <div className="space-y-6 text-quartz leading-relaxed text-lg">
              <p>
                Fondée à Casablanca, Maison est née d&apos;une passion ardente pour la haute parfumerie et le désir de créer un écrin de beauté inégalé au Maroc. Nous avons parcouru le monde pour sélectionner les fragrances les plus exquises et les marques les plus prestigieuses.
              </p>
              <p>
                Notre philosophie repose sur l&apos;authenticité et l&apos;excellence. Chaque produit de notre collection est soigneusement choisi pour sa qualité, son histoire et l&apos;émotion qu&apos;il suscite. Nous croyons que le parfum est bien plus qu&apos;une odeur ; c&apos;est une signature, un souvenir, une part de soi.
              </p>
              <p>
                Aujourd&apos;hui, Maison représente la destination par excellence pour les amateurs de parfums rares, les esthètes et tous ceux qui recherchent l&apos;élégance absolue.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display text-light text-center mb-16">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Authenticité', desc: 'Tous nos produits sont 100% originaux et proviennent directement des maisons mères.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'Excellence', desc: 'Un service client irréprochable pour une expérience d\'achat luxueuse.', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
              { title: 'Tradition', desc: 'Le respect du savoir-faire parfumeur et de l\'hospitalité marocaine.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
              { title: 'Innovation', desc: 'Une sélection avant-gardiste des dernières tendances mondiales.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            ].map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10 text-center hover:border-amber/30 transition-colors"
              >
                <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={value.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-light mb-3">{value.title}</h3>
                <p className="text-quartz text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-obsidian border-y border-white/8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
          {[
            { label: 'Marques', value: '25+' },
            { label: 'Clients', value: '2000+' },
            { label: 'Villes', value: '5' },
            { label: 'Authentique', value: '100%' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center px-4"
            >
              <div className="text-4xl md:text-5xl font-display text-amber mb-2">{stat.value}</div>
              <div className="text-sm md:text-base font-medium tracking-wider uppercase text-quartz">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team/Founder Placeholder */}
      <section className="py-24 px-6 bg-obsidian">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 w-full aspect-[4/5] bg-graphite rounded-2xl border border-white/10 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <span className="text-quartz font-display text-lg">Portrait de l&apos;équipe</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-display text-light mb-6">Notre Équipe</h2>
            <p className="text-quartz mb-8 leading-relaxed">
              Derrière Maison se cache une équipe de passionnés, des experts en parfumerie dédiés à vous offrir des conseils personnalisés. Nous sommes animés par le désir de partager notre amour pour les belles créations et de vous faire découvrir des jus exceptionnels qui souligneront votre personnalité.
            </p>
            <Link
              href="/categorie/parfums"
              className="inline-flex items-center justify-center bg-amber hover:bg-brass text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Découvrir notre collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
