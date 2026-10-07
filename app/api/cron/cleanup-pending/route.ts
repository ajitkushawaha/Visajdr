import { NextRequest } from 'next/server'
import { cleanupPendingBookings } from '@/lib/cleanupPendingBookings'
import connectDB from '@/lib/db'

/**
 * API route triggered by a cron job (e.g. Vercel Cron, GitHub Actions, or node-cron container).
 * Moves unpaid "Pending" bookings to "abandoned" status after ABANDON_TIMEOUT_MINUTES (default 15 minutes).
 * This helps with lead generation - abandoned bookings can be followed up.
 * Returns count of abandoned records and any error message.
 */
export async function GET(req: NextRequest) {
  // Optional secret header to restrict callers
  const secret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Connect to database before cleanup
    await connectDB()

    const abandoned = await cleanupPendingBookings()
    return Response.json({ abandoned, ok: true })
  } catch (err: any) {
    console.error('[cron/cleanup] error:', err)
    return Response.json(
      { error: err.message || 'Cleanup failed' },
      { status: 500 }
    )
  }
}
