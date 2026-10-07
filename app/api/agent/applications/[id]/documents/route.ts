import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import Agent from '@/models/Agent'
import mongoose from 'mongoose'
import { emailService } from '@/lib/emailService'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'agent') {
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

    const agent = await Agent.findOne({ userId: (session.user as any).id })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const application = await VisaApplication.findById(id)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.agentId?.toString() !== agent._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updateField = `documents.${documentType}.status`
    const reasonField = `documents.${documentType}.rejectionReason`

    const updateData: any = {
      [updateField]: status,
    }

    if (status === 'rejected') {
      updateData[reasonField] = rejectionReason
    } else {
      updateData[reasonField] = ''
    }

    const historyEntry = {
      status: `Document ${documentType} ${status}`,
      changedBy: new mongoose.Types.ObjectId((session.user as any).id),
      changedByRole: 'agent',
      changedByName: agent.personalDetails.fullName,
      timestamp: new Date(),
      reason: rejectionReason,
    }

    const updated = await VisaApplication.findByIdAndUpdate(
      id,
      {
        $set: updateData,
        $push: { statusHistory: historyEntry },
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json(
        { error: 'Application not found after update' },
        { status: 404 }
      )
    }

    try {
      if (status === 'rejected') {
        await emailService.sendDocumentRejected(
          updated.trackingId,
          updated.personalInfo.email,
          rejectionReason || ''
        )
      }
    } catch (emailError) {
      console.error('Error sending document rejected email:', emailError)
    }

    return NextResponse.json({ success: true, application: updated })
  } catch (error) {
    console.error('Error updating document status (agent):', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
