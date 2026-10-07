import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Agent from '@/models/Agent'
import { z } from 'zod'

// Validation schema for profile updates
const updateProfileSchema = z.object({
  personalDetails: z.object({
    fullName: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    address: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    pincode: z.string().min(6).optional(),
    emergencyContact: z.object({
      name: z.string().min(1).optional(),
      phone: z.string().min(10).optional(),
      relation: z.string().min(1).optional()
    }).optional()
  }).optional(),
  bankDetails: z.object({
    accountHolderName: z.string().min(1).optional(),
    accountNumber: z.string().min(9).optional(),
    ifscCode: z.string().min(11).optional(),
    bankName: z.string().min(1).optional(),
    branchName: z.string().optional()
  }).optional(),
  businessDetails: z.object({
    businessName: z.string().optional(),
    businessType: z.enum(['individual', 'partnership', 'company']).optional(),
    gstNumber: z.string().optional(),
    businessAddress: z.string().optional(),
    yearsOfExperience: z.number().min(0).optional(),
    previousAgency: z.string().optional()
  }).optional(),
  settings: z.object({
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    commissionAlerts: z.boolean().optional(),
    applicationUpdates: z.boolean().optional()
  }).optional()
})

// GET /api/agent/profile - Get agent profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const agent = await Agent.findOne({ userId: session.user.id })
      .populate('userId', 'name email role')
      .populate('approvedBy', 'name email')
      .lean()

    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: agent
    })
  } catch (error) {
    console.error('Error fetching agent profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/agent/profile - Update agent profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const agent = await Agent.findOne({ userId: session.user.id })
    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 })
    }

    // Update agent profile
    if (validatedData.personalDetails) {
      Object.assign(agent.personalDetails, validatedData.personalDetails)
    }
    if (validatedData.bankDetails) {
      Object.assign(agent.bankDetails, validatedData.bankDetails)
    }
    if (validatedData.businessDetails) {
      Object.assign(agent.businessDetails, validatedData.businessDetails)
    }
    if (validatedData.settings) {
      Object.assign(agent.settings, validatedData.settings)
    }

    await agent.save()

    return NextResponse.json({
      success: true,
      data: agent,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating agent profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
