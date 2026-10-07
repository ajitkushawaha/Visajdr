// lib/payment-gateways/implementations/index.ts
import { CashfreeGateway } from './CashfreeGateway'
import { RazorpayGateway } from './RazorpayGateway'
import { paymentGatewayRegistry } from '../PaymentGatewayRegistry'

// Register all payment gateways
export function registerPaymentGateways() {
  paymentGatewayRegistry.register(new CashfreeGateway())
  paymentGatewayRegistry.register(new RazorpayGateway())
  // Add more gateways here as they are implemented
}

// Auto-register on import
registerPaymentGateways()
