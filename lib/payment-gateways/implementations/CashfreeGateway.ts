// lib/payment-gateways/implementations/CashfreeGateway.ts
import {
  IPaymentGateway,
  CreateOrderParams,
  OrderResponse,
  VerifyParams,
  VerifyResponse,
  PaymentGatewayConfig,
} from '../IPaymentGateway'
import { Cashfree } from 'cashfree-pg'

export class CashfreeGateway implements IPaymentGateway {
  id = 'cashfree'
  name = 'Cashfree'

  async initializeSDK(config: PaymentGatewayConfig): Promise<any> {
    if (!config.isActive) {
      throw new Error('Cashfree is not active')
    }

    // Validate and trim credentials
    const appId = config.appId?.trim()
    const secretKey = config.secretKey?.trim()
    const environment = config.environment || 'sandbox'

    if (!appId || appId.length === 0) {
      throw new Error('Cashfree App ID is required and cannot be empty')
    }

    if (!secretKey || secretKey.length === 0) {
      throw new Error('Cashfree Secret Key is required and cannot be empty')
    }

    // Log configuration (without exposing full secrets)
    console.log('🔐 Cashfree SDK Configuration:', {
      appId: appId.substring(0, 8) + '...',
      secretKeyLength: secretKey.length,
      environment: environment === 'production' ? 'PRODUCTION' : 'SANDBOX',
      apiVersion: '2023-08-01',
    })

    try {
      // Use static properties exactly as shown in migration guide
      // Reference: https://www.cashfree.com/docs/payments/migration/migration
      // Format: Cashfree.XClientId = {Client ID};
      //         Cashfree.XClientSecret = {Client Secret Key};
      //         Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

      ;(Cashfree as any).XClientId = appId
      ;(Cashfree as any).XClientSecret = secretKey

      // Set environment using Environment enum if available, otherwise use string
      if ((Cashfree as any).Environment) {
        ;(Cashfree as any).XEnvironment =
          environment === 'production'
            ? (Cashfree as any).Environment.PRODUCTION
            : (Cashfree as any).Environment.SANDBOX
      } else {
        ;(Cashfree as any).XEnvironment =
          environment === 'production' ? 'PRODUCTION' : 'SANDBOX'
      }

      // Return the Cashfree class (not instance) as per migration guide
      return {
        class: Cashfree,
        appId,
        secretKey,
        environment: environment === 'production' ? 'PRODUCTION' : 'SANDBOX',
      }
    } catch (error: any) {
      console.error('❌ Cashfree SDK initialization error:', error)
      throw new Error(
        `Failed to initialize Cashfree SDK: ${error.message || 'Unknown error'}`
      )
    }
  }

