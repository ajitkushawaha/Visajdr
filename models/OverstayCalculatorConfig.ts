import mongoose, { Schema, Document } from 'mongoose'

export interface IAdditionalCharge {
  name: string
  amount: number
  currency: string
  description?: string
}

export interface IRegularizationOption {
  title: string
  description: string
  link: string
}

export interface IVisaTypeConfig {
  name: string
  validityOptions: number[] // Array of days (e.g., [14, 30, 60, 90])
  gracePeriodDays: number
  finePerDay: number
  fineCurrency: string
  maxFineCap?: number // Optional maximum fine cap
  additionalCharges?: IAdditionalCharge[]
  isActive: boolean
}

export interface IOverstayCalculatorConfig extends Document {
  country: string
  countryCode?: string
  isActive: boolean
  visaTypes: IVisaTypeConfig[]
  whatsappLink?: string
  regularizationOptions?: IRegularizationOption[]
  disclaimer?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  createdAt: Date
  updatedAt: Date
}

const AdditionalChargeSchema = new Schema<IAdditionalCharge>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    description: { type: String },
  },
  { _id: false }
)

const RegularizationOptionSchema = new Schema<IRegularizationOption>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
  },
  { _id: false }
)

const VisaTypeConfigSchema = new Schema<IVisaTypeConfig>(
  {
    name: { type: String, required: true },
    validityOptions: [{ type: Number, required: true }],
    gracePeriodDays: { type: Number, required: true },
    finePerDay: { type: Number, required: true },
    fineCurrency: { type: String, required: true },
    maxFineCap: { type: Number },
    additionalCharges: [AdditionalChargeSchema],
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
)

const OverstayCalculatorConfigSchema = new Schema<IOverstayCalculatorConfig>(
  {
    country: { type: String, required: true, unique: true },
    countryCode: { type: String },
    isActive: { type: Boolean, default: true },
    visaTypes: [VisaTypeConfigSchema],
    whatsappLink: { type: String },
    regularizationOptions: [RegularizationOptionSchema],
    disclaimer: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
  },
  { timestamps: true }
)

// Prevent recompilation error in Next.js
export default mongoose.models.OverstayCalculatorConfig ||
  mongoose.model<IOverstayCalculatorConfig>(
    'OverstayCalculatorConfig',
    OverstayCalculatorConfigSchema
  )
