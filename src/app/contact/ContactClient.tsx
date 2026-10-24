'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function ContactClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      toast.success('Votre message a été envoyé avec succès.')
      setIsSubmitting(false)
      ;(e.target as HTMLFormElement).reset()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-graphite py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display text-light mb-4">Contactez-nous</h1>
          <p className="text-quartz max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans votre expérience olfactive.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10 text-center"
          >
            <div className="w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-light mb-2">Téléphone</h3>
            <p className="text-quartz">+212 522-123456</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10 text-center"
          >
            <div className="w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-light mb-2">Email</h3>
            <p className="text-quartz">contact@maison.ma</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10 text-center"
          >
            <div className="w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-light mb-2">Adresse</h3>
            <p className="text-quartz">Casablanca, Morocco</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10 space-y-6">
              <h2 className="text-2xl font-display text-light mb-6">Envoyez-nous un message</h2>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-light mb-2">Nom complet</label>
                <input
                  type="text"
                  id="nom"
                  required
                  className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-amber transition-colors"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-amber transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label htmlFor="sujet" className="block text-sm font-medium text-light mb-2">Sujet</label>
                <select
                  id="sujet"
                  required
                  className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-amber transition-colors appearance-none"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="question">Question</option>
                  <option value="reclamation">Réclamation</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-light mb-2">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-amber transition-colors resize-none"
                  placeholder="Votre message..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber hover:bg-brass text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le Message'}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-obsidian rounded-xl shadow-sm border border-white/10 p-8 flex-grow flex items-center justify-center">
              <p className="text-quartz font-medium text-lg">Carte à venir</p>
            </div>
            <div className="bg-obsidian p-8 rounded-xl shadow-sm border border-white/10">
              <h3 className="text-xl font-display text-light mb-4">Heures d&apos;ouverture</h3>
              <ul className="space-y-3 text-quartz">
                <li className="flex justify-between items-center pb-3 border-b border-white/8">
                  <span>Lundi - Samedi</span>
                  <span className="font-medium text-light">9h - 20h</span>
                </li>
                <li className="flex justify-between items-center pt-1">
                  <span>Dimanche</span>
                  <span className="font-medium text-light">10h - 18h</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
