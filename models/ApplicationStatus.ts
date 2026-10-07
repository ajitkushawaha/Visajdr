import mongoose, { Schema, Document } from 'mongoose'

export interface IApplicationStatus extends Document {
  name: string // Display name (e.g., "Under Review")
  slug: string // Unique identifier (e.g., "under_review")
  description?: string
  color: string // Tailwind color class (e.g., "bg-blue-100 text-blue-800")
  order: number // Display order
  isActive: boolean
  isSystem: boolean // System statuses cannot be deleted (e.g., "Pending", "Submitted", "abandoned")
  category?: 'initial' | 'processing' | 'final' // Status category
}

const ApplicationStatusSchema = new Schema<IApplicationStatus>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    color: {
      type: String,
      required: true,
      default: 'bg-gray-100 text-gray-800',
    },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false }, // System statuses cannot be deleted
    category: {
      type: String,
      enum: ['initial', 'processing', 'final'],
      default: 'processing',
    },
  },
  { timestamps: true }
)

// Index for faster queries
ApplicationStatusSchema.index({ isActive: 1, order: 1 })

export default mongoose.models.ApplicationStatus ||
  mongoose.model<IApplicationStatus>(
    'ApplicationStatus',
    ApplicationStatusSchema
  )
