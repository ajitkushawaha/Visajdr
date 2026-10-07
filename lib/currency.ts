/**
 * Currency formatting utility
 * Uses the global currency setting from CompanySettings
 */

export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  locale: string
}

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupees',
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollars',
    locale: 'en-US',
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    locale: 'en-AE',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    name: 'Saudi Riyal',
    locale: 'en-SA',
  },
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencyCode - Currency code (defaults to INR if not provided)
 * @param options - Additional formatting options
 */
export function formatCurrency(
  amount: number | string,
  currencyCode: string = 'INR',
  options?: {
    showSymbol?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  const currency = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR
  const numAmount =
    typeof amount === 'string' ? parseFloat(amount) || 0 : amount

  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options || {}

  if (showSymbol) {
    // Use Intl.NumberFormat for proper formatting
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(numAmount)
  } else {
    // Just format the number with symbol prefix
    return `${currency.symbol} ${numAmount.toLocaleString(currency.locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    })}`
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  const currency = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR
  return currency.symbol
}

/**
 * Get currency info
 */
export function getCurrencyInfo(currencyCode: string = 'INR'): CurrencyInfo {
  return CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR
}
