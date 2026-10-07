import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import Agent from '@/models/Agent'
import { emailService } from '@/lib/emailService'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { reopenReason, newAgentId } = body
    const { id: applicationId } = await params

    if (!reopenReason) {
      return NextResponse.json(
        {
          error: 'Reopen reason is required',
        },
        { status: 400 }
      )
    }

    // Get current application
    const application = await VisaApplication.findById(applicationId)
      .populate('userId', 'name email')
      .populate('visaId', 'country visaType')
      .populate(
        'agentId',
        'agentId personalDetails.fullName personalDetails.email'
      )
    console.log('application in 37 ', application)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'rejected') {
      return NextResponse.json(
        {
          error: 'Only rejected applications can be reopened',
        },
        { status: 400 }
      )
    }

    // Determine new status and agent
    let newStatus = 'under_review'
    const currentAgentId = application.agentId

    if (currentAgentId) {
      newStatus = 'assigned_to_agent'
    }

    // If newAgentId is provided, verify it exists
    if (newAgentId) {
      const agent = await Agent.findById(newAgentId)
      if (!agent) {
        return NextResponse.json(
          { error: 'New agent not found' },
          { status: 404 }
        )
      }
      newStatus = 'assigned_to_agent'
    }

    // Update application
    const updateData: any = {
      status: newStatus,
      rejectionReason: null, // Clear rejection reason
      actualProcessingDate: null, // Clear processing date
    }

    if (newAgentId) {
      updateData.agentId = newAgentId
    }

    // Add status history entry
    const statusHistoryEntry = {
      status: newStatus,
      changedBy: session.user.id,
      changedByRole: 'admin' as const,
      changedByName: session.user.name || 'Admin',
      timestamp: new Date(),
      notes: `Application reopened: ${reopenReason}`,
      reason: reopenReason,
    }

    updateData.$push = { statusHistory: statusHistoryEntry }

    const updatedApplication = await VisaApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    )
      .populate('visaId', 'country visaType')
      .populate('userId', 'name email')
      .populate(
        'agentId',
        'agentId personalDetails.fullName personalDetails.email'
      )

    // Send email notifications
    try {
      // Notify user about reopening
      await emailService.sendApplicationReopened(
        application.personalInfo.email,
        application.trackingId,
        reopenReason,
        newAgentId
          ? (await Agent.findById(newAgentId))?.personalDetails.fullName
          : null
      )

      // Notify agent if assigned
      if (newAgentId) {
        const agent = await Agent.findById(newAgentId).populate(
          'userId',
          'name email'
        )
        if (agent) {
          await emailService.sendAgentNotification(
            agent.userId.email,
            application.trackingId,
            application.personalInfo.firstName +
              ' ' +
              application.personalInfo.lastName,
            application.visaDetails.country
          )
        }
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Application reopened successfully',
      application: updatedApplication,
    })
  } catch (error) {
    console.error('Reopen application error:', error)
    return NextResponse.json(
      { error: 'Failed to reopen application' },
      { status: 500 }
    )
  }
}
