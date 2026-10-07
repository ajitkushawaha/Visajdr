import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import Agent from '@/models/Agent'
import { uploadImage } from '@/lib/cloudinary'
import { emailService } from '@/lib/emailService'
import mongoose from 'mongoose'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (
      !session?.user ||
      !(session.user as any).id ||
      (session.user as any).role !== 'agent'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

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

    const assignedAgentId = application.agentId?.toString()
    if (!assignedAgentId || assignedAgentId !== agent._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const documentType = String(formData.get('documentType') || '').trim()
    const notes = String(formData.get('notes') || '').trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (
      !['submission_proof', 'approval_document', 'rejection_letter'].includes(
        documentType
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    const uploadRes = await uploadImage(
      file,
      `visa-applications/agent/${agent._id.toString()}`
    )

    const set: Record<string, any> = {}
    const now = new Date()
    const docPayload = {
      url: uploadRes.url,
      publicId: uploadRes.publicId,
      originalName: uploadRes.originalName,
      uploadedBy: (session.user as any).id,
      uploadedAt: now,
    }

    if (documentType === 'submission_proof') {
      set['documents.embassySubmissionProof'] = docPayload
      if (application.status !== 'in_embassy') {
        set['status'] = 'in_embassy'
      }
    } else if (documentType === 'approval_document') {
      set['documents.embassyApprovalDocument'] = docPayload
    } else if (documentType === 'rejection_letter') {
      set['documents.embassyRejectionLetter'] = docPayload
      if (notes) {
        set['rejectionReason'] = notes
      }
    }

    const historyEntry =
      documentType === 'submission_proof' && application.status !== 'in_embassy'
        ? {
            status: 'in_embassy',
            changedBy: new mongoose.Types.ObjectId((session.user as any).id),
            changedByRole: 'agent',
            changedByName: agent.personalDetails.fullName,
            timestamp: now,
            notes: 'Embassy submission proof uploaded',
          }
        : null

    const updateOps: any = { $set: set }
    if (historyEntry) {
      updateOps.$push = { statusHistory: historyEntry }
    }

    const updated = await VisaApplication.findByIdAndUpdate(id, updateOps, {
      new: true,
    })
      .populate('visaId', 'country visaType')
      .populate('userId', 'name email')
      .populate(
        'agentId',
        'agentId personalDetails.fullName personalDetails.email'
      )

    if (!updated) {
      return NextResponse.json(
        { error: 'Application not found after update' },
        { status: 404 }
      )
    }

    try {
      if (documentType === 'rejection_letter') {
        await emailService.sendDocumentRejected(
          updated.trackingId,
          updated.personalInfo.email,
          notes || ''
        )
      }
    } catch (emailError) {
      console.error('Document rejected email error:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      application: updated,
    })
  } catch (error) {
    console.error('Agent upload document error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
