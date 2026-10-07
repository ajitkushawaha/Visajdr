import mongoose, { Schema, Document } from 'mongoose'

export interface ISelectPlanPage extends Document {
  // Trust Section
  trustSection: {
    mainText: string
    features: Array<{
      text: string
      order: number
      status: 'active' | 'inactive'
    }>
  }

  // Status
  status: 'active' | 'inactive'

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const SelectPlanPageSchema = new Schema<ISelectPlanPage>(
  {
    trustSection: {
      mainText: {
        type: String,
        default: 'Visa4 has brought joy to over 1,50,000 happy travellers!',
      },
      features: [
        {
          text: { type: String, required: true },
          order: { type: Number, default: 0 },
          status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
          },
        },
      ],
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
)

export default mongoose.models.SelectPlanPage ||
  mongoose.model<ISelectPlanPage>('SelectPlanPage', SelectPlanPageSchema)
