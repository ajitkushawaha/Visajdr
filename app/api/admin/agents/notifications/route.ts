import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'
import Agent, { IAgent } from '@/models/Agent'
import { emailService } from '@/lib/emailService'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    await connectDB()

    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const isRead = searchParams.get('isRead')

    // Build query
    let query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } },
      ]
    }

    if (type && type !== 'all') {
      query.type = type
    }

    if (priority && priority !== 'all') {
      query.priority = priority
    }

    if (isRead && isRead !== 'all') {
      query.isRead = isRead === 'true'
    }

    // Only get notifications for agents or the current admin
    // We need to find all users that are agents first
    const agents = await Agent.find({}).select('userId').lean()
    const agentUserIds = agents.map(agent => agent.userId)

    // Add current admin to the list of allowed recipients so they can see their own notifications
    const adminId = (session?.user as any)?.id
    const allowedRecipients = adminId
      ? [...agentUserIds, adminId]
      : agentUserIds

    // If there are existing query parameters for recipient (unlikely in this generic fetch but possible)
    if (query.recipient) {
      // Ensure the requested recipient is actually an agent or the current admin
      const isAllowed = allowedRecipients.some(
        id => id.toString() === query.recipient.toString()
      )
      if (!isAllowed) {
        return NextResponse.json({
          success: true,
          data: { notifications: [], total: 0 },
        })
      }
    } else {
      query.recipient = { $in: allowedRecipients }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate('recipient', 'name email role')
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        total: notifications.length,
      },
    })
  } catch (error) {
    console.error('Error fetching agent notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    await connectDB()

    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipient, type, title, message, priority, sendEmail } = body

    // Validate required fields
    if (!recipient || !type || !title || !message || !priority) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Get agent details
    const agent = (await Agent.findById(recipient).lean()) as unknown as IAgent
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
        },
        { status: 404 }
      )
    }

    // Create notification
    const notification = new Notification({
      recipient: agent.userId,
      type,
      title,
      message,
      priority,
      isRead: false,
      emailSent: false,
      createdBy: (session?.user as any)?.id,
    })

    await notification.save()

    // Send email if requested
    if (sendEmail) {
      try {
        await emailService.sendAgentGenericNotification({
          to: agent.personalDetails.email,
          agentName: agent.personalDetails.fullName,
          title,
          message,
          type,
          priority,
        })

        notification.emailSent = true
        notification.emailSentAt = new Date()
        await notification.save()
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification sent successfully',
    })
  } catch (error) {
    console.error('Error creating agent notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
