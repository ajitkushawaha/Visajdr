import mongoose from 'mongoose'

const ServiceDetailSchema = new mongoose.Schema({
  // Basic Info
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  title: {
    type: String,
    required: true,
  },

  // Hero Section
  hero: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    badgeText: { type: String, default: '#1 Trusted Visa Consultant' },
    primaryButtonText: { type: String, default: 'Get Started Now' },
    primaryButtonLink: { type: String, default: '' },
    secondaryButtonText: { type: String, default: '' },
    secondaryButtonLink: { type: String, default: '' },
  },
  statistics: [
    {
      label: String,
      value: String,
      icon: String,
    },
  ],

  // Sidebar Configuration
  sidebar: {
    bannerText: { type: String, default: 'Get your visa by' },
    bannerDate: { type: String, default: '' },
    contactText: { type: String, default: 'Contact us for assistance:' },
    whatsappNumber: { type: String, default: '+918007011942' },
    guaranteeTitle: {
      type: String,
      default: 'Approval guaranteed, or your money back!',
    },
    guaranteeSubtext: {
      type: String,
      default: 'This also includes the government fees. Zero loss for you!',
    },
  },

  // Description Section
  description: {
    type: String,
    default: '',
  },

  // Apply Section (Intro)
  applySectionTitle: { type: String, default: '' },
  applySectionSubtitle: { type: String, default: '' },
  applySectionDescription: { type: String, default: '' },

  // Visa Info Section
  visaInfo: {
    title: { type: String, default: 'Visa Information' },
    items: [
      {
        label: String,
        value: String,
        type: {
          type: String,
          enum: [
            'sticker',
            'stay',
            'category',
            'entry',
            'validity',
            'processing',
            'document',
            'fees',
            'guest',
            'purpose',
            'business',
            'student',
            'medical',
            'tourist',
            'transit',
          ],
        },
      },
    ],
  },

  // Benefits Section
  benefits: {
    title: { type: String, default: 'Benefits' },
    subtitle: { type: String, default: '' },
    items: [
      {
        icon: String,
        title: String,
        description: String,
      },
    ],
  },

  // Requirements Section
  requirements: {
    title: { type: String, default: 'Requirements' },
    subtitle: { type: String, default: '' },
    items: [
      {
        title: String,
        description: String,
      },
    ],
  },

  // Process Section
  process: {
    title: { type: String, default: 'Our Process' },
    subtitle: { type: String, default: '' },
    steps: [
      {
        number: String,
        title: String,
        description: String,
      },
    ],
  },

  // Comparison Section
  comparison: {
    title: { type: String, default: 'Comparison' },
    description: { type: String, default: '' },
    atlysRate: { type: String, default: '99%' },
    overallRate: { type: String, default: '75%' },
    table: [
      {
        title: String,
        good: String,
        bad: String,
      },
    ],
  },

  // Video Section
  video: {
    url: { type: String, default: '' },
    poster: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
  },

  // Documents Required Section
  documentsSection: {
    title: { type: String, default: 'Documents Required' },
    steps: [
      {
        title: String,
        description: String,
        subtext: String,
        commonDocs: {
          title: String,
          items: [
            {
              label: String,
              icon: String,
            },
          ],
        },
      },
    ],
  },

  // Pricing Section
  pricing: {
    title: { type: String, default: 'Pricing' },
    govFee: { type: String, default: '' },
    govFeeLabel: { type: String, default: 'Government fee' },
    atlysFee: { type: String, default: '' },
    atlysFeeLabel: { type: String, default: 'Visa 4 Fees' },
    totalFee: { type: String, default: '' },
    totalFeeLabel: { type: String, default: 'Total Amount' },
    appointmentFeeLabel: { type: String, default: 'Appointment Fee' },
    appointmentFeeSubtext: {
      type: String,
      default: 'Paid to government | Zero commission',
    },
    paymentMethodsText: {
      type: String,
      default: 'Acceptable Payment Methods:',
    },
    ctaText: { type: String, default: 'Get Your Visa Or Full Refund' },
    guaranteeText: {
      type: String,
      default: 'Approval guaranteed, or your money back!',
    },
    guaranteeSubtext: { type: String, default: '' },
    mobileCtaText: { type: String, default: 'Get Started Now' },
  },

  // Reviews Section
  reviews: {
    rating: { type: String, default: '4.9' },
    totalCount: { type: String, default: '10,000+' },
    items: [
      {
        name: String,
        location: String,
        date: String,
        rating: Number,
        title: String,
        comment: String,
        initials: String,
        color: String,
        travelerType: String,
        image: String,
      },
    ],
  },

  // FAQs Section
  faqs: {
    title: {
      type: String,
      default: 'Frequently Asked Questions',
    },
    subtitle: {
      type: String,
      default: 'Common questions about this service',
    },
    items: [
      {
        question: String,
        answer: String,
      },
    ],
  },

  // Application Packet Section
  applicationPacket: [
    {
      src: String,
      label: String,
    },
  ],
  applicationPacketTitle: { type: String, default: 'What you get' },
  applicationPacketDescription: {
    type: String,
    default:
      'Visa 4 gives you a fully prepared application packet with all required documents.',
  },
  applicationPacketPreviewTitle: {
    type: String,
    default: 'Your Final Application Preview',
  },
  applicationPacketPreviewSubtitle: {
    type: String,
    default: 'Application Packet',
  },
  applicationPacketDisclaimer: {
    type: String,
    default:
      'For illustrative purposes only; actual packet will reflect your details',
  },

  // SEO
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [String],
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Update the updatedAt field before saving
ServiceDetailSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// Index for faster queries
// Note: slug index is automatically created by unique: true, so we don't need to add it again
ServiceDetailSchema.index({ status: 1 })

export default mongoose.models.ServiceDetail ||
  mongoose.model('ServiceDetail', ServiceDetailSchema)
