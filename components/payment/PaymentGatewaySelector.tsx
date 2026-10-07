'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle,
  Loader2,
} from 'lucide-react'

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

interface PaymentGatewaySelectorProps {
  onGatewaySelect: (gateway: PaymentGateway) => void
  selectedGateway?: PaymentGateway | null
  disabled?: boolean
}

export default function PaymentGatewaySelector({
  onGatewaySelect,
  selectedGateway,
  disabled = false,
}: PaymentGatewaySelectorProps) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentGateways()
  }, [])

  const fetchPaymentGateways = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/public/payment-gateways')
      const data = await response.json()
      if (data.success) {
        setGateways(data.data.activeGateways)
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

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5" />
      case 'wallet':
        return <Wallet className="w-5 h-5" />
      case 'upi':
        return <Smartphone className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }

  const getGatewayBadge = (gateway: PaymentGateway) => {
    // Show "Test Mode" for sandbox/test environments
    if (gateway.mode === 'sandbox' || gateway.mode === 'test') {
      return (
        <Badge variant="secondary" className="text-xs">
          Test Mode
        </Badge>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading payment options...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchPaymentGateways} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  if (gateways.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-2">No payment gateways available</p>
        <p className="text-sm text-gray-500">
          Please contact support for payment options
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
        <p className="text-sm text-gray-600">
          Choose your preferred payment option
        </p>
      </div>

      <div className="grid gap-3">
        {gateways.map(gateway => (
          <Card
            key={gateway.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedGateway?.id === gateway.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => !disabled && onGatewaySelect(gateway)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      gateway.type === 'card'
                        ? 'bg-blue-100 text-blue-600'
                        : gateway.type === 'wallet'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {getGatewayIcon(gateway.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{gateway.name}</h4>
                      {getGatewayBadge(gateway)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {gateway.description}
                    </p>
                  </div>
                </div>

                {selectedGateway?.id === gateway.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGateway && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {selectedGateway.name}
            {selectedGateway.mode === 'sandbox' && ' (Test Mode)'}
          </p>
        </div>
      )}
    </div>
  )
}
