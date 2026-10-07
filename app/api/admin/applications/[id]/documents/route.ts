import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import mongoose from 'mongoose'

import { createAndSendNotification } from '@/lib/notificationService'

export async function PATCH(
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
    const { documentType, status, rejectionReason } = body

    if (!['passport', 'photo'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const updateField = `documents.${documentType}.status`
    const reasonField = `documents.${documentType}.rejectionReason`

    const updateData: any = {
      [updateField]: status,
    }

    if (status === 'rejected') {
      updateData[reasonField] = rejectionReason
      // Also update the main application status to 'rejected' if a document is rejected?
      // Or just keep it as 'under_review' but with rejected documents?
      // The user said "reject the application i want like this".
      // Usually, if a document is rejected, the application is effectively paused/rejected until fixed.
      // But let's stick to document status first.
    } else {
      // Clear rejection reason if approved or pending
      updateData[reasonField] = ''
    }

    // Add history entry
    const historyEntry = {
      status: `Document ${documentType} ${status}`,
      changedBy: new mongoose.Types.ObjectId((session.user as any).id),
      changedByRole: 'admin',
      changedByName: (session.user as any).name || 'Admin',
      timestamp: new Date(),
      reason: rejectionReason,
    }

    const application = await VisaApplication.findByIdAndUpdate(
      id,
      {
        $set: updateData,
        $push: { statusHistory: historyEntry },
      },
      { new: true }
    )

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Send notification if rejected
    if (status === 'rejected') {
      try {
        await createAndSendNotification({
          recipient: application.userId.toString(),
          type: 'document_rejected' as any, // Cast to any because we just added it to the enum but types might not be updated
          title: `Action Required: ${
            documentType === 'passport' ? 'Passport' : 'Photo'
          } Rejected`,
          message: `Your ${documentType} was rejected. Reason: ${rejectionReason}. Please log in to your dashboard to upload a new one.`,
          relatedId: (application as any)._id.toString(),
          relatedType: 'visa-application',
          sendEmail: true,
          metadata: {
            documentType: documentType === 'passport' ? 'Passport' : 'Photo',
            rejectionReason: rejectionReason,
            trackingId: application.trackingId,
          },
        })
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    }

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error('Error updating document status:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
