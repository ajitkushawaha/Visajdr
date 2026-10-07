import mongoose, { Document, Schema, models, model } from 'mongoose'

export interface ITraveler extends Document {
  userId: mongoose.Types.ObjectId
  relation: string // 'Self', 'Spouse', 'Child', 'Parent', 'Friend', 'Other'
  personalInfo: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    nationality: string
    dateOfBirth?: Date
    gender?: 'male' | 'female' | 'other'
    passportNumber?: string
    passportExpiry?: Date
    occupation?: string
  }
  documents: {
    passportFront?: {
      url: string
      publicId: string
      originalName: string
    }
    passportBack?: {
      url: string
      publicId: string
      originalName: string
    }
    photo?: {
      url: string
      publicId: string
      originalName: string
    }
  }
}

const TravelerSchema = new Schema<ITraveler>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relation: {
      type: String,
      default: 'Other',
    },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      nationality: { type: String, required: true },
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      passportNumber: { type: String, required: true },
      passportExpiry: { type: Date, required: true },
      occupation: { type: String },
    },
    documents: {
      passportFront: {
        url: String,
        publicId: String,
        originalName: String,
      },
      passportBack: {
        url: String,
        publicId: String,
        originalName: String,
      },
      photo: {
        url: String,
        publicId: String,
        originalName: String,
      },
    },
  },
  {
    timestamps: true,
  }
)

const Traveler = models.Traveler || model<ITraveler>('Traveler', TravelerSchema)
export default Traveler
