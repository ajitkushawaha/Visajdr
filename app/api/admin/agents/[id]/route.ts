import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Agent from '@/models/Agent'
import User from '@/models/User'
import { emailService } from '@/lib/emailService'
import { z } from 'zod'

// Validation schemas
const updateAgentSchema = z.object({
  status: z
    .enum([
      'pending',
      'approved',
      'rejected',
      'suspended',
      'inactive',
      'disabled',
    ])
    .optional(),
  kycStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  commissionType: z.enum(['percentage', 'fixed']).optional(),
  fixedCommissionAmount: z.number().min(0).optional(),
  personalDetails: z
    .object({
      fullName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().min(10).optional(),
      address: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      state: z.string().min(1).optional(),
      pincode: z.string().min(6).optional(),
      dateOfBirth: z.string().min(1).optional(),
      emergencyContact: z
        .object({
          name: z.string().min(1).optional(),
          phone: z.string().min(10).optional(),
          relation: z.string().min(1).optional(),
        })
        .optional(),
    })
    .optional(),
  bankDetails: z
    .object({
      accountHolderName: z.string().min(1).optional(),
      accountNumber: z.string().min(9).optional(),
      ifscCode: z.string().min(11).optional(),
      bankName: z.string().min(1).optional(),
      branchName: z.string().optional(),
    })
    .optional(),
  businessDetails: z
    .object({
      businessName: z.string().optional(),
      businessType: z.enum(['individual', 'partnership', 'company']).optional(),
      gstNumber: z.string().optional(),
      businessAddress: z.string().optional(),
      yearsOfExperience: z.number().min(0).optional(),
      previousAgency: z.string().optional(),
    })
    .optional(),
  settings: z
    .object({
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      commissionAlerts: z.boolean().optional(),
      applicationUpdates: z.boolean().optional(),
    })
    .optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/agents/[id] - Get single agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const agent = await Agent.findById(id)
      .populate('userId', 'name email role createdAt')
      .populate('approvedBy', 'name email')
      .lean()

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: agent,
    })
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateAgentSchema.parse(body)

    const agent = await Agent.findById(id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Store previous KYC status for email notification
    const previousKycStatus = agent.kycStatus
    const previousAgentStatus = agent.status

    // Update agent with validated data first
    Object.assign(agent, validatedData)

    // If status is being changed to approved, set approvedBy and approvedAt
    if (
      validatedData.status === 'approved' &&
      previousAgentStatus !== 'approved'
    ) {
      agent.approvedBy = (session.user as any).id
      agent.approvedAt = new Date()
      agent.isActive = true // Also set isActive field (after Object.assign so it doesn't get overwritten)

      // Also activate the user account when agent is approved
      await User.findByIdAndUpdate(agent.userId, {
        'status.isActive': true,
      })
    }

    // If agent status is being set to inactive/disabled/suspended, also deactivate user account
    if (
      validatedData.status &&
      ['inactive', 'disabled', 'suspended', 'rejected'].includes(
        validatedData.status
      )
    ) {
      // Only deactivate if transitioning from an active state (approved) to inactive state
      if (previousAgentStatus === 'approved') {
        agent.isActive = false // Also set isActive field (after Object.assign so it doesn't get overwritten)
        await User.findByIdAndUpdate(agent.userId, {
          'status.isActive': false,
        })
      } else if (previousAgentStatus !== validatedData.status) {
        // If changing to inactive state from any other inactive state, ensure isActive is false
        agent.isActive = false
      }
    }

    // Ensure isActive is synced with status (if validatedData didn't include isActive)
    if (
      validatedData.status === 'approved' &&
      validatedData.isActive === undefined
    ) {
      agent.isActive = true
    } else if (
      validatedData.status &&
      ['inactive', 'disabled', 'suspended', 'rejected'].includes(
        validatedData.status
      ) &&
      validatedData.isActive === undefined
    ) {
      agent.isActive = false
    }

    await agent.save()

    // Send email notification if KYC status changed
    if (
      validatedData.kycStatus &&
      validatedData.kycStatus !== previousKycStatus
    ) {
      try {
        await emailService.sendKycStatusUpdate(
          agent.personalDetails.email,
          agent.personalDetails.fullName,
          validatedData.kycStatus,
          previousKycStatus
        )
      } catch (emailError) {
        console.error('Failed to send KYC status update email:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Send email notification if agent status changed
    if (validatedData.status && validatedData.status !== previousAgentStatus) {
      try {
        await emailService.sendAgentStatusUpdate(
          agent.personalDetails.email,
          agent.personalDetails.fullName,
          validatedData.status,
          previousAgentStatus
        )
      } catch (emailError) {
        console.error('Failed to send agent status update email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: agent,
      message: 'Agent updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating agent:', error)
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/agents/[id] - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const agent = await Agent.findById(id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    agent.isActive = false
    agent.status = 'inactive'
    await agent.save()

    // Revert user role back to user and deactivate
    await User.findByIdAndUpdate(agent.userId, {
      role: 'user',
      'status.isActive': false,
    })

    return NextResponse.json({
      success: true,
      message: 'Agent deactivated successfully',
    })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
