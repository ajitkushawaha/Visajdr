import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import JobApplication from '@/models/JobApplication'

// Get single job application by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const resolvedParams = await params
    const applicationId = resolvedParams.id

    const application = await JobApplication.findById(applicationId)
    console.log('application in 13 ', application)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

// Update job application (mainly for status updates)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const resolvedParams = await params
    const applicationId = resolvedParams.id
    const body = await req.json()

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      body,
      { new: true, runValidators: true }
    )

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

// Delete job application
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const resolvedParams = await params
    const applicationId = resolvedParams.id

    const application = await JobApplication.findByIdAndDelete(applicationId)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
