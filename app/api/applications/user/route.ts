import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import mongoose from 'mongoose'
import VisaApplication from '@/models/VisaApplication'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Find all applications for the current user, excluding abandoned ones
    const applications = await VisaApplication.find({
      userId: (session.user as any)?.id,
      status: { $ne: 'abandoned' },
    })
      .select(
        'trackingId personalInfo visaDetails status totalAmount createdAt updatedAt paymentStatus agentId rejectionReason documents'
      )
      .populate({
        path: 'agentId',
        select: 'agentId personalDetails.fullName personalDetails.email',
      })
      .sort({ createdAt: -1 })

    console.log('Found visa applications:', applications.length)

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error('Error fetching user applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
