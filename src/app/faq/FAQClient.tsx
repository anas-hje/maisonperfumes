'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type FAQCategory = 'Commandes & Paiement' | 'Livraison' | 'Retours & Échanges' | 'Produits'

const faqs = [
  // Commandes & Paiement
  { category: 'Commandes & Paiement', q: 'Y a-t-il un montant minimum pour commander ?', a: 'Non, il n\'y a pas de montant minimum pour passer commande chez Maison.' },
  { category: 'Commandes & Paiement', q: 'Quels sont les moyens de paiement acceptés ?', a: 'Nous acceptons les paiements par carte bancaire (Visa, MasterCard, CMI) ainsi que le paiement à la livraison.' },
  { category: 'Commandes & Paiement', q: 'Comment puis-je suivre ma commande ?', a: 'Une fois votre commande expédiée, vous recevrez un email avec un lien de suivi. Vous pouvez également suivre votre commande depuis la page "Suivi de Commande".' },
  { category: 'Commandes & Paiement', q: 'Puis-je modifier ou annuler ma commande ?', a: 'Vous pouvez modifier ou annuler votre commande dans l\'heure qui suit sa validation en contactant notre service client.' },
  { category: 'Commandes & Paiement', q: 'Combien de temps faut-il pour traiter une commande ?', a: 'Les commandes sont généralement traitées et préparées en 24h ouvrées.' },
  
  // Livraison
  { category: 'Livraison', q: 'Quels sont les délais de livraison ?', a: 'La livraison standard prend de 3 à 5 jours ouvrables. La livraison express est disponible pour les grandes villes en 24-48h.' },
  { category: 'Livraison', q: 'Quelles sont les villes couvertes ?', a: 'Nous livrons partout au Maroc.' },
  { category: 'Livraison', q: 'La livraison est-elle gratuite ?', a: 'La livraison est gratuite pour les commandes supérieures à 500 MAD vers Casablanca, Rabat, Marrakech, Fès et Tanger.' },
  { category: 'Livraison', q: 'Livrez-vous à l\'international ?', a: 'Pour le moment, nous expédions uniquement au Maroc.' },

  // Retours
  { category: 'Retours & Échanges', q: 'Quelle est votre politique de retour ?', a: 'Vous disposez de 14 jours pour nous retourner un produit, à condition qu\'il soit non ouvert et dans son emballage d\'origine.' },
  { category: 'Retours & Échanges', q: 'Comment effectuer un retour ?', a: 'Contactez notre service client via la page Contact pour initier la procédure de retour et recevoir les instructions détaillées.' },
  { category: 'Retours & Échanges', q: 'Quel est le délai de remboursement ?', a: 'Les remboursements sont effectués sous 7 jours ouvrés après réception et vérification du produit retourné.' },
  { category: 'Retours & Échanges', q: 'Puis-je échanger un produit ?', a: 'Les échanges sont possibles sous les mêmes conditions que les retours (produit non ouvert).' },

  // Produits
  { category: 'Produits', q: 'Garantissez-vous l\'authenticité des produits ?', a: 'Absolument. Nous sommes revendeurs agréés pour toutes les marques que nous proposons. Chaque produit est 100% authentique.' },
  { category: 'Produits', q: 'Comment bien choisir mon parfum ?', a: 'Nos conseillers sont disponibles via le formulaire de contact pour vous guider. Nous vous recommandons de lire les notes olfactives détaillées sur chaque fiche produit.' },
  { category: 'Produits', q: 'Quelle est la durée de conservation d\'un parfum ?', a: 'Conservé à l\'abri de la lumière et de la chaleur, un parfum se garde généralement de 3 à 5 ans.' },
]

const categories: FAQCategory[] = ['Commandes & Paiement', 'Livraison', 'Retours & Échanges', 'Produits']

export default function FAQClient() {
  const [activeTab, setActiveTab] = useState<FAQCategory>('Commandes & Paiement')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = searchQuery ? true : faq.category === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="min-h-screen bg-graphite py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display text-light mb-6">Questions Fréquentes</h1>
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setOpenIndex(null)
              }}
              className="w-full bg-obsidian border border-white/10 rounded-full px-6 py-3 pl-12 text-light focus:outline-none focus:border-amber shadow-sm"
            />
            <svg className="w-5 h-5 text-quartz absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        {!searchQuery && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat)
                  setOpenIndex(null)
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === cat
                    ? 'bg-amber text-graphite shadow-md'
                    : 'bg-obsidian text-quartz border border-white/10 hover:border-amber'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4 mb-16">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-obsidian rounded-xl shadow-sm border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus-visible:bg-graphite"
                >
                  <span className="font-medium text-light pr-8">{faq.q}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-amber text-white' : 'bg-graphite text-quartz'}`}>
                    <svg className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0 text-quartz leading-relaxed border-t border-white/8 mt-2">
                        <div className="pt-3">{faq.a}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-quartz">
              Aucune question trouvée pour &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>

        <div className="bg-amber/5 rounded-2xl p-8 border border-amber/20 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-display text-light mb-3">Vous n&apos;avez pas trouvé votre réponse ?</h3>
          <p className="text-quartz mb-6">Notre équipe de service client est à votre écoute pour vous assister.</p>
          <Link href="/contact" className="inline-flex items-center justify-center bg-amber hover:bg-brass text-graphite font-medium py-3 px-8 rounded-lg transition-colors">
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  )
}
