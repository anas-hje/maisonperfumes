import { Order, Product, Customer, OrderStatus, RevenueDataPoint, CategoryRevenue, CityOrders, DashboardKPIs } from '@/lib/types'
import { format, subDays, subMonths, startOfMonth, isAfter, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Compute dashboard KPIs from orders
 */
export function computeKPIs(orders: Order[]): DashboardKPIs {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const sixtyDaysAgo = subDays(now, 60)

  const recentOrders = orders.filter((o) => isAfter(parseISO(o.createdAt), thirtyDaysAgo))
  const previousOrders = orders.filter(
    (o) => isAfter(parseISO(o.createdAt), sixtyDaysAgo) && !isAfter(parseISO(o.createdAt), thirtyDaysAgo)
  )

  const activeOrders = orders.filter((o) => o.status !== 'cancelled')
  const recentActive = recentOrders.filter((o) => o.status !== 'cancelled')
  const previousActive = previousOrders.filter((o) => o.status !== 'cancelled')

  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0)
  const recentRevenue = recentActive.reduce((sum, o) => sum + o.total, 0)
  const previousRevenue = previousActive.reduce((sum, o) => sum + o.total, 0)

  const revenueChange = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0
  const ordersChange = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0

  // Unique customers by phone
  const allCustomerPhones = new Set(orders.map((o) => o.shippingAddress.phone))
  const recentCustomerPhones = new Set(recentOrders.map((o) => o.shippingAddress.phone))
  const previousCustomerPhones = new Set(previousOrders.map((o) => o.shippingAddress.phone))
  const customersChange = previousCustomerPhones.size > 0
    ? ((recentCustomerPhones.size - previousCustomerPhones.size) / previousCustomerPhones.size) * 100 : 0

  return {
    totalRevenue,
    revenueChange: Math.round(revenueChange * 10) / 10,
    totalOrders: orders.length,
    ordersChange: Math.round(ordersChange * 10) / 10,
    activeCustomers: allCustomerPhones.size,
    customersChange: Math.round(customersChange * 10) / 10,
    conversionRate: 3.2, // placeholder — would need traffic data
    conversionChange: 0,
  }
}

/**
 * Compute monthly revenue data for charts
 */
export function computeMonthlyRevenue(orders: Order[]): RevenueDataPoint[] {
  const months: RevenueDataPoint[] = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i))
    const monthEnd = startOfMonth(subMonths(now, i - 1))
    const prevMonthStart = startOfMonth(subMonths(now, i + 1))

    const monthOrders = orders.filter((o) => {
      const d = parseISO(o.createdAt)
      return d >= monthStart && d < monthEnd && o.status !== 'cancelled'
    })

    const prevMonthOrders = orders.filter((o) => {
      const d = parseISO(o.createdAt)
      return d >= prevMonthStart && d < monthStart && o.status !== 'cancelled'
    })

    months.push({
      month: format(monthStart, 'MMM yy', { locale: fr }),
      revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
      orders: monthOrders.length,
      previousRevenue: prevMonthOrders.reduce((sum, o) => sum + o.total, 0),
    })
  }

  return months
}

/**
 * Compute revenue by category
 */
