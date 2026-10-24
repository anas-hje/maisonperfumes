'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/lib/adapters/product-source';
import { getUniqueBrands } from '@/lib/utils';

interface Props {
  categorySlug: string;
}

export default function CategoryContent({ categorySlug }: Props) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount =
    selectedBrands.length + (selectedGender ? 1 : 0) + (priceRange ? 1 : 0);

  // Sourced here rather than passed down from the (now server-rendered) page, so
  // the listing still reflects admin product edits held in the client store.
  const allProducts = useProducts();
  const initialProducts = useMemo(
    () => allProducts.filter((p) => p.category === categorySlug),
    [allProducts, categorySlug]
  );

  const brands = useMemo(() => getUniqueBrands(initialProducts), [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }
    if (selectedGender) {
      result = result.filter(p => p.gender === selectedGender);
    }
    if (priceRange === 'under_1000') {
      result = result.filter(p => p.variants[0].price < 1000);
    } else if (priceRange === '1000_2000') {
      result = result.filter(p => p.variants[0].price >= 1000 && p.variants[0].price <= 2000);
    } else if (priceRange === 'over_2000') {
      result = result.filter(p => p.variants[0].price > 2000);
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.variants[0].price - b.variants[0].price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.variants[0].price - a.variants[0].price);
    }
    return result;
  }, [initialProducts, selectedBrands, selectedGender, priceRange, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const removeFilter = (type: string, value?: string) => {
    if (type === 'brand' && value) {
      setSelectedBrands(prev => prev.filter(b => b !== value));
    } else if (type === 'gender') {
      setSelectedGender('');
    } else if (type === 'price') {
      setPriceRange('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-12">
      <aside className="w-full md:w-64 shrink-0">
        {/* On phones the filter list pushed every product below the fold, so it
            collapses behind a toggle; from md up it's always open as a sidebar. */}
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="category-filters"
          className="md:hidden w-full flex items-center justify-between glass-surface rounded-lg px-4 py-3 mb-4 text-light"
        >
          <span className="font-display text-lg uppercase tracking-wider">Filtres</span>
          <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-quartz">
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-amber/15 text-amber px-2 py-0.5">{activeFilterCount}</span>
            )}
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>

        <h3 className="hidden md:block font-display text-2xl text-light mb-6 uppercase tracking-wider">Filtres</h3>
        <div id="category-filters" className={`${filtersOpen ? 'block' : 'hidden'} md:block space-y-8`}>
           <div>
             <h4 className="text-sm uppercase tracking-widest text-quartz/60 mb-4">Marques</h4>
             <div className="space-y-2">
               {brands.map(brand => (
                 <label key={brand} className="flex items-center gap-2 text-sm text-quartz">
                   <input 
                     type="checkbox" 
                     checked={selectedBrands.includes(brand)}
                     onChange={() => toggleBrand(brand)}
                     className="accent-amber focus-visible:outline-2 focus-visible:outline-amber bg-obsidian border-white/10"
                   />
                   {brand}
                 </label>
               ))}
             </div>
           </div>
           <div>
             <h4 className="text-sm uppercase tracking-widest text-quartz/60 mb-4">Genre</h4>
             <div className="space-y-2 text-sm text-quartz">
               {['Homme', 'Femme', 'Unisexe'].map(gender => (
                 <label key={gender} className="flex items-center gap-2">
                   <input 
                     type="radio" 
                     name="gender"
                     checked={selectedGender === gender}
                     onChange={() => setSelectedGender(gender)}
                     className="accent-amber focus-visible:outline-2 focus-visible:outline-amber bg-obsidian border-white/10"
                   />
                   {gender}
                 </label>
               ))}
             </div>
           </div>
           <div>
             <h4 className="text-sm uppercase tracking-widest text-quartz/60 mb-4">Prix</h4>
             <select 
               value={priceRange}
               onChange={(e) => setPriceRange(e.target.value)}
               className="w-full bg-obsidian border border-white/10 text-quartz p-3 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber uppercase text-xs tracking-wider"
             >
               <option value="">Tous les prix</option>
               <option value="under_1000">Moins de 1000 MAD</option>
               <option value="1000_2000">1000 - 2000 MAD</option>
               <option value="over_2000">Plus de 2000 MAD</option>
             </select>
           </div>
           <div>
             <h4 className="text-sm uppercase tracking-widest text-quartz/60 mb-4">Trier par</h4>
             <select 
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="w-full bg-obsidian border border-white/10 text-quartz p-3 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber uppercase text-xs tracking-wider"
             >
               <option value="">Nouveautés</option>
               <option value="price_asc">Prix croissant</option>
               <option value="price_desc">Prix décroissant</option>
             </select>
           </div>
        </div>
      </aside>
      
      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedBrands.map(brand => (
            <button key={brand} onClick={() => removeFilter('brand', brand)} className="px-3 py-1 bg-obsidian border border-white/10 text-xs uppercase tracking-wider text-quartz hover:border-amber focus-visible:outline-2 focus-visible:outline-amber">
              {brand} ✕
            </button>
          ))}
          {selectedGender && (
            <button onClick={() => removeFilter('gender')} className="px-3 py-1 bg-obsidian border border-white/10 text-xs uppercase tracking-wider text-quartz hover:border-amber focus-visible:outline-2 focus-visible:outline-amber">
              {selectedGender} ✕
            </button>
          )}
          {priceRange && (
            <button onClick={() => removeFilter('price')} className="px-3 py-1 bg-obsidian border border-white/10 text-xs uppercase tracking-wider text-quartz hover:border-amber focus-visible:outline-2 focus-visible:outline-amber">
              {priceRange === 'under_1000' ? '< 1000 MAD' : priceRange === '1000_2000' ? '1000 - 2000 MAD' : '> 2000 MAD'} ✕
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 border border-white/8 bg-obsidian/30 glass-surface">
            <h3 className="font-display text-2xl text-light mb-2 uppercase">Aucun produit trouvé</h3>
            <p className="text-quartz/60 font-light">Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
