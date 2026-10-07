import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import ServiceDetail from '@/models/ServiceDetail'
import { slugify } from '@/utils/slugify'
import mongoose from 'mongoose'

// GET - Fetch single service detail by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || (session as any).user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid service detail ID' },
        { status: 400 }
      )
    }

    const serviceDetail = await ServiceDetail.findById(id)

    if (!serviceDetail) {
      return NextResponse.json(
        { error: 'Service detail not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      serviceDetail,
    })
  } catch (error) {
    console.error('Error fetching service detail:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service detail' },
      { status: 500 }
    )
  }
}

// PUT - Update service detail
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || (session as any).user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid service detail ID' },
        { status: 400 }
      )
    }

    const data = await request.json()

    const serviceDetail = await ServiceDetail.findById(id)

    if (!serviceDetail) {
      return NextResponse.json(
        { error: 'Service detail not found' },
        { status: 404 }
      )
    }

    // Handle slug update
    if (data.slug && data.slug !== serviceDetail.slug) {
      // Check if new slug already exists
      const existingService = await ServiceDetail.findOne({
        slug: data.slug,
        _id: { $ne: id },
      })

      if (existingService) {
        return NextResponse.json(
          { error: 'A service with this slug already exists' },
          { status: 400 }
        )
      }
    } else if (data.title && data.title !== serviceDetail.title && !data.slug) {
      // Auto-generate slug from title if title changed and slug not provided
      const newSlug = slugify(data.title)
      if (newSlug !== serviceDetail.slug) {
        // Check if new slug already exists
        const existingService = await ServiceDetail.findOne({
          slug: newSlug,
          _id: { $ne: id },
        })

        if (!existingService) {
          data.slug = newSlug
        }
      }
    }

    // Update service detail
    Object.assign(serviceDetail, data)
    await serviceDetail.save()

    return NextResponse.json({
      success: true,
      message: 'Service detail updated successfully',
      serviceDetail,
    })
  } catch (error: any) {
    console.error('Error updating service detail:', error)

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A service with this slug already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update service detail',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete service detail
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || (session as any).user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid service detail ID' },
        { status: 400 }
      )
    }

    const serviceDetail = await ServiceDetail.findByIdAndDelete(id)

    if (!serviceDetail) {
      return NextResponse.json(
        { error: 'Service detail not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Service detail deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting service detail:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete service detail' },
      { status: 500 }
    )
  }
}
