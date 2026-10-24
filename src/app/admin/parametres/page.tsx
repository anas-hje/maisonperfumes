'use client'

import React, { useState, useEffect } from 'react'
import { useAdminSettingsStore } from '@/lib/store/admin-settings'
import FormField from '@/components/admin/FormField'
import { toast } from 'sonner'


// Custom Toggle Switch Component
const Toggle = ({ checked, onChange, label, helpText }: { checked: boolean, onChange: (checked: boolean) => void, label: string, helpText?: string }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex flex-col">
      <span className="text-sm font-medium text-[#E8E4DF]">{label}</span>
      {helpText && <span className="text-xs text-[#6B6B70] mt-0.5">{helpText}</span>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#C8923C]' : 'bg-[#2A2A2E]'}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
)

export default function ParametresPage() {
  const store = useAdminSettingsStore()
  
  // Local state for all fields
  const [storeName, setStoreName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  
  const [socialLinks, setSocialLinks] = useState({ instagram: '', facebook: '', tiktok: '', whatsapp: '' })
  
  const [freeShippingCities, setFreeShippingCities] = useState<string[]>([])
  const [defaultShippingCost, setDefaultShippingCost] = useState<number>(0)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0)
  const [newCity, setNewCity] = useState('')
  
  const [codEnabled, setCodEnabled] = useState(false)
  const [cardEnabled, setCardEnabled] = useState(false)
  const [codFee, setCodFee] = useState<number>(0)
  
  const [emailOnOrder, setEmailOnOrder] = useState(false)
  const [whatsappOnOrder, setWhatsappOnOrder] = useState(false)
  
  const [isLoaded, setIsLoaded] = useState(false)

  const populateState = (state: ReturnType<typeof useAdminSettingsStore.getState>) => {
    setStoreName(state.storeName || '')
    setContactEmail(state.contactEmail || '')
    setContactPhone(state.contactPhone || '')
    setSocialLinks(state.socialLinks || { instagram: '', facebook: '', tiktok: '', whatsapp: '' })
    setFreeShippingCities(state.shippingConfig?.freeShippingCities || [])
    setDefaultShippingCost(state.shippingConfig?.defaultShippingCost || 0)
    setFreeShippingThreshold(state.shippingConfig?.freeShippingThreshold || 0)
    setCodEnabled(state.paymentConfig?.codEnabled || false)
    setCardEnabled(state.paymentConfig?.cardEnabled || false)
    setCodFee(state.paymentConfig?.codFee || 0)
    setEmailOnOrder(state.notifications?.emailOnOrder || false)
    setWhatsappOnOrder(state.notifications?.whatsappOnOrder || false)
    setIsLoaded(true)
  }

  // Initialize from store on mount. Since these stores use skipHydration: true,
  // we must explicitly trigger rehydration and wait for it before reading state —
  // reading getState() beforehand would return the pre-hydration defaults.
  useEffect(() => {
    useAdminSettingsStore.persist.rehydrate()

    const unsub = useAdminSettingsStore.persist.onFinishHydration((state) => {
      populateState(state)
    })

    // Fallback: hydration may have already completed by the time this effect runs
    // (e.g. on a client-side navigation back to this page). Deferred to a microtask
    // so the state update happens in its own callback, not synchronously in the
    // effect body.
    if (useAdminSettingsStore.persist.hasHydrated()) {
      queueMicrotask(() => populateState(useAdminSettingsStore.getState()))
    }

    return () => unsub()
  }, [])

  const handleAddCity = () => {
    if (newCity.trim() && !freeShippingCities.includes(newCity.trim())) {
      setFreeShippingCities([...freeShippingCities, newCity.trim()])
      setNewCity('')
    }
  }

  const handleRemoveCity = (cityToRemove: string) => {
    setFreeShippingCities(freeShippingCities.filter(city => city !== cityToRemove))
  }

  const handleSave = () => {
    store.updateSettings({
      storeName,
      contactEmail,
      contactPhone,
      socialLinks,
      shippingConfig: {
        freeShippingCities,
        defaultShippingCost,
        freeShippingThreshold
      },
      paymentConfig: {
        codEnabled,
        cardEnabled,
        codFee
      },
      notifications: {
        emailOnOrder,
        whatsappOnOrder
      }
    })
    toast.success('Paramètres sauvegardés avec succès')
  }

  const handleInviteAdmin = () => {
    toast.info('Fonctionnalité disponible prochainement')
  }

  if (!isLoaded) return null // or a loader

  return (
    <div className="min-h-screen bg-[#0F0F11] font-[family-name:var(--font-inter)] text-[#E8E4DF] pb-24">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        <h1 className="text-2xl font-bold mb-8">Paramètres</h1>

        {/* 1. Informations Générales */}
        <div className="bg-[#1E1E22] rounded-2xl p-6 border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Informations Générales</h2>
          <div className="space-y-4">
            <FormField label="Nom de la Boutique">
              <input 
                type="text" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
                placeholder="Nom de la boutique"
              />
            </FormField>
            <FormField label="Email de Contact">
              <input 
                type="email" 
                value={contactEmail} 
                onChange={(e) => setContactEmail(e.target.value)} 
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
                placeholder="contact@example.com"
              />
            </FormField>
            <FormField label="Téléphone">
              <input 
                type="tel" 
                value={contactPhone} 
                onChange={(e) => setContactPhone(e.target.value)} 
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
                placeholder="+212 6XX-XXXXXX"
              />
            </FormField>
          </div>
        </div>

        {/* 2. Réseaux Sociaux */}
        <div className="bg-[#1E1E22] rounded-2xl p-6 border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Réseaux Sociaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Instagram">
              <input 
                type="text" 
                value={socialLinks.instagram} 
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} 
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
                placeholder="@username"
              />
            </FormField>
            <FormField label="Facebook">
              <input 
                type="text" 
                value={socialLinks.facebook} 
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} 
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
                placeholder="Page Facebook"
              />
            </FormField>
            <FormField label="TikTok">
              <input 
                type="text" 
                value={socialLinks.tiktok} 
                onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })} 
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
                placeholder="@username"
              />
            </FormField>
            <FormField label="WhatsApp">
              <input 
                type="tel" 
                value={socialLinks.whatsapp} 
                onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })} 
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
                placeholder="+212600000000"
              />
            </FormField>
          </div>
        </div>

        {/* 3. Configuration de Livraison */}
        <div className="bg-[#1E1E22] rounded-2xl p-6 border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Configuration de Livraison</h2>
          
          <div className="mb-6">
            <FormField label="Villes avec Livraison Gratuite">
              <div className="flex flex-wrap gap-2 mb-3">
                {freeShippingCities.map(city => (
                  <span key={city} className="inline-flex items-center gap-1 bg-[#C8923C]/10 text-[#C8923C] rounded-full px-3 py-1 text-sm border border-[#C8923C]/20">
                    {city}
                    <button onClick={() => handleRemoveCity(city)} className="hover:text-white transition-colors">
                      <span className="w-3.5 h-3.5 flex items-center justify-center">✕</span>
                    </button>
                  </span>
                ))}
                {freeShippingCities.length === 0 && <span className="text-sm text-[#6B6B70]">Aucune ville configurée</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCity())}
                  className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none flex-1"
                  placeholder="Ajouter une ville (ex: Casablanca)"
                />
                <button
                  type="button"
                  onClick={handleAddCity}
                  className="bg-[#2A2A2E] hover:bg-[#3A3A3E] text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 border border-transparent"
                >
                  <span className="w-4 h-4 flex items-center justify-center font-bold">+</span>
                  Ajouter
                </button>
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Frais de Livraison par Défaut (MAD)">
              <input
                type="number"
                min="0"
                value={defaultShippingCost}
                onChange={(e) => setDefaultShippingCost(Number(e.target.value))}
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
              />
            </FormField>
            <FormField label="Seuil de Livraison Gratuite (MAD)">
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full"
              />
              <p className="text-xs text-[#6B6B70] mt-1">Livraison gratuite à partir de {freeShippingThreshold.toLocaleString('fr-MA')} MAD</p>
            </FormField>
          </div>
        </div>

        {/* 4. Configuration des Paiements */}
        <div className="bg-[#1E1E22] rounded-2xl p-6 border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Configuration des Paiements</h2>
          <div className="space-y-2 border-b border-[#2A2A2E] pb-4 mb-4">
            <Toggle 
              label="Paiement à la livraison (COD)" 
              checked={codEnabled} 
              onChange={setCodEnabled} 
              helpText="Permettre aux clients de payer à la réception de la commande"
            />
            {codEnabled && (
              <div className="pl-4 mt-2 border-l-2 border-[#2A2A2E]">
                <FormField label="Frais COD (MAD)">
                  <input
                    type="number"
                    min="0"
                    value={codFee}
                    onChange={(e) => setCodFee(Number(e.target.value))}
                    className="bg-[#141416] border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-[#E8E4DF] focus:border-[#C8923C] focus:outline-none w-full max-w-xs"
                  />
                </FormField>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Toggle 
              label="Paiement par Carte" 
              checked={cardEnabled} 
              onChange={setCardEnabled} 
              helpText="Activer le paiement en ligne par carte bancaire (via CMI ou Stripe)"
            />
          </div>
        </div>

        {/* 5. Notifications */}
        <div className="bg-[#1E1E22] rounded-2xl p-6 border border-[rgba(200,146,60,0.08)]">
          <h2 className="text-lg font-semibold text-[#E8E4DF] mb-4">Notifications</h2>
          <div className="space-y-2">
            <div className="border-b border-[#2A2A2E] pb-2">
              <Toggle 
                label="Email pour nouvelles commandes" 
                checked={emailOnOrder} 
                onChange={setEmailOnOrder} 
                helpText="Recevoir un email à chaque nouvelle commande passée sur la boutique"
              />
            </div>
            <div className="pt-2">
              <Toggle 
                label="WhatsApp pour nouvelles commandes" 
                checked={whatsappOnOrder} 
                onChange={setWhatsappOnOrder} 
                helpText="Recevoir un message WhatsApp à chaque nouvelle commande"
              />
            </div>
          </div>
        </div>

        {/* 6. Comptes Administrateurs */}
        <div className="bg-[#1E1E22] rounded-2xl p-6 border border-[rgba(200,146,60,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-[#E8E4DF]">Comptes Administrateurs</h2>
            <button
              onClick={handleInviteAdmin}
              className="bg-[#2A2A2E] hover:bg-[#3A3A3E] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-transparent"
            >
              Inviter un Administrateur
            </button>
          </div>
          
          <div className="bg-[#141416] rounded-xl p-4 border border-[#2A2A2E] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2A2A2E] flex items-center justify-center shrink-0">
              <span className="w-6 h-6 flex items-center justify-center text-xl text-[#E8E4DF]">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#E8E4DF] truncate">Administrateur Principal</p>
              <div className="flex items-center gap-2 text-sm text-[#6B6B70] mt-1">
                <span className="w-3.5 h-3.5 flex items-center justify-center text-xs">✉️</span>
                <span className="truncate">{contactEmail || 'admin@maison.ma'}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8923C]/10 text-[#C8923C] text-xs font-medium border border-[#C8923C]/20">
              <span className="w-3.5 h-3.5 flex items-center justify-center text-xs">🛡️</span>
              Super Admin
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-[#C8923C] hover:bg-[#D4A853] text-[#0F0F11] font-semibold rounded-xl px-8 py-3 text-base transition-colors shadow-lg shadow-[#C8923C]/20"
          >
            Sauvegarder les Modifications
          </button>
        </div>
      </div>
    </div>
  )
}
