'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAdminContentStore } from '@/lib/store/admin-content'
import { useAdminProductStore } from '@/lib/store/admin-products'
import { products as seedProducts } from '@/lib/data/products'
import FormField from '@/components/admin/FormField'
import ConfirmModal from '@/components/admin/ConfirmModal'

export default function ContenuPage() {
  const { 
    content, 
    updateHero, 
    updateAnnouncement, 
    updatePromo, 
    updateTrustBadges, 
    updateFeaturedProducts, 
    updateBestSellers,
    resetToDefaults
  } = useAdminContentStore()

  const { products, initialized, initializeProducts } = useAdminProductStore()

  useEffect(() => {
    if (!initialized) {
      initializeProducts(seedProducts)
    }
  }, [initialized, initializeProducts])

  const [activeTab, setActiveTab] = useState<'hero' | 'announcement' | 'promo' | 'badges' | 'collections'>('hero')
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  // Local state for forms
  const [heroForm, setHeroForm] = useState(content.hero)
  const [announcementForm, setAnnouncementForm] = useState(content.announcement)
  const [promoForm, setPromoForm] = useState(content.promo)
  const [badgesForm, setBadgesForm] = useState(content.trustBadges)
  const [featuredForm, setFeaturedForm] = useState(content.featuredProductIds)
  const [bestSellersForm, setBestSellersForm] = useState(content.bestSellerProductIds)

  // Each form is a locally-editable draft, so it can't be a pure derivation of the
  // store's content — it must resync only when the underlying content itself changes
  // (e.g. after this page's own save, or a rehydration finishing after mount).
  useEffect(() => {
    setHeroForm(content.hero) // eslint-disable-line react-hooks/set-state-in-effect
    setAnnouncementForm(content.announcement)
    setPromoForm(content.promo)
    setBadgesForm(content.trustBadges)
    setFeaturedForm(content.featuredProductIds)
    setBestSellersForm(content.bestSellerProductIds)
  }, [content])

  const handleSaveHero = () => {
    updateHero(heroForm)
    toast.success('Section Hero mise à jour')
  }

  const handleSaveAnnouncement = () => {
    updateAnnouncement(announcementForm)
    toast.success("Barre d'annonce mise à jour")
  }

  const handleSavePromo = () => {
    updatePromo(promoForm)
    toast.success('Bannière Promo mise à jour')
  }

  const handleSaveBadges = () => {
    updateTrustBadges(badgesForm)
    toast.success('Badges de confiance mis à jour')
  }

  const handleSaveCollections = () => {
    updateFeaturedProducts(featuredForm)
    updateBestSellers(bestSellersForm)
    toast.success('Collections mises à jour')
  }

  const handleReset = () => {
    resetToDefaults()
    toast.success('Contenu réinitialisé aux valeurs par défaut')
  }

  const toggleProduct = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(pId => pId !== id))
    } else {
      setList([...list, id])
    }
  }

  const tabs = [
    { id: 'hero', label: 'Section Hero' },
    { id: 'announcement', label: "Barre d'Annonce" },
    { id: 'promo', label: 'Bannière Promo' },
    { id: 'badges', label: 'Badges de Confiance' },
    { id: 'collections', label: 'Collections' }
  ] as const

  return (
    <div className="p-6 bg-[#0F0F11] min-h-screen text-[#E8E4DF] font-[family-name:var(--font-inter)] pb-24">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestion du Contenu</h1>
            <p className="text-[#9A9A9E] mt-1">Personnalisez les textes, images et sections de la boutique.</p>
          </div>
        </div>

        <div className="flex overflow-x-auto border-b border-[#2A2A2E] mb-6 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#C8923C] border-[#C8923C]'
                  : 'text-[#6B6B70] border-transparent hover:text-[#9A9A9E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#1E1E22] rounded-2xl border border-[rgba(200,146,60,0.08)] p-6 md:p-8">
          
          {/* TAB: HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <FormField label="Titre Principal">
                    <input 
                      type="text" 
                      value={heroForm.title}
                      onChange={(e) => setHeroForm({...heroForm, title: e.target.value})}
                      className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                    />
                  </FormField>
                  <FormField label="Sous-titre">
                    <textarea 
                      value={heroForm.subtitle}
                      onChange={(e) => setHeroForm({...heroForm, subtitle: e.target.value})}
                      rows={3}
                      className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none resize-none"
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Texte du Bouton">
                      <input 
                        type="text" 
                        value={heroForm.ctaText}
                        onChange={(e) => setHeroForm({...heroForm, ctaText: e.target.value})}
                        className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                      />
                    </FormField>
                    <FormField label="Lien du Bouton">
                      <input 
                        type="text" 
                        value={heroForm.ctaLink}
                        onChange={(e) => setHeroForm({...heroForm, ctaLink: e.target.value})}
                        className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                      />
                    </FormField>
                  </div>
                  <button 
                    onClick={handleSaveHero}
                    className="bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-6 py-2.5 mt-4 transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#9A9A9E] mb-4">Aperçu</h3>
                  <div className="aspect-video bg-[#141416] rounded-xl border border-[#2A2A2E] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl md:text-4xl font-serif text-white mb-3">{heroForm.title || 'Titre'}</h2>
                      <p className="text-[#E8E4DF] text-sm max-w-md mx-auto mb-6">{heroForm.subtitle || 'Sous-titre'}</p>
                      <button className="bg-[#C8923C] text-[#0F0F11] px-6 py-2 rounded font-medium text-sm">
                        {heroForm.ctaText || 'Bouton'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANNOUNCEMENT */}
          {activeTab === 'announcement' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-medium text-[#9A9A9E] mb-4">Aperçu</h3>
                {announcementForm.enabled ? (
                  <div className={`w-full py-2 px-4 text-center text-sm font-medium rounded ${
                    announcementForm.colorPreset === 'amber' ? 'bg-[#C8923C] text-[#0F0F11]' :
                    announcementForm.colorPreset === 'red' ? 'bg-red-500 text-white' :
                    announcementForm.colorPreset === 'green' ? 'bg-emerald-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {announcementForm.text || 'Texte de l\'annonce'}
                  </div>
                ) : (
                  <div className="w-full py-2 px-4 text-center text-sm font-medium rounded bg-[#141416] border border-[#2A2A2E] text-[#6B6B70] italic">
                    La barre d&apos;annonce est désactivée
                  </div>
                )}
              </div>
              
              <div className="max-w-xl space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#141416] border border-[#2A2A2E] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[#E8E4DF]">Activer la barre d&apos;annonce</h4>
                    <p className="text-xs text-[#9A9A9E]">Afficher un bandeau en haut du site</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={announcementForm.enabled}
                      onChange={(e) => setAnnouncementForm({...announcementForm, enabled: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-[#2A2A2E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C8923C]"></div>
                  </label>
                </div>
                
                <FormField label="Texte">
                  <input 
                    type="text" 
                    value={announcementForm.text}
                    onChange={(e) => setAnnouncementForm({...announcementForm, text: e.target.value})}
                    className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                  />
                </FormField>
                
                <FormField label="Lien (Optionnel)">
                  <input 
                    type="text" 
                    value={announcementForm.link}
                    onChange={(e) => setAnnouncementForm({...announcementForm, link: e.target.value})}
                    className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                  />
                </FormField>
                
                <FormField label="Couleur">
                  <div className="flex gap-4">
                    {(['amber', 'red', 'green', 'blue'] as const).map(color => (
                      <button
                        key={color}
                        onClick={() => setAnnouncementForm({...announcementForm, colorPreset: color})}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          announcementForm.colorPreset === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                        } ${
                          color === 'amber' ? 'bg-[#C8923C]' :
                          color === 'red' ? 'bg-red-500' :
                          color === 'green' ? 'bg-emerald-500' :
                          'bg-blue-500'
                        }`}
                      >
                        {announcementForm.colorPreset === color && (
                          <svg className={`w-5 h-5 ${color === 'amber' ? 'text-[#0F0F11]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                        )}
                      </button>
                    ))}
                  </div>
                </FormField>

                <button 
                  onClick={handleSaveAnnouncement}
                  className="bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-6 py-2.5 mt-4 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          {/* TAB: PROMO */}
          {activeTab === 'promo' && (
            <div className="max-w-xl space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#141416] border border-[#2A2A2E] rounded-lg">
                <div>
                  <h4 className="font-medium text-[#E8E4DF]">Activer la bannière promo</h4>
                  <p className="text-xs text-[#9A9A9E]">Afficher la section promotion sur l&apos;accueil</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={promoForm.active}
                    onChange={(e) => setPromoForm({...promoForm, active: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-[#2A2A2E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C8923C]"></div>
                </label>
              </div>

              <div className={!promoForm.active ? 'opacity-50 pointer-events-none' : ''}>
                <FormField label="Titre">
                  <input 
                    type="text" 
                    value={promoForm.title}
                    onChange={(e) => setPromoForm({...promoForm, title: e.target.value})}
                    className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                  />
                </FormField>
                
                <FormField label="Description">
                  <textarea 
                    value={promoForm.description}
                    onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                    rows={2}
                    className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none resize-none"
                  />
                </FormField>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Pourcentage de Remise (%)">
                    <input 
                      type="number" 
                      value={promoForm.discountPercent}
                      onChange={(e) => setPromoForm({...promoForm, discountPercent: parseInt(e.target.value) || 0})}
                      min={0}
                      max={100}
                      className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                    />
                  </FormField>
                  <FormField label="Date de Début">
                    <input 
                      type="date" 
                      value={promoForm.startDate}
                      onChange={(e) => setPromoForm({...promoForm, startDate: e.target.value})}
                      className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                    />
                  </FormField>
                  <FormField label="Date de Fin">
                    <input 
                      type="date" 
                      value={promoForm.endDate}
                      onChange={(e) => setPromoForm({...promoForm, endDate: e.target.value})}
                      className="w-full bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                    />
                  </FormField>
                </div>
              </div>

              <button 
                onClick={handleSavePromo}
                className="bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-6 py-2.5 mt-4 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          )}

          {/* TAB: BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {badgesForm.map((badge, index) => (
                  <div key={index} className="bg-[#141416] border border-[#2A2A2E] rounded-xl p-5 space-y-4">
                    <h4 className="font-medium text-[#E8E4DF] mb-2 border-b border-[#2A2A2E] pb-2">Badge {index + 1}</h4>
                    <FormField label="Nom d'icône">
                      <input 
                        type="text" 
                        value={badge.icon}
                        onChange={(e) => {
                          const newBadges = [...badgesForm]
                          newBadges[index].icon = e.target.value
                          setBadgesForm(newBadges)
                        }}
                        className="w-full bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                      />
                    </FormField>
                    <FormField label="Titre">
                      <input 
                        type="text" 
                        value={badge.title}
                        onChange={(e) => {
                          const newBadges = [...badgesForm]
                          newBadges[index].title = e.target.value
                          setBadgesForm(newBadges)
                        }}
                        className="w-full bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                      />
                    </FormField>
                    <FormField label="Description">
                      <input 
                        type="text" 
                        value={badge.description}
                        onChange={(e) => {
                          const newBadges = [...badgesForm]
                          newBadges[index].description = e.target.value
                          setBadgesForm(newBadges)
                        }}
                        className="w-full bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none"
                      />
                    </FormField>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleSaveBadges}
                className="bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-6 py-2.5 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          )}

          {/* TAB: COLLECTIONS */}
          {activeTab === 'collections' && (
            <div className="space-y-10">
              
              {/* Featured */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#E8E4DF]">Produits Vedettes</h3>
                  <p className="text-sm text-[#9A9A9E]">Sélectionnez les produits à afficher sur l&apos;accueil.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {featuredForm.map(id => {
                    const product = products.find(p => p.id === id)
                    return product ? (
                      <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8923C]/10 text-[#C8923C] border border-[#C8923C]/20 text-sm">
                        {product.name}
                        <button onClick={() => toggleProduct(id, featuredForm, setFeaturedForm)} className="hover:text-white ml-1">&times;</button>
                      </span>
                    ) : null
                  })}
                  {featuredForm.length === 0 && <span className="text-sm text-[#6B6B70] italic">Aucun produit sélectionné</span>}
                </div>

                <div className="bg-[#141416] border border-[#2A2A2E] rounded-lg max-h-60 overflow-y-auto p-2 no-scrollbar">
                  {products.map(product => (
                    <label key={`feat-${product.id}`} className="flex items-center p-2 hover:bg-[#1E1E22] rounded cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={featuredForm.includes(product.id)}
                        onChange={() => toggleProduct(product.id, featuredForm, setFeaturedForm)}
                        className="w-4 h-4 rounded border-gray-300 text-[#C8923C] focus:ring-[#C8923C] bg-transparent"
                      />
                      <span className="ml-3 text-sm text-[#E8E4DF]">{product.name} <span className="text-[#6B6B70]">({product.brand})</span></span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Best Sellers */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#E8E4DF]">Best-Sellers</h3>
                  <p className="text-sm text-[#9A9A9E]">Sélectionnez les meilleures ventes.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {bestSellersForm.map(id => {
                    const product = products.find(p => p.id === id)
                    return product ? (
                      <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8923C]/10 text-[#C8923C] border border-[#C8923C]/20 text-sm">
                        {product.name}
                        <button onClick={() => toggleProduct(id, bestSellersForm, setBestSellersForm)} className="hover:text-white ml-1">&times;</button>
                      </span>
                    ) : null
                  })}
                  {bestSellersForm.length === 0 && <span className="text-sm text-[#6B6B70] italic">Aucun produit sélectionné</span>}
                </div>

                <div className="bg-[#141416] border border-[#2A2A2E] rounded-lg max-h-60 overflow-y-auto p-2 no-scrollbar">
                  {products.map(product => (
                    <label key={`best-${product.id}`} className="flex items-center p-2 hover:bg-[#1E1E22] rounded cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={bestSellersForm.includes(product.id)}
                        onChange={() => toggleProduct(product.id, bestSellersForm, setBestSellersForm)}
                        className="w-4 h-4 rounded border-gray-300 text-[#C8923C] focus:ring-[#C8923C] bg-transparent"
                      />
                      <span className="ml-3 text-sm text-[#E8E4DF]">{product.name} <span className="text-[#6B6B70]">({product.brand})</span></span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSaveCollections}
                className="bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-lg px-6 py-2.5 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          )}

        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="text-sm text-red-400 hover:text-red-300 font-medium underline underline-offset-4"
          >
            Réinitialiser tout le contenu
          </button>
        </div>

      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleReset}
        title="Réinitialiser le contenu"
        message="Êtes-vous sûr de vouloir réinitialiser tout le contenu aux valeurs par défaut ? Cette action est irréversible."
        confirmLabel="Réinitialiser"
        variant="danger"
      />
    </div>
  )
}
