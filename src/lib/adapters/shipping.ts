import { ShippingAdapter, ShippingConfig } from '../types'

// ============================================================
// Shipping Adapter
// TODO: Replace with Sendit API for real shipping rates
// ============================================================

const moroccanCities = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
  'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan',
  'Salé', 'Nador', 'Mohammedia', 'El Jadida', 'Béni Mellal',
  'Khouribga', 'Settat', 'Safi', 'Taza', 'Errachidia',
  'Khemisset', 'Larache', 'Guelmim', 'Berrechid', 'Temara',
]

const defaultConfig: ShippingConfig = {
  freeShippingCities: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'],
  defaultShippingCost: 35,
  freeShippingThreshold: 500,
}

const shippingAdapter: ShippingAdapter = {
  async calculateShipping(city: string, config?: ShippingConfig) {
    const cfg = config || defaultConfig
    const isFreeCity = cfg.freeShippingCities.includes(city)

    return {
      cost: isFreeCity ? 0 : cfg.defaultShippingCost,
      estimatedDays: isFreeCity ? 1 : 3,
    }
  },

  async getAvailableCities() {
    return moroccanCities
  },
}

export { shippingAdapter }
export { moroccanCities }
