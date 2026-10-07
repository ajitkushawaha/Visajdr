// models/ConvenienceFee.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IConvenienceFee extends Document {
  isActive: boolean
  processingFeeEnabled: boolean // Simple toggle to enable/disable visa-specific processing fee feature
  fees: {
    onlineProcessing?: {
      isActive: boolean
      amount: number
      type: 'fixed' | 'percentage'
      description: string
    }
    paymentMethod?: {
      razorpay?: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      stripe?: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      upi?: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      card?: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      cashfree?: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
    }
    expressService?: {
      isActive: boolean
      amount: number
      type: 'fixed' | 'percentage'
      description: string
    }
    documentProcessing?: {
      isActive: boolean
      amount: number
      type: 'fixed' | 'percentage'
      description: string
    }
  }
  createdAt?: Date
  updatedAt?: Date
}

const ConvenienceFeeSchema: Schema<IConvenienceFee> = new Schema(
  {
    isActive: {
      type: Boolean,
      default: false,
    },
    processingFeeEnabled: {
      type: Boolean,
      default: false,
    },
    fees: {
      onlineProcessing: {
        isActive: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
        description: {
          type: String,
          default: 'Online processing convenience fee',
        },
      },
      paymentMethod: {
        razorpay: {
          isActive: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
          },
          description: {
            type: String,
            default: 'Razorpay payment convenience fee',
          },
        },
        stripe: {
          isActive: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
          },
          description: {
            type: String,
            default: 'Stripe payment convenience fee',
          },
        },
        upi: {
          isActive: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
          },
          description: { type: String, default: 'UPI payment convenience fee' },
        },
        card: {
          isActive: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
          },
          description: {
            type: String,
            default: 'Card payment convenience fee',
          },
        },
        cashfree: {
          isActive: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
          },
          description: {
            type: String,
            default: 'Cashfree payment convenience fee',
          },
        },
      },
      expressService: {
        isActive: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
        description: {
          type: String,
          default: 'Express processing service fee',
        },
      },
      documentProcessing: {
        isActive: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
        description: {
          type: String,
          default: 'Document processing convenience fee',
        },
      },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

// Ensure only one document exists
ConvenienceFeeSchema.index({}, { unique: true })

// Prevent model overwrite upon hot reload in dev
const ConvenienceFee: Model<IConvenienceFee> =
  (mongoose.models.ConvenienceFee as Model<IConvenienceFee>) ||
  mongoose.model<IConvenienceFee>('ConvenienceFee', ConvenienceFeeSchema)

export default ConvenienceFee
