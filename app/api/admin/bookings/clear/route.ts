import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import TravelInsuranceApplication from '@/models/TravelInsuranceApplication'
import AgentCommission from '@/models/AgentCommission'

// POST /api/admin/bookings/clear
// Admin-only endpoint to clear booking-related data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Use optional chaining to safely access role without strict typing
    const role = (session as any)?.user?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { confirm, dryRun } = body || {}

    if (confirm !== true) {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmation required',
          message: 'Pass { "confirm": true } in the request body to proceed.',
        },
        { status: 400 }
      )
    }

    await connectDB()

    // Count current documents
    const [visaCount, insuranceCount, commissionCount] = await Promise.all([
      VisaApplication.countDocuments({}),
      TravelInsuranceApplication.countDocuments({}),
      AgentCommission.countDocuments({
        sourceType: { $in: ['visa_application', 'travel_insurance'] },
      }),
    ])

    if (dryRun === true) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        counts: {
          visaApplications: visaCount,
          travelInsuranceApplications: insuranceCount,
          agentCommissions: commissionCount,
        },
        message: 'Dry run only. No data was deleted.',
      })
    }

    // Perform deletions
    const [visaResult, insuranceResult, commissionResult] = await Promise.all([
      VisaApplication.deleteMany({}),
      TravelInsuranceApplication.deleteMany({}),
      AgentCommission.deleteMany({
        sourceType: { $in: ['visa_application', 'travel_insurance'] },
      }),
    ])

    return NextResponse.json({
      success: true,
      deleted: {
        visaApplications: visaResult?.deletedCount ?? 0,
        travelInsuranceApplications: insuranceResult?.deletedCount ?? 0,
        agentCommissions: commissionResult?.deletedCount ?? 0,
      },
    })
  } catch (error: any) {
    console.error('Clear bookings error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear bookings' },
      { status: 500 }
    )
  }
}
