import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import PaymentMethod from '@/models/PaymentMethod'
import VisaApplication from '@/models/VisaApplication'
import TravelInsuranceApplication from '@/models/TravelInsuranceApplication'
import crypto from 'crypto'

/**
 * Cashfree Webhook Handler
 *
 * This endpoint receives webhook events from Cashfree when payment status changes.
 * The webhook URL is set as 'notify_url' in the order_meta object when creating orders.
 *
 * Supported Events:
 * - PAYMENT_SUCCESS
 * - PAYMENT_FAILED
 * - PAYMENT_USER_DROPPED
 *
 * Webhook URL: {NEXTAUTH_URL}/api/payments/cashfree/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-cashfree-signature')

    console.log('📥 Cashfree Webhook Received:', {
      event: body.type || body.event || 'unknown',
      orderId: body.data?.order?.order_id || body.orderId,
      paymentStatus: body.data?.payment?.payment_status || body.paymentStatus,
      timestamp: new Date().toISOString(),
    })

    await connectDB()

    // Get webhook secret from PaymentMethod collection (new system)
    const paymentMethod = await PaymentMethod.findOne({
      gateway: 'cashfree',
    }).lean()
    const webhookSecret = paymentMethod?.webhookSecret

    // Fallback to CompanySettings if PaymentMethod doesn't have webhook secret
    let fallbackSecret = null
    if (!webhookSecret) {
      const CompanySettings = (await import('@/models/CompanySettings')).default
      const settings = await CompanySettings.findOne({}).lean()
      fallbackSecret = (settings?.paymentGateways as any)?.cashfree
        ?.webhookSecret
    }

    const secretToUse = webhookSecret || fallbackSecret

    // Verify webhook signature if secret is configured
    if (secretToUse && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secretToUse)
        .update(JSON.stringify(body))
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
      console.log('✅ Webhook signature verified')
    } else if (secretToUse && !signature) {
      console.warn('⚠️ Webhook secret configured but no signature received')
    }

    // Extract payment data from webhook payload
    // Cashfree webhook format can vary, handle both formats
    const orderId =
      body.data?.order?.order_id || body.orderId || body.data?.orderId
    const orderAmount =
      body.data?.order?.order_amount ||
      body.orderAmount ||
      body.data?.orderAmount
    const paymentStatus =
      body.data?.payment?.payment_status ||
      body.paymentStatus ||
      body.data?.paymentStatus
    const paymentId =
      body.data?.payment?.cf_payment_id ||
      body.paymentId ||
      body.data?.paymentId
    const paymentMessage =
      body.data?.payment?.payment_message ||
      body.paymentMessage ||
      body.data?.paymentMessage
    const paymentTime =
      body.data?.payment?.payment_time ||
      body.paymentTime ||
      body.data?.paymentTime

    if (!orderId) {
      console.error('❌ Webhook missing order ID:', body)
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    console.log('🔍 Processing webhook for order:', {
      orderId,
      orderAmount,
      paymentStatus,
      paymentId,
    })

    // Find application by order ID (check both Visa and Travel Insurance)
    let application = await VisaApplication.findOne({
      $or: [
        { trackingId: orderId },
        { paymentId: orderId },
        { 'paymentDetails.orderId': orderId },
      ],
    })

    let applicationType = 'visa'

    // If not found in Visa applications, check Travel Insurance
    if (!application) {
      application = await TravelInsuranceApplication.findOne({
        $or: [
          { trackingId: orderId },
          { paymentId: orderId },
          { 'paymentDetails.orderId': orderId },
        ],
      })
      applicationType = 'travel-insurance'
    }

    if (!application) {
      console.warn('⚠️ Application not found for order ID:', orderId)
      // Still return success to Cashfree to acknowledge receipt
      return NextResponse.json({
        success: true,
        message: 'Webhook received but application not found',
      })
    }

    // Update payment status based on webhook event
    const statusMap: Record<string, string> = {
      SUCCESS: 'completed',
      FAILED: 'failed',
      USER_DROPPED: 'cancelled',
      PAID: 'completed',
      ACTIVE: 'pending',
    }

    const newPaymentStatus = statusMap[paymentStatus] || 'pending'

    // Determine application status: if payment completed, set to 'Submitted'
    // Also normalize any lowercase 'submitted' or 'pending' to proper case
    let newApplicationStatus = application.status
    if (newPaymentStatus === 'completed') {
      const currentStatus = application.status?.toLowerCase()
      if (
        currentStatus === 'pending' ||
        currentStatus === 'draft' ||
        currentStatus === 'abandoned' ||
        currentStatus === 'submitted'
      ) {
        newApplicationStatus = 'Submitted'
      } else if (
        ![
          'under_review',
          'assigned_to_agent',
          'in_embassy',
          'approved',
          'rejected',
          'completed',
          'cancelled',
        ].includes(application.status)
      ) {
        newApplicationStatus = 'Submitted'
      }
    }

    const updateData: any = {
      paymentStatus: newPaymentStatus,
      paymentMethod: 'cashfree',
      updatedAt: new Date(),
    }

    // Update application status to "Submitted" when payment is completed
    if (
      newPaymentStatus === 'completed' &&
      newApplicationStatus !== application.status
    ) {
      updateData.status = newApplicationStatus
    }

    if (paymentId) {
      updateData.paymentId = paymentId
    }

    if (orderAmount) {
      updateData.totalAmount = orderAmount
    }

    if (paymentTime) {
      updateData.paymentDate = new Date(paymentTime)
    }

    // Update the appropriate application with status history
    const updateOperation: any = {
      $set: updateData,
    }

    // Add status history entry if status changed
    if (
      newPaymentStatus === 'completed' &&
      newApplicationStatus !== application.status
    ) {
      updateOperation.$push = {
        statusHistory: {
          status: newApplicationStatus.toLowerCase(),
          changedBy: application.userId,
          changedByRole: 'system',
          changedByName: 'Payment System',
          timestamp: new Date(),
          notes: 'Payment completed via webhook',
          reason: '',
        },
      }
    }

    if (applicationType === 'visa') {
      await VisaApplication.findByIdAndUpdate(application._id, updateOperation)
    } else {
      await TravelInsuranceApplication.findByIdAndUpdate(
        application._id,
        updateOperation
      )
    }

    console.log('✅ Application updated:', {
      applicationId: application._id,
      applicationType,
      newStatus,
      orderId,
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderId,
      status: newStatus,
    })
  } catch (error: any) {
    console.error('❌ Cashfree webhook error:', {
      message: error.message,
      stack: error.stack,
      body: error.body,
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
