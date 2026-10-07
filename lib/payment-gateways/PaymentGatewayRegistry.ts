// lib/payment-gateways/PaymentGatewayRegistry.ts
import { IPaymentGateway } from './IPaymentGateway'

class PaymentGatewayRegistry {
  private gateways: Map<string, IPaymentGateway> = new Map()

  /**
   * Register a payment gateway
   */
  register(gateway: IPaymentGateway): void {
    this.gateways.set(gateway.id, gateway)
  }

  /**
   * Get a payment gateway by ID
   */
  get(gatewayId: string): IPaymentGateway | undefined {
    return this.gateways.get(gatewayId)
  }

  /**
   * Get all registered payment gateways
   */
  getAll(): IPaymentGateway[] {
    return Array.from(this.gateways.values())
  }

  /**
   * Check if a gateway is registered
   */
  has(gatewayId: string): boolean {
    return this.gateways.has(gatewayId)
  }

  /**
   * Get all gateway IDs
   */
  getIds(): string[] {
    return Array.from(this.gateways.keys())
  }
}

// Create singleton instance
export const paymentGatewayRegistry = new PaymentGatewayRegistry()
