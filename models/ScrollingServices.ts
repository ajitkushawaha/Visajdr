import mongoose, { Schema, Document } from 'mongoose'

export interface IScrollingServiceItem extends Document {
  name: string
  icon: string // Lucide icon name (e.g., 'Briefcase', 'PlaneTakeoff', 'Globe', 'TicketsPlane')
  order: number
  status: 'active' | 'inactive'
}

export interface IScrollingServices extends Document {
  items: IScrollingServiceItem[]
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const ScrollingServiceItemSchema = new Schema<IScrollingServiceItem>({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
})

const ScrollingServicesSchema = new Schema<IScrollingServices>(
  {
    items: [ScrollingServiceItemSchema],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export default mongoose.models.ScrollingServices ||
  mongoose.model<IScrollingServices>(
    'ScrollingServices',
    ScrollingServicesSchema
  )
