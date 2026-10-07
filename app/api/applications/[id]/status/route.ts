import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import ApplicationStatus from '@/models/ApplicationStatus'
import { logAuditEvent } from '@/lib/auditLog'
import { z } from 'zod'
import mongoose from 'mongoose'

const bodySchema = z.object({
  status: z.string(), // Accept any string, validate against database
  note: z.string().optional(),
})

/**
 * Internal PATCH /api/applications/:id/status
 * Updates application status and records audit log.
 * Used by payment webhooks to move Pending → Submitted.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    // Allow server-side calls (no session) or logged-in users
    const userId = session ? (session.user as any).id : 'SYSTEM'

    await connectDB()
    const { id } = await params
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { status, note } = parsed.data

    // Validate status exists in database (for dynamic statuses)
    const statusExists = await ApplicationStatus.findOne({
      $or: [{ slug: status }, { name: status }],
      isActive: true,
    })

    // Allow system statuses even if not in database (backward compatibility)
    const systemStatuses = ['Pending', 'Submitted', 'abandoned', 'draft']
    if (!statusExists && !systemStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Status does not exist or is inactive.' },
        { status: 400 }
      )
    }

    const app = await VisaApplication.findById(id)
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Validate transition: only allow Pending → Submitted for payment webhooks
    // For admin/agent updates, allow any valid status transition
    if (app.status === 'Pending' && status === 'Submitted') {
      app.status = 'Submitted'
      console.log(app.status)
    } else if (userId !== 'SYSTEM') {
      // Allow admin/agent to update to any valid status
      app.status = status as any
    } else {
      return NextResponse.json({ error: 'Invalid transition' }, { status: 400 })
    }

    await app.save()

    await (mongoose.models.AuditLog as any).create({
      userId:
        userId === 'SYSTEM'
          ? undefined
          : new mongoose.Types.ObjectId(userId as string),
      action: 'STATUS_CHANGE',
      targetId: new mongoose.Types.ObjectId(app._id as string),
      targetType: 'VisaApplication',
      details: { from: 'Pending', to: 'Submitted', note },
    })

    return NextResponse.json({ success: true, status: app.status })
  } catch (err: any) {
    console.error('[PATCH /applications/:id/status]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
