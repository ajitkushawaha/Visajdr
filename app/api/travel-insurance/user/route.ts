import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import TravelInsuranceApplication from '@/models/TravelInsuranceApplication'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    console.log('Session user email:', session.user.email)

    // Find all travel insurance applications for the current user with completed payment only
    const applications = await TravelInsuranceApplication.find({
      'personalInfo.email': session.user.email,
      paymentStatus: 'completed', // Only show applications with completed payment
    })
      .select(
        'trackingId personalInfo tripDetails selectedPlan status createdAt updatedAt paymentStatus'
      )
      .sort({ createdAt: -1 })

    console.log('Found insurance applications:', applications.length)

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error('Error fetching user travel insurance applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travel insurance applications' },
      { status: 500 }
    )
  }
}
