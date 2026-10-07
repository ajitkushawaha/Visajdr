import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Agent from '@/models/Agent'
import User from '@/models/User'
import { z } from 'zod'

// Validation schemas
const createAgentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  commissionRate: z.number().min(0).max(100),
  commissionType: z.enum(['percentage', 'fixed']),
  fixedCommissionAmount: z.number().min(0).optional(),
  personalDetails: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(6, 'Valid pincode is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    emergencyContact: z.object({
      name: z.string().min(1, 'Emergency contact name is required'),
      phone: z.string().min(10, 'Valid emergency contact phone is required'),
      relation: z.string().min(1, 'Relation is required')
    })
  }),
  bankDetails: z.object({
    accountHolderName: z.string().min(1, 'Account holder name is required'),
    accountNumber: z.string().min(9, 'Valid account number is required'),
    ifscCode: z.string().min(11, 'Valid IFSC code is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    branchName: z.string().optional()
  }),
  businessDetails: z.object({
    businessName: z.string().optional(),
    businessType: z.enum(['individual', 'partnership', 'company']),
    gstNumber: z.string().optional(),
    businessAddress: z.string().optional(),
    yearsOfExperience: z.number().min(0),
    previousAgency: z.string().optional()
  })
})

const updateAgentSchema = createAgentSchema.partial()

// GET /api/admin/agents - List all agents with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const kycStatus = searchParams.get('kycStatus')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter object
    const filter: any = {}
    if (status) filter.status = status
    if (kycStatus) filter.kycStatus = kycStatus
    if (search) {
      filter.$or = [
        { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
        { 'personalDetails.email': { $regex: search, $options: 'i' } },
        { agentId: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Get agents with pagination
    const agents = await Agent.find(filter)
      .populate('userId', 'name email role')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await Agent.countDocuments(filter)

    return NextResponse.json({
      success: true,
      data: agents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

// POST /api/admin/agents - Create new agent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const validatedData = createAgentSchema.parse(body)

    // Check if user exists and is not already an agent
    const user = await User.findById(validatedData.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingAgent = await Agent.findOne({ userId: validatedData.userId })
    if (existingAgent) {
      return NextResponse.json({ error: 'User is already an agent' }, { status: 400 })
    }

    // Create agent
    const agent = new Agent({
      ...validatedData,
      userId: validatedData.userId,
      status: 'pending',
      kycStatus: 'pending',
      approvedBy: (session.user as any).id,
      approvedAt: new Date()
    })

    await agent.save()

    // Update user role to agent
    await User.findByIdAndUpdate(validatedData.userId, { role: 'agent' })

    return NextResponse.json({
      success: true,
      data: agent,
      message: 'Agent created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
