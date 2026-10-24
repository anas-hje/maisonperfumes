// ============================================================
// Core Type Definitions — Maison Parfumerie
// ============================================================

export type CategorySlug = 'parfums' | 'cosmetiques' | 'soin-visage' | 'corps-et-bain' | 'cheveux'

export type Gender = 'homme' | 'femme' | 'unisexe'

export type SortOption = 'price-asc' | 'price-desc' | 'name' | 'newest'

// ─── Product ───

export interface Variant {
  id: string
  label: string
  price: number
  compareAtPrice?: number
  stock: number
  sku: string
}

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  description: string
  category: CategorySlug
  subcategory: string
  gender: Gender
  variants: Variant[]
  images: string[]
  tags: string[]
  isFeatured: boolean
  isOnSale: boolean
  isNewArrival: boolean
  rating: number
  reviewCount: number
  createdAt: string
}

// ─── Category ───

export interface Subcategory {
  slug: string
  name: string
  parentCategory: CategorySlug
}

export interface Category {
  slug: CategorySlug
  name: string
  description: string
  subcategories: Subcategory[]
  image: string
}

// ─── Cart ───

export interface CartItem {
  productId: string
  variantId: string
  quantity: number
}

// ─── Order ───

export interface ShippingAddress {
  firstName: string
  lastName: string
  phone: string
  city: string
  address: string
  postalCode?: string
}

export interface OrderItem {
  productId: string
  variantId: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: 'cod' | 'card'
  subtotal: number
  shippingCost: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

// ─── Filter Params ───

export interface FilterParams {
  category?: CategorySlug
  subcategory?: string
  brand?: string
  gender?: Gender
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: SortOption
}

// ─── Adapter Interfaces ───

export interface ProductAdapter {
  getProducts(filters?: FilterParams): Promise<Product[]>
  getProduct(slug: string): Promise<Product | null>
  getCategories(): Promise<Category[]>
  getCategory(slug: CategorySlug): Promise<Category | null>
  searchProducts(query: string): Promise<Product[]>
  getFeaturedProducts(): Promise<Product[]>
  getBestSellers(): Promise<Product[]>
}

export interface PaymentAdapter {
  processPayment(order: Order): Promise<{
    success: boolean
    transactionId?: string
    error?: string
  }>
}

export interface ShippingAdapter {
  calculateShipping(city: string, config?: ShippingConfig): Promise<{
    cost: number
    estimatedDays: number
  }>
  getAvailableCities(): Promise<string[]>
}

// ─── Admin Types ───

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  city: string
  totalOrders: number
  totalSpent: number
  joinedAt: string
  lastOrderAt: string
  status: 'active' | 'inactive'
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager'
  avatar?: string
}

export interface AnnouncementBar {
  text: string
  link: string
  enabled: boolean
  colorPreset: 'amber' | 'red' | 'green' | 'blue'
}

export interface PromoBanner {
  title: string
  description: string
  discountPercent: number
  startDate: string
  endDate: string
  active: boolean
}

export interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

export interface TrustBadge {
  icon: string
  title: string
  description: string
}

export interface CMSContent {
  hero: HeroContent
  announcement: AnnouncementBar
  promo: PromoBanner
  trustBadges: TrustBadge[]
  featuredProductIds: string[]
  bestSellerProductIds: string[]
}

export interface ShippingConfig {
  freeShippingCities: string[]
  defaultShippingCost: number
  freeShippingThreshold: number
}

export interface PaymentConfig {
  codEnabled: boolean
  cardEnabled: boolean
  codFee: number
}

export interface RevenueDataPoint {
  month: string
  revenue: number
  orders: number
  previousRevenue?: number
}

export interface CategoryRevenue {
  category: string
  revenue: number
  percentage: number
}

export interface CityOrders {
  city: string
  orders: number
  revenue: number
}

export interface DashboardKPIs {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  activeCustomers: number
  customersChange: number
  conversionRate: number
  conversionChange: number
}
