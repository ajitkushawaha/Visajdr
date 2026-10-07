import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import Agent from '@/models/Agent'
import User from '@/models/User'
import { emailService } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { applicationId, agentId, notes } = body

    if (!applicationId || !agentId) {
      return NextResponse.json(
        {
          error: 'Application ID and Agent ID are required',
        },
        { status: 400 }
      )
    }

    // Verify agent exists
    const agent = await Agent.findById(agentId).populate('userId', 'name email')
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get current application
    const application = await VisaApplication.findById(applicationId)
      .populate('userId', 'name email')
      .populate('visaId', 'country visaType')
    console.log('application in 40 ', application)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const oldAgentId = application.agentId?.toString()
    const oldStatus = application.status

    // Update application with agent assignment
    const updateData: any = {
      agentId: agentId,
      status: 'assigned_to_agent',
    }

    // Add status history entry
    const statusHistoryEntry = {
      status: 'assigned_to_agent',
      changedBy: session.user.id,
      changedByRole: 'admin' as const,
      changedByName: session.user.name || 'Admin',
      timestamp: new Date(),
      notes: notes || `Assigned to agent ${agent.agentId}`,
      reason: '',
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
      // Notify user about agent assignment
      await emailService.sendAgentAssigned(
        application.personalInfo.email,
        agent.personalDetails.fullName,
        application.trackingId,
        application.visaDetails
      )

      // Notify agent about new assignment
      await emailService.sendAgentNotification(
        agent.userId.email,
        application.trackingId,
        application.personalInfo.firstName +
          ' ' +
          application.personalInfo.lastName,
        application.visaDetails.country
      )

      // If reassigning, notify old agent
      if (oldAgentId && oldAgentId !== agentId) {
        const oldAgent = await Agent.findById(oldAgentId).populate(
          'userId',
          'name email'
        )
        if (oldAgent) {
          await emailService.sendAgentReassigned(
            oldAgent.userId.email,
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
      message: 'Agent assigned successfully',
      application: updatedApplication,
    })
  } catch (error) {
    console.error('Assign agent error:', error)
    return NextResponse.json(
      { error: 'Failed to assign agent' },
      { status: 500 }
    )
  }
}
