import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import { CSRF_HEADER, CSRF_COOKIE_NAME, validateCsrfTokens } from '@/lib/csrf'
import { emailService } from '@/lib/emailService'
import Visa from '@/models/Visa'
import User from '@/models/User'
import Notification from '@/models/Notification'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Payment-complete API called')
    const session = await getServerSession(authOptions)
    let userId = (session?.user as any)?.id

    console.log('👤 Session check:', {
      hasSession: !!session,
      hasUserId: !!userId,
      userId: userId,
    })

    const body = await request.json()
    const {
      applicationId,
      trackingId,
      finalAmount,
      couponDiscount,
      paymentId,
      paymentMethod,
      orderId,
    } = body

    // Verify payment first - if payment is verified, we can proceed even without session
    // This handles cases where session is temporarily lost after returning from payment gateway
    let paymentVerified = false
    const verifyOrderId = orderId || paymentId

    if (verifyOrderId) {
      try {
        console.log(
          '🔍 Verifying payment via Cashfree API for orderId:',
          verifyOrderId
        )
        const verifyUrl = `${request.nextUrl.origin}/api/payments/cashfree/verify?order_id=${verifyOrderId}`
        const verifyRes = await fetch(verifyUrl, { method: 'GET' })
        const verifyData = await verifyRes.json()

        if (verifyRes.ok) {
          paymentVerified =
            verifyData.success &&
            (verifyData.status === 'success' || verifyData.verified === true)
        } else {
          console.error('❌ Payment verification failed:', verifyData)
        }
      } catch (e) {
        console.error('❌ Payment verification error:', e)
      }
    }

    // If no userId but payment is verified, try to find application and get userId from it
    if (
      !userId &&
      paymentVerified &&
      (applicationId || trackingId || orderId || paymentId)
    ) {
      console.log(
        '⚠️ No userId in session, but payment is verified. Attempting to find application...'
      )
      await connectDB()

      // Try to find application by any available identifier
      let tempApplication = null
      if (applicationId) {
        tempApplication = await VisaApplication.findById(applicationId)
      } else if (trackingId && !trackingId.startsWith('order_')) {
        tempApplication = await VisaApplication.findOne({ trackingId })
      } else if (orderId || paymentId) {
        const searchId = orderId || paymentId
        tempApplication = await VisaApplication.findOne({
          $or: [
            { 'paymentDetails.orderId': searchId },
            { paymentId: searchId },
            { 'paymentDetails.paymentId': searchId },
          ],
        })
      }

      if (tempApplication && tempApplication.userId) {
        userId = tempApplication.userId
        console.log('✅ Found userId from application:', userId)
      } else {
        console.error(
          '❌ Could not find application or userId even with verified payment'
        )
      }
    }

    // If still no userId, return error (but allow verified payments to proceed if we can find the app)
    if (!userId && !paymentVerified) {
      console.error(
        '❌ Unauthorized: No userId found in session and payment not verified'
      )
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Either applicationId, trackingId, orderId, or paymentId is required, along with finalAmount
    if (
      (!applicationId && !trackingId && !orderId && !paymentId) ||
      !finalAmount
    ) {
      return NextResponse.json(
        {
          error:
            'Either Application ID, Tracking ID, Order ID, or Payment ID, and final amount are required',
        },
        { status: 400 }
      )
    }

    // CSRF validation - but allow bypass if we can verify payment was successful
    const headerToken = request.headers.get(CSRF_HEADER) || undefined
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
    const hasValidCsrf = validateCsrfTokens(headerToken, cookieToken)

    // If CSRF is valid, we can trust the request - mark as verified for search purposes
    if (hasValidCsrf) {
      paymentVerified = true
    }

    // Require either valid CSRF or verified payment
    if (!hasValidCsrf && !paymentVerified) {
      console.error('❌ CSRF validation failed and payment not verified')
      return NextResponse.json(
        {
          error: 'Invalid CSRF token or unverified payment',
        },
        { status: 403 }
      )
    }

    await connectDB()

    // Find the application - use applicationId first (most reliable)
    let application = null

    // FIRST PRIORITY: Direct lookup by applicationId (most reliable)
    if (applicationId) {
      try {
        application = await VisaApplication.findOne({
          _id: applicationId,
          userId: userId,
        })

        if (!application && paymentVerified) {
          application = await VisaApplication.findById(applicationId)
        }
      } catch (e) {
        console.error('Error searching by applicationId:', e)
        // Error searching by applicationId - continue to other methods
      }
    }

    // SECOND PRIORITY: Try to find by trackingId if it's provided and looks like a real tracking ID
    if (!application && trackingId && !trackingId.startsWith('order_')) {
      application = await VisaApplication.findOne({
        trackingId,
        userId: userId,
      })
    }

    // If not found, try searching by orderId or paymentId
    if (!application && (orderId || paymentId)) {
      const searchId = orderId || paymentId

      // Build comprehensive search query
      const searchQuery: any = {
        $or: [
          { 'paymentDetails.orderId': searchId },
          { paymentId: searchId },
          // Also try searching by the orderId as paymentId (Cashfree might return it as paymentId)
          { 'paymentDetails.paymentId': searchId },
        ],
      }

      // If trackingId looks like an order ID, also search by it
      if (
        trackingId &&
        (trackingId.startsWith('order_') || trackingId === searchId)
      ) {
        searchQuery.$or.push({ trackingId: trackingId })
      }

      // First try with userId
      application = await VisaApplication.findOne({
        ...searchQuery,
        userId: userId,
      })

      // If not found and payment is verified, try without userId
      if (!application && paymentVerified) {
        application = await VisaApplication.findOne(searchQuery)
      }

      // Also try searching by any orderId pattern (Cashfree order IDs start with "order_")
      if (!application && searchId.startsWith('order_')) {
        // Try to find by matching the orderId in various fields
        const fallbackQuery = {
          $or: [
            { 'paymentDetails.orderId': { $regex: searchId, $options: 'i' } },
            { paymentId: { $regex: searchId, $options: 'i' } },
            { trackingId: searchId },
          ],
        }
        application = await VisaApplication.findOne({
          ...fallbackQuery,
          userId: userId,
        })

        if (!application && paymentVerified) {
          application = await VisaApplication.findOne(fallbackQuery)
        }
      }
    }

    // Last resort: if we still have trackingId, try searching without userId
    if (!application && trackingId && paymentVerified) {
      application = await VisaApplication.findOne({
        trackingId: trackingId,
      })
    }

    // Final fallback: if payment is verified, find the most recent pending application for this user
    if (!application && paymentVerified && userId) {
      const pendingApps = await VisaApplication.find({
        userId: userId,
        paymentStatus: 'pending',
        status: { $in: ['Pending', 'draft', 'pending'] },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()

      if (pendingApps.length > 0) {
        const matchedApp = pendingApps.find((app: any) => {
          const appOrderId = app.paymentDetails?.orderId || app.paymentId
          return (
            appOrderId === verifyOrderId ||
            appOrderId === orderId ||
            appOrderId === paymentId ||
            app.trackingId === verifyOrderId ||
            app.trackingId === orderId ||
            app.trackingId === paymentId
          )
        })

        if (matchedApp) {
          application = await VisaApplication.findById(matchedApp._id)
        } else if (pendingApps.length === 1) {
          application = await VisaApplication.findById(pendingApps[0]._id)
        } else {
          application = await VisaApplication.findById(pendingApps[0]._id)
        }
      }
    }

    // Last resort: if still not found and we have orderId, try searching ALL applications (not just pending)
    // This is a safety net in case the payment status was already updated
    if (!application && (orderId || paymentId) && userId) {
      const searchId = orderId || paymentId
      application = await VisaApplication.findOne({
        userId: userId,
        $or: [
          { 'paymentDetails.orderId': searchId },
          { paymentId: searchId },
          { 'paymentDetails.gatewayOrderId': searchId },
        ],
      })
    }
    if (!application) {
      console.error('❌ Application not found:', {
        applicationId,
        trackingId,
        orderId,
        paymentId,
        userId,
      })
      return NextResponse.json(
        {
          error: 'Application not found',
        },
        { status: 404 }
      )
    }

    // Idempotency: if already completed, still try to send emails if they haven't been sent
    // This handles cases where payment was completed but emails failed
    if (application.paymentStatus === 'completed') {
      console.log(
        '⚠️ Payment already completed, but checking if emails need to be sent...'
      )

      // Still try to send emails if email exists and payment is completed
      if (application.personalInfo?.email) {
        try {
          const visa = await Visa.findById(application.visaId)
          const customerName = `${application.personalInfo.firstName} ${application.personalInfo.lastName}`

          console.log(
            '📧 Payment already completed, but sending emails anyway to:',
            application.personalInfo.email
          )

          // Send application submitted email
          await emailService.sendApplicationSubmitted(
            application.personalInfo.email,
            application.trackingId,
            {
              customerName: customerName,
              country:
                visa?.country || application.visaDetails?.country || 'N/A',
              visaType:
                visa?.visaType || application.visaDetails?.visaType || 'N/A',
              processingTime:
                visa?.processingTimeQuote ||
                visa?.processingTime ||
                visa?.processingTimeValue ||
                application.visaDetails?.processingTime ||
                'N/A',
            }
          )

          // Send invoice email
          const invoiceNumber = `INV-${application.trackingId || (application._id as any)?.toString().slice(-8).toUpperCase() || 'UNKNOWN'}`
          const invoiceDate = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          await emailService.sendInvoiceEmail(
            application.personalInfo.email,
            customerName,
            {
              trackingId: application.trackingId,
              invoiceNumber,
              invoiceDate,
              baseAmount: application.baseAmount || 0,
              convenienceFees: application.convenienceFees || { total: 0 },
              couponDiscount: application.couponDiscount,
              totalAmount: application.totalAmount,
              paymentMethod: application.paymentMethod || 'online',
              paymentId: application.paymentId,
              orderId:
                (application.paymentDetails as any)?.orderId || undefined,
              visaDetails: {
                country:
                  visa?.country || application.visaDetails?.country || 'N/A',
                visaType:
                  visa?.visaType || application.visaDetails?.visaType || 'N/A',
                processingTime:
                  visa?.processingTimeQuote ||
                  visa?.processingTime ||
                  application.visaDetails?.processingTime ||
                  'N/A',
              },
            }
          )

          console.log('✅ Emails sent for already-completed payment')
        } catch (emailError) {
          console.error(
            '❌ Error sending emails for already-completed payment:',
            emailError
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment already completed',
        application: {
          trackingId: application.trackingId,
          totalAmount: application.totalAmount,
          paymentStatus: application.paymentStatus,
          couponDiscount: application.couponDiscount,
        },
      })
    }

    // Update the application with final payment details
    // IMPORTANT: Use the application's existing totalAmount if it exists and is valid
    // The finalAmount from callback might be incorrect (e.g., base amount without fees)
    // The application.totalAmount should already include fees and discount from pre-create
    const amountNumber =
      typeof finalAmount === 'string' ? parseFloat(finalAmount) : finalAmount

    // Use application's totalAmount if it exists and is valid, otherwise use finalAmount
    // This ensures we preserve the correct amount (with fees and discount) that was calculated during pre-create
    const finalTotalAmount =
      application.totalAmount && application.totalAmount > 0
        ? application.totalAmount
        : amountNumber

    // Determine the new status: ALWAYS set to 'Submitted' when payment is completed
    // unless already in a final state (Approved, Rejected, etc.)
    const currentStatus = application.status?.toLowerCase() || ''

    // Final states that should not be changed
    const finalStates = ['approved', 'rejected', 'cancelled', 'completed']
    const isFinalState = finalStates.includes(currentStatus)

    // Always set to Submitted if payment is successful (unless already in a final state)
    const newStatus = isFinalState
      ? application.status // Keep final states as-is
      : 'Submitted' // Always set to Submitted when payment completes

    const updateData: any = {
      totalAmount: finalTotalAmount, // Use the preserved totalAmount (with fees and discount)
      paymentStatus: 'completed',
      status: newStatus, // Transition from Pending/abandoned/draft to Submitted after successful payment
    }

    // Add coupon discount information if provided
    if (couponDiscount) {
      updateData.couponDiscount = {
        couponCode: couponDiscount.couponCode,
        discountAmount: couponDiscount.discountAmount,
        discountType: couponDiscount.discountType,
      }
    }

    // Add payment details if provided
    if (paymentId) {
      updateData.paymentId = paymentId
    }

    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod
    }

    if (orderId) {
      const existingPaymentDetails =
        (application as any)?.paymentDetails &&
        typeof (application as any).paymentDetails === 'object'
          ? (application as any).paymentDetails
          : {}
      updateData.paymentDetails = { ...existingPaymentDetails, orderId }
    }

    // Always send email notification when payment is completed successfully
    // unless the status is already in a final state (which means it was already processed)
    const shouldSendEmail = !isFinalState && newStatus === 'Submitted'

    const updatedApplication = await VisaApplication.findByIdAndUpdate(
      application._id,
      {
        $set: {
          ...updateData,
          // Explicitly set status and paymentStatus to ensure they're updated
          status: newStatus,
          paymentStatus: 'completed',
        },
        $push: {
          statusHistory: {
            status: newStatus.toLowerCase(),
            changedBy: userId,
            changedByRole: 'user',
            changedByName: session?.user?.name || 'User',
            timestamp: new Date(),
            notes: 'Payment completed successfully',
            reason: '',
          },
        },
      },
      { new: true, runValidators: true }
    ).populate(
      'visaId',
      'country visaType processingTime processingTimeQuote processingTimeValue'
    )

    if (!updatedApplication) {
      return NextResponse.json(
        { error: 'Application update failed' },
        { status: 500 }
      )
    }

    // Verify the update actually worked
    const verifyApplication = await VisaApplication.findById(application._id)

    if (
      verifyApplication?.status !== newStatus ||
      verifyApplication?.paymentStatus !== 'completed'
    ) {
      console.error('Payment status update verification failed:', {
        expected: { status: newStatus, paymentStatus: 'completed' },
        actual: {
          status: verifyApplication?.status,
          paymentStatus: verifyApplication?.paymentStatus,
        },
      })
    }

    // Send email notification if payment is completed
    console.log('📧 Email sending check:', {
      shouldSendEmail,
      hasEmail: !!updatedApplication.personalInfo?.email,
      email: updatedApplication.personalInfo?.email,
      status: newStatus,
      isFinalState,
      currentStatus: application.status,
      paymentStatus: updatedApplication.paymentStatus,
      paymentStatusCompleted: updatedApplication.paymentStatus === 'completed',
    })

    // Always try to send emails if payment is completed and email exists
    // Simplified condition: just check if payment is completed and email exists
    const shouldSendEmails =
      updatedApplication.paymentStatus === 'completed' &&
      !!updatedApplication.personalInfo?.email

    console.log('📧 Final email decision:', {
      shouldSendEmails,
      paymentStatus: updatedApplication.paymentStatus,
      newStatus,
      hasEmail: !!updatedApplication.personalInfo?.email,
      email: updatedApplication.personalInfo?.email,
      personalInfo: updatedApplication.personalInfo,
    })

    // FORCE email sending if payment is completed - don't rely on shouldSendEmails alone
    // This ensures emails are sent even if there are edge cases
    if (
      shouldSendEmails ||
      (updatedApplication.paymentStatus === 'completed' &&
        updatedApplication.personalInfo?.email)
    ) {
      try {
        // Get visa details for email
        const visa = await Visa.findById(updatedApplication.visaId)
        const customerName = `${updatedApplication.personalInfo.firstName} ${updatedApplication.personalInfo.lastName}`

        console.log(
          '📧 Sending application submitted email to:',
          updatedApplication.personalInfo.email
        )

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
        console.error('❌ Email error details:', {
          message:
            emailError instanceof Error ? emailError.message : 'Unknown error',
          stack: emailError instanceof Error ? emailError.stack : undefined,
        })
        // Don't fail the request if email fails
      }

      // Notify Admins about new application (post-payment)
      try {
        const admins = await User.find({ role: 'admin' })
        const adminNotifications = admins.map(admin => ({
          recipient: admin._id,
          type: 'application',
          title: 'New Visa Application',
          message: `User ${updatedApplication.personalInfo.firstName} ${updatedApplication.personalInfo.lastName} has submitted a new visa application (${updatedApplication.trackingId}).`,
          relatedId: updatedApplication._id,
          relatedType: 'visa-application',
          isRead: false,
          priority: 'medium',
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        if (adminNotifications.length > 0) {
          await Notification.insertMany(adminNotifications)
        }
      } catch (notificationError) {
        console.error('Admin notification error:', notificationError)
      }
    } else {
      console.error('❌ Cannot send application submitted email:', {
        paymentStatus: updatedApplication.paymentStatus,
        hasEmail: !!updatedApplication.personalInfo?.email,
        email: updatedApplication.personalInfo?.email,
        shouldSendEmails,
        personalInfoKeys: updatedApplication.personalInfo
          ? Object.keys(updatedApplication.personalInfo)
          : 'no personalInfo',
        fullPersonalInfo: JSON.stringify(updatedApplication.personalInfo),
      })
    }

    // Send invoice email after successful payment (always send if payment completed)
    if (
      updatedApplication.paymentStatus === 'completed' &&
      updatedApplication.personalInfo?.email
    ) {
      try {
        const visa = await Visa.findById(updatedApplication.visaId)
        const customerName = `${updatedApplication.personalInfo.firstName} ${updatedApplication.personalInfo.lastName}`

        // Generate invoice number (using trackingId or timestamp-based)
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
        '❌ Cannot send invoice email: No email address found in personalInfo'
      )
    }

    // Return the updated application with verified status and paymentStatus
    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      application: {
        _id:
          (updatedApplication as any)._id?.toString() || updatedApplication._id,
        trackingId: updatedApplication.trackingId,
        totalAmount: updatedApplication.totalAmount,
        paymentStatus:
          verifyApplication?.paymentStatus || updatedApplication.paymentStatus,
        status: verifyApplication?.status || updatedApplication.status,
        couponDiscount: updatedApplication.couponDiscount,
      },
    })
  } catch (error) {
    console.error('Payment completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete payment' },
      { status: 500 }
    )
  }
}
