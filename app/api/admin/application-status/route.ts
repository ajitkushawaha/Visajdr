import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import ApplicationStatus from '@/models/ApplicationStatus'

// GET - Fetch all application statuses
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const statuses = await ApplicationStatus.find({})
      .sort({ order: 1, createdAt: 1 })
      .lean()

    return NextResponse.json({ success: true, data: statuses })
  } catch (error) {
    console.error('Error fetching application statuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application statuses' },
      { status: 500 }
    )
  }
}

// POST - Create a new application status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { name, slug, description, color, order, category } = body

    // Validate required fields
    if (!name || !slug || !color) {
      return NextResponse.json(
        { error: 'Name, slug, and color are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await ApplicationStatus.findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { error: 'Status with this slug already exists' },
        { status: 400 }
      )
    }

    // Get the highest order number
    const maxOrder = await ApplicationStatus.findOne({})
      .sort({ order: -1 })
      .select('order')
      .lean()

    const newStatus = await ApplicationStatus.create({
      name,
      slug,
      description,
      color,
      order: order ?? (maxOrder?.order ?? 0) + 1,
      category: category || 'processing',
      isActive: true,
      isSystem: false,
    })

    return NextResponse.json(
      { success: true, data: newStatus },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating application status:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Status with this name or slug already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create application status' },
      { status: 500 }
    )
  }
}
