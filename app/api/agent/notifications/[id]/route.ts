import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { isRead } = body

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: (session?.user as any).id },
      { isRead: !!isRead },
      { new: true }
    )

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    console.error('Error updating agent notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
