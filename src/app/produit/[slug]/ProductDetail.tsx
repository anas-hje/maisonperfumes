'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useAdminSettingsStore } from '@/lib/store/admin-settings';
import { formatPrice } from '@/lib/utils';
import { categories } from '@/lib/data/categories';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import ProductImage from '@/components/ui/ProductImage';
import { useProductBySlug, useProducts } from '@/lib/adapters/product-source';
import Badge from '@/components/ui/Badge';

interface Props {
  slug: string;
}

export default function ProductDetail({ slug }: Props) {
  const product = useProductBySlug(slug);
  const allProducts = useProducts();
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  
  const addItem = useCartStore(state => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const freeShippingThreshold = useAdminSettingsStore(s => s.shippingConfig.freeShippingThreshold);

  if (!product) return <div className="min-h-screen bg-graphite flex items-center justify-center text-quartz">Produit Introuvable</div>;

  const currentVariantId = selectedVariantId || product.variants[0]?.id;
  const selectedVariant = product.variants.find(v => v.id === currentVariantId) || product.variants[0];
  const isWishlisted = isInWishlist(product.id);

  // Cap the quantity picker at available stock, and at 10 per order.
  const maxQuantity = Math.min(10, Math.max(1, selectedVariant?.stock ?? 0));

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product.id, selectedVariant.id, quantity);
    }
  };

  const handleToggleWishlist = () => {
    toggleItem(product.id);
  };

  const images = product.images?.length ? product.images : [];

  return (
    <div className="min-h-screen bg-graphite text-quartz font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex text-xs uppercase tracking-widest text-quartz/60 mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-amber transition-colors">Accueil</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <Link href={`/categorie/${product.category}`} className="hover:text-amber transition-colors">
                  {categories.find(c => c.slug === product.category)?.name ?? product.category}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-quartz">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-24">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square md:aspect-auto md:h-[600px] bg-gradient-to-br from-amber/5 to-brass/10 border border-white/8 rounded-sm glass-surface overflow-hidden group"
            >
              <ProductImage
                src={images[mainImageIndex]}
                alt={`${product.name} — vue ${mainImageIndex + 1}`}
                fallbackLabel={product.brand.charAt(0)}
                fallbackLabelClassName="text-9xl"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="transition-transform duration-700 ease-out group-hover:scale-105"
                priority
              />
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isNewArrival && <Badge variant="new">Nouveau</Badge>}
                {freeShippingThreshold > 0 && selectedVariant.price >= freeShippingThreshold && (
                  <Badge variant="sale">Livraison Gratuite</Badge>
                )}
              </div>
            </motion.div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImageIndex(idx)}
                    className={`relative w-20 h-20 shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${
                      idx === mainImageIndex ? 'border-amber' : 'border-transparent hover:border-amber/50'
                    }`}
                  >
                    <ProductImage
                      src={img}
                      alt={`${product.name} — miniature ${idx + 1}`}
                      fallbackLabel={product.brand.charAt(0)}
                      fallbackLabelClassName="text-xl"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-amber uppercase tracking-[0.2em] text-sm mb-4 small-caps">{product.brand}</p>
            <h1 className="font-display text-4xl lg:text-6xl text-light uppercase tracking-widest mb-6">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <p className="text-2xl text-quartz font-light">
                {formatPrice(selectedVariant.price)}
              </p>
              {selectedVariant.compareAtPrice && (
                <p className="text-lg text-quartz/50 line-through">
                  {formatPrice(selectedVariant.compareAtPrice)}
                </p>
              )}
              {selectedVariant.stock > 0 && selectedVariant.stock < 10 && (
                <span className="text-xs text-amber border border-amber px-2 py-1 uppercase tracking-wider">
                  Plus que {selectedVariant.stock} en stock
                </span>
              )}
            </div>

            <p className="text-quartz/70 font-light leading-relaxed mb-10">
              {product.description}
            </p>

            <div className="mb-8">
              <p className="text-sm uppercase tracking-widest text-quartz/60 mb-4">Format</p>
              <div className="flex flex-wrap gap-4">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setQuantity(1);
                    }}
                    className={`px-6 py-3 border text-sm tracking-wider uppercase transition-all focus-visible:outline-2 focus-visible:outline-amber ${
                      currentVariantId === variant.id
                        ? 'border-amber text-amber bg-amber/10'
                        : 'border-white/10 text-quartz hover:border-white/25'
                    }`}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 mb-12">
              <div className="flex items-center border border-white/10">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Diminuer la quantité"
                  className="px-4 py-3 text-quartz hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-amber disabled:opacity-40 disabled:cursor-not-allowed"
                >-</button>
                <span className="w-8 text-center text-quartz" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                  aria-label="Augmenter la quantité"
                  className="px-4 py-3 text-quartz hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-amber disabled:opacity-40 disabled:cursor-not-allowed"
                >+</button>
              </div>
              
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button 
                  onClick={handleAddToCart}
                  disabled={selectedVariant.stock === 0}
                  className="w-full bg-amber hover:bg-brass text-white border-none rounded-none py-6 text-sm tracking-widest uppercase focus-visible:outline-2 focus-visible:outline-amber disabled:opacity-50"
                >
                  {selectedVariant.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </Button>
              </motion.div>
              
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-pressed={isWishlisted}
                aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className={`p-4 border transition-colors focus-visible:outline-2 focus-visible:outline-amber ${
                  isWishlisted
                    ? 'border-amber text-amber bg-amber/10'
                    : 'border-white/10 text-quartz hover:border-white/25 hover:bg-white/5'
                }`}
              >
                <span aria-hidden="true">{isWishlisted ? '♥' : '♡'}</span>
              </button>
            </div>
          </div>
        </div>

        {relatedProducts?.length > 0 && (
          <section className="pt-24 border-t border-white/8">
            <h2 className="font-display text-3xl text-light text-center mb-16 uppercase tracking-widest">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
