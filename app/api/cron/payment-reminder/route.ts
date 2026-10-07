import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import { emailService } from '@/lib/emailService'

export const dynamic = 'force-dynamic' // Ensure this route is not cached

export async function GET(request: Request) {
  try {
    // Optional: Add a secret key check to prevent unauthorized triggering
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const now = new Date()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
    // Look back 3 days (72 hours) to ensure daily cron jobs don't miss anyone
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    // Find pending applications created between 15 mins and 3 days ago
    // that haven't received a reminder yet
    const pendingApplications = await VisaApplication.find({
      status: 'Pending',
      paymentStatus: 'pending',
      paymentReminderSent: { $ne: true },
      createdAt: {
        $lt: fifteenMinutesAgo,
        $gt: threeDaysAgo,
      },
    }).populate('userId', 'email firstName lastName')

    console.log(
      `[Cron] Found ${pendingApplications.length} pending applications for payment reminder`
    )

    let sentCount = 0
    const results = []

    for (const app of pendingApplications) {
      try {
        const paymentLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`

        // Get email from personalInfo (primary) or user account (fallback)
        const email = app.personalInfo?.email || (app.userId as any)?.email
        const name =
          `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`.trim() ||
          (app.userId as any)?.firstName ||
          'Customer'
        const country = app.visaDetails?.country || 'Destination'

        if (email) {
          const sent = await emailService.sendApplicationIncompleteReminder(
            email,
            name,
            app.trackingId || 'N/A',
            country,
            paymentLink
          )

          if (sent) {
            app.paymentReminderSent = true
            await app.save()
            sentCount++
            results.push({ id: app._id, status: 'sent', email })
          } else {
            results.push({
              id: app._id,
              status: 'failed',
              reason: 'Email service returned false',
            })
          }
        } else {
          results.push({
            id: app._id,
            status: 'skipped',
            reason: 'No email found',
          })
        }
      } catch (err: any) {
        console.error(`[Cron] Failed to process application ${app._id}:`, err)
        results.push({ id: app._id, status: 'error', error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingApplications.length,
      sent: sentCount,
      results,
    })
  } catch (error: any) {
    console.error('[Cron] Payment reminder job failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
