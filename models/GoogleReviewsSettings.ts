import mongoose, { Schema, Document } from 'mongoose'

export interface IGoogleReviewsSettings extends Document {
  apiKey: string
  placeId: string
  isConfigured: boolean
  lastSyncedAt?: Date
  autoSyncEnabled: boolean
  syncInterval?: number // in hours
  createdAt?: Date
  updatedAt?: Date
}

const GoogleReviewsSettingsSchema = new Schema<IGoogleReviewsSettings>(
  {
    apiKey: {
      type: String,
      required: true,
      default: '',
    },
    placeId: {
      type: String,
      required: true,
      default: '',
    },
    isConfigured: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
    },
    autoSyncEnabled: {
      type: Boolean,
      default: false,
    },
    syncInterval: {
      type: Number,
      default: 24, // 24 hours default
    },
  },
  {
    timestamps: true,
  }
)

// Ensure only one settings document exists
GoogleReviewsSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({
      apiKey: '',
      placeId: '',
      isConfigured: false,
    })
  }
  return settings
}

const GoogleReviewsSettings =
  mongoose.models.GoogleReviewsSettings ||
  mongoose.model<IGoogleReviewsSettings>(
    'GoogleReviewsSettings',
    GoogleReviewsSettingsSchema
  )

export default GoogleReviewsSettings
