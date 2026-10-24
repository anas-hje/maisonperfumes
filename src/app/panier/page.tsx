'use client';

import Link from 'next/link';
import ProductImage from '@/components/ui/ProductImage';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useProducts } from '@/lib/adapters/product-source';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const products = useProducts();

  if (!products.length) {
    return <div className="min-h-screen bg-graphite flex items-center justify-center text-quartz">Chargement...</div>;
  }

  const subtotal = getTotal(products);

  return (
    <div className="min-h-screen bg-graphite text-quartz font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-display text-4xl md:text-5xl text-light uppercase tracking-widest mb-12">
          Votre Panier
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24 border border-white/8 bg-obsidian/30 glass-surface">
            <p className="text-xl font-light text-quartz/70 mb-8">Votre panier est vide.</p>
            <Link href="/categorie/parfums">
              <Button className="bg-amber hover:bg-brass text-white border-none rounded-none tracking-widest uppercase px-8 focus-visible:outline-2 focus-visible:outline-amber">
                Continuez vos achats
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <table className="w-full text-left">
                <thead className="border-b border-white/8 text-xs uppercase tracking-widest text-quartz/60">
                  <tr>
                    <th className="pb-4 font-normal">Produit</th>
                    <th className="pb-4 font-normal">Quantité</th>
                    <th className="pb-4 font-normal text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {items.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    const variant = product?.variants.find(v => v.id === item.variantId);
                    if (!product || !variant) return null;
                    
                    const image = product.images?.[0];
                    
                    return (
                      <tr key={`${item.productId}-${item.variantId}`}>
                        <td className="py-8">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-24 bg-gradient-to-br from-amber/5 to-brass/10 border border-white/8 shrink-0 flex items-center justify-center relative overflow-hidden">
                              <ProductImage
                                src={image}
                                alt={product.name}
                                fallbackLabel={product.brand.charAt(0)}
                                fallbackLabelClassName="text-2xl"
                                sizes="80px"
                              />
                            </div>
                            <div>
                              <p className="text-amber text-xs uppercase tracking-widest mb-1 small-caps">{product.brand}</p>
                              <Link href={`/produit/${product.slug}`} className="font-display text-lg text-light hover:text-amber transition-colors uppercase">
                                {product.name}
                              </Link>
                              <p className="text-sm text-quartz/60 mt-1">{variant.label}</p>
                              <button 
                                onClick={() => removeItem(item.productId, item.variantId)}
                                className="text-xs text-quartz/40 hover:text-amber uppercase tracking-wider mt-3 transition-colors focus-visible:outline-2 focus-visible:outline-amber"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-8">
                          <div className="inline-flex items-center border border-white/10">
                            <button 
                              onClick={() => updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))}
                              className="px-3 py-1 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-amber"
                            >-</button>
                            <span className="w-8 text-center text-sm text-quartz">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, item.variantId, Math.min(variant.stock, Math.min(10, item.quantity + 1)))}
                              className="px-3 py-1 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-amber"
                            >+</button>
                          </div>
                        </td>
                        <td className="py-8 text-right font-light text-quartz">
                          {formatPrice(variant.price * item.quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-obsidian p-8 border border-white/8 glass-surface">
                <h3 className="font-display text-xl text-light uppercase tracking-widest mb-6">
                  Résumé
                </h3>
                <div className="space-y-4 text-sm font-light text-quartz/80 mb-6">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison estimée</span>
                    <span>Calculée à l&apos;étape suivante</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/8 flex justify-between text-lg text-light mb-8">
                  <span className="uppercase tracking-widest text-sm">Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-amber hover:bg-brass text-white border-none rounded-none py-6 text-xs tracking-widest uppercase focus-visible:outline-2 focus-visible:outline-amber">
                    Passer la commande
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
