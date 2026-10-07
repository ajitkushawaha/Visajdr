// lib/payment-gateways/IPaymentGateway.ts

export interface CreateOrderParams {
  amount: number
  orderId: string
  customerDetails: {
    name?: string
    email?: string
    phone?: string
    id?: string
  }
  orderNote?: string
  metadata?: Record<string, any>
}

export interface OrderResponse {
  success: boolean
  paymentSessionId?: string
  orderId?: string
  redirectUrl?: string
  checkoutData?: any // Gateway-specific checkout data
  [key: string]: any
}

export interface VerifyParams {
  orderId: string
  paymentId?: string
  signature?: string
  [key: string]: any
}

export interface VerifyResponse {
  success: boolean
  verified: boolean
  status: 'success' | 'failed' | 'pending'
  amount?: number
  currency?: string
  [key: string]: any
}

export interface PaymentGatewayConfig {
  gateway: string
  isActive: boolean
  [key: string]: any // Gateway-specific config fields
}

export interface IPaymentGateway {
  id: string
  name: string

  /**
   * Initialize the payment gateway SDK on the server side
   */
  initializeSDK: (config: PaymentGatewayConfig) => Promise<any>

  /**
   * Create a payment order
   */
  createOrder: (
    params: CreateOrderParams,
    config: PaymentGatewayConfig
  ) => Promise<OrderResponse>

  /**
   * Verify a payment
   */
  verifyPayment: (
    params: VerifyParams,
    config: PaymentGatewayConfig
  ) => Promise<VerifyResponse>

  /**
   * Get client-side SDK script URL (if needed)
   */
  getSDKScript?: () => string

  /**
   * Get client-side SDK initialization config
   */
  getSDKConfig?: (gateway: any) => any

  /**
   * Get client-side SDK initialization function name
   */
  getSDKInitFunction?: () => string

  /**
   * Process payment on client side (after SDK is loaded)
   */
  processClientPayment?: (
    sdk: any,
    orderResponse: OrderResponse,
    gateway: any
  ) => Promise<void> | void
}
