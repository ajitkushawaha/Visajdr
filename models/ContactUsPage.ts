import mongoose, { Schema, Document } from 'mongoose'

interface ContactMethod {
  _id?: string
  icon: string // Lucide icon name
  title: string
  description: string
  primary: string
  secondary: string
  action: string
  href: string
  order: number
  status: 'active' | 'inactive'
}

interface FAQ {
  _id?: string
  question: string
  answer: string
  order: number
  status: 'active' | 'inactive'
}

interface ContactInfo {
  _id?: string
  type: 'address' | 'phone' | 'email' | 'hours' | 'other'
  title: string
  content: string
  icon: string // Lucide icon name
  actionText?: string
  actionHref?: string
  order: number
  status: 'active' | 'inactive'
}

export interface IContactUsPage extends Document {
  // Hero Section
  heroPillText: string
  heroTitle: string
  heroDescription: string
  statistics: {
    label: string
    value: string
  }[]

  // Contact Methods Section
  contactSectionTitle: string
  contactSectionDescription: string
  contactMethods: ContactMethod[]

  // Contact Information Section
  infoSectionTitle: string
  contactInfo: ContactInfo[]

  // Form Section
  formTitle: string
  formDescription: string

  // Social Proof Section
  socialProofTitle: string
  socialProofDescription: string

  // FAQ Section
  faqSectionSubtitle: string
  faqTitle: string
  faqDescription: string
  faqs: FAQ[]

  // CTA Section
  ctaTitle: string
  ctaDescription: string
  ctaButtons: {
    primary: {
      text: string
      href: string
    }
    secondary: {
      text: string
      href: string
    }
  }

  // Meta
  status: 'active' | 'inactive'
  order: number
  createdAt: Date
  updatedAt: Date
}

const ContactMethodSchema = new Schema<ContactMethod>({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  primary: { type: String, required: true },
  secondary: { type: String, required: true },
  action: { type: String, required: true },
  href: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const FAQSchema = new Schema<FAQ>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const ContactInfoSchema = new Schema<ContactInfo>({
  type: {
    type: String,
    enum: ['address', 'phone', 'email', 'hours', 'other'],
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  icon: { type: String, required: true },
  actionText: { type: String },
  actionHref: { type: String },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const ContactUsPageSchema = new Schema<IContactUsPage>(
  {
    // Hero Section
    heroPillText: { type: String, default: 'Get in Touch with Experts' },
    heroTitle: { type: String, required: true },
    heroDescription: { type: String, required: true },
    statistics: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],

    // Contact Methods Section
    contactSectionTitle: { type: String, default: 'Get in Touch' },
    contactSectionDescription: {
      type: String,
      default:
        "Choose your preferred way to reach us. We're here to help with all your visa needs.",
    },
    contactMethods: [ContactMethodSchema],

    // Contact Information Section
    infoSectionTitle: { type: String, default: 'Contact Details' },
    contactInfo: [ContactInfoSchema],

    // Form Section
    formTitle: { type: String, default: 'Send a Message' },
    formDescription: {
      type: String,
      default: 'We typically respond within 24 hours.',
    },

    // Social Proof Section
    socialProofTitle: { type: String, default: 'Award Winning Service' },
    socialProofDescription: {
      type: String,
      default:
        'Recognized for excellence in visa consultancy and customer satisfaction across India.',
    },

    // FAQ Section
    faqSectionSubtitle: { type: String, default: 'Common Questions' },
    faqTitle: { type: String, required: true },
    faqDescription: { type: String, required: true },
    faqs: [FAQSchema],

    // CTA Section
    ctaTitle: { type: String, required: true },
    ctaDescription: { type: String, required: true },
    ctaButtons: {
      primary: {
        text: { type: String, required: true },
        href: { type: String, required: true },
      },
      secondary: {
        text: { type: String, required: true },
        href: { type: String, required: true },
      },
    },

    // Meta
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.ContactUsPage ||
  mongoose.model<IContactUsPage>('ContactUsPage', ContactUsPageSchema)
