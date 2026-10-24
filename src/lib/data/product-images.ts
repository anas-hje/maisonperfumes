/**
 * Stock product photography, by category.
 *
 * These are Unsplash CDN permalinks. Every id below was fetched and confirmed to
 * return `200 image/jpeg` before being committed — do not add one without checking
 * it first, since a dead id silently reproduces the "every product image 404s" bug
 * these replaced. Premium (plus.unsplash.com) photos are deliberately excluded.
 *
 * Sizing is appended at read time rather than baked in, so the same id can serve a
 * 64px thumbnail and a 1200px hero.
 *
 * These are generic fragrance/cosmetics photographs, not pictures of the actual
 * branded products in the catalogue. Before launch they must be replaced with
 * photography supplied by the brands — see MAISON_LAUNCH_PLAN.md.
 */

const UNSPLASH_CDN = 'https://images.unsplash.com'

const POOLS: Record<string, string[]> = {
  parfums: [
    'photo-1543422655-ac1c6ca993ed',
    'photo-1749264361617-dbe17a223f54',
    'photo-1705936117652-6dc624983df2',
    'photo-1712995518345-e6f807d4b6ad',
  ],
  cosmetiques: [
    'photo-1596462502278-27bfdc403348',
    'photo-1619451427882-6aaaded0cc61',
    'photo-1620916297397-a4a5402a3c6c',
  ],
  'soin-visage': [
    'photo-1580870069867-74c57ee1bb07',
    'photo-1585945037805-5fd82c2e60b1',
    'photo-1608571423902-eed4a5ad8108',
  ],
  'corps-et-bain': ['photo-1552046122-03184de85e08', 'photo-1619451427882-6aaaded0cc61'],
  cheveux: [
    'photo-1515377905703-c4788e51af15',
    'photo-1608571423539-e951b9b3871e',
    'photo-1560264641-1b5191cc63e2',
  ],
}

const FALLBACK_POOL = POOLS.parfums

interface ImageOptions {
  width?: number
  height?: number
  /**
   * Position of the product within its category. Pools are smaller than the
   * catalogue, so photos necessarily repeat — cycling by position guarantees
   * neighbours in a grid differ, which hashing the slug did not (Dior and Chanel
   * landed on the same photo side by side).
   */
  index?: number
}

/** Stable per-slug index, used when the caller doesn't know the position. */
function hashSlug(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  }
  return hash
}

export function productImageUrl(
  category: string,
  slug: string,
  { width = 900, height = 1125, index }: ImageOptions = {}
): string {
  const pool = POOLS[category] ?? FALLBACK_POOL
  const position = index ?? hashSlug(slug)
  const id = pool[position % pool.length]
  return `${UNSPLASH_CDN}/${id}?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&auto=format`
}

/**
 * Hero image for a category tile. Uses the first photo of that category's pool, so a
 * tile always looks like the products behind it.
 */
export function categoryImageUrl(
  category: string,
  { width = 600, height = 760 }: { width?: number; height?: number } = {}
): string {
  const pool = POOLS[category] ?? FALLBACK_POOL
  return `${UNSPLASH_CDN}/${pool[0]}?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&auto=format`
}

/** Every distinct photo in the catalogue, for preloading or verification scripts. */
export function allProductImageIds(): string[] {
  return [...new Set(Object.values(POOLS).flat())]
}
