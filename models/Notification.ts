import mongoose, { Document, Schema } from 'mongoose'

export interface INotification extends Document {
  recipient: string // Agent/User ID
  type: 'application' | 'document' | 'status' | 'reminder' | 'query' | 'system'
  title: string
  message: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  relatedId?: string // Related application, query, or other entity ID
  relatedType?: 'visa-application' | 'query' | 'supplier' | 'other'
  emailSent: boolean
  emailSentAt?: Date
  smsSent: boolean
  smsSentAt?: Date
  scheduledFor?: Date // For scheduled notifications
  createdBy?: string
  metadata?: {
    applicationId?: string
    clientName?: string
    visaType?: string
    country?: string
    [key: string]: any
  }
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: String,
      required: [true, 'Recipient is required'],
      ref: 'User',
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'application',
        'document',
        'status',
        'reminder',
        'query',
        'system',
        'document_rejected',
        'commission',
        'payout',
      ],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    relatedId: {
      type: String,
      trim: true,
    },
    relatedType: {
      type: String,
      enum: ['visa-application', 'query', 'supplier', 'other'],
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    smsSentAt: {
      type: Date,
    },
    scheduledFor: {
      type: Date,
    },
    createdBy: {
      type: String,
      ref: 'User',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
NotificationSchema.index({ recipient: 1, isRead: 1 })
NotificationSchema.index({ type: 1, priority: 1 })
NotificationSchema.index({ createdAt: -1 })
NotificationSchema.index({ scheduledFor: 1 })

// Prevent model overwrite issue in dev
const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema)
export default Notification
