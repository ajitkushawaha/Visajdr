'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ConvenienceFeeDisplay from '@/components/payment/ConvenienceFeeDisplay'
import SimpleCouponInput from '@/components/forms/SimpleCouponInput'
import { usePaymentGateway } from '@/hooks/usePaymentGateway'
import { useSession } from 'next-auth/react'
import { CreditCard, Wallet, Smartphone } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { processPayment } from '@/lib/payment-gateways/dynamicSDKLoader'

interface PaymentComponentProps {
  visaPrice: string
  method: string
  setMethod: (method: string) => void
  onTotalAmountChange?: (totalAmount: number) => void
  onCouponDiscountChange?: (couponDiscount: any) => void
  country?: string
  visaType?: string
  trackingId?: string
  visaId?: string // Visa ID to fetch visa-specific processing fee
  documentFiles?: Record<string, File | null> // Files to upload after pre-create
}

const PaymentComponent = ({
  visaPrice,
  method,
  setMethod,
  onTotalAmountChange,
  onCouponDiscountChange,
  country,
  visaType,
  trackingId,
  visaId,
  documentFiles = {},
}: PaymentComponentProps) => {
  const {
    gateways,
    selectedGateway,
    loading,
    error,
    selectGateway,
    clearSelection,
  } = usePaymentGateway()
  const { data: session } = useSession()
  const [processingPayment, setProcessingPayment] = useState(false)
  const [totalAmount, setTotalAmount] = useState<number>(parseInt(visaPrice))
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null)
  const [couponDiscount, setCouponDiscount] = useState<number>(0)
  const [couponData, setCouponData] = useState<any>(null) // Store full coupon object
  const [originalAmount, setOriginalAmount] = useState<number>(
    parseInt(visaPrice)
  )

  // Load coupon from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedCoupon = localStorage.getItem('visaCouponDiscount')
      if (savedCoupon) {
        const parsedCoupon = JSON.parse(savedCoupon)
        setCouponData(parsedCoupon)
        if (parsedCoupon?.discountAmount) {
          setCouponDiscount(parsedCoupon.discountAmount)
        }
      }
    } catch (error) {
      // Silently fail if coupon cannot be loaded from localStorage
    }
  }, [])

  // Auto-select active gateway when gateways are loaded
  useEffect(() => {
    if (!loading && gateways.length > 0 && !selectedGateway) {
      const activeGateway = gateways[0] // Only one active gateway at a time
      if (activeGateway) {
        selectGateway(activeGateway)
        setMethod(activeGateway.id)
      }
    }
  }, [loading, gateways, selectedGateway, selectGateway, setMethod])

  // Reset fee breakdown when gateway changes to trigger recalculation
  useEffect(() => {
    if (selectedGateway?.id) {
      setFeeBreakdown(null)
    }
  }, [selectedGateway?.id])

  const handleFeeUpdate = useCallback(
    (newTotalAmount: number, breakdown?: any) => {
      setOriginalAmount(newTotalAmount)
      const finalAmount = newTotalAmount - couponDiscount
      setTotalAmount(finalAmount)
      setFeeBreakdown(breakdown)
      // Notify parent component of the total amount change
      if (onTotalAmountChange) {
        onTotalAmountChange(finalAmount)
      }
    },
    [couponDiscount, onTotalAmountChange]
  )

  const handleCouponApplied = (
    discountAmount: number,
    finalAmount: number,
    couponObj?: any
  ) => {
    setCouponDiscount(discountAmount)
    setTotalAmount(finalAmount)
    setCouponData(couponObj) // Store the full coupon object in state
    if (onTotalAmountChange) {
      onTotalAmountChange(finalAmount)
    }
    if (onCouponDiscountChange && couponObj) {
      onCouponDiscountChange(couponObj)
    }

    // Save coupon to localStorage so it's available when creating payment order
    if (couponObj && typeof window !== 'undefined') {
      try {
        localStorage.setItem('visaCouponDiscount', JSON.stringify(couponObj))
      } catch (error) {
        // Silently fail if coupon cannot be saved to localStorage
      }
    }
  }

  const handleCouponRemoved = () => {
    setCouponDiscount(0)
    setCouponData(null) // Clear coupon object from state
    setTotalAmount(originalAmount)
    if (onTotalAmountChange) {
      onTotalAmountChange(originalAmount)
    }
    if (onCouponDiscountChange) {
      onCouponDiscountChange(null)
    }

    // Remove coupon from localStorage when removed
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('visaCouponDiscount')
      } catch (error) {
        // Silently fail if coupon cannot be removed from localStorage
      }
    }
  }

  const getGatewayIcon = (gatewayId?: string, type?: string) => {
    // Check gateway ID first for specific gateways
    if (gatewayId === 'cashfree') {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
          <span className="text-white font-bold text-xs">CF</span>
        </div>
      )
    }
    if (gatewayId === 'razorpay') {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
          <span className="text-white font-bold text-xs">RZ</span>
        </div>
      )
    }
    if (gatewayId === 'stripe') {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
          <span className="text-white font-bold text-xs">ST</span>
        </div>
      )
    }

    // Fallback to type-based icons
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5 text-blue-600" />
      case 'wallet':
        return <Wallet className="w-5 h-5 text-purple-600" />
      case 'upi':
        return <Smartphone className="w-5 h-5 text-green-600" />
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />
    }
  }

  /**
   * Dynamic payment handler - works for all payment gateways
   * Shows payment details and all calculated charges before opening payment UI
   */
  const handlePayment = async () => {
    if (!selectedGateway || !totalAmount) {
      alert('Please select a payment method')
      return
    }

    // New flow: pre-create application to obtain trackingId before payment

    // Show payment confirmation with all details
    // Only show Online Processing Fee and Coupon Discount in the confirmation
    const confirmMessage =
      `Payment Details:\n\n` +
      `Visa Application Fee: ${formatPrice(visaPrice)}\n` +
      (feeBreakdown?.fees?.length > 0
        ? feeBreakdown.fees
            .filter(
              (fee: any) =>
                fee.name === 'Online Processing Fee' ||
                fee.name === 'Payment Method Fee (Cashfree)'
            ) // Show Online Processing Fee and Cashfree Payment Method Fee
            .map((fee: any) => `${fee.name}: +${formatPrice(fee.amount)}`)
            .join('\n') + '\n'
        : '') +
      (couponDiscount > 0
        ? `Coupon Discount: -${formatPrice(couponDiscount)}\n`
        : '') +
      `\nTotal Amount: ${formatPrice(totalAmount)}\n\n` +
      `Payment Method: ${selectedGateway.name}\n` +
      `\nClick OK to proceed to payment.`

    if (!window.confirm(confirmMessage)) {
      return // User cancelled
    }

    try {
      setProcessingPayment(true)
      // Obtain CSRF token - always fetch fresh token to ensure it's valid
      let csrfToken: string | null = null
      try {
        const csrfRes = await fetch('/api/security/csrf', {
          method: 'GET',
          credentials: 'same-origin',
        })

        if (!csrfRes.ok) {
          throw new Error(`CSRF token fetch failed: ${csrfRes.status}`)
        }

        const csrfData = await csrfRes.json()
        csrfToken = csrfData?.token

        if (!csrfToken) {
          throw new Error('CSRF token not returned from server')
        }

        // Store in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('csrfToken', csrfToken)
        }

        // Ensure CSRF cookie exists - the server sets it, but we also set it client-side as backup
        if (typeof document !== 'undefined') {
          const secureAttr =
            window.location.protocol === 'https:' ? '; Secure' : ''
          document.cookie = `csrfToken=${csrfToken}; Path=/; SameSite=Strict${secureAttr}`
        }

        // Small delay to ensure cookie is set by browser before making POST request
        await new Promise(resolve => setTimeout(resolve, 150))
      } catch (e) {
        alert(
          'Failed to obtain security token. Please refresh the page and try again.'
        )
        setProcessingPayment(false)
        return
      }

      if (!csrfToken) {
        alert(
          'Security token is required. Please refresh the page and try again.'
        )
        setProcessingPayment(false)
        return
      }
      // Generate a standalone orderId
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      // Always call pre-create to ensure application is updated with latest discount and amounts
      // This is important because the user might have applied a coupon after the initial pre-create
      let preCreatedTrackingId: string | null = null
      try {
        const get = (key: string) =>
          typeof window !== 'undefined' ? localStorage.getItem(key) : null

        const formRaw = get('visaApplicationFormData')
        const form = formRaw ? JSON.parse(formRaw) : null
        const additionalInfo = get('visaApplicationAdditionalInfo') || ''
        const countryId =
          get('visaApplicationSelectedVisaId') || get('selectedCountry')
        // Try to get coupon from localStorage, but also check state (which might be more up-to-date)
        const couponRaw = get('visaCouponDiscount')
        let couponDataFromStorage = couponRaw ? JSON.parse(couponRaw) : null

        // Use couponData from state if available (more recent), otherwise use localStorage
        const couponDataToUse = couponData || couponDataFromStorage

        const passportUrl =
          get('uploadedPassportUrl') ||
          get('visaPassportUrl') ||
          get('passportUrl')
        const photoUrl =
          get('uploadedPhotoUrl') || get('visaPhotoUrl') || get('photoUrl')

        // Try to get existing trackingId, but still call pre-create to update amounts
        const existingTrackingId =
          trackingId ||
          sessionStorage.getItem('visaApplicationTrackingId') ||
          localStorage.getItem('visaApplicationTrackingId')

        if (!form || !countryId) {
          // If no form data but we have trackingId, use it (fallback scenario)
          if (existingTrackingId) {
            preCreatedTrackingId = String(existingTrackingId)
          } else {
            throw new Error(
              'Missing saved application data. Please fill the application form.'
            )
          }
        } else {
          // Always call pre-create to ensure amounts are updated with latest discount
          // Use couponDataToUse (from state or localStorage) - the full coupon object
          // Build payload - always include couponDiscount (even if null)
          const payload: any = {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            nationality: form.nationality,
            purpose: form.purpose,
            countryId,
            additionalInfo,
            paymentMethod: selectedGateway.id,
            couponDiscount: couponDiscount, // Pass coupon object (or null)
            passportUrl: passportUrl || undefined,
            photoUrl: photoUrl || undefined,
          }

          const submitRes = await fetch('/api/applications/pre-create', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
            },
            body: JSON.stringify(payload),
          })
          const submitData = await submitRes.json()
          if (!submitRes.ok || !submitData?.trackingId) {
            throw new Error(
              submitData?.error || 'Failed to pre-create application'
            )
          }
          preCreatedTrackingId = String(submitData.trackingId)

          try {
            if (preCreatedTrackingId) {
              sessionStorage.setItem(
                'visaApplicationTrackingId',
                preCreatedTrackingId
              )
              localStorage.setItem(
                'visaApplicationTrackingId',
                preCreatedTrackingId
              )
              // Also store application ID if available
              if (submitData.applicationId) {
                sessionStorage.setItem(
                  'visaApplicationId',
                  submitData.applicationId
                )
                localStorage.setItem(
                  'visaApplicationId',
                  submitData.applicationId
                )

                // Documents are already uploaded to Cloudinary in handleSubmitPending
                // before moving to payment step, so no need to upload again here
                console.log(
                  '✅ Documents already uploaded to Cloudinary before payment step'
                )
              }
            }
          } catch {}
        }
      } catch (precreateError: any) {
        // If pre-create fails but we have an existing trackingId, use it as fallback
        const fallbackTrackingId =
          trackingId ||
          sessionStorage.getItem('visaApplicationTrackingId') ||
          localStorage.getItem('visaApplicationTrackingId')
        if (fallbackTrackingId) {
          preCreatedTrackingId = String(fallbackTrackingId)
        } else {
          alert(
            precreateError?.message ||
              'Unable to pre-create application. Please check your form.'
          )
          return
        }
      }

      // Ensure we have a valid tracking id from pre-create
      if (!preCreatedTrackingId) {
        throw new Error('Missing trackingId after pre-create. Please retry.')
      }

      // Use unified payment API
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          gatewayId: selectedGateway.id,
          orderId: orderId,
          trackingId: preCreatedTrackingId,
          clientAmount: totalAmount,
          customerDetails: {
            name: session?.user?.name,
            email: session?.user?.email,
          },
          orderNote: `Payment for ${country || ''} ${visaType || ''} visa`,
          metadata: {
            country,
            visaType,
            userId: (session?.user as any)?.id || session?.user?.email,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store application ID if returned from create-order
        if (data.applicationId) {
          try {
            sessionStorage.setItem('visaApplicationId', data.applicationId)
            localStorage.setItem('visaApplicationId', data.applicationId)
          } catch (e) {
            // Failed to store application ID - continue anyway
          }
        }

        // For Cashfree, the payment UI will show all options (UPI, wallet, cards, etc.)
        // Dynamically process payment using the SDK loader
        await processPayment(selectedGateway.id, data, selectedGateway)
      } else {
        throw new Error(data.error || 'Failed to create payment order')
      }
    } catch (error: any) {
      alert(error.message || 'Failed to initiate payment. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const { format: formatPrice } = useCurrency()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Payment Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple Coupon Input */}
            <SimpleCouponInput
              country={country}
              visaType={visaType}
              originalAmount={originalAmount}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
            />

            {/* Single Clear Payment Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Visa Application Fee</span>
                <span className="font-semibold">{formatPrice(visaPrice)}</span>
              </div>

              {feeBreakdown &&
                feeBreakdown.fees &&
                feeBreakdown.fees.length > 0 && (
                  <>
                    {feeBreakdown.fees.map((fee: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-700">{fee.name}</span>
                        <span className="font-semibold text-blue-600">
                          +{formatPrice(fee.amount)}
                        </span>
                      </div>
                    ))}
                  </>
                )}

              {/* Debug logging for fee breakdown */}
              {selectedGateway &&
                (!feeBreakdown ||
                  !feeBreakdown.fees ||
                  feeBreakdown.fees.length === 0) && (
                  <div className="text-xs text-gray-400 italic">
                    Calculating fees for {selectedGateway.name}
                  </div>
                )}

              {couponDiscount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Coupon Discount</span>
                  <span className="font-semibold text-green-600">
                    -{formatPrice(couponDiscount)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount to Pay
                  </span>
                  <span className="text-2xl font-bold text-brand-primary">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* {selectedGateway && (
              <div className="mt-4 p-3 bg-brand-primary/10 rounded-lg text-center">
                <p className="text-sm text-brand-primary">
                  <strong>Selected Payment Method:</strong>{' '}
                  {selectedGateway.name}
                </p>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Convenience Fee Display - Hidden but still calculating fees */}
      {/* Always calculate fees with the selected gateway or default method */}
      {visaPrice && !isNaN(parseInt(visaPrice)) && parseInt(visaPrice) > 0 && (
        <div className="mb-6" style={{ display: 'none' }}>
          <ConvenienceFeeDisplay
            baseAmount={parseInt(visaPrice)}
            paymentMethod={selectedGateway?.id || method || 'razorpay'}
            onFeeUpdate={handleFeeUpdate}
            showBreakdown={false}
            visaId={visaId}
          />
        </div>
      )}

      {/* Payment Method Info and Continue Button */}
      {selectedGateway && (
        <Card className="mb-6">
          <CardContent>
            {/* Continue Button - Opens Cashfree SDK with all payment options */}
            <div className="pt-4">
              <Button
                onClick={handlePayment}
                className="w-full bg-brand-primary hover:bg-brand-dark text-white py-6 text-lg font-semibold"
                disabled={!totalAmount || totalAmount <= 0 || processingPayment}
              >
                {processingPayment ? `Processing...` : `Continue to Payment`}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                You will be redirected to {selectedGateway.name} to complete
                payment with all available options
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Gateways Available */}
      {!loading && !error && gateways.length === 0 && (
        <Card className="mt-6">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-2">No payment gateways available</p>
            <p className="text-sm text-gray-500">
              Please contact support for payment options or try again later
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PaymentComponent
