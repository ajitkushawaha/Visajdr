'use client'

import { useState, useEffect } from 'react'
import {
  formatCurrency,
  getCurrencySymbol,
  getCurrencyInfo,
  CURRENCY_MAP,
} from '@/lib/currency'

export function useCurrency() {
  const [currency, setCurrency] = useState<string>('INR')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch('/api/public/currency')
        const data = await response.json()
        if (data.success && data.currency) {
          setCurrency(data.currency)
        }
      } catch (error) {
        console.error('Error fetching currency:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrency()
  }, [])

  return {
    currency,
    currencyInfo: getCurrencyInfo(currency),
    symbol: getCurrencySymbol(currency),
    format: (amount: number | string, options?: any) =>
      formatCurrency(amount, currency, options),
    loading,
  }
}
