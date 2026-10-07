import mongoose, { Schema, Document } from 'mongoose'

interface InsurancePlan {
  _id?: string
  name: string
  price: string
  duration: string
  features: string[]
  popular: boolean
  order: number
  status: 'active' | 'inactive'
}

interface CoverageDetail {
  _id?: string
  icon: string // Lucide icon name
  title: string
  description: string
  coverage: string
  order: number
  status: 'active' | 'inactive'
}

interface CustomerTestimonial {
  _id?: string
  name: string
  location: string
  rating: number // 1-5 stars
  text: string
  order: number
  status: 'active' | 'inactive'
}

interface InsuranceStat {
  _id?: string
  value: string
  label: string
  order: number
  status: 'active' | 'inactive'
}

export interface ITravelInsurancePage extends Document {
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroPriceText: string
  heroPriceValue: string
  heroPoweredByText: string
  heroPoweredByLogoUrl: string
  heroClaimRatioValue: string
  heroClaimRatioDescription: string

  // Form Section
  formTitle: string
  formSubtitle: string

  // Features Section
  featuresSectionTitle: string
  featuresSectionSubtitle: string

  // Insurance Plans
  insurancePlansTitle: string
  insurancePlansSubtitle: string
  plans: InsurancePlan[]

  // Coverage Details
  coverageDetailsTitle: string
  coverageDetailsSubtitle: string
  coverageDetails: CoverageDetail[]

  // Testimonials
  testimonialsTitle: string
  testimonialsSubtitle: string
  testimonials: CustomerTestimonial[]

  // Stats Section
  statsSectionTitle: string
  statsSectionSubtitle: string
  stats: InsuranceStat[]

  // CTA Section
  ctaTitle: string
  ctaSubtitle: string
  ctaButton1Text: string
  ctaButton1Link: string
  ctaButton2Text: string
  ctaButton2Link: string

  // SEO Fields
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  canonicalUrl: string

  // Meta
  status: 'active' | 'inactive'
  order: number
  createdAt: Date
  updatedAt: Date
}

const InsurancePlanSchema = new Schema<InsurancePlan>({
  name: { type: String, required: true },
  price: { type: String, required: true },
  duration: { type: String, required: true },
  features: [{ type: String }],
  popular: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const CoverageDetailSchema = new Schema<CoverageDetail>({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverage: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const CustomerTestimonialSchema = new Schema<CustomerTestimonial>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const InsuranceStatSchema = new Schema<InsuranceStat>({
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const TravelInsurancePageSchema = new Schema<ITravelInsurancePage>(
  {
    // Hero Section
    heroTitle: { type: String, required: true },
    heroSubtitle: { type: String, required: true },
    heroDescription: { type: String, required: true },
    heroPriceText: { type: String, required: true },
    heroPriceValue: { type: String, required: true },
    heroPoweredByText: { type: String, required: true },
    heroPoweredByLogoUrl: { type: String, required: false, default: '' },
    heroClaimRatioValue: { type: String, required: true },
    heroClaimRatioDescription: { type: String, required: true },

    // Form Section
    formTitle: { type: String, required: true },
    formSubtitle: { type: String, required: true },

    // Features Section
    featuresSectionTitle: { type: String, required: true },
    featuresSectionSubtitle: { type: String, required: true },

    // Insurance Plans
    insurancePlansTitle: { type: String, required: true },
    insurancePlansSubtitle: { type: String, required: true },
    plans: [InsurancePlanSchema],

    // Coverage Details
    coverageDetailsTitle: { type: String, required: true },
    coverageDetailsSubtitle: { type: String, required: true },
    coverageDetails: [CoverageDetailSchema],

    // Testimonials
    testimonialsTitle: { type: String, required: true },
    testimonialsSubtitle: { type: String, required: true },
    testimonials: [CustomerTestimonialSchema],

    // Stats Section
    statsSectionTitle: { type: String, required: true },
    statsSectionSubtitle: { type: String, required: true },
    stats: [InsuranceStatSchema],

    // CTA Section
    ctaTitle: { type: String, required: true },
    ctaSubtitle: { type: String, required: true },
    ctaButton1Text: { type: String, required: true },
    ctaButton1Link: { type: String, required: true },
    ctaButton2Text: { type: String, required: true },
    ctaButton2Link: { type: String, required: true },

    // SEO Fields
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    metaKeywords: [{ type: String }],
    ogTitle: { type: String, required: true },
    ogDescription: { type: String, required: true },
    ogImage: { type: String, required: true },
    twitterTitle: { type: String, required: true },
    twitterDescription: { type: String, required: true },
    twitterImage: { type: String, required: true },
    canonicalUrl: { type: String, required: true },

    // Meta
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.TravelInsurancePage ||
  mongoose.model<ITravelInsurancePage>(
    'TravelInsurancePage',
    TravelInsurancePageSchema
  )
