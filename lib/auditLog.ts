import mongoose from 'mongoose'

export interface IAuditLog extends mongoose.Document {
  userId?: mongoose.Types.ObjectId
  action: string
  targetId?: mongoose.Types.ObjectId
  targetType?: string
  details?: any
  createdAt: Date
}

const AuditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, index: true },
    targetType: { type: String, index: true },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

export const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)

export async function logAuditEvent(
  data: Omit<IAuditLog, '_id' | 'createdAt' | 'updatedAt'>
) {
  await AuditLog.create(data)
}
