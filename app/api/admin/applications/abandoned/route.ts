import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import { cleanupPendingBookings } from '@/lib/cleanupPendingBookings'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Run cleanup to ensure fresh data (workaround for Vercel Free Tier cron limits)
    await cleanupPendingBookings()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const query: any = {
      status: 'abandoned',
      paymentStatus: { $ne: 'completed' }, // Payment incomplete
    }

    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { 'personalInfo.phone': { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } },
      ]
    }

    const applications = await VisaApplication.find(query)
      .populate('visaId', 'country visaType')
      .populate('userId', 'name email phone')
      .populate(
        'agentId',
        'agentId personalDetails.fullName personalDetails.email'
      )
      .sort({ abandonedAt: -1, createdAt: -1 }) // Sort by abandoned time, then creation time
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await VisaApplication.countDocuments(query)

    // Get stats for abandoned bookings
    const stats = {
      total: total,
      today: await VisaApplication.countDocuments({
        ...query,
        abandonedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      thisWeek: await VisaApplication.countDocuments({
        ...query,
        abandonedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),
      thisMonth: await VisaApplication.countDocuments({
        ...query,
        abandonedAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }),
    }

    return NextResponse.json({
      success: true,
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching abandoned applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch abandoned applications' },
      { status: 500 }
    )
  }
}
