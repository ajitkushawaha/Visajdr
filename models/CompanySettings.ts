// models/CompanySettings.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICompanySettings extends Document {
  companyName: string
  gstNo?: string
  cinNo?: string
  supportNo?: string
  tollfreeNo?: string
  whatsappNo?: string
  supportEmail: string
  panName?: string
  panNumber?: string
  streetAddress?: string
  country?: string
  state?: string
  city?: string
  zipCode?: string
  copyright?: string
  googleAnalyticsHead?: string
  googleAnalyticsBody?: string
  googleSiteVerification?: string
  googlePlacesApi?: string
  googleMapEmbed?: string
  googleApiKey?: string
  googleClientSecret?: string
  sendgridApiKey?: string
  // Cloudinary Settings
  cloudinaryCloudName?: string
  cloudinaryApiKey?: string
  cloudinaryApiSecret?: string
  logoUrl?: string
  faviconUrl?: string
  selectedTheme?: string
  facebookLink?: string
  linkedinLink?: string
  instagramLink?: string
  twitterLink?: string
  youtubeLink?: string
  mailer?: string
  smtpServer?: string
  portNumber?: string
  fromEmail?: string
  emailId?: string
  emailPassword?: string
  ccEmail?: string
  bccEmail?: string
  androidAppUrl?: string
  iosAppUrl?: string
  metaRobots?: string
  metaTitle?: string
  metaKeyword?: string
  metaDescription?: string
  // Currency Settings
  defaultCurrency?: string // e.g., 'INR', 'USD', 'AED'
  // Payment Gateway Settings
  paymentGateways?: {
    razorpay?: {
      isActive: boolean
      keyId: string
      keySecret: string
      webhookSecret?: string
    }
    stripe?: {
      isActive: boolean
      publishableKey: string
      secretKey: string
      webhookSecret?: string
    }
    paypal?: {
      isActive: boolean
      clientId: string
      clientSecret: string
      mode: 'sandbox' | 'live'
    }
    upi?: {
      isActive: boolean
      upiId: string
      merchantName: string
    }
    cashfree?: {
      isActive: boolean
      appId: string
      secretKey: string
      environment: 'sandbox' | 'production'
      webhookSecret?: string
    }
  }

  // Convenience Fee Settings
  convenienceFees?: {
    isActive: boolean
    fees: {
      onlineProcessing?: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      paymentMethod?: {
        razorpay?: {
          isActive: boolean
          amount: number
          type: 'fixed' | 'percentage'
          description: string
        }
        stripe?: {
          isActive: boolean
          amount: number
          type: 'fixed' | 'percentage'
          description: string
        }
        upi?: {
          isActive: boolean
          amount: number
          type: 'fixed' | 'percentage'
          description: string
        }
        card?: {
          isActive: boolean
          amount: number
          type: 'fixed' | 'percentage'
          description: string
        }
        cashfree?: {
          isActive: boolean
          amount: number
          type: 'fixed' | 'percentage'
          description: string
        }
      }
      expressService?: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
      documentProcessing?: {
        isActive: boolean
        amount: number
        type: 'fixed' | 'percentage'
        description: string
      }
    }
  }
  // Notification Settings
  notificationSettings?: {
    email: {
      isActive: boolean
      provider: 'smtp' | 'twilio' | 'sendgrid'
    }
    sms: {
      isActive: boolean
      provider: 'twilio'
    }
    whatsapp: {
      isActive: boolean
      provider: 'twilio'
    }
  }

  // Twilio Settings
  twilioSettings?: {
    accountSid: string
    authToken: string
    phoneNumber: string
    whatsappNumber: string
    messagingServiceSid?: string
  }
  updatedAt?: Date
  createdAt?: Date
}

