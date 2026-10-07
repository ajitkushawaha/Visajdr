// lib/payment-gateways/dynamicSDKLoader.ts
import { paymentGatewayRegistry } from './PaymentGatewayRegistry'

// Register gateways for client-side use
// We create lightweight client-side gateway objects that only have the methods needed for client
// This avoids importing Node.js-only packages on the client side
if (typeof window !== 'undefined') {
  // Client-side: Register gateways with only client-side methods (no Node.js imports)
  const cashfreeClient = {
    id: 'cashfree',
    name: 'Cashfree',
    // Cashfree uses @cashfreepayments/cashfree-js package, not script loading
    getSDKScript: () => null, // Not used for Cashfree
    getSDKInitFunction: () => 'load', // Use 'load' from @cashfreepayments/cashfree-js
    getSDKConfig: (gateway: any) => ({
      mode: gateway.mode === 'live' ? 'production' : 'sandbox',
    }),
    processClientPayment: async (
      cashfreeSDK: any,
      orderResponse: any,
      gateway: any
    ) => {
      if (!orderResponse.paymentSessionId) {
        throw new Error('Payment session ID is required for Cashfree')
      }
      console.log('💳 Opening Cashfree checkout with payment session:', {
        paymentSessionId: orderResponse.paymentSessionId,
        gateway: gateway.id,
        mode: gateway.mode,
      })

      const returnUrl = `${window.location.origin}/payment/cashfree/callback?order_id={order_id}`

      // Use Cashfree's checkout method
      cashfreeSDK
        .checkout({
          paymentSessionId: orderResponse.paymentSessionId,
          returnUrl: returnUrl,
        })
        .then((result: any) => {
          if (result.error) {
            console.error('Cashfree checkout error:', result.error)
            alert('Payment failed: ' + result.error.message)
          }
          if (result.redirect) {
            console.log('Redirecting to payment status...')
          }
        })
        .catch((error: any) => {
          console.error('Cashfree checkout error:', error)
          alert('An error occurred during payment: ' + error.message)
        })
    },
  }

  const razorpayClient = {
    id: 'razorpay',
    name: 'Razorpay',
    getSDKScript: () => 'https://checkout.razorpay.com/v1/checkout.js',
    getSDKInitFunction: () => 'Razorpay',
    getSDKConfig: () => ({}),
    processClientPayment: (sdk: any, orderResponse: any, gateway: any) => {
      const options = {
        key: gateway.keyId,
        amount: orderResponse.amount,
        currency: 'INR',
        name: 'Visa4',
        description: orderResponse.orderNote || 'Payment',
        order_id: orderResponse.orderId,
        handler: function (response: any) {
          // Handle success
          window.location.href = `/payment/razorpay/callback?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`
        },
        prefill: {
          name: orderResponse.customerDetails?.name || '',
          email: orderResponse.customerDetails?.email || '',
          contact: orderResponse.customerDetails?.phone || '',
        },
        theme: {
          color: '#007bff',
        },
      }
      sdk.open(options)
    },
  }

  paymentGatewayRegistry.register(cashfreeClient as any)
  paymentGatewayRegistry.register(razorpayClient as any)
} else {
  // Server-side: Import full implementations
  require('./implementations/index')
}

interface GatewayInfo {
  id: string
  mode?: string
  keyId?: string
  [key: string]: any
}

/**
 * Dynamically load payment SDK script
 */
export async function loadPaymentSDK(
  gatewayId: string,
  gateway: GatewayInfo
): Promise<any> {
  const paymentGateway = paymentGatewayRegistry.get(gatewayId)

  if (!paymentGateway) {
    throw new Error(`Payment gateway ${gatewayId} not found`)
  }

  const scriptUrl = paymentGateway.getSDKScript?.()
  const initFunction = paymentGateway.getSDKInitFunction?.()
  const config = paymentGateway.getSDKConfig?.(gateway)

  if (!initFunction) {
    throw new Error(`SDK configuration not found for gateway: ${gatewayId}`)
  }

  // Special handling for Cashfree - uses @cashfreepayments/cashfree-js package
  if (gatewayId === 'cashfree') {
    try {
      // Dynamically import the Cashfree JS SDK
      // @ts-ignore - Type definitions not available for @cashfreepayments/cashfree-js
      const { load } = await import('@cashfreepayments/cashfree-js')

      // Initialize Cashfree with the correct mode
      const cashfreeSDK = await load({
        mode: config?.mode || 'sandbox', // 'sandbox' or 'production'
      })

      console.log('✅ Cashfree SDK loaded successfully')
      return cashfreeSDK
    } catch (error: any) {
      console.error('Failed to load Cashfree SDK:', error)
      throw new Error(`Failed to load Cashfree SDK: ${error.message}`)
    }
  }

  // For other gateways (Razorpay, etc.), use script loading
  if (!scriptUrl) {
    throw new Error(`SDK script URL not found for gateway: ${gatewayId}`)
  }

  // Check if SDK is already loaded
  if ((window as any)[initFunction]) {
    console.log(`✅ SDK ${initFunction} already loaded`)
    const SDK = (window as any)[initFunction]
    return config ? SDK(config) : SDK
  }

  // Load SDK dynamically via script tag
  return new Promise((resolve, reject) => {
    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        const SDK = (window as any)[initFunction]
        if (SDK) {
          resolve(config ? SDK(config) : SDK)
        } else {
          reject(new Error(`Failed to initialize ${initFunction}`))
        }
      })
      return
    }

    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    script.onload = () => {
      const SDK = (window as any)[initFunction]
      if (SDK) {
        console.log(`✅ SDK ${initFunction} loaded successfully`)
        resolve(config ? SDK(config) : SDK)
      } else {
        reject(new Error(`Failed to initialize ${initFunction}`))
      }
    }
    script.onerror = () => {
      reject(new Error(`Failed to load SDK: ${scriptUrl}`))
    }
    document.body.appendChild(script)
  })
}

/**
 * Process payment using the loaded SDK
 */
export async function processPayment(
  gatewayId: string,
  orderResponse: any,
  gateway: GatewayInfo
): Promise<void> {
  const paymentGateway = paymentGatewayRegistry.get(gatewayId)

  if (!paymentGateway) {
    throw new Error(`Payment gateway ${gatewayId} not found`)
  }

  // Load SDK
  const sdk = await loadPaymentSDK(gatewayId, gateway)

  // Process payment using gateway-specific logic
  if (paymentGateway.processClientPayment) {
    // For Cashfree, processClientPayment is async
    if (gatewayId === 'cashfree') {
      await paymentGateway.processClientPayment(sdk, orderResponse, gateway)
    } else {
      paymentGateway.processClientPayment(sdk, orderResponse, gateway)
    }
  } else {
    throw new Error(
      `Payment processing not implemented for gateway: ${gatewayId}`
    )
  }
}
