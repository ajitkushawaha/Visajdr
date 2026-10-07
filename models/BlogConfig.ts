// models/BlogConfig.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IBlogAuthor extends Document {
  name: string
  email?: string
  bio?: string
  profileImage?: string
  order?: number
  isActive: boolean
}

export interface IBlogCategory extends Document {
  name: string
  slug: string
  order?: number
  isActive: boolean
}

export interface IBlogCTA extends Document {
  title: string
  description?: string
  buttonText: string
  buttonLink: string
  travelersCount?: string
  travelersText?: string
  trustText?: string
  travelerImages?: string[] // Array of image URLs for travelers
  isActive: boolean
  order?: number
}

export interface IBlogVisaPlan extends Document {
  badgeText?: string
  title: string
  description?: string
  processingTime?: string
  price?: string
  buttonText: string
  buttonLink: string
  whatsappLink?: string
  phoneLink?: string
  isActive: boolean
  order?: number
}

export interface IBlogConfig extends Document {
  authors: IBlogAuthor[]
  categories: IBlogCategory[]
  headerCTA: IBlogCTA
  visaPlanCTA: IBlogVisaPlan
  footerCTA: IBlogCTA
  sidebarCTA: IBlogCTA
  createdAt: Date
  updatedAt: Date
}

const BlogAuthorSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    bio: { type: String },
    profileImage: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
)

const BlogCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
)

const BlogCTASchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    buttonText: { type: String, required: true },
    buttonLink: { type: String, required: true },
    travelersCount: { type: String },
    travelersText: { type: String },
    trustText: { type: String },
    travelerImages: [{ type: String }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
)

const BlogVisaPlanSchema = new Schema(
  {
    badgeText: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    processingTime: { type: String },
    price: { type: String },
    buttonText: { type: String, required: true },
    buttonLink: { type: String, required: true },
    whatsappLink: { type: String },
    phoneLink: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
)

const BlogConfigSchema: Schema = new Schema(
  {
    authors: [BlogAuthorSchema],
    categories: [BlogCategorySchema],
    headerCTA: { type: BlogCTASchema },
    visaPlanCTA: { type: BlogVisaPlanSchema },
    footerCTA: { type: BlogCTASchema },
    sidebarCTA: { type: BlogCTASchema },
  },
  { timestamps: true }
)

// Prevent recompilation error in Next.js
export default mongoose.models.BlogConfig ||
  mongoose.model<IBlogConfig>('BlogConfig', BlogConfigSchema)
