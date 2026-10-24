import { Category } from '../types'

export const categories: Category[] = [
  {
    slug: 'parfums',
    name: 'Parfums',
    description: 'Découvrez notre collection exclusive de parfums de luxe pour homme et femme, des grandes maisons aux créateurs niche.',
    subcategories: [
      { slug: 'homme', name: 'Homme', parentCategory: 'parfums' },
      { slug: 'femme', name: 'Femme', parentCategory: 'parfums' },
      { slug: 'niche', name: 'Niche', parentCategory: 'parfums' },
      { slug: 'decants', name: 'Décants', parentCategory: 'parfums' },
      { slug: 'coffrets', name: 'Coffrets', parentCategory: 'parfums' },
    ],
    image: '/images/categories/parfums.jpg',
  },
  {
    slug: 'cosmetiques',
    name: 'Cosmétiques',
    description: 'Maquillage haut de gamme pour sublimer votre beauté naturelle, des marques les plus prestigieuses.',
    subcategories: [
      { slug: 'teint', name: 'Teint', parentCategory: 'cosmetiques' },
      { slug: 'yeux', name: 'Yeux', parentCategory: 'cosmetiques' },
      { slug: 'levres', name: 'Lèvres', parentCategory: 'cosmetiques' },
      { slug: 'sourcils', name: 'Sourcils', parentCategory: 'cosmetiques' },
      { slug: 'ongles', name: 'Ongles', parentCategory: 'cosmetiques' },
    ],
    image: '/images/categories/cosmetiques.jpg',
  },
  {
    slug: 'soin-visage',
    name: 'Soin Visage',
    description: 'Soins premium pour une peau éclatante et radieuse, sélectionnés parmi les meilleures formulations mondiales.',
    subcategories: [
      { slug: 'nettoyant', name: 'Nettoyants', parentCategory: 'soin-visage' },
      { slug: 'hydratant', name: 'Hydratants', parentCategory: 'soin-visage' },
      { slug: 'serum', name: 'Sérums', parentCategory: 'soin-visage' },
      { slug: 'masque', name: 'Masques', parentCategory: 'soin-visage' },
    ],
    image: '/images/categories/soin-visage.jpg',
  },
  {
    slug: 'corps-et-bain',
    name: 'Corps & Bain',
    description: 'Rituels de soin corporel pour une expérience luxueuse au quotidien, du hammam à votre salle de bain.',
    subcategories: [
      { slug: 'gel-douche', name: 'Gels Douche', parentCategory: 'corps-et-bain' },
      { slug: 'lait-corporel', name: 'Laits Corporels', parentCategory: 'corps-et-bain' },
      { slug: 'savon', name: 'Savons', parentCategory: 'corps-et-bain' },
      { slug: 'huile', name: 'Huiles', parentCategory: 'corps-et-bain' },
    ],
    image: '/images/categories/corps-et-bain.jpg',
  },
  {
    slug: 'cheveux',
    name: 'Cheveux',
    description: 'Soins capillaires professionnels pour des cheveux sublimes, enrichis aux actifs naturels du Maroc.',
    subcategories: [
      { slug: 'shampoing', name: 'Shampoings', parentCategory: 'cheveux' },
      { slug: 'apres-shampoing', name: 'Après-Shampoings', parentCategory: 'cheveux' },
      { slug: 'masque-cheveux', name: 'Masques', parentCategory: 'cheveux' },
      { slug: 'huile-cheveux', name: 'Huiles Capillaires', parentCategory: 'cheveux' },
    ],
    image: '/images/categories/cheveux.jpg',
  },
]
