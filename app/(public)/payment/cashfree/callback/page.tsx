'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function CashfreeCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(
    'loading'
  )
  const [message, setMessage] = useState('Processing payment...')
  const orderId = searchParams?.get('order_id') ?? ''

  useEffect(() => {
    // Don't run if no orderId
    if (!orderId) {
      setStatus('failed')
      setMessage(
        'Order ID not found in payment callback. Please contact support.'
      )
      return
    }

    const processPayment = async () => {
      try {
        // Step 1: Verify payment with Cashfree
        setMessage('Verifying payment...')

        const verifyResponse = await fetch(
          `/api/payments/cashfree/verify?order_id=${orderId}`
        )

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json().catch(() => ({}))
          throw new Error(
            errorData.error ||
              `Verification failed: ${verifyResponse.statusText}`
          )
        }

        const verifyData = await verifyResponse.json()

        if (!verifyData.success || !verifyData.verified) {
          setStatus('failed')
          setMessage(
            verifyData.message ||
              'Payment verification failed. Please contact support.'
          )
          return
        }

        // Step 2: Get CSRF token
        setMessage('Preparing to complete payment...')

        const csrfResponse = await fetch('/api/security/csrf', {
          method: 'GET',
          credentials: 'include',
        })

        if (!csrfResponse.ok) {
          throw new Error('Failed to obtain security token')
        }

        const csrfData = await csrfResponse.json()
        const csrfToken = csrfData?.token

        if (!csrfToken) {
          throw new Error('Security token not received')
        }

        // Step 3: Get application data from storage
        const applicationId =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('visaApplicationId') ||
              localStorage.getItem('visaApplicationId')
            : null

        const trackingId =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('visaApplicationTrackingId') ||
              localStorage.getItem('visaApplicationTrackingId')
            : null

        setMessage('Completing payment...')

        const paymentCompletePayload = {
          ...(applicationId ? { applicationId } : {}),
          ...(trackingId ? { trackingId } : {}),
          finalAmount: verifyData.orderAmount,
          paymentId: orderId,
          paymentMethod: 'cashfree',
          orderId: orderId,
        }

        const completeResponse = await fetch(
          '/api/applications/payment-complete',
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': csrfToken,
            },
            body: JSON.stringify(paymentCompletePayload),
          }
        )

        if (!completeResponse.ok) {
          const errorData = await completeResponse.json().catch(() => ({}))
          console.error('❌ Payment complete error:', errorData)

          if (completeResponse.status === 401) {
            setStatus('failed')
            setMessage(
              'Session expired. Please login and contact support with order ID: ' +
                orderId
            )
            return
          }

          if (completeResponse.status === 404) {
            setStatus('failed')
            setMessage(
              'Application not found. Please contact support with order ID: ' +
                orderId
            )
            return
          }

          throw new Error(
            errorData.error ||
              `Payment completion failed: ${completeResponse.statusText}`
          )
        }

        const completeData = await completeResponse.json()

        if (!completeData.success) {
          setStatus('failed')
          setMessage(completeData.error || 'Payment completion failed')
          return
        }

        // Step 5: Success - clear storage and show success

        if (typeof window !== 'undefined') {
          // Clear form data
          localStorage.removeItem('visaApplicationFormData')
          localStorage.removeItem('visaApplicationAdditionalInfo')
          localStorage.removeItem('visaApplicationSelectedVisaId')
          localStorage.removeItem('visaApplicationStep')
          localStorage.removeItem('selectedCountry')
          localStorage.removeItem('returnStep')
          localStorage.removeItem('visaApplicationTrackingId')
          localStorage.removeItem('uploadedPassportUrl')
          localStorage.removeItem('uploadedPhotoUrl')
          localStorage.removeItem('visaPassportUrl')
          localStorage.removeItem('visaPhotoUrl')
          localStorage.removeItem('passportUrl')
          localStorage.removeItem('photoUrl')
          localStorage.removeItem('visaCouponDiscount')

          // Mark payment as complete
          sessionStorage.setItem('paymentComplete', 'true')
          sessionStorage.setItem('paymentJustCompleted', 'true')
        }

        setStatus('success')
        setMessage('Payment successful!')
      } catch (error: any) {
        console.error('❌ Payment processing error:', error)
        setStatus('failed')
        setMessage(
          error.message || 'Failed to process payment. Please contact support.'
        )
      }
    }

    processPayment()
  }, [orderId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-2">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">
            {status === 'success'
              ? '🎉 Payment Successful!'
              : status === 'failed'
                ? '❌ Payment Failed'
                : 'Payment Status'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-blue-600" />
              <p className="text-lg text-gray-700">{message}</p>
              <p className="text-sm text-gray-500">
                Please wait while we process your payment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-green-100 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <div className="space-y-3">
                <p className="text-green-600 font-bold text-2xl mb-2">
                  {message}
                </p>
                <p className="text-lg text-gray-800 font-semibold">
                  Your booking has been submitted successfully!
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    📧 Email Confirmation
                  </p>
                  <p className="text-sm text-blue-700">
                    You will receive a confirmation email with your booking
                    details and invoice shortly.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  size="lg"
                  className="flex-1 sm:flex-none min-w-[140px]"
                >
                  🏠 Go to Home
                </Button>
                <Button
                  onClick={() => router.push('/dashboard?paid=1')}
                  size="lg"
                  className="flex-1 sm:flex-none min-w-[140px] bg-brand-primary hover:bg-brand-dark text-white"
                >
                  📊 View Booking
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="bg-red-100 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
              <p className="text-red-600 font-semibold text-lg mb-4">
                {message}
              </p>
              {orderId && (
                <p className="text-sm text-gray-600 mb-4">
                  Order ID:{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {orderId}
                  </code>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push('/dashboard')}
                  size="lg"
                  className="bg-brand-primary hover:bg-brand-dark text-white"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  size="lg"
                >
                  Go to Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function CashfreeCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <CashfreeCallbackContent />
    </Suspense>
  )
}
