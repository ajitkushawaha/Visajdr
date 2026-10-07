import mongoose, { Schema, Document } from 'mongoose'

export interface IAgentCommission extends Document {
  agentId: mongoose.Types.ObjectId
  applicationId: mongoose.Types.ObjectId
  sourceType: 'visa_application' | 'travel_insurance' | 'other'
  sourceId: string // Application ID or other source identifier
  commissionAmount: number
  commissionRate: number // Rate used for calculation
  commissionType: 'percentage' | 'fixed'
  baseAmount: number // The amount commission was calculated from
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  paymentPeriod: string // e.g., "2024-01" for January 2024
  paidAt: Date
  paidBy: mongoose.Types.ObjectId
  paymentReference: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

const AgentCommissionSchema = new Schema<IAgentCommission>({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'VisaApplication',
    required: true
  },
  sourceType: {
    type: String,
    enum: ['visa_application', 'travel_insurance', 'other'],
    required: true
  },
  sourceId: {
    type: String,
    required: true
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  commissionType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  baseAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentPeriod: {
    type: String,
    required: true
  },
  paidAt: Date,
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentReference: String,
  notes: String
}, {
  timestamps: true
})

// Indexes for better performance
AgentCommissionSchema.index({ agentId: 1 })
AgentCommissionSchema.index({ applicationId: 1 })
AgentCommissionSchema.index({ status: 1 })
AgentCommissionSchema.index({ paymentPeriod: 1 })
AgentCommissionSchema.index({ createdAt: -1 })
AgentCommissionSchema.index({ agentId: 1, paymentPeriod: 1 })

export default mongoose.models.AgentCommission || mongoose.model<IAgentCommission>('AgentCommission', AgentCommissionSchema)
