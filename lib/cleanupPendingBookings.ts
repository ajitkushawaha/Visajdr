import mongoose from 'mongoose'
import VisaApplication from '@/models/VisaApplication'
import { logAuditEvent } from '@/lib/auditLog'

/**
 * Moves unpaid "Pending" bookings to "abandoned" status after ABANDON_TIMEOUT_MINUTES (default 15 minutes).
 * This helps with lead generation - abandoned bookings can be followed up.
 * Logs each move for audit.
 */
export async function cleanupPendingBookings(): Promise<number> {
  const ABANDON_TIMEOUT_MINUTES = Number(
    process.env.ABANDON_TIMEOUT_MINUTES || 15
  )
  const cutoff = new Date(Date.now() - ABANDON_TIMEOUT_MINUTES * 60 * 1000)

  const toAbandon = await VisaApplication.find({
    status: 'Pending',
    paymentStatus: { $ne: 'completed' },
    createdAt: { $lte: cutoff },
    abandonedAt: { $exists: false }, // skip already abandoned docs
  }).lean()

  let abandoned = 0
  for (const doc of toAbandon) {
    try {
      await VisaApplication.findByIdAndUpdate(doc._id, {
        $set: {
          status: 'abandoned',
          abandonedAt: new Date(),
          abandonReason: `Payment incomplete: moved to abandoned after ${ABANDON_TIMEOUT_MINUTES} minutes`,
        },
        $push: {
          statusHistory: {
            status: 'abandoned',
            changedBy: new mongoose.Types.ObjectId(String(doc.userId)),
            changedByRole: 'system',
            changedByName: 'System',
            timestamp: new Date(),
            notes: `Payment incomplete - moved to abandoned section for lead generation`,
            reason: 'Payment not completed within timeout period',
          },
        },
      })

      await logAuditEvent({
        userId: new mongoose.Types.ObjectId(String(doc.userId)),
        action: 'AUTO_ABANDON_PENDING_BOOKING',
        targetId: new mongoose.Types.ObjectId(String(doc._id)),
        targetType: 'VisaApplication',
        details: {
          trackingId: doc.trackingId,
          reason: 'Payment incomplete - moved to abandoned',
          timeoutMinutes: ABANDON_TIMEOUT_MINUTES,
        },
      } as any)
      abandoned++
    } catch (err) {
      console.error('[cleanupPendingBookings] failed to abandon', doc._id, err)
    }
  }
  return abandoned
}

if (require.main === module) {
  // Allow running directly: ts-node lib/cleanupPendingBookings.ts
  mongoose
    .connect(process.env.MONGODB_URI!)
    .then(() => cleanupPendingBookings().then(n => process.exit(n > 0 ? 0 : 0)))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
