import { useState, useEffect } from 'react'

interface PaymentGateway {
  id: string
  name: string
  type: 'card' | 'wallet' | 'upi'
  keyId: string
  description: string
  mode?: 'sandbox' | 'live'
  upiId?: string
  merchantName?: string
}

interface UsePaymentGatewayReturn {
  gateways: PaymentGateway[]
  selectedGateway: PaymentGateway | null
  loading: boolean
  error: string | null
  selectGateway: (gateway: PaymentGateway) => void
  clearSelection: () => void
  refreshGateways: () => void
}

export function usePaymentGateway(): UsePaymentGatewayReturn {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGateways = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/public/payment-gateways')
      const data = await response.json()

      if (data.success) {
        // Use activeGateway if available (single active gateway), fallback to activeGateways array
        const activeGateway =
          data.data.activeGateway || data.data.activeGateways?.[0] || null
        const gatewaysList = activeGateway
          ? [activeGateway]
          : data.data.activeGateways || []

        setGateways(gatewaysList)

        // Auto-select the active gateway (only one can be active at a time)
        if (activeGateway) {
          setSelectedGateway(activeGateway)
        } else {
          setSelectedGateway(null)
          console.log('⚠️ No active payment gateway found')
        }
      } else {
        setError('Failed to fetch payment gateways')
      }
    } catch (error) {
      console.error('Error fetching payment gateways:', error)
      setError('Failed to load payment options')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGateways()
  }, [])

  const selectGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway)
  }

  const clearSelection = () => {
    setSelectedGateway(null)
  }

  const refreshGateways = () => {
    fetchGateways()
  }

  return {
    gateways,
    selectedGateway,
    loading,
    error,
    selectGateway,
    clearSelection,
    refreshGateways,
  }
}
