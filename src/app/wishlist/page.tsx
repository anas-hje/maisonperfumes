'use client';

import { useWishlistStore } from '@/lib/store/wishlist';
import { useProducts } from '@/lib/adapters/product-source';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const products = useProducts();
  const wishlistProducts = products.filter(p => items.includes(p.id));

  return (
    <div className="min-h-screen bg-graphite text-quartz font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-display text-4xl md:text-5xl text-light uppercase tracking-widest mb-12">
          Ma Wishlist
        </h1>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-24 border border-white/5 bg-obsidian/30 glass-surface">
            <p className="text-xl font-light text-quartz/70 mb-8">Votre wishlist est vide.</p>
            <Link href="/categorie/parfums">
              <Button className="bg-amber hover:bg-brass text-graphite border-none rounded-none tracking-widest uppercase px-8 focus-visible:outline-2 focus-visible:outline-amber">
                Découvrir nos parfums
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