  async createOrder(
    params: CreateOrderParams,
    config: PaymentGatewayConfig
  ): Promise<OrderResponse> {
    const sdkConfig = await this.initializeSDK(config)
    const { class: CashfreeClass, appId, secretKey, environment } = sdkConfig

    // Build order request exactly as shown in migration guide
    // Cashfree requires customer_phone to be present and non-empty
    const customerPhone = params.customerDetails.phone?.trim() || '9999999999' // Default phone if not provided

    const orderRequest = {
      order_amount: params.amount.toString(), // Convert to string as per guide
      order_currency: 'INR',
      customer_details: {
        customer_id:
          params.customerDetails.id ||
          params.customerDetails.email ||
          'customer',
        customer_name: params.customerDetails.name || '',
        customer_email: params.customerDetails.email || '',
        customer_phone: customerPhone, // Required field - must be present and non-empty
      },
      order_meta: {
        return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/cashfree/callback?order_id={order_id}`,
        // Webhook URL - Cashfree will send payment status updates to this endpoint
        notify_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/cashfree/webhook`,
        // Enable all payment methods using Cashfree's valid codes:
        // cc=credit card, dc=debit card, upi=UPI, nb=netbanking, app=app-based payments (wallets)
        payment_methods: 'cc,dc,upi,nb,app',
      },
      order_note: params.orderNote || '',
    }

    // Use new API version 2023-08-01 exactly as shown in migration guide
    // Format: Cashfree.PGCreateOrder("2023-08-01", request)
    // Reference: https://www.cashfree.com/docs/payments/migration/migration
    const apiVersion = '2023-08-01'
    let orderResponse

    try {
      // Primary approach: Static method as shown in migration guide
      if (typeof CashfreeClass.PGCreateOrder === 'function') {
        const response = await CashfreeClass.PGCreateOrder(
          apiVersion,
          orderRequest
        )
        // Response has .data property as per migration guide: response.data
        orderResponse = response?.data || response
      } else {
        // Fallback: Direct API call if static method not available
        const baseUrl =
          environment === 'PRODUCTION'
            ? 'https://api.cashfree.com'
            : 'https://sandbox.cashfree.com'

        const response = await fetch(`${baseUrl}/pg/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-api-version': apiVersion,
            'x-client-id': appId,
            'x-client-secret': secretKey,
          },
          body: JSON.stringify(orderRequest),
        })

        const responseText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { message: responseText || response.statusText }
        }

        if (!response.ok) {
          console.error('❌ Direct API call failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          })

          if (response.status === 401) {
            throw new Error(
              `Cashfree authentication failed (401). Details:\n` +
                `- Status: ${response.status}\n` +
                `- Error: ${errorData.message || errorData.error || 'Invalid credentials'}\n` +
                `- App ID: ${appId.substring(0, 8)}...\n` +
                `- Environment: ${environment}\n` +
                `\nPlease verify:\n` +
                `1. App ID (Client ID) and Secret Key (Client Secret) are correct\n` +
                `2. Environment matches your credentials (sandbox vs production)\n` +
                `3. Credentials are not expired or revoked\n` +
                `4. Using correct API version (2023-08-01)`
            )
          }

          throw new Error(
            `Cashfree API error (${response.status}): ${errorData.message || errorData.error || response.statusText}`
          )
        }

        orderResponse = errorData
      }
    } catch (sdkError: any) {
      console.error('❌ Cashfree SDK error details:', {
        message: sdkError.message,
      })

      // If error message already contains detailed info, just re-throw it
      if (sdkError.message.includes('Cashfree authentication failed')) {
        throw sdkError
      }

      // Provide more helpful error messages
      if (
        sdkError.status === 401 ||
        sdkError.statusCode === 401 ||
        sdkError.response?.status === 401
      ) {
        throw new Error(
          'Cashfree authentication failed (401). Please verify:\n' +
            '1. App ID (Client ID) and Secret Key (Client Secret) are correct\n' +
            '2. Environment matches your credentials (sandbox vs production)\n' +
            '3. Credentials are not expired or revoked\n' +
            '4. Using correct API version (2023-08-01)'
        )
      }

      throw new Error(
        `Cashfree SDK error: ${sdkError.message || sdkError.response?.data?.message || 'Unknown error'}`
      )
    }

    // Extract payment_session_id from response
    const paymentSessionId =
      orderResponse?.payment_session_id ||
      orderResponse?.data?.payment_session_id

    if (!paymentSessionId) {
      console.error(
        '❌ Invalid order response:',
        JSON.stringify(orderResponse, null, 2)
      )
      throw new Error(
        'Failed to create Cashfree order - no payment session ID in response'
      )
    }

    return {
      success: true,
      paymentSessionId: paymentSessionId,
      orderId: orderResponse?.order_id || params.orderId,
      amount: params.amount,
    }
  }

  async verifyPayment(
    params: VerifyParams,
    config: PaymentGatewayConfig
  ): Promise<VerifyResponse> {
    const sdkConfig = await this.initializeSDK(config)
    const { class: CashfreeClass, appId, secretKey, environment } = sdkConfig

    // Use new API version 2023-08-01
    const apiVersion = '2023-08-01'
    let orderResponse

    try {
      // Use static method as shown in migration guide
      if (typeof CashfreeClass.PGFetchOrder === 'function') {
        const response = await CashfreeClass.PGFetchOrder(
          apiVersion,
          params.orderId
        )
        orderResponse = response?.data || response
      } else {
        // Fallback: Direct API call
        const baseUrl =
          environment === 'PRODUCTION'
            ? 'https://api.cashfree.com'
            : 'https://sandbox.cashfree.com'

        const response = await fetch(`${baseUrl}/pg/orders/${params.orderId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'x-api-version': apiVersion,
            'x-client-id': appId,
            'x-client-secret': secretKey,
          },
        })

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: response.statusText }))
          throw new Error(
            `Cashfree API error (${response.status}): ${errorData.message || response.statusText}`
          )
        }

        orderResponse = await response.json()
      }
    } catch (sdkError: any) {
      console.error('Cashfree SDK verification error:', sdkError)
      throw new Error(
        `Cashfree SDK error: ${sdkError.message || 'Unknown error'}`
      )
    }

    const paymentStatus = orderResponse?.order_status || 'PENDING'
    const isSuccess = paymentStatus === 'PAID'

    return {
      success: true,
      verified: isSuccess,
      status: isSuccess
        ? 'success'
        : paymentStatus === 'ACTIVE'
          ? 'pending'
          : 'failed',
      amount: orderResponse?.order_amount,
      currency: orderResponse?.order_currency || 'INR',
    }
  }

  getSDKScript(): string {
    return 'https://sdk.cashfree.com/js/v3/cashfree.js'
  }

  getSDKInitFunction(): string {
    return 'Cashfree'
  }

  getSDKConfig(gateway: any): any {
    return {
      mode: gateway.mode === 'live' ? 'production' : 'sandbox',
    }
  }

  processClientPayment(
    sdk: any,
    orderResponse: OrderResponse,
    gateway: any
  ): void {
    if (!orderResponse.paymentSessionId) {
      throw new Error('Payment session ID is required for Cashfree')
    }

    console.log('💳 Opening Cashfree checkout with payment session:', {
      paymentSessionId: orderResponse.paymentSessionId,
      gateway: gateway.id,
      mode: gateway.mode,
    })

    // Cashfree SDK opens their checkout UI which shows ALL payment methods:
    // - Credit/Debit Cards
    // - UPI (all UPI apps)
    // - Wallets (Paytm, PhonePe, etc.)
    // - Netbanking
    // This is the correct behavior - Cashfree's UI handles all payment method selection
    sdk.checkout({
      paymentSessionId: orderResponse.paymentSessionId,
      redirectTarget: '_self', // Opens in same window
    })
  }
}
