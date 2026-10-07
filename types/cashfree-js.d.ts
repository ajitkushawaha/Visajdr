declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeConfig {
    mode: 'sandbox' | 'production'
  }

  export interface CheckoutOptions {
    paymentSessionId: string
    returnUrl: string
  }

  export interface CheckoutResult {
    error?: {
      message: string
    }
    redirect?: boolean
  }

  export interface CashfreeSDK {
    checkout(options: CheckoutOptions): Promise<CheckoutResult>
  }

  export function load(config: CashfreeConfig): Promise<CashfreeSDK>
}
