import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRecognitionPartner {
  img: string
  alt: string
  text: string
  order: number
  status: 'active' | 'inactive'
}

export interface IRecognitionSection extends Document {
  title: string
  partners: IRecognitionPartner[]
  status: 'active' | 'inactive'
}

const recognitionPartnerSchema = new Schema<IRecognitionPartner>({
  img: { type: String, default: '' },
  alt: { type: String, default: '' },
  text: { type: String, default: '' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
})

const recognitionSectionSchema = new Schema<IRecognitionSection>(
  {
    title: {
      type: String,
      default: 'Recognized by global travel and data partners',
    },
    partners: [recognitionPartnerSchema],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
)

// Check if model already exists to avoid recompilation errors in development
// In development, we want to allow schema updates, so we might need to delete the model
if (
  process.env.NODE_ENV === 'development' &&
  mongoose.models.RecognitionSection
) {
  delete mongoose.models.RecognitionSection
}

const RecognitionSection: Model<IRecognitionSection> =
  mongoose.models.RecognitionSection ||
  mongoose.model<IRecognitionSection>(
    'RecognitionSection',
    recognitionSectionSchema
  )

export default RecognitionSection
