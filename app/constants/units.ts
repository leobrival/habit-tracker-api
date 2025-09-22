/**
 * Unit constants and mappings for habit tracking
 * Provides standardized units with default values for common habits
 */

export interface UnitMapping {
  name: string
  symbol: string
  defaultValue: number
  category: string
}

/**
 * Percentage Units
 */
export const PERCENTAGE_UNITS: Record<string, UnitMapping> = {
  PERCENT: {
    name: 'percent',
    symbol: '%',
    defaultValue: 100,
    category: 'percentage',
  },
} as const

/**
 * Duration Units
 */
export const DURATION_UNITS: Record<string, UnitMapping> = {
  SECONDS: {
    name: 'seconds',
    symbol: 's',
    defaultValue: 60,
    category: 'duration',
  },
  MINUTES: {
    name: 'minutes',
    symbol: 'min',
    defaultValue: 30,
    category: 'duration',
  },
  HOURS: {
    name: 'hours',
    symbol: 'h',
    defaultValue: 2,
    category: 'duration',
  },
} as const

/**
 * Distance Units
 */
export const DISTANCE_UNITS: Record<string, UnitMapping> = {
  KILOMETERS: {
    name: 'kilometers',
    symbol: 'km',
    defaultValue: 5,
    category: 'distance',
  },
  METERS: {
    name: 'meters',
    symbol: 'm',
    defaultValue: 1000,
    category: 'distance',
  },
  MILES: {
    name: 'miles',
    symbol: 'mi',
    defaultValue: 3,
    category: 'distance',
  },
  YARDS: {
    name: 'yards',
    symbol: 'yd',
    defaultValue: 500,
    category: 'distance',
  },
  FEET: {
    name: 'feet',
    symbol: 'ft',
    defaultValue: 1000,
    category: 'distance',
  },
} as const

/**
 * Volume Units
 */
export const VOLUME_UNITS: Record<string, UnitMapping> = {
  LITERS: {
    name: 'liters',
    symbol: 'L',
    defaultValue: 2.5,
    category: 'volume',
  },
  MILLILITERS: {
    name: 'milliliters',
    symbol: 'ml',
    defaultValue: 500,
    category: 'volume',
  },
  GLASSES: {
    name: 'glasses',
    symbol: 'gl',
    defaultValue: 8,
    category: 'volume',
  },
  CUPS: {
    name: 'cups',
    symbol: 'cups',
    defaultValue: 6,
    category: 'volume',
  },
  BOTTLES: {
    name: 'bottles',
    symbol: 'btl',
    defaultValue: 3,
    category: 'volume',
  },
  GALLONS: {
    name: 'gallons',
    symbol: 'gal',
    defaultValue: 1,
    category: 'volume',
  },
} as const

/**
 * Mass Units
 */
export const MASS_UNITS: Record<string, UnitMapping> = {
  KILOGRAMS: {
    name: 'kilograms',
    symbol: 'kg',
    defaultValue: 70,
    category: 'mass',
  },
  GRAMS: {
    name: 'grams',
    symbol: 'g',
    defaultValue: 500,
    category: 'mass',
  },
  POUNDS: {
    name: 'pounds',
    symbol: 'lbs',
    defaultValue: 150,
    category: 'mass',
  },
  OUNCES: {
    name: 'ounces',
    symbol: 'oz',
    defaultValue: 16,
    category: 'mass',
  },
  TONS: {
    name: 'tons',
    symbol: 't',
    defaultValue: 1,
    category: 'mass',
  },
} as const

/**
 * Energy Units
 */
export const ENERGY_UNITS: Record<string, UnitMapping> = {
  CALORIES: {
    name: 'calories',
    symbol: 'kcal',
    defaultValue: 300,
    category: 'energy',
  },
} as const

/**
 * Currency Units
 */
