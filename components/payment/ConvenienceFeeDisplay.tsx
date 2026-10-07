'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calculator,
  CreditCard,
  Clock,
  FileText,
  Info,
  AlertCircle,
} from 'lucide-react'
import { formatFeeAmount, getFeeDescription } from '@/lib/convenienceFee'

interface ConvenienceFeeDisplayProps {
  baseAmount: number
  paymentMethod: string
  className?: string
  showBreakdown?: boolean
  onFeeUpdate?: (totalAmount: number, breakdown?: any) => void
  visaId?: string // Optional visa ID to fetch visa-specific processing fee
}

interface FeeBreakdown {
  onlineProcessing: number
  paymentMethod: number
  expressService: number
  documentProcessing: number
  total: number
  baseAmount: number
  totalAmount: number
}

export default function ConvenienceFeeDisplay({
  baseAmount,
  paymentMethod,
  className = '',
  showBreakdown = true,
  onFeeUpdate,
  visaId,
}: ConvenienceFeeDisplayProps) {
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use ref to track last values sent to prevent infinite loops
  const lastSentRef = useRef<{
    totalAmount: number
    breakdownHash: string
  } | null>(null)

  useEffect(() => {
    fetchFeeBreakdown()
    // Reset lastSentRef when baseAmount, paymentMethod, or visaId changes to allow new calculations
    lastSentRef.current = null
  }, [baseAmount, paymentMethod, visaId])

  // Notify parent component when fee breakdown changes
  useEffect(() => {
    if (!onFeeUpdate || !feeBreakdown) return

    // Create a simplified breakdown for the payment summary
    // Show Online Processing Fee and Payment Method Fee (Cashfree)
    const simplifiedBreakdown = {
      fees: [] as Array<{ name: string; amount: number }>,
    }

    // Include Online Processing Fee in the payment summary
    if (feeBreakdown.onlineProcessing > 0) {
      simplifiedBreakdown.fees.push({
        name: 'Online Processing Fee',
        amount: feeBreakdown.onlineProcessing,
      })
    }

    // Include Payment Method Fee (Cashfree) if payment method is Cashfree and fee exists
    if (
      paymentMethod.toLowerCase() === 'cashfree' &&
      feeBreakdown.paymentMethod > 0
    ) {
      simplifiedBreakdown.fees.push({
        name: 'Payment Method Fee (Cashfree)',
        amount: feeBreakdown.paymentMethod,
      })
    }

    // Hide other fees from payment summary:
    // - Express Service Fee (hidden)
    // - Document Processing Fee (hidden)

    // Create a hash to check if breakdown actually changed
    const breakdownHash = JSON.stringify(simplifiedBreakdown)
    const totalAmount = feeBreakdown.totalAmount

    // Only call onFeeUpdate if values actually changed
    if (
      lastSentRef.current?.totalAmount !== totalAmount ||
      lastSentRef.current?.breakdownHash !== breakdownHash
    ) {
      lastSentRef.current = { totalAmount, breakdownHash }
      onFeeUpdate(totalAmount, simplifiedBreakdown)
    }
  }, [feeBreakdown, onFeeUpdate, paymentMethod])

  const fetchFeeBreakdown = async () => {
    // Validate inputs before making API call
    if (
      !baseAmount ||
      baseAmount <= 0 ||
      !paymentMethod ||
      paymentMethod.trim() === ''
    ) {
      console.warn(
        'ConvenienceFeeDisplay: Missing or invalid required parameters',
        {
          baseAmount,
          paymentMethod,
          baseAmountValid: baseAmount && baseAmount > 0,
          paymentMethodValid: paymentMethod && paymentMethod.trim() !== '',
        }
      )
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const requestBody = {
        baseAmount,
        paymentMethod,
        visaId, // Pass visaId to fetch visa-specific processing fee
        options: {
          expressService: false,
          documentProcessing: false,
        },
      }

      const response = await fetch('/api/public/convenience-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const data = await response.json()

        setFeeBreakdown(data.feeBreakdown)
        // The useEffect hook will handle notifying the parent component
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to calculate fees:', errorData)
        throw new Error(errorData.error || 'Failed to calculate fees')
      }
    } catch (error) {
      console.error('Error fetching fee breakdown:', error)
      setError('Unable to calculate convenience fees')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="w-5 h-5" />
            Calculating Fees...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !feeBreakdown) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-600">
            <AlertCircle className="w-5 h-5" />
            Fee Calculation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {error || 'Unable to calculate convenience fees at this time.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // If no fees are applicable
  if (feeBreakdown.total === 0) {
    // The useEffect hook will handle notifying the parent component

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-600">
            <Calculator className="w-5 h-5" />
            No Additional Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            No convenience fees apply to this transaction.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5" />
          Fee Breakdown
        </CardTitle>
        <p className="text-sm text-gray-600">
          Additional charges for this transaction
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Amount */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Base Amount:</span>
          <span className="font-semibold">
            ₹{feeBreakdown.baseAmount.toFixed(2)}
          </span>
        </div>

        <Separator />

        {/* Fee Breakdown */}
        {showBreakdown && (
          <>
            {feeBreakdown.onlineProcessing > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Online Processing
                  </span>
                </div>
                <Badge variant="outline" className="text-blue-600">
                  +₹{feeBreakdown.onlineProcessing.toFixed(2)}
                </Badge>
              </div>
            )}

            {/* {feeBreakdown.paymentMethod > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">
                    {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Payment
                  </span>
                </div>
                <Badge variant="outline" className="text-purple-600">
                  +₹{feeBreakdown.paymentMethod.toFixed(2)}
                </Badge>
              </div>
            )} */}

            {feeBreakdown.expressService > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">Express Service</span>
                </div>
                <Badge variant="outline" className="text-yellow-600">
                  +₹{feeBreakdown.expressService.toFixed(2)}
                </Badge>
              </div>
            )}

            {feeBreakdown.documentProcessing > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-600">
                    Document Processing
                  </span>
                </div>
                <Badge variant="outline" className="text-indigo-600">
                  +₹{feeBreakdown.documentProcessing.toFixed(2)}
                </Badge>
              </div>
            )}

            <Separator />
          </>
        )}

        {/* Total Fees */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Fees:</span>
          <Badge variant="secondary" className="text-lg">
            +₹{feeBreakdown.total.toFixed(2)}
          </Badge>
        </div>

        <Separator />

        {/* Final Total */}
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount:</span>
          <span className="text-green-600">
            ₹{feeBreakdown.totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Info Section */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Convenience Fees:</p>
              <ul className="text-xs space-y-1">
                <li>
                  • Online processing fees cover digital application handling
                </li>
                <li>• Payment method fees vary by transaction type</li>
                <li>• Express service fees apply for faster processing</li>
                <li>• Document processing fees cover verification services</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
