// lib/payment-gateways/implementations/RazorpayGateway.ts
import {
  IPaymentGateway,
  CreateOrderParams,
  OrderResponse,
  VerifyParams,
  VerifyResponse,
  PaymentGatewayConfig,
} from '../IPaymentGateway'

export class RazorpayGateway implements IPaymentGateway {
  id = 'razorpay'
  name = 'Razorpay'

  async initializeSDK(config: PaymentGatewayConfig): Promise<any> {
    if (!config.isActive) {
      throw new Error('Razorpay is not active')
    }

    if (!config.keyId || !config.keySecret) {
      throw new Error('Razorpay Key ID and Key Secret are required')
    }

    // Razorpay uses REST API, not SDK initialization
    return {
      keyId: config.keyId,
      keySecret: config.keySecret,
    }
  }

  async createOrder(
    params: CreateOrderParams,
    config: PaymentGatewayConfig
  ): Promise<OrderResponse> {
    const sdk = await this.initializeSDK(config)

    // Create order via Razorpay API
    let Razorpay
    try {
      Razorpay = (await import('razorpay')).default
    } catch (error) {
      // Fallback to require for CommonJS
      Razorpay = require('razorpay')
    }

    const instance = new Razorpay({
      key_id: sdk.keyId,
      key_secret: sdk.keySecret,
    })

    const orderOptions = {
      amount: params.amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: params.orderId,
      notes: {
        order_note: params.orderNote || 'Payment',
        customer_id: params.customerDetails.id,
        customer_name: params.customerDetails.name,
        customer_email: params.customerDetails.email,
      },
    }

    try {
      const order = await instance.orders.create(orderOptions)

      return {
        success: true,
        orderId: order.id,
        amount: params.amount,
        checkoutData: {
          key: sdk.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: params.customerDetails.name || 'Customer',
          description: params.orderNote || 'Payment',
          prefill: {
            name: params.customerDetails.name,
            email: params.customerDetails.email,
            contact: params.customerDetails.phone,
          },
        },
      }
    } catch (error: any) {
      console.error('Razorpay order creation error:', error)
      throw new Error(
        `Razorpay error: ${error.message || 'Failed to create order'}`
      )
    }
  }

  async verifyPayment(
    params: VerifyParams,
    config: PaymentGatewayConfig
  ): Promise<VerifyResponse> {
    const sdk = await this.initializeSDK(config)
    const crypto = require('crypto')

    // Verify signature
    const text = `${params.orderId}|${params.paymentId}`
    const generatedSignature = crypto
      .createHmac('sha256', sdk.keySecret)
      .update(text)
      .digest('hex')

    const isSignatureValid = generatedSignature === params.signature

    return {
      success: true,
      verified: isSignatureValid,
      status: isSignatureValid ? 'success' : 'failed',
      amount: params.amount,
      currency: 'INR',
    }
  }

  getSDKScript(): string {
    return 'https://checkout.razorpay.com/v1/checkout.js'
  }

  getSDKInitFunction(): string {
    return 'Razorpay'
  }

  getSDKConfig(gateway: any): any {
    return {
      key: gateway.keyId,
    }
  }

  processClientPayment(
    sdk: any,
    orderResponse: OrderResponse,
    gateway: any
  ): void {
    if (!orderResponse.checkoutData) {
      throw new Error('Checkout data is required for Razorpay')
    }

    const options = orderResponse.checkoutData
    const razorpay = new sdk(options.key)

    razorpay.open(options)
  }
}
