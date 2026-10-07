import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailTemplate extends Document {
  name: string
  type:
    | 'booking-confirmation'
    | 'application-submitted'
    | 'status-update'
    | 'agent-assigned'
    | 'visa-approved'
    | 'visa-rejected'
    | 'password-reset'
    | 'application-reopened'
    | 'invoice'
    | 'application-incomplete'
    | 'application-under-review'
    | 'application-in-embassy'
    | 'application-cancelled'
    | 'application-completed'
    | 'document-rejected'
  subject: string
  htmlBody: string
  textBody: string
  isActive: boolean
  variables?: string[]
  description?: string
  createdAt: Date
  updatedAt: Date
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'booking-confirmation',
        'application-submitted',
        'status-update',
        'agent-assigned',
        'visa-approved',
        'visa-rejected',
        'password-reset',
        'application-reopened',
        'invoice',
        'application-incomplete',
        'application-under-review',
        'application-in-embassy',
        'application-cancelled',
        'application-completed',
        'document-rejected',
      ],
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlBody: {
      type: String,
      required: true,
    },
    textBody: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'emailtemplates',
  }
)

// Indexes
EmailTemplateSchema.index({ type: 1, isActive: 1 })
EmailTemplateSchema.index({ name: 1 })

export default mongoose.models.EmailTemplate ||
  mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema)
