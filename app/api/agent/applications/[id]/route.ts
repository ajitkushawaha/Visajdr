import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import Agent from '@/models/Agent'
import { emailService } from '@/lib/emailService'
import { commissionService } from '@/lib/commissionService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check agent authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Await params
    const { id } = await params

    // Get agent info
    const agent = await Agent.findOne({ userId: session.user.id })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const application = await VisaApplication.findById(id)
      .populate('visaId', 'country visaType')
      .populate('userId', 'name email')
      .populate(
        'agentId',
        'agentId personalDetails.fullName personalDetails.email'
      )
    console.log('application in 36 ', application)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const assignedAgentId = (application as any).agentId?._id
      ? (application as any).agentId._id.toString()
      : (application as any).agentId?.toString()
    if (assignedAgentId !== agent._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check agent authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get agent info
    const agent = await Agent.findOne({ userId: session.user.id })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, notes, rejectionReason } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Get current application
    const { id } = params
    const currentApplication = await VisaApplication.findById(id)
    if (!currentApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if application is assigned to this agent
    if (currentApplication.agentId?.toString() !== agent._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Validate status transitions for agents
    const allowedStatuses = [
      'under_review',
      'in_embassy',
      'approved',
      'rejected',
    ]
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Status '${status}' is not allowed for agents`,
        },
        { status: 400 }
      )
    }

    const oldStatus = currentApplication.status
    const updateData: any = { status }

    if (notes !== undefined) updateData.notes = notes
    if (rejectionReason !== undefined)
      updateData.rejectionReason = rejectionReason

    // Set actual processing date when status changes to approved/rejected
    if (status === 'approved' || status === 'rejected') {
      updateData.actualProcessingDate = new Date()
    }

    // Add status history entry
    const statusHistoryEntry = {
      status: status,
      changedBy: session.user.id,
      changedByRole: 'agent' as const,
      changedByName: agent.personalDetails.fullName,
      timestamp: new Date(),
      notes: notes || '',
      reason: rejectionReason || '',
    }

    updateData.$push = { statusHistory: statusHistoryEntry }

    const application = await VisaApplication.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
      .populate('visaId', 'country visaType')
      .populate('userId', 'name email')
      .populate(
        'agentId',
        'agentId personalDetails.fullName personalDetails.email'
      )

    // Create commission when application is approved
    if (status === 'approved' && oldStatus !== 'approved') {
      try {
        await commissionService.processApplicationApproval(
          application._id.toString(),
          agent._id.toString(),
          application.totalAmount || 0
        )
      } catch (commissionError) {
        console.error('Commission creation error:', commissionError)
        // Don't fail the request if commission creation fails
      }
    }

    // Send email notifications
    try {
      if (oldStatus !== status) {
        await emailService.sendStatusUpdate(
          application.trackingId,
          application.personalInfo.email,
          status,
          'visa'
        )
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application,
    })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
