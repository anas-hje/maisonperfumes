import { Product, Category, FilterParams, ProductAdapter, CategorySlug } from '../types'
import { products } from '../data/products'
import { categories } from '../data/categories'

// ============================================================
// Local Data Adapter
// TODO: Replace with Shopify Storefront API or Postgres adapter
// 
// To switch to Shopify:
// 1. Create a new file: adapters/shopify-products.ts
// 2. Implement the ProductAdapter interface using Storefront API
// 3. Change the export below to use the new adapter
// ============================================================

const localAdapter: ProductAdapter = {
  async getProducts(filters?: FilterParams): Promise<Product[]> {
    let result = [...products]

    if (filters) {
      if (filters.category) {
        result = result.filter((p) => p.category === filters.category)
      }
      if (filters.subcategory) {
        result = result.filter((p) => p.subcategory === filters.subcategory)
      }
      if (filters.brand) {
        result = result.filter(
          (p) => p.brand.toLowerCase() === filters.brand!.toLowerCase()
        )
      }
      if (filters.gender) {
        result = result.filter((p) => p.gender === filters.gender)
      }
      if (filters.minPrice !== undefined) {
        result = result.filter(
          (p) =>
            Math.min(...p.variants.map((v) => v.price)) >= filters.minPrice!
        )
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter(
          (p) =>
            Math.min(...p.variants.map((v) => v.price)) <= filters.maxPrice!
        )
      }
      if (filters.search) {
        const q = filters.search.toLowerCase()
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
      }

      switch (filters.sortBy) {
        case 'price-asc':
          result.sort(
            (a, b) =>
              Math.min(...a.variants.map((v) => v.price)) -
              Math.min(...b.variants.map((v) => v.price))
          )
          break
        case 'price-desc':
          result.sort(
            (a, b) =>
              Math.min(...b.variants.map((v) => v.price)) -
              Math.min(...a.variants.map((v) => v.price))
          )
          break
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
          break
        case 'newest':
          result.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          break
      }
    }

    return result
  },

  async getProduct(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) || null
  },

  async getCategories(): Promise<Category[]> {
    return categories
  },

  async getCategory(slug: CategorySlug): Promise<Category | null> {
    return categories.find((c) => c.slug === slug) || null
  },

  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query })
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return products.filter((p) => p.isFeatured)
  },

  async getBestSellers(): Promise<Product[]> {
    return [...products]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 8)
  },
}

export const productAdapter: ProductAdapter = localAdapter
