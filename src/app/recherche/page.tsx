'use client'

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/lib/adapters/product-source';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const products = useProducts();

  // query is locally editable (the input below), so it can't be a pure derivation of
  // the URL param — it must resync only when the URL itself changes (e.g. following a
  // different search link while already on this page).
  useEffect(() => {
    setQuery(searchParams.get('q') || ''); // eslint-disable-line react-hooks/set-state-in-effect
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.brand.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.tags.some(t => t.toLowerCase().includes(term))
    );
  }, [query, products]);

  const popularTags = ['Parfum', 'Oud', 'Rose', 'Crème', 'Sérum', 'Cheveux'];
  const categories = [
    { name: 'Parfums', slug: 'parfums' },
    { name: 'Cosmétiques', slug: 'cosmetiques' },
    { name: 'Soin Visage', slug: 'soin-visage' },
    { name: 'Corps & Bain', slug: 'corps-et-bain' },
    { name: 'Cheveux', slug: 'cheveux' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="max-w-2xl mx-auto mb-16">
        <h1 className="font-display text-4xl text-light uppercase tracking-widest mb-8 text-center">
          Recherche
        </h1>
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Chercher un parfum, une marque..."
            className="w-full bg-obsidian border border-white/10 text-light p-4 text-lg rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber focus-visible:border-amber placeholder:text-quartz/60"
            autoFocus
          />
        </div>
      </div>

      {!query ? (
        <div className="space-y-16">
          <div className="text-center">
            <h2 className="text-light font-display text-2xl uppercase tracking-widest mb-6">
              Recherches populaires
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-6 py-2 bg-obsidian border border-white/10 text-light rounded-full text-sm hover:border-amber hover:text-amber transition-colors shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-light font-display text-2xl uppercase tracking-widest mb-6">
              Catégories
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/categorie/${cat.slug}`}
                  className="text-quartz hover:text-amber uppercase tracking-widest text-sm transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 text-sm uppercase tracking-widest text-quartz">
            {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 border border-white/10 bg-obsidian shadow-sm rounded-lg">
              <p className="text-xl font-light text-quartz">Aucun produit ne correspond à &quot;{query}&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-graphite text-light font-sans pt-32 pb-24">
      <Suspense fallback={<div className="min-h-screen bg-graphite flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin"></div></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
