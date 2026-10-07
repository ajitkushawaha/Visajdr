// models/VisaConfig.ts
import mongoose, { Schema, Document } from 'mongoose'

interface IConfigItem extends Document {
  name: string
  slug: string
  displayName: string
  description?: string
  isRequired?: boolean // For document types
  isActive: boolean
  order: number
  image?: string // For visa types - image URL
  icon?: string // For visa types - icon URL or class
  exampleImage?: string // For document types - example image URL
  exampleLink?: string // For document types - example link URL
}

interface IVisaConfig extends Document {
  configType:
    | 'visaType'
    | 'documentType'
    | 'visaCategory'
    | 'processingTimeType'
    | 'occupancyType'
  items: IConfigItem[]
}

const ConfigItemSchema = new Schema<IConfigItem>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: { type: String },
  isRequired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  image: { type: String }, // For visa types - image URL
  icon: { type: String }, // For visa types - icon URL or class
  exampleImage: { type: String }, // For document types - example image URL
  exampleLink: { type: String }, // For document types - example link URL
})

const VisaConfigSchema = new Schema<IVisaConfig>(
  {
    configType: {
      type: String,
      required: true,
      enum: [
        'visaType',
        'documentType',
        'visaCategory',
        'processingTimeType',
        'occupancyType',
      ],
      unique: true,
    },
    items: [ConfigItemSchema],
  },
  { timestamps: true }
)

// Export the interfaces for use in API routes
export interface DocumentType extends IConfigItem {}
export interface VisaType extends IConfigItem {}
export interface VisaCategory extends IConfigItem {}
export interface ProcessingTimeType extends IConfigItem {}
export interface OccupancyType extends IConfigItem {}

export default mongoose.models.VisaConfig ||
  mongoose.model<IVisaConfig>('VisaConfig', VisaConfigSchema)
