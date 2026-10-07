import mongoose from 'mongoose'

const ServicesPageSchema = new mongoose.Schema({
  // Hero Section
  heroTitle: {
    type: String,
    required: true,
    default: 'Trusted Visa Consultancy Services for Study, Work & Immigration',
  },
  heroSubtitle: {
    type: String,
    required: true,
    default:
      'Get expert guidance for student visas, work permits, PR, and business immigration with 100% support.',
  },
  heroImage: {
    type: String,
    default: '/world-map.jpg',
  },
  heroImageAlt: {
    type: String,
    default: 'Global travelers and immigration',
  },
  heroPrimaryButtonText: {
    type: String,
    default: 'Book Free Consultation',
  },
  heroPrimaryButtonLink: {
    type: String,
    default: '/apply',
  },
  heroSecondaryButtonText: {
    type: String,
    default: 'Apply Now',
  },
  heroSecondaryButtonLink: {
    type: String,
    default: '/contact-us',
  },
  heroStats: [
    {
      number: String,
      label: String,
    },
  ],

  // Definition Box
  definitionTitle: {
    type: String,
    required: true,
    default: 'What is a Visa Consultancy Service?',
  },
  definitionContent: {
    type: String,
    required: true,
    default:
      'A visa consultancy service helps individuals and businesses with expert guidance for obtaining study, work, tourist, business, and immigration visas. Consultants provide eligibility checks, document preparation, application filing, and visa interview support. Our team of certified immigration consultants ensures a smooth and transparent process, maximizing your chances of visa approval while minimizing stress and delays.',
  },

  // Why Choose Us
  whyChooseUsTitle: {
    type: String,
    required: true,
    default: 'Why Choose Our Visa Consultancy Services?',
  },
  whyChooseUsSubtitle: {
    type: String,
    required: true,
    default:
      'Registered consultancy with proven track record and client satisfaction',
  },
  whyChooseUsItems: [
    {
      title: String,
      description: String,
    },
  ],

  // Services Grid
  servicesTitle: {
    type: String,
    required: true,
    default: 'Types of Visa Services We Offer',
  },
  servicesSubtitle: {
    type: String,
    required: true,
    default: 'Comprehensive visa solutions for every immigration need',
  },
  services: [
    {
      icon: String, // Icon name from lucide-react
      title: String,
      description: String,
      slug: String, // Optional custom slug for service detail page link
    },
  ],

  // Process Steps
  processTitle: {
    type: String,
    required: true,
    default: 'Our Simple & Transparent Process',
  },
  processSubtitle: {
    type: String,
    required: true,
    default: 'Five easy steps to your visa approval',
  },
  processSteps: [
    {
      number: String,
      title: String,
      description: String,
    },
  ],

  // Use Cases
  useCasesTitle: {
    type: String,
    required: true,
    default: 'Who Needs a Visa Consultant?',
  },
  useCasesSubtitle: {
    type: String,
    required: true,
    default: 'We serve diverse clients with unique immigration goals',
  },
  useCases: [
    {
      icon: String,
      title: String,
      description: String,
    },
  ],

  // Testimonials
  testimonialsTitle: {
    type: String,
    required: true,
    default: 'Success Stories & Testimonials',
  },
  testimonialsSubtitle: {
    type: String,
    required: true,
    default: 'Real stories from our satisfied clients',
  },
  testimonials: [
    {
      name: String,
      destination: String,
      text: String,
      rating: Number,
    },
  ],

  // Differentiator Section
  differentiatorTitle: {
    type: String,
    required: true,
    default: 'Why Our Visa Consultants Are Different',
  },
  differentiatorSubtitle: {
    type: String,
    required: true,
    default: 'Excellence in every aspect of immigration consulting',
  },
  differentiatorItems: [String],

  // Country Services
  countryServicesTitle: {
    type: String,
    required: true,
    default: 'Country-Specific Visa Services',
  },
  countryServicesSubtitle: {
    type: String,
    required: true,
    default: 'Expert guidance for top immigration destinations',
  },
  countryServices: [
    {
      name: String,
      service: String,
    },
  ],

  // FAQ Section
  faqTitle: {
    type: String,
    required: true,
    default: 'Frequently Asked Questions',
  },
  faqSubtitle: {
    type: String,
    required: true,
    default: 'Find answers to common visa consultancy questions',
  },
  faqs: [
    {
      question: String,
      answer: String,
    },
  ],

  // CTA Section
  ctaTitle: {
    type: String,
    required: true,
    default: 'Ready to Start Your Journey Abroad?',
  },
  ctaSubtitle: {
    type: String,
    required: true,
    default:
      'Let our expert consultants guide you through every step of your visa application process.',
  },
  ctaPrimaryButtonText: {
    type: String,
    default: 'Book Free Consultation',
  },
  ctaSecondaryButtonText: {
    type: String,
    default: 'Contact Us',
  },
  ctaStats: [
    {
      number: String,
      label: String,
    },
  ],

  // SEO
  seoTitle: {
    type: String,
    default: 'Visa Consultancy Services - Expert Immigration Guidance',
  },
  seoDescription: {
    type: String,
    default:
      'Professional visa consultancy services for study, work, and immigration. Expert guidance for student visas, work permits, and PR applications.',
  },
  seoKeywords: [String],

  // Status
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
ServicesPageSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.ServicesPage ||
  mongoose.model('ServicesPage', ServicesPageSchema)