export const CURRENCY_UNITS: Record<string, UnitMapping> = {
  EUR: {
    name: 'euros',
    symbol: '€',
    defaultValue: 50,
    category: 'currency',
  },
  USD: {
    name: 'dollars',
    symbol: '$',
    defaultValue: 50,
    category: 'currency',
  },
  GBP: {
    name: 'pounds',
    symbol: '£',
    defaultValue: 40,
    category: 'currency',
  },
  JPY: {
    name: 'yen',
    symbol: '¥',
    defaultValue: 5000,
    category: 'currency',
  },
  CHF: {
    name: 'francs',
    symbol: 'CHF',
    defaultValue: 45,
    category: 'currency',
  },
  CAD: {
    name: 'canadian_dollars',
    symbol: 'CAD',
    defaultValue: 60,
    category: 'currency',
  },
  AUD: {
    name: 'australian_dollars',
    symbol: 'AUD',
    defaultValue: 70,
    category: 'currency',
  },
  CNY: {
    name: 'yuan',
    symbol: '¥',
    defaultValue: 300,
    category: 'currency',
  },
  KRW: {
    name: 'won',
    symbol: '₩',
    defaultValue: 60000,
    category: 'currency',
  },
  BTC: {
    name: 'bitcoin',
    symbol: '₿',
    defaultValue: 0.001,
    category: 'currency',
  },
  ETH: {
    name: 'ethereum',
    symbol: 'ETH',
    defaultValue: 0.02,
    category: 'currency',
  },
} as const

/**
 * All units combined for easy access
 */
export const ALL_UNITS = {
  ...PERCENTAGE_UNITS,
  ...DURATION_UNITS,
  ...DISTANCE_UNITS,
  ...VOLUME_UNITS,
  ...MASS_UNITS,
  ...ENERGY_UNITS,
  ...CURRENCY_UNITS,
} as const

/**
 * Unit categories for organization
 */
export const UNIT_CATEGORIES = {
  PERCENTAGE: 'percentage',
  DURATION: 'duration',
  DISTANCE: 'distance',
  VOLUME: 'volume',
  MASS: 'mass',
  ENERGY: 'energy',
  CURRENCY: 'currency',
} as const

/**
 * Helper functions
 */
export class UnitHelper {
  /**
   * Get all units for a specific category
   */
  static getUnitsByCategory(category: string): UnitMapping[] {
    return Object.values(ALL_UNITS).filter((unit) => unit.category === category)
  }

  /**
   * Get unit by name
   */
  static getUnitByName(name: string): UnitMapping | undefined {
    return Object.values(ALL_UNITS).find((unit) => unit.name === name)
  }

  /**
   * Get suggested default value for a unit
   */
  static getDefaultValue(unitName: string): number {
    const unit = this.getUnitByName(unitName)
    return unit?.defaultValue ?? 1
  }

  /**
   * Get all available categories
   */
  static getCategories(): string[] {
    return Object.values(UNIT_CATEGORIES)
  }

  /**
   * Create a custom unit
   */
  static createCustomUnit(name: string, symbol: string, defaultValue: number): UnitMapping {
    return {
      name,
      symbol,
      defaultValue,
      category: 'custom',
    }
  }

  /**
   * Format value with unit symbol
   */
  static formatValue(value: number, unitName: string): string {
    const unit = this.getUnitByName(unitName)
    if (!unit) return `${value}`
    return `${value} ${unit.symbol}`
  }
}

/**
 * Type definitions for TypeScript
 */
export type UnitName = keyof typeof ALL_UNITS
export type UnitCategory = keyof typeof UNIT_CATEGORIES

/**
 * Common unit presets for popular habits
 */
export const HABIT_PRESETS = {
  DAILY_WALK: {
    name: 'Daily Walk',
    unit: DURATION_UNITS.MINUTES,
    suggestions: [15, 30, 45, 60],
  },
  WATER_INTAKE: {
    name: 'Water Intake',
    unit: VOLUME_UNITS.GLASSES,
    suggestions: [6, 8, 10, 12],
  },
  READING: {
    name: 'Reading',
    unit: VOLUME_UNITS.PAGES,
    suggestions: [10, 20, 30, 50],
  },
  MEDITATION: {
    name: 'Meditation',
    unit: DURATION_UNITS.MINUTES,
    suggestions: [5, 10, 15, 20],
  },
  WORKOUT: {
    name: 'Workout',
    unit: ENERGY_UNITS.CALORIES,
    suggestions: [200, 300, 400, 500],
  },
} as const
