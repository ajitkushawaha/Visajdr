import mongoose, { Schema, Document } from 'mongoose'

export interface IAgentPayout extends Document {
  agentId: mongoose.Types.ObjectId
  payoutPeriod: string // e.g., "2024-01" for January 2024
  totalCommission: number
  totalApplications: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  paymentMethod: 'bank_transfer' | 'upi' | 'cheque' | 'cash'
  paymentDetails: {
    bankAccount?: string
    upiId?: string
    chequeNumber?: string
    paymentReference?: string
  }
  deductions: {
    tdsAmount: number
    otherDeductions: number
    reason: string
  }
  netAmount: number
  paidAt: Date
  paidBy: mongoose.Types.ObjectId
  approvedAt: Date
  approvedBy: mongoose.Types.ObjectId
  notes: string
  commissionIds: mongoose.Types.ObjectId[] // References to AgentCommission documents
  createdAt: Date
  updatedAt: Date
}

const AgentPayoutSchema = new Schema<IAgentPayout>({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  payoutPeriod: {
    type: String,
    required: true
  },
  totalCommission: {
    type: Number,
    required: true,
    min: 0
  },
  totalApplications: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'cheque', 'cash'],
    required: true
  },
  paymentDetails: {
    bankAccount: String,
    upiId: String,
    chequeNumber: String,
    paymentReference: String
  },
  deductions: {
    tdsAmount: { type: Number, default: 0, min: 0 },
    otherDeductions: { type: Number, default: 0, min: 0 },
    reason: String
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAt: Date,
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  commissionIds: [{
    type: Schema.Types.ObjectId,
    ref: 'AgentCommission'
  }]
}, {
  timestamps: true
})

// Indexes for better performance
AgentPayoutSchema.index({ agentId: 1 })
AgentPayoutSchema.index({ payoutPeriod: 1 })
AgentPayoutSchema.index({ status: 1 })
AgentPayoutSchema.index({ createdAt: -1 })
AgentPayoutSchema.index({ agentId: 1, payoutPeriod: 1 }, { unique: true })

// Calculate net amount before saving
AgentPayoutSchema.pre('save', function(next) {
  this.netAmount = this.totalCommission - this.deductions.tdsAmount - this.deductions.otherDeductions
  next()
})

export default mongoose.models.AgentPayout || mongoose.model<IAgentPayout>('AgentPayout', AgentPayoutSchema)
