'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function LivraisonClient() {
  return (
    <div className="min-h-screen bg-graphite py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display text-light mb-4">Livraison & Retours</h1>
          <p className="text-quartz max-w-2xl mx-auto">
            Nous apportons un soin particulier à l&apos;expédition de nos créations pour vous garantir une expérience d&apos;exception dès la réception.
          </p>
        </motion.div>

        {/* Shipping Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-amber/10 rounded-full flex items-center justify-center text-amber">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-light">Livraison Standard</h3>
            </div>
            <p className="text-quartz mb-4">Délai estimé: 3 à 5 jours ouvrables.</p>
            <p className="text-light font-medium text-lg">35 MAD</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-amber/10 rounded-full flex items-center justify-center text-amber">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-light">Livraison Express</h3>
            </div>
            <p className="text-quartz mb-4">Délai estimé: 24 à 48 heures.</p>
            <p className="text-light font-medium text-lg">75 MAD</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-amber/5 p-8 rounded-xl shadow-sm border border-amber/20 md:col-span-2"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-14 h-14 bg-amber rounded-full flex items-center justify-center text-white shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-light mb-2">Livraison Gratuite</h3>
                <p className="text-quartz">Pour les villes de <span className="font-medium text-light">Casablanca, Rabat, Marrakech, Fès, Tanger</span> sur toute commande supérieure à <span className="font-medium text-amber">500 MAD</span>.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Coverage */}
        <div className="mb-20">
          <h2 className="text-3xl font-display text-light mb-8 text-center">Zone de Couverture</h2>
          <div className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10">
            <p className="text-quartz text-center mb-6">Nous livrons dans toutes les grandes villes et régions du Maroc.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center text-light">
              {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'Mohammédia'].map(city => (
                <div key={city} className="py-2 px-4 rounded-lg bg-graphite border border-white/10 text-sm">
                  {city}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Returns */}
        <div className="mb-20">
          <h2 className="text-3xl font-display text-light mb-8 text-center">Politique de Retours</h2>
          <div className="space-y-8">
            <div className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10 flex flex-col md:flex-row gap-8 items-start">
              <div className="shrink-0 w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center text-amber">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-light mb-3">Conditions de retour</h3>
                <ul className="list-disc list-inside text-quartz space-y-2">
                  <li>Délai de rétractation de 14 jours après réception.</li>
                  <li>Les produits doivent être non ouverts et scellés dans leur emballage d&apos;origine.</li>
                  <li>Remboursement traité sous 7 jours ouvrés après réception du retour.</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: 1, title: 'Demande', desc: 'Contactez notre service client pour initier le retour.' },
                { step: 2, title: 'Préparation', desc: 'Emballez le produit soigneusement dans son carton.' },
                { step: 3, title: 'Expédition', desc: 'Remettez le colis à notre transporteur partenaire.' },
              ].map((item) => (
                <div key={item.step} className="bg-obsidian p-6 rounded-xl shadow-sm border border-white/10 text-center relative overflow-hidden">
                  <span className="absolute -top-4 -right-4 text-6xl font-display text-graphite z-0 font-bold">{item.step}</span>
                  <div className="relative z-10">
                    <h4 className="text-lg font-semibold text-light mb-2">Étape {item.step} : {item.title}</h4>
                    <p className="text-sm text-quartz">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Mini */}
        <div>
          <h2 className="text-3xl font-display text-light mb-8 text-center">Questions Fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Puis-je modifier mon adresse de livraison ?', a: 'Oui, tant que la commande n\'a pas encore été expédiée. Veuillez nous contacter rapidement.' },
              { q: 'Livrez-vous à l\'international ?', a: 'Actuellement, nous livrons exclusivement au Maroc.' },
              { q: 'Que faire si mon colis est endommagé ?', a: 'Contactez notre service client dans les 24h suivant la réception avec des photos du colis.' }
            ].map((faq, i) => (
              <details key={i} className="group bg-obsidian rounded-xl shadow-sm border border-white/10 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-light group-open:bg-graphite transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-quartz group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="p-6 pt-0 text-quartz border-t border-white/8">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
