import { describe, it, expect } from 'vitest'
import { shippingAdapter, moroccanCities } from './shipping'
import type { ShippingConfig } from '@/lib/types'

const config: ShippingConfig = {
  freeShippingCities: ['Casablanca', 'Rabat'],
  defaultShippingCost: 35,
  freeShippingThreshold: 500,
}

describe('shipping adapter', () => {
  it('ships free to a configured free city', async () => {
    const result = await shippingAdapter.calculateShipping('Casablanca', config)

    expect(result.cost).toBe(0)
    expect(result.estimatedDays).toBe(1)
  })

  it('charges the default cost elsewhere', async () => {
    const result = await shippingAdapter.calculateShipping('Agadir', config)

    expect(result.cost).toBe(35)
    expect(result.estimatedDays).toBe(3)
  })

  it('honours an updated free-city list rather than hardcoded defaults', async () => {
    const custom: ShippingConfig = { ...config, freeShippingCities: ['Agadir'] }

    await expect(shippingAdapter.calculateShipping('Agadir', custom)).resolves.toMatchObject({ cost: 0 })
    await expect(shippingAdapter.calculateShipping('Casablanca', custom)).resolves.toMatchObject({ cost: 35 })
  })

  it('honours a custom default shipping cost', async () => {
    const custom: ShippingConfig = { ...config, defaultShippingCost: 60 }

    await expect(shippingAdapter.calculateShipping('Tanger', custom)).resolves.toMatchObject({ cost: 60 })
  })

  it('falls back to built-in defaults when no config is supplied', async () => {
    const result = await shippingAdapter.calculateShipping('Casablanca')

    // Casablanca is a free city in the built-in defaults.
    expect(result.cost).toBe(0)
  })

  it('treats city matching as case- and exact-sensitive', async () => {
    // Guards the checkout <select>, which must submit values exactly as listed.
    await expect(shippingAdapter.calculateShipping('casablanca', config)).resolves.toMatchObject({
      cost: 35,
    })
  })

  it('exposes a non-empty city list that includes the free cities', async () => {
    const cities = await shippingAdapter.getAvailableCities()

    expect(cities.length).toBeGreaterThan(0)
    for (const city of config.freeShippingCities) {
      expect(cities).toContain(city)
    }
    expect(cities).toEqual(moroccanCities)
  })

  it('has no duplicate cities', async () => {
    const cities = await shippingAdapter.getAvailableCities()

    expect(new Set(cities).size).toBe(cities.length)
  })
})
