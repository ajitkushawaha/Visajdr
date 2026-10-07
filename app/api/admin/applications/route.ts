import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import User from '@/models/User'
import Agent from '@/models/Agent'
import { emailService } from '@/lib/emailService'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const userId = searchParams.get('userId')

    const query: any = {}

    if (status) {
      query.status = status
    } else {
      query.status = { $ne: 'abandoned' }
    }
    if (userId) query.userId = userId

    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } },
      ]
    }

    const applications = await VisaApplication.find(query)
      .populate('visaId', 'country visaType')
      .populate('userId', 'name email')
      .populate(
        'agentId',
        'agentId personalDetails.fullName personalDetails.email'
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await VisaApplication.countDocuments(query)

    // Get status counts for dashboard
    const statusCounts = await VisaApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    // Calculate overdue count
    const overdueCount = await VisaApplication.countDocuments({
      status: {
        $nin: ['approved', 'rejected', 'completed', 'cancelled', 'abandoned'],
      },
      estimatedProcessingDate: { $lt: new Date() },
    })

    // Calculate document rejection count
    const documentRejectCount = await VisaApplication.countDocuments({
      $or: [
        { 'documents.passport.status': 'rejected' },
        { 'documents.photo.status': 'rejected' },
      ],
    })

    // Calculate document reupload count
    const documentReuploadCount = await VisaApplication.countDocuments({
      $or: [
        { 'documents.passport.status': 'reuploaded' },
        { 'documents.photo.status': 'reuploaded' },
      ],
    })

    const statusSummary = statusCounts.reduce((acc: any, curr) => {
      acc[curr._id] = curr.count
      return acc
    }, {})

    // Add overdue to summary
    statusSummary['overdue'] = overdueCount
    // Add document status counts
    statusSummary['document_rejected'] = documentRejectCount
    statusSummary['document_reuploaded'] = documentReuploadCount

    return NextResponse.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusSummary,
    })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// Update application status
export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const {
      applicationId,
      status,
      notes,
      agentId,
      estimatedProcessingDate,
      rejectionReason,
    } = body

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      )
    }

    // Get current application to track status change
    const currentApplication = await VisaApplication.findById(applicationId)
    if (!currentApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const oldStatus = currentApplication.status
    const updateData: any = { status }

    if (notes !== undefined) updateData.notes = notes
    if (agentId !== undefined) updateData.agentId = agentId
    if (estimatedProcessingDate !== undefined)
      updateData.estimatedProcessingDate = estimatedProcessingDate
    if (rejectionReason !== undefined)
      updateData.rejectionReason = rejectionReason

    // Set actual processing date when status changes to approved/rejected
    if (status === 'approved' || status === 'rejected') {
      updateData.actualProcessingDate = new Date()
    }

    // If application is approved, also approve all documents to clear "reuploaded" status
    if (status === 'approved') {
      // We need to use $set for specific fields, but updateData already uses keys like 'status'
      // Mongoose handles top-level keys in updateData as $set if not explicitly using $set
      // But we are mixing top-level keys and $push.
      // Wait, line 160 uses $push.

      // Let's structure updateData properly.
      // Currently: { status: ..., notes: ..., $push: ... }
      // This is valid in Mongoose.

      updateData['documents.passport.status'] = 'approved'
      updateData['documents.photo.status'] = 'approved'
      // Also approve additional documents if needed, but they are dynamic.
      // For now, focusing on passport and photo as they drive the counts.
    }

    // Add status history entry
    const statusHistoryEntry = {
      status: status,
      changedBy: (session.user as any).id,
      changedByRole: 'admin' as const,
      changedByName: session.user.name || 'Admin',
      timestamp: new Date(),
      notes: notes || '',
      reason: rejectionReason || '',
    }

    updateData.$push = { statusHistory: statusHistoryEntry }

    const application = await VisaApplication.findByIdAndUpdate(
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

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
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

      // If agent is assigned, send notification to agent
      if (agentId && agentId !== currentApplication.agentId?.toString()) {
        const agent = await Agent.findById(agentId).populate(
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
