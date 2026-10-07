import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import User from '@/models/User'
import Notification from '@/models/Notification'
import { uploadImage } from '@/lib/cloudinary'
import { emailService } from '@/lib/emailService'

// Upload dynamic documents to an existing application
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const formData = await request.formData()

    // Find the application
    const application = await VisaApplication.findById(id)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify the application belongs to the user
    if (application.userId.toString() !== (session.user as any).id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateQuery: any = {}
    let uploadedCount = 0
    const uploadErrors: string[] = []

    // Handle passport file
    const passportFile = formData.get('passport') as File | null
    if (passportFile && passportFile instanceof File) {
      try {
        const uploadRes = await uploadImage(
          passportFile,
          `visa-applications/${(session.user as any).id}`
        )
        const url = typeof uploadRes === 'string' ? uploadRes : uploadRes.url
        const publicId =
          typeof uploadRes === 'string' ? '' : (uploadRes as any).publicId
        updateQuery['documents.passport.url'] = url
        updateQuery['documents.passport.publicId'] = publicId
        updateQuery['documents.passport.originalName'] = passportFile.name

        // Check if it was previously rejected
        const wasRejected =
          (application as any).documents?.passport?.status === 'rejected'
        updateQuery['documents.passport.status'] = wasRejected
          ? 'reuploaded'
          : 'pending'
        updateQuery['documents.passport.rejectionReason'] = ''

        uploadedCount++
      } catch (error) {
        console.error('Error uploading passport:', error)
        uploadErrors.push(
          `Passport: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    // Handle photo file
    const photoFile = formData.get('photo') as File | null
    if (photoFile && photoFile instanceof File) {
      try {
        const uploadRes = await uploadImage(
          photoFile,
          `visa-applications/${(session.user as any).id}`
        )
        const url = typeof uploadRes === 'string' ? uploadRes : uploadRes.url
        const publicId =
          typeof uploadRes === 'string' ? '' : (uploadRes as any).publicId
        updateQuery['documents.photo.url'] = url
        updateQuery['documents.photo.publicId'] = publicId
        updateQuery['documents.photo.originalName'] = photoFile.name

        // Check if it was previously rejected
        const wasRejected =
          (application as any).documents?.photo?.status === 'rejected'
        updateQuery['documents.photo.status'] = wasRejected
          ? 'reuploaded'
          : 'pending'
        updateQuery['documents.photo.rejectionReason'] = ''

        uploadedCount++
      } catch (error) {
        console.error('Error uploading photo:', error)
        uploadErrors.push(
          `Photo: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    // Handle additional dynamic documents from formData (keys starting with doc_)
    const additionalDocs: Record<string, any> = {}
    const entries = Array.from(formData.entries())
    const docEntries = entries.filter(
      ([k, v]) => k.startsWith('doc_') && v instanceof File
    )

    // Process dynamic documents sequentially to avoid race conditions
    for (const [k, v] of docEntries) {
      const key = k.replace('doc_', '')
      try {
        const uploadRes = await uploadImage(
          v as File,
          `visa-applications/${(session.user as any).id}`
        )
        const url = typeof uploadRes === 'string' ? uploadRes : uploadRes.url
        const publicId =
          typeof uploadRes === 'string' ? '' : (uploadRes as any).publicId

        additionalDocs[key] = {
          url,
          publicId,
          originalName: (v as File).name,
          uploadedAt: new Date(),
        }
        uploadedCount++
      } catch (error) {
        console.error(`Error uploading document ${key}:`, error)
        // Continue processing other documents even if one fails
      }
    }

    // Add additional documents
    if (Object.keys(additionalDocs).length > 0) {
      const existingAdditionalDocs =
        (application.documents?.additionalDocs &&
        typeof application.documents.additionalDocs === 'object'
          ? application.documents.additionalDocs
          : {}) || {}

      updateQuery['documents.additionalDocs'] = {
        ...existingAdditionalDocs,
        ...additionalDocs,
      }
    }

    // Update the application with all documents
    if (Object.keys(updateQuery).length > 0) {
      try {
        const updated = await VisaApplication.findByIdAndUpdate(
          id,
          { $set: updateQuery },
          { new: true, runValidators: false }
        )

        if (!updated) {
          return NextResponse.json(
            { error: 'Application not found after update' },
            { status: 404 }
          )
        }

        // Send notification to admin if documents were reuploaded (status changed to reuploaded)
        const hasReuploads = Object.values(updateQuery).some(
          val => val === 'reuploaded'
        )
        if (hasReuploads) {
          // Find admin users
          const admins = await User.find({ role: 'admin' })

          // Create notifications for each admin
          const notifications = admins.map(admin => ({
            recipient: admin._id,
            type: 'document', // or 'document_reuploaded' if added to enum
            title: 'Documents Reuploaded',
            message: `User ${updated.personalInfo.firstName} ${updated.personalInfo.lastName} has reuploaded documents for application ${updated.trackingId}.`,
            relatedId: updated._id,
            relatedType: 'visa-application',
            isRead: false,
            priority: 'high',
            createdAt: new Date(),
            updatedAt: new Date(),
          }))

          if (notifications.length > 0) {
            await Notification.insertMany(notifications)
          }
        }
      } catch (updateError) {
        console.error('Error updating application:', updateError)
        throw updateError
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Documents uploaded successfully',
      uploadedCount: uploadedCount,
      errors: uploadErrors.length > 0 ? uploadErrors : undefined,
    })
  } catch (error) {
    console.error('Upload documents error:', error)
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    )
  }
}
