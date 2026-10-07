import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import ApplicationStatus from '@/models/ApplicationStatus'

// PUT - Update an application status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    const body = await request.json()
    const { name, slug, description, color, order, isActive, category } = body

    const status = await ApplicationStatus.findById(id)
    if (!status) {
      return NextResponse.json(
        { error: 'Application status not found' },
        { status: 404 }
      )
    }

    // Don't allow updating system statuses
    if (status.isSystem) {
      return NextResponse.json(
        { error: 'Cannot modify system statuses' },
        { status: 400 }
      )
    }

    // Check if slug is being changed and if it conflicts
    if (slug && slug !== status.slug) {
      const existing = await ApplicationStatus.findOne({ slug })
      if (existing) {
        return NextResponse.json(
          { error: 'Status with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update fields
    if (name) status.name = name
    if (slug) status.slug = slug
    if (description !== undefined) status.description = description
    if (color) status.color = color
    if (order !== undefined) status.order = order
    if (isActive !== undefined) status.isActive = isActive
    if (category) status.category = category

    await status.save()

    return NextResponse.json({ success: true, data: status })
  } catch (error: any) {
    console.error('Error updating application status:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Status with this name or slug already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an application status
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    const status = await ApplicationStatus.findById(id)
    if (!status) {
      return NextResponse.json(
        { error: 'Application status not found' },
        { status: 404 }
      )
    }

    // Don't allow deleting system statuses
    if (status.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system statuses' },
        { status: 400 }
      )
    }

    await ApplicationStatus.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Status deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting application status:', error)
    return NextResponse.json(
      { error: 'Failed to delete application status' },
      { status: 500 }
    )
  }
}
