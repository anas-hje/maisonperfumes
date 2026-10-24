'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { useAdminSettingsStore } from '@/lib/store/admin-settings';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useProducts } from '@/lib/adapters/product-source';
import { shippingAdapter } from '@/lib/adapters/shipping';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const shippingConfig = useAdminSettingsStore((s) => s.shippingConfig);
  const paymentConfig = useAdminSettingsStore((s) => s.paymentConfig);
  const products = useProducts();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethodOverride, setPaymentMethod] = useState<'cod' | 'card' | null>(null);

  const [cities, setCities] = useState<string[]>([]);
  const [fetchedShippingCost, setFetchedShippingCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const subtotal = getTotal(products);
  const shippingCost = city ? fetchedShippingCost : 0;
  const total = subtotal + shippingCost;

  // Default payment method is derived from available options rather than synced via effect,
  // so it reacts immediately to paymentConfig without an extra render.
  const defaultPaymentMethod: 'cod' | 'card' = paymentConfig?.codEnabled ? 'cod' : 'card';
  const paymentMethod = paymentMethodOverride ?? defaultPaymentMethod;

  useEffect(() => {
    shippingAdapter.getAvailableCities().then(setCities);
  }, []);

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    shippingAdapter.calculateShipping(city, shippingConfig).then((res) => {
      if (!cancelled) setFetchedShippingCost(res.cost);
    });
    return () => {
      cancelled = true;
    };
  }, [city, shippingConfig]);

  // Redirect to cart if empty. Must run unconditionally, before any early return below,
  // otherwise the hook is skipped on the render where successOrderId becomes truthy and
  // React throws "Rendered fewer hooks than expected".
  useEffect(() => {
    if (items.length === 0 && !successOrderId) {
      router.push('/panier');
    }
  }, [items.length, successOrderId, router]);

  const validatePhone = (p: string) => {
    return /^(?:\+212|0)[5-7]\d{8}$/.test(p.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !phone) return;
    
    if (!validatePhone(phone)) {
      setSubmitError(
        'Veuillez entrer un numéro de téléphone marocain valide (ex: 0612345678 ou +212612345678).'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Only identifiers and quantities are sent. The server reprices the basket from
      // the database, so prices shown here can never become the prices charged.
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          city,
          address,
          paymentMethod,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitError(payload?.error ?? 'Impossible de finaliser la commande.');
        return;
      }

      clearCart();
      setSuccessOrderId(payload.order.id as string);
    } catch {
      setSubmitError('Connexion impossible. Vérifiez votre réseau et réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrderId) {
    return (
      <div className="min-h-screen bg-graphite text-quartz font-sans pt-32 pb-24 flex items-center justify-center">
        <div className="text-center bg-obsidian p-12 border border-white/5 glass-surface max-w-lg w-full">
          <h1 className="font-display text-4xl text-light uppercase tracking-widest mb-6">Commande Confirmée</h1>
          <p className="text-quartz/80 font-light mb-8">Merci pour votre commande. Votre numéro de commande est <strong>{successOrderId}</strong>.</p>
          <Button onClick={() => router.push('/')} className="bg-amber hover:bg-brass text-graphite border-none rounded-none uppercase tracking-widest px-8 focus-visible:outline-2 focus-visible:outline-amber">
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !successOrderId) {
    return null;
  }

  const freeShippingThreshold = shippingConfig?.freeShippingThreshold || 0;
  const isFreeShippingActive = freeShippingThreshold > 0;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100) || 0;

  return (
    <div className="min-h-screen bg-graphite text-quartz font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-display text-4xl md:text-5xl text-light uppercase tracking-widest mb-12">
          Validation de la commande
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="bg-obsidian p-8 border border-white/5 glass-surface">
                <h2 className="font-display text-2xl text-light uppercase tracking-wider mb-6">Informations de livraison</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-quartz/60 mb-2">Prénom</label>
                    <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-graphite border border-white/10 text-quartz p-3 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-quartz/60 mb-2">Nom</label>
                    <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-graphite border border-white/10 text-quartz p-3 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-quartz/60 mb-2">Téléphone *</label>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="06XXXXXXXX ou +2126XXXXXXXX" className="w-full bg-graphite border border-white/10 text-quartz p-3 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber" />
                </div>
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-quartz/60 mb-2">Ville *</label>
                  <select required value={city} onChange={e => setCity(e.target.value)} className="w-full bg-graphite border border-white/10 text-quartz p-3 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber">
                    <option value="">Sélectionnez une ville</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-quartz/60 mb-2">Adresse détaillée *</label>
                  <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full bg-graphite border border-white/10 text-quartz p-3 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber"></textarea>
                </div>
              </section>

              <section className="bg-obsidian p-8 border border-white/5 glass-surface">
                <h2 className="font-display text-2xl text-light uppercase tracking-wider mb-6">Paiement</h2>
                <div className="space-y-4">
                  {paymentConfig?.codEnabled && (
                    <label className={`flex items-center gap-4 p-4 border cursor-pointer ${paymentMethod === 'cod' ? 'border-amber bg-amber/5' : 'border-white/10'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-amber focus-visible:outline-2 focus-visible:outline-amber" />
                      <div>
                        <p className="uppercase tracking-widest text-sm text-light">Paiement à la livraison</p>
                        <p className="text-xs text-quartz/60 font-light mt-1">Payez en espèces à la réception de votre commande.</p>
                      </div>
                    </label>
                  )}
                  {paymentConfig?.cardEnabled ? (
                    <label className={`flex items-center gap-4 p-4 border cursor-pointer ${paymentMethod === 'card' ? 'border-amber bg-amber/5' : 'border-white/10'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-amber focus-visible:outline-2 focus-visible:outline-amber" />
                      <div>
                        <p className="uppercase tracking-widest text-sm text-light">Carte Bancaire</p>
                        <p className="text-xs text-quartz/60 font-light mt-1">Paiement sécurisé par carte.</p>
                      </div>
                    </label>
                  ) : (
                    <label className="flex items-center gap-4 p-4 border border-white/10 opacity-50 cursor-not-allowed">
                      <input type="radio" name="payment" disabled className="accent-amber" />
                      <div>
                        <p className="uppercase tracking-widest text-sm text-light">Carte Bancaire</p>
                        <p className="text-xs text-quartz/60 font-light mt-1">Non disponible pour le moment.</p>
                      </div>
                    </label>
                  )}
                </div>
              </section>

              {submitError && (
                <p
                  role="alert"
                  className="border border-red-500/40 bg-red-500/5 text-red-700 text-sm font-light p-4"
                >
                  {submitError}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting || !city || !phone} className="w-full bg-amber hover:bg-brass text-graphite border-none rounded-none py-6 text-sm tracking-widest uppercase focus-visible:outline-2 focus-visible:outline-amber disabled:opacity-50">
                {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
              </Button>
            </form>
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-obsidian p-8 border border-white/5 glass-surface sticky top-32">
              <h3 className="font-display text-xl text-light uppercase tracking-widest mb-6">
                Résumé
              </h3>
              
              {isFreeShippingActive && (
                <div className="mb-6 p-4 bg-graphite border border-white/5">
                  {amountToFreeShipping > 0 ? (
                    <>
                      <p className="text-sm font-medium text-amber mb-2 text-center">Ajoutez {formatPrice(amountToFreeShipping)} de plus pour la livraison gratuite !</p>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-green-600 text-center">Vous bénéficiez de la livraison gratuite !</p>
                  )}
                </div>
              )}

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  const variant = product?.variants.find(v => v.id === item.variantId);
                  if (!product || !variant) return null;
                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="flex justify-between items-start gap-4 text-sm font-light">
                      <div>
                        <p className="text-light uppercase">{product.name} <span className="text-quartz/60 text-xs normal-case">x{item.quantity}</span></p>
                        <p className="text-quartz/60 text-xs">{variant.label}</p>
                      </div>
                      <span className="text-quartz whitespace-nowrap">{formatPrice(variant.price * item.quantity)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-4 text-sm font-light text-quartz/80 mb-6 pt-6 border-t border-white/5">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{city ? (shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)) : '-'}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between text-lg text-light">
                <span className="uppercase tracking-widest text-sm">Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