export function computeCategoryRevenue(orders: Order[], products: Product[]): CategoryRevenue[] {
  const catMap: Record<string, number> = {}

  for (const order of orders) {
    if (order.status === 'cancelled') continue
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        const cat = product.category
        catMap[cat] = (catMap[cat] || 0) + item.unitPrice * item.quantity
      }
    }
  }

  const total = Object.values(catMap).reduce((s, v) => s + v, 0)
  return Object.entries(catMap)
    .map(([category, revenue]) => ({
      category,
      revenue,
      percentage: total > 0 ? Math.round((revenue / total) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

/**
 * Compute orders by city
 */
export function computeCityOrders(orders: Order[]): CityOrders[] {
  const cityMap: Record<string, { orders: number; revenue: number }> = {}

  for (const order of orders) {
    const city = order.shippingAddress.city
    if (!cityMap[city]) cityMap[city] = { orders: 0, revenue: 0 }
    cityMap[city].orders++
    if (order.status !== 'cancelled') {
      cityMap[city].revenue += order.total
    }
  }

  return Object.entries(cityMap)
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.orders - a.orders)
}

/**
 * Compute order status distribution
 */
export function computeStatusDistribution(orders: Order[]): { status: OrderStatus; count: number }[] {
  const statusMap: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  }

  for (const order of orders) {
    statusMap[order.status]++
  }

  return Object.entries(statusMap).map(([status, count]) => ({
    status: status as OrderStatus,
    count,
  }))
}

/**
 * Compute top selling products
 */
export function computeTopProducts(
  orders: Order[],
  products: Product[]
): { productId: string; name: string; revenue: number; unitsSold: number }[] {
  const productMap: Record<string, { revenue: number; unitsSold: number }> = {}

  for (const order of orders) {
    if (order.status === 'cancelled') continue
    for (const item of order.items) {
      if (!productMap[item.productId]) {
        productMap[item.productId] = { revenue: 0, unitsSold: 0 }
      }
      productMap[item.productId].revenue += item.unitPrice * item.quantity
      productMap[item.productId].unitsSold += item.quantity
    }
  }

  return Object.entries(productMap)
    .map(([productId, data]) => {
      const product = products.find((p) => p.id === productId)
      return {
        productId,
        name: product?.name || 'Produit inconnu',
        ...data,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
}

/**
 * Compute payment method split
 */
export function computePaymentSplit(orders: Order[]) {
  let cod = 0
  let card = 0
  for (const order of orders) {
    if (order.paymentMethod === 'cod') cod++
    else card++
  }
  const total = cod + card
  return [
    { method: 'cod', count: cod, percentage: total > 0 ? Math.round((cod / total) * 100) : 0 },
    { method: 'card', count: card, percentage: total > 0 ? Math.round((card / total) * 100) : 0 },
  ]
}

/**
 * Derive customers from orders (deduplicate by phone number)
 */
export function deriveCustomers(orders: Order[]): Customer[] {
  const customerMap: Record<string, {
    firstName: string
    lastName: string
    phone: string
    city: string
    totalOrders: number
    totalSpent: number
    firstOrderAt: string
    lastOrderAt: string
  }> = {}

  for (const order of orders) {
    const phone = order.shippingAddress.phone
    if (!customerMap[phone]) {
      customerMap[phone] = {
        firstName: order.shippingAddress.firstName,
        lastName: order.shippingAddress.lastName,
        phone,
        city: order.shippingAddress.city,
        totalOrders: 0,
        totalSpent: 0,
        firstOrderAt: order.createdAt,
        lastOrderAt: order.createdAt,
      }
    }

    const customer = customerMap[phone]
    customer.totalOrders++
    if (order.status !== 'cancelled') {
      customer.totalSpent += order.total
    }
    // Update city to most recent
    customer.city = order.shippingAddress.city
    customer.firstName = order.shippingAddress.firstName
    customer.lastName = order.shippingAddress.lastName

    if (new Date(order.createdAt) < new Date(customer.firstOrderAt)) {
      customer.firstOrderAt = order.createdAt
    }
    if (new Date(order.createdAt) > new Date(customer.lastOrderAt)) {
      customer.lastOrderAt = order.createdAt
    }
  }

  const thirtyDaysAgo = subDays(new Date(), 30)

  return Object.entries(customerMap).map(([, data], index) => ({
    id: `cust_${String(index + 1).padStart(3, '0')}`,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    city: data.city,
    totalOrders: data.totalOrders,
    totalSpent: data.totalSpent,
    joinedAt: data.firstOrderAt,
    lastOrderAt: data.lastOrderAt,
    status: isAfter(parseISO(data.lastOrderAt), thirtyDaysAgo) ? 'active' as const : 'inactive' as const,
  }))
}
