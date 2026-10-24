import { Product, Variant } from './types'

/**
 * Format a price in MAD currency
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-MA')} MAD`
}

/**
 * Get the lowest price from a product's variants
 */
export function getLowestPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price))
}

/**
 * Get the highest price from a product's variants
 */
export function getHighestPrice(product: Product): number {
  return Math.max(...product.variants.map((v) => v.price))
}

/**
 * Format a price range for display
 */
export function formatPriceRange(product: Product): string {
  const low = getLowestPrice(product)
  const high = getHighestPrice(product)
  if (low === high) return formatPrice(low)
  return `${formatPrice(low)} — ${formatPrice(high)}`
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercent(variant: Variant): number | null {
  if (!variant.compareAtPrice || variant.compareAtPrice <= variant.price) return null
  return Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100)
}

/**
 * Check if any variant is on sale
 */
export function hasDiscount(product: Product): boolean {
  return product.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price)
}

/**
 * Check if a product is in stock
 */
export function isInStock(product: Product): boolean {
  return product.variants.some((v) => v.stock > 0)
}

/**
 * Get unique brands from products list
 */
export function getUniqueBrands(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.brand))].sort((a, b) =>
    a.localeCompare(b, 'fr')
  )
}

/**
 * Create a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trimEnd() + '…'
}

/**
 * Format a date string for display in French locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format a date string with time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
