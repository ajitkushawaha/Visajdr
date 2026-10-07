// models/Blog.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IBlogCTA {
  title?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  travelersCount?: string
  travelersText?: string
  trustText?: string
  travelerImages?: string[]
  selectedVisaId?: string
  selectedVisaName?: string
  isActive?: boolean
}

export interface IBlogVisaPlan {
  badgeText?: string
  title?: string
  description?: string
  processingTime?: string
  price?: string
  buttonText?: string
  buttonLink?: string
  whatsappLink?: string
  phoneLink?: string
  selectedVisaId?: string
  selectedVisaName?: string
  purpose?: string
  isActive?: boolean
}

export interface IBlog extends Document {
  _id: String
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  featuredImageAlt?: string
  author: string
  status: 'draft' | 'published'
  category: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  publishedAt?: Date
  // CTA Configurations
  headerCTA?: IBlogCTA
  visaPlanCTA?: IBlogVisaPlan
  footerCTA?: IBlogCTA
  createdAt: Date
  updatedAt: Date
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true }, // can store HTML/Markdown
    featuredImage: { type: String },
    featuredImageAlt: { type: String },

    author: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },

    category: { type: String, required: true },
    tags: [{ type: String }],

    // SEO fields
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },

    publishedAt: { type: Date },

    // CTA Configurations
    headerCTA: {
      title: { type: String },
      description: { type: String },
      buttonText: { type: String },
      buttonLink: { type: String },
      travelersCount: { type: String },
      travelersText: { type: String },
      trustText: { type: String },
      travelerImages: [{ type: String }],
      selectedVisaId: { type: String },
      selectedVisaName: { type: String },
      isActive: { type: Boolean, default: false },
    },
    visaPlanCTA: {
      badgeText: { type: String },
      title: { type: String },
      description: { type: String },
      processingTime: { type: String },
      price: { type: String },
      buttonText: { type: String },
      buttonLink: { type: String },
      whatsappLink: { type: String },
      phoneLink: { type: String },
      selectedVisaId: { type: String },
      selectedVisaName: { type: String },
      purpose: { type: String },
      isActive: { type: Boolean, default: false },
    },
    footerCTA: {
      title: { type: String },
      description: { type: String },
      buttonText: { type: String },
      buttonLink: { type: String },
      travelersCount: { type: String },
      travelersText: { type: String },
      trustText: { type: String },
      travelerImages: [{ type: String }],
      selectedVisaId: { type: String },
      selectedVisaName: { type: String },
      isActive: { type: Boolean, default: false },
    },
  },
  { timestamps: true } // automatically adds createdAt, updatedAt
)

// Prevent recompilation error in Next.js
export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema)