const CompanySettingsSchema: Schema<ICompanySettings> = new Schema(
  {
    companyName: { type: String, required: true },
    gstNo: { type: String, default: '' },
    cinNo: { type: String, default: '' },
    supportNo: { type: String, default: '' },
    tollfreeNo: { type: String, default: '' },
    whatsappNo: { type: String, default: '' },
    supportEmail: { type: String, required: true },
    panName: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    streetAddress: { type: String, default: '' },
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    copyright: { type: String, default: '' },
    googleAnalyticsHead: { type: String, default: '' },
    googleAnalyticsBody: { type: String, default: '' },
    googleSiteVerification: { type: String, default: '' },
    googlePlacesApi: { type: String, default: '' },
    googleMapEmbed: { type: String, default: '' },
    googleApiKey: { type: String, default: '' },
    googleClientSecret: { type: String, default: '' },
    sendgridApiKey: { type: String, default: '' },
    // Cloudinary Settings
    cloudinaryCloudName: { type: String, default: '' },
    cloudinaryApiKey: { type: String, default: '' },
    cloudinaryApiSecret: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    selectedTheme: { type: String, default: 'theme-one' },
    facebookLink: { type: String, default: '' },
    linkedinLink: { type: String, default: '' },
    instagramLink: { type: String, default: '' },
    twitterLink: { type: String, default: '' },
    youtubeLink: { type: String, default: '' },
    mailer: { type: String, default: '' },
    smtpServer: { type: String, default: '' },
    portNumber: { type: String, default: '' },
    fromEmail: { type: String, default: '' },
    emailId: { type: String, default: '' },
    emailPassword: { type: String, default: '' },
    ccEmail: { type: String, default: '' },
    bccEmail: { type: String, default: '' },
    androidAppUrl: { type: String, default: '' },
    iosAppUrl: { type: String, default: '' },
    metaRobots: { type: String, default: 'index_follow' },
    metaTitle: { type: String, default: '' },
    metaKeyword: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    // Currency Settings
    defaultCurrency: { type: String, default: 'INR' }, // Default to INR (Rupees)
    // Payment Gateway Settings
    paymentGateways: {
      razorpay: {
        isActive: { type: Boolean, default: false },
        keyId: { type: String, default: '' },
        keySecret: { type: String, default: '' },
        webhookSecret: { type: String, default: '' },
      },
      stripe: {
        isActive: { type: Boolean, default: false },
        publishableKey: { type: String, default: '' },
        secretKey: { type: String, default: '' },
        webhookSecret: { type: String, default: '' },
      },
      paypal: {
        isActive: { type: Boolean, default: false },
        clientId: { type: String, default: '' },
        clientSecret: { type: String, default: '' },
        mode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' },
      },
      upi: {
        isActive: { type: Boolean, default: false },
        upiId: { type: String, default: '' },
        merchantName: { type: String, default: '' },
      },
      cashfree: {
        isActive: { type: Boolean, default: false },
        appId: { type: String, default: '' },
        secretKey: { type: String, default: '' },
        environment: {
          type: String,
          enum: ['sandbox', 'production'],
          default: 'sandbox',
        },
        webhookSecret: { type: String, default: '' },
      },
    },

    // Convenience Fee Settings
    convenienceFees: {
      isActive: { type: Boolean, default: false },
      fees: {
        onlineProcessing: {
          isActive: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
          },
          description: {
            type: String,
            default: 'Online processing convenience fee',
          },
        },
        paymentMethod: {
          razorpay: {
            isActive: { type: Boolean, default: false },
            amount: { type: Number, default: 0 },
            type: {
              type: String,
              enum: ['fixed', 'percentage'],
              default: 'fixed',
            },
            description: {
              type: String,
              default: 'Razorpay payment convenience fee',
            },
          },
          stripe: {
            isActive: { type: Boolean, default: false },
            amount: { type: Number, default: 0 },
            type: {
              type: String,
              enum: ['fixed', 'percentage'],
              default: 'fixed',
            },
            description: {
              type: String,
              default: 'Stripe payment convenience fee',
            },
          },
          upi: {
            isActive: { type: Boolean, default: false },
            amount: { type: Number, default: 0 },
            type: {
              type: String,
              enum: ['fixed', 'percentage'],
              default: 'fixed',
            },
            description: {
              type: String,
              default: 'UPI payment convenience fee',
            },
          },
          card: {
            isActive: { type: Boolean, default: false },
            amount: { type: Number, default: 0 },
            type: {
              type: String,
              enum: ['fixed', 'percentage'],
              default: 'fixed',
            },
            description: {
              type: String,
              default: 'Card payment convenience fee',
            },
          },
          cashfree: {
            isActive: { type: Boolean, default: false },
            amount: { type: Number, default: 0 },
            type: {
              type: String,
              enum: ['fixed', 'percentage'],
              default: 'fixed',
            },
            description: {
              type: String,
              default: 'Cashfree payment convenience fee',
            },
          },
        },
        expressService: {
          isActive: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
          },
          description: {
            type: String,
            default: 'Express processing service fee',
          },
        },
        documentProcessing: {
          isActive: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'fixed',
          },
          description: {
            type: String,
            default: 'Document processing convenience fee',
          },
        },
      },
    },

    // Notification Settings
    notificationSettings: {
      email: {
        isActive: { type: Boolean, default: false },
        provider: {
          type: String,
          enum: ['smtp', 'twilio', 'sendgrid'],
          default: 'smtp',
        },
      },
      sms: {
        isActive: { type: Boolean, default: false },
        provider: { type: String, enum: ['twilio'], default: 'twilio' },
      },
      whatsapp: {
        isActive: { type: Boolean, default: false },
        provider: { type: String, enum: ['twilio'], default: 'twilio' },
      },
    },

    // Twilio Settings
    twilioSettings: {
      accountSid: { type: String, default: '' },
      authToken: { type: String, default: '' },
      phoneNumber: { type: String, default: '' },
      whatsappNumber: { type: String, default: '' },
      messagingServiceSid: { type: String, default: '' },
    },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

// Prevent model overwrite upon hot reload in dev
const CompanySettings: Model<ICompanySettings> =
  (mongoose.models.CompanySettings as Model<ICompanySettings>) ||
  mongoose.model<ICompanySettings>('CompanySettings', CompanySettingsSchema)

export default CompanySettings
