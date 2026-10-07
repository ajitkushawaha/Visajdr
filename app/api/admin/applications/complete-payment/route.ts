import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import { emailService } from '@/lib/emailService'
import Visa from '@/models/Visa'

/**
 * Admin endpoint to manually verify and complete payment for an application
 * This bypasses CSRF since it's server-side admin action
 */
export async function POST(request: NextRequest) {
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
      trackingId,
      orderId,
      finalAmount,
      paymentId,
      paymentMethod,
    } = body

    if (!applicationId && !trackingId && !orderId) {
      return NextResponse.json(
        { error: 'Application ID, Tracking ID, or Order ID is required' },
        { status: 400 }
      )
    }

    // Find the application
    let application = null

    if (applicationId) {
      application = await VisaApplication.findById(applicationId)
    } else if (trackingId) {
      application = await VisaApplication.findOne({ trackingId })
    } else if (orderId) {
      application = await VisaApplication.findOne({
        $or: [
          { 'paymentDetails.orderId': orderId },
          { paymentId: orderId },
          { trackingId: orderId },
        ],
      })
    }
    console.log('application in 54 ', application)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // If already completed, return current state
    if (application.paymentStatus === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Payment already completed',
        application: {
          _id: (application._id as any)?.toString() || application._id,
          trackingId: application.trackingId,
          totalAmount: application.totalAmount,
          paymentStatus: application.paymentStatus,
          status: application.status,
        },
      })
    }

    // Determine the new status
    const currentStatus = application.status?.toLowerCase()
    const newStatus =
      currentStatus === 'pending' ||
      currentStatus === 'abandoned' ||
      currentStatus === 'draft'
        ? 'Submitted'
        : currentStatus === 'submitted'
          ? 'Submitted'
          : application.status

    // Prepare update data
    const updateData: any = {
      paymentStatus: 'completed',
      status: newStatus,
    }

    if (finalAmount) {
      const amountNumber =
        typeof finalAmount === 'string' ? parseFloat(finalAmount) : finalAmount
      updateData.totalAmount = amountNumber
    }

    if (paymentId) {
      updateData.paymentId = paymentId
    }

    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod
    } else if (!application.paymentMethod) {
      updateData.paymentMethod = 'cashfree' // Default
    }

    if (orderId) {
      const existingPaymentDetails =
        (application as any)?.paymentDetails &&
        typeof (application as any).paymentDetails === 'object'
          ? (application as any).paymentDetails
          : {}
      updateData.paymentDetails = { ...existingPaymentDetails, orderId }
    }

    // Update application with status history
    const updatedApplication = await VisaApplication.findByIdAndUpdate(
      application._id,
      {
        $set: updateData,
        $push: {
          statusHistory: {
            status: newStatus.toLowerCase(),
            changedBy: (session.user as any).id,
            changedByRole: 'admin',
            changedByName: session.user.name || 'Admin',
            timestamp: new Date(),
            notes: 'Payment manually completed by admin',
            reason: '',
          },
        },
      },
      { new: true }
    )

    if (!updatedApplication) {
      return NextResponse.json(
        { error: 'Application update failed' },
        { status: 500 }
      )
    }

    // Send email notifications if payment is completed and email exists
    const shouldSendEmails =
      updatedApplication.paymentStatus === 'completed' &&
      !!updatedApplication.personalInfo?.email

    if (shouldSendEmails) {
      try {
        // Get visa details for email
        const visa = await Visa.findById(updatedApplication.visaId)
        const customerName = `${updatedApplication.personalInfo.firstName} ${updatedApplication.personalInfo.lastName}`

        console.log(
          '📧 Sending application submitted email to:',
          updatedApplication.personalInfo.email
        )

        // Send application submitted email
        const emailSent = await emailService.sendApplicationSubmitted(
          updatedApplication.personalInfo.email,
          updatedApplication.trackingId,
          {
            customerName: customerName,
            country:
              visa?.country || updatedApplication.visaDetails?.country || 'N/A',
            visaType:
              visa?.visaType ||
              updatedApplication.visaDetails?.visaType ||
              'N/A',
            processingTime:
              visa?.processingTimeQuote ||
              visa?.processingTime ||
              visa?.processingTimeValue ||
              updatedApplication.visaDetails?.processingTime ||
              'N/A',
          }
        )

        if (emailSent) {
          console.log(
            '✅ Application submitted email sent successfully to:',
            updatedApplication.personalInfo.email
          )
        } else {
          console.error(
            '❌ Failed to send application submitted email to:',
            updatedApplication.personalInfo.email
          )
        }
      } catch (emailError) {
        console.error('❌ Email notification error:', emailError)
        // Don't fail the request if email fails
      }

      // Send invoice email
      try {
        const visa = await Visa.findById(updatedApplication.visaId)
        const customerName = `${updatedApplication.personalInfo.firstName} ${updatedApplication.personalInfo.lastName}`

        // Generate invoice number
        const invoiceNumber = `INV-${updatedApplication.trackingId || (updatedApplication._id as any)?.toString().slice(-8).toUpperCase() || 'UNKNOWN'}`
        const invoiceDate = new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        console.log(
          '📧 Sending invoice email to:',
          updatedApplication.personalInfo.email
        )

        const invoiceEmailSent = await emailService.sendInvoiceEmail(
          updatedApplication.personalInfo.email,
          customerName,
          {
            trackingId: updatedApplication.trackingId,
            invoiceNumber,
            invoiceDate,
            baseAmount: updatedApplication.baseAmount || 0,
            convenienceFees: updatedApplication.convenienceFees || {
              total: 0,
            },
            couponDiscount: updatedApplication.couponDiscount,
            totalAmount: updatedApplication.totalAmount,
            paymentMethod: updatedApplication.paymentMethod || 'online',
            paymentId: updatedApplication.paymentId,
            orderId:
              (updatedApplication.paymentDetails as any)?.orderId || undefined,
            visaDetails: {
              country:
                visa?.country ||
                updatedApplication.visaDetails?.country ||
                'N/A',
              visaType:
                visa?.visaType ||
                updatedApplication.visaDetails?.visaType ||
                'N/A',
              processingTime:
                visa?.processingTimeQuote ||
                visa?.processingTime ||
                updatedApplication.visaDetails?.processingTime ||
                'N/A',
            },
          }
        )

        if (invoiceEmailSent) {
          console.log(
            '✅ Invoice email sent successfully to:',
            updatedApplication.personalInfo.email
          )
        } else {
          console.error(
            '❌ Failed to send invoice email to:',
            updatedApplication.personalInfo.email
          )
        }
      } catch (invoiceEmailError) {
        console.error('❌ Invoice email error:', invoiceEmailError)
        // Don't fail the request if invoice email fails
      }
    } else if (
      updatedApplication.paymentStatus === 'completed' &&
      !updatedApplication.personalInfo?.email
    ) {
      console.error(
        '❌ Cannot send emails: No email address found in personalInfo'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      application: {
        _id:
          (updatedApplication._id as any)?.toString() || updatedApplication._id,
        trackingId: updatedApplication.trackingId,
        totalAmount: updatedApplication.totalAmount,
        paymentStatus: updatedApplication.paymentStatus,
        status: updatedApplication.status,
      },
    })
  } catch (error: any) {
    console.error('Admin payment completion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete payment' },
      { status: 500 }
    )
  }
}
