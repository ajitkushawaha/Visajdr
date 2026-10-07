import mongoose from 'mongoose'

const CareerPageSchema = new mongoose.Schema({
  // Hero Section
  heroTitle: {
    type: String,
    required: true,
    default: 'Join Our Mission to Simplify Global Travel',
  },
  heroSubtitle: {
    type: String,
    required: true,
    default:
      "Be part of a dynamic team that's revolutionizing visa processing and making international travel accessible to everyone. Grow your career while making a meaningful impact on travelers worldwide.",
  },
  heroPrimaryButtonText: {
    type: String,
    default: 'View Open Positions',
  },
  heroPrimaryButtonLink: {
    type: String,
    default: '#open-positions',
  },
  heroSecondaryButtonText: {
    type: String,
    default: 'Apply Now',
  },
  heroSecondaryButtonLink: {
    type: String,
    default: '/career/apply',
  },

  // Company Stats
  companyStats: [
    {
      number: String,
      label: String,
    },
  ],

  // Open Positions Section
  openPositionsTitle: {
    type: String,
    required: true,
    default: 'Open Positions',
  },
  openPositionsSubtitle: {
    type: String,
    required: true,
    default:
      "Discover exciting opportunities to grow your career with us. We're always looking for talented individuals who share our passion for excellence.",
  },
  openPositionsDescription: {
    type: String,
    default:
      'At Visa4, every role matters. From visa consultants to support staff, our team helps travelers reach their dreams. Grow your skills, collaborate with passionate people, and make a real impact.',
  },
  openPositions: [
    {
      title: String,
      department: String,
      location: String,
      type: String,
      description: String,
    },
  ],

  // Benefits Section
  benefitsTitle: {
    type: String,
    required: true,
    default: 'Why Work With Us?',
  },
  benefitsSubtitle: {
    type: String,
    required: true,
    default:
      'We offer comprehensive benefits and a supportive work environment that helps you thrive both personally and professionally.',
  },
  benefits: [
    {
      icon: String, // Icon name from lucide-react
      title: String,
      description: String,
    },
  ],

  // Company Values Section
  valuesTitle: {
    type: String,
    required: true,
    default: 'Our Values',
  },
  valuesSubtitle: {
    type: String,
    required: true,
    default:
      'These core values guide everything we do and shape our company culture.',
  },
  companyValues: [
    {
      icon: String, // Icon name from lucide-react
      title: String,
      description: String,
    },
  ],

  // Culture Section
  cultureTitle: {
    type: String,
    required: true,
    default: 'Our Culture',
  },
  cultureSubtitle: {
    type: String,
    required: true,
    default:
      'We foster an inclusive, collaborative environment where everyone can contribute and grow.',
  },
  cultureDescription: {
    type: String,
    required: true,
    default:
      'At Visa4, we believe that great companies are built by great people. Our culture is built on trust, collaboration, and a shared commitment to excellence. We celebrate diversity, encourage innovation, and provide opportunities for continuous learning and growth.',
  },
  cultureFeatures: [String],

  // Application Process Section
  applicationProcessTitle: {
    type: String,
    required: true,
    default: 'How to Apply',
  },
  applicationProcessSubtitle: {
    type: String,
    required: true,
    default:
      'Our application process is designed to be transparent and efficient.',
  },
  applicationSteps: [
    {
      number: String,
      title: String,
      description: String,
    },
  ],

  // CTA Section
  ctaTitle: {
    type: String,
    required: true,
    default: 'Ready to Join Our Team?',
  },
  ctaSubtitle: {
    type: String,
    required: true,
    default:
      "Take the next step in your career journey with us. We're excited to learn about your skills and how you can contribute to our mission.",
  },
  ctaPrimaryButtonText: {
    type: String,
    default: 'View All Positions',
  },
  ctaSecondaryButtonText: {
    type: String,
    default: 'Contact HR',
  },

  // SEO
  seoTitle: {
    type: String,
    default: 'Career Opportunities - Join Our Team | Visa4',
  },
  seoDescription: {
    type: String,
    default:
      'Explore exciting career opportunities at Visa4. Join our dynamic team and help revolutionize visa processing and global travel. Apply now!',
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
CareerPageSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.CareerPage ||
  mongoose.model('CareerPage', CareerPageSchema)
