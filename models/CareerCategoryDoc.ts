import { Schema, model, models } from 'mongoose'

export type CareerCategoryDoc = {
  _id: string
  name: string
  slug: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const CareerCategorySchema = new Schema<CareerCategoryDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true }, // unique: true automatically creates an index
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
)

export const CareerCategory =
  models.CareerCategory || model('CareerCategory', CareerCategorySchema)
