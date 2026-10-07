import mongoose, { Schema, Document } from 'mongoose'

interface AboutUsStat {
  _id?: string
  icon: string // Name of the Lucide icon
  label: string
  value: string
  order: number
  status: 'active' | 'inactive'
}

interface AboutUsService {
  _id?: string
  name: string
  order: number
  status: 'active' | 'inactive'
}

interface TeamMember {
  _id?: string
  name?: string
  position?: string
  experience?: string
  image?: string // URL to image
  description?: string
  order: number
  status: 'active' | 'inactive'
}

interface Milestone {
  _id?: string
  year: string
  title: string
  description: string
  order: number
  status: 'active' | 'inactive'
}

export interface IAboutUsPage extends Document {
  // Hero Section
  heroTitle: string
  heroSubtitle: string

  // Company Info
  companyName: string
  companyDescription: string

  // Problem & Solution
  problemTitle: string
  problemDescription: string
  solutionTitle: string
  solutionDescription: string

  // Comprehensive Solutions Card
  comprehensiveTitle: string
  comprehensiveDescription: string

  // B2B Platform
  b2bTitle: string
  b2bDescription: string

  // Testimonials
  testimonialsTitle: string
  testimonialsDescription: string

  // Google Reviews
  showGoogleReviews: boolean
  googleReviewsTitle: string
  googleReviewsDescription: string

  // Services
  servicesTitle: string
  services: AboutUsService[]

  // Destinations
  destinationsTitle: string
  destinationsDescription: string

  // Technology
  technologyTitle: string
  technologyDescription: string

  // Team
  teamTitle?: string
  teamDescription?: string
  teamMembers?: TeamMember[]

  // Stats
  stats: AboutUsStat[]

  // Milestones
  milestonesTitle: string
  milestonesDescription: string
  milestones: Milestone[]

  // CTA
  ctaTitle: string
  ctaDescription: string
  ctaEmail?: string

  // Meta
  status: 'active' | 'inactive'
  order: number
  createdAt: Date
  updatedAt: Date
}

const AboutUsStatSchema = new Schema<AboutUsStat>({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const AboutUsServiceSchema = new Schema<AboutUsService>({
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const TeamMemberSchema = new Schema<TeamMember>({
  name: { type: String },
  position: { type: String },
  experience: { type: String },
  image: { type: String },
  description: { type: String },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const MilestoneSchema = new Schema<Milestone>({
  year: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const AboutUsPageSchema = new Schema<IAboutUsPage>(
  {
    // Hero Section
    heroTitle: { type: String, required: true },
    heroSubtitle: { type: String, required: true },

    // Company Info
    companyName: { type: String, required: true },
    companyDescription: { type: String, required: true },

    // Problem & Solution
    problemTitle: { type: String, required: true },
    problemDescription: { type: String, required: true },
    solutionTitle: { type: String, required: true },
    solutionDescription: { type: String, required: true },

    // Comprehensive Solutions Card
    comprehensiveTitle: {
      type: String,
      required: true,
      default: 'Comprehensive Solutions',
    },
    comprehensiveDescription: {
      type: String,
      required: true,
      default: 'Everything you need for international travel in one place',
    },

    // B2B Platform
    b2bTitle: { type: String, required: true, default: '' },
    b2bDescription: { type: String, required: true, default: '' },

    // Testimonials
    testimonialsTitle: { type: String, required: true, default: '' },
    testimonialsDescription: { type: String, required: true, default: '' },

    // Google Reviews
    showGoogleReviews: { type: Boolean, default: false },
    googleReviewsTitle: { type: String, default: 'What Our Clients Say' },
    googleReviewsDescription: {
      type: String,
      default: 'Real reviews from our satisfied customers',
    },

    // Services
    servicesTitle: { type: String, required: true },
    services: [AboutUsServiceSchema],

    // Destinations
    destinationsTitle: { type: String, required: true, default: '' },
    destinationsDescription: { type: String, required: true, default: '' },

    // Technology
    technologyTitle: { type: String, required: true, default: '' },
    technologyDescription: { type: String, required: true, default: '' },

    // Team
    teamTitle: { type: String, required: false },
    teamDescription: { type: String, required: false },
    teamMembers: [TeamMemberSchema],

    // Stats
    stats: [AboutUsStatSchema],

    // Milestones
    milestonesTitle: { type: String, required: true },
    milestonesDescription: { type: String, required: true },
    milestones: [MilestoneSchema],

    // CTA
    ctaTitle: { type: String, required: true },
    ctaDescription: { type: String, required: true },
    ctaEmail: { type: String },

    // Meta
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Prevent Mongoose OverwriteModelError in development by deleting the model if it exists
export default mongoose.models.AboutUsPage
  ? (delete mongoose.models.AboutUsPage,
    mongoose.model<IAboutUsPage>('AboutUsPage', AboutUsPageSchema))
  : mongoose.model<IAboutUsPage>('AboutUsPage', AboutUsPageSchema)
