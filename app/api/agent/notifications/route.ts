import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'
import Agent from '@/models/Agent'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (
      !(session?.user as any)?.id ||
      (session?.user as any)?.role !== 'agent'
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const agent = await Agent.findOne({
      userId: (session?.user as any).id,
    }).lean()
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const isRead = searchParams.get('isRead')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query: any = { recipient: (session?.user as any).id }
    if (type && type !== 'all') query.type = type
    if (priority && priority !== 'all') query.priority = priority
    if (isRead && isRead !== 'all') query.isRead = isRead === 'true'

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const unreadCount = await Notification.countDocuments({
      recipient: (session?.user as any).id,
      isRead: false,
    })

    return NextResponse.json({
      success: true,
      data: { notifications, unreadCount },
    })
  } catch (error) {
    console.error('Error fetching agent notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
