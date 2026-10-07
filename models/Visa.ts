// models/Visa.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IVisa extends Document {
  country: string
  countryFlag: string
  countryCode: string
  countryImage: string
  visaType: string
  adultPrice: string
  childPrice: string
  processingFee: string
  status: 'active' | 'inactive'
  processingTimeDays: 'in-days' | 'schengen'
  processingTimeValue: string
  processingTimeQuote: string
  stayPeriod: string
  validity: string
  eVisa: 'true' | 'false'
  category: 'standard' | 'premium' | string
  hotListed: 'true' | 'false'
  restListed: 'true' | 'false'
  occupancyType: 'single' | 'double' | string
  documents: {
    [key: string]: boolean // Dynamic document types from config
  }
  visaDetail: string
  visaDocument: string
  planDisclaimer: string
  inclusions: string
  importantInformation: string

  // Quotation Page Content
  visaSchedule?: {
    processInitiation: string
    processInitiationDays?: number
    applicationReview: string
    applicationReviewDays?: number
    appointmentPicked: string
    appointmentPickedDays?: number
    biometricDay: string
    biometricDayDays?: number
    appliedToEmbassy?: string
    appliedToEmbassyDays?: number
    enableAppointmentStep?: boolean
    enableBiometricStep?: boolean
  }
  documentRequirements?: {
    generalNote?: string
    [key: string]: string | undefined // Allow dynamic document requirement keys (e.g., aadharRequirements, panRequirements, etc.)
  }
  operatingSchedule?: {
    visa4Hours?: string
    embassyHours: string
    publicHolidaysNote: string
  }
  faq?: Array<{
    question: string
    answer: string
    order: number
  }>

  metaRobots: string
  metaTitle: string
  metaKeyword: string
  metaDescription: string
}

const VisaSchema = new Schema<IVisa>(
  {
    country: { type: String, required: true },
    countryFlag: { type: String },
    countryCode: { type: String },
    countryImage: { type: String },
    visaType: { type: String, required: true },
    adultPrice: { type: String, required: true },
    childPrice: { type: String, required: true },
    processingFee: { type: String, default: '0' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    processingTimeDays: {
      type: String,
      enum: ['in-days', 'schengen'],
      default: 'in-days',
    },
    processingTimeValue: { type: String },
    processingTimeQuote: { type: String },
    stayPeriod: { type: String },
    validity: { type: String },
    eVisa: { type: String, enum: ['true', 'false'], default: 'false' },
    category: { type: String, default: 'standard' },
    hotListed: { type: String, enum: ['true', 'false'], default: 'true' },
    restListed: { type: String, enum: ['true', 'false'], default: 'false' },
    occupancyType: { type: String, default: 'single' },
    documents: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    visaDetail: { type: String },
    visaDocument: { type: String },
    planDisclaimer: { type: String },
    inclusions: { type: String },
    importantInformation: { type: String },

    // Quotation Page Content
    visaSchedule: {
      processInitiation: {
        type: String,
        default: 'Our representative will connect with you, if required.',
      },
      processInitiationDays: { type: Number, default: 0 },
      applicationReview: {
        type: String,
        default: 'Application review and document verification.',
      },
      applicationReviewDays: { type: Number, default: 1 },
      appointmentPicked: {
        type: String,
        default: 'Appointment date will be confirmed.',
      },
      appointmentPickedDays: { type: Number, default: 2 },
      biometricDay: { type: String, default: 'Biometric appointment day.' },
      biometricDayDays: { type: Number, default: 5 },
      appliedToEmbassy: {
        type: String,
        default: 'Application submitted to embassy.',
      },
      appliedToEmbassyDays: { type: Number, default: 0 },
      enableAppointmentStep: { type: Boolean, default: false },
      enableBiometricStep: { type: Boolean, default: false },
    },
    documentRequirements: {
      type: mongoose.Schema.Types.Mixed,
      default: function () {
        return {
          generalNote:
            'This document checklist is standard but not exhaustive. The Embassy reserves the right to request additional documents based on specific use cases.',
        }
      },
    },
    operatingSchedule: {
      visa4Hours: { type: String, default: '10:00 AM - 7:00 PM (Mon-Sat)' },
      embassyHours: { type: String, default: '9:00 AM - 5:00 PM (Mon-Fri)' },
      publicHolidaysNote: {
        type: String,
        default:
          'Visa processing timelines may vary as per public holidays observed in both India and your intended destination country.',
      },
    },
    faq: {
      type: [
        {
          question: { type: String },
          answer: { type: String },
          order: { type: Number, default: 0 },
        },
      ],
      default: [],
    },

    metaRobots: { type: String, default: 'INDEX, FOLLOW' },
    metaTitle: { type: String },
    metaKeyword: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.Visa || mongoose.model<IVisa>('Visa', VisaSchema)
