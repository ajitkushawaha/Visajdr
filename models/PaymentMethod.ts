// models/PaymentMethod.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPaymentMethod extends Document {
  gateway: 'razorpay' | 'stripe' | 'paypal' | 'upi' | 'cashfree'
  isActive: boolean
  // Razorpay fields
  keyId?: string
  keySecret?: string
  webhookSecret?: string
  // Stripe fields
  publishableKey?: string
  secretKey?: string
  // PayPal fields
  clientId?: string
  clientSecret?: string
  mode?: 'sandbox' | 'live'
  // UPI fields
  upiId?: string
  merchantName?: string
  // Cashfree fields
  appId?: string
  secretKey?: string
  environment?: 'sandbox' | 'production'
  // Metadata
  createdAt?: Date
  updatedAt?: Date
}

const PaymentMethodSchema: Schema<IPaymentMethod> = new Schema(
  {
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal', 'upi', 'cashfree'],
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    // Razorpay
    keyId: { type: String, default: '' },
    keySecret: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
    // Stripe
    publishableKey: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    // PayPal
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' },
    mode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' },
    // UPI
    upiId: { type: String, default: '' },
    merchantName: { type: String, default: '' },
    // Cashfree
    appId: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

// Prevent model overwrite upon hot reload in dev
const PaymentMethod: Model<IPaymentMethod> =
  (mongoose.models.PaymentMethod as Model<IPaymentMethod>) ||
  mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema)

export default PaymentMethod
