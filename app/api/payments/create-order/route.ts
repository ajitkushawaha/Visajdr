import { NextRequest, NextResponse } from 'next/server'
import { CSRF_HEADER, CSRF_COOKIE_NAME, validateCsrfTokens } from '@/lib/csrf'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/authConfig'
import connectDb from '@/lib/db'
import PaymentMethod from '@/models/PaymentMethod'
import User from '@/models/User'
import { paymentGatewayRegistry } from '@/lib/payment-gateways/PaymentGatewayRegistry'
import '@/lib/payment-gateways/implementations' // Register gateways

type SessionUserWithId = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const userId = (session?.user as SessionUserWithId | undefined)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // CSRF protection: require matching header and cookie
    const headerToken = request.headers.get(CSRF_HEADER) || undefined
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
    if (!validateCsrfTokens(headerToken, cookieToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    const body = await request.json()
    const schema = z.object({
      gatewayId: z.string().trim().min(1, 'Gateway ID is required'),
      // amount is optional; server will derive from application using trackingId
      amount: z.coerce.number().positive('Amount must be positive').optional(),
      orderId: z.string().trim().min(1, 'Order ID is required'),
      trackingId: z.string().trim().min(1, 'Tracking ID is required'),
      customerDetails: z
        .object({
          name: z.string().trim().optional(),
          email: z.string().email().optional(),
          phone: z.string().trim().optional(),
        })
        .optional(),
      orderNote: z.string().trim().optional(),
      metadata: z.record(z.any()).optional(),
    })

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      gatewayId,
      amount: clientAmount,
      orderId,
      trackingId,
      customerDetails,
      orderNote,
      metadata,
    } = parsed.data

    await connectDb()

    // Get gateway from registry
    const gateway = paymentGatewayRegistry.get(gatewayId)
    if (!gateway) {
      return NextResponse.json(
        {
          error: `Payment gateway ${gatewayId} is not supported`,
        },
        { status: 400 }
      )
    }

    // Get gateway config from database
    const paymentMethod = await PaymentMethod.findOne({
      gateway: gatewayId,
    }).lean()
    if (!paymentMethod) {
      return NextResponse.json(
        {
          error: `Payment gateway ${gatewayId} not found in database`,
        },
        { status: 400 }
      )
    }

    if (!paymentMethod.isActive) {
      return NextResponse.json(
        {
          error: `Payment gateway ${gatewayId} is not active`,
        },
        { status: 400 }
      )
    }

    // Convert payment method to config format
    const config: any = {
      gateway: paymentMethod.gateway,
      isActive: paymentMethod.isActive,
      ...(paymentMethod.gateway === 'razorpay' && {
        keyId: paymentMethod.keyId,
        keySecret: paymentMethod.keySecret,
        webhookSecret: paymentMethod.webhookSecret,
      }),
      ...(paymentMethod.gateway === 'stripe' && {
        publishableKey: paymentMethod.publishableKey,
        secretKey: paymentMethod.secretKey,
        webhookSecret: paymentMethod.webhookSecret,
      }),
      ...(paymentMethod.gateway === 'paypal' && {
        clientId: paymentMethod.clientId,
        clientSecret: paymentMethod.clientSecret,
        mode: paymentMethod.mode,
      }),
      ...(paymentMethod.gateway === 'upi' && {
        upiId: paymentMethod.upiId,
        merchantName: paymentMethod.merchantName,
      }),
      ...(paymentMethod.gateway === 'cashfree' && {
        appId: paymentMethod.appId,
        secretKey: paymentMethod.secretKey,
        environment: paymentMethod.environment || 'sandbox',
        webhookSecret: paymentMethod.webhookSecret,
      }),
    }

    // Derive amount from the pre-created application using trackingId
    let amount = clientAmount
    try {
      const VisaApplication = (await import('@/models/VisaApplication')).default

      // Try to find the application - if not found immediately, wait a bit and retry
      // This handles race conditions where pre-create just finished
      // Sort by createdAt desc to get the most recent application
      let application = (await VisaApplication.findOne({
        trackingId,
        userId: userId,
      })
        .select(
          'totalAmount paymentStatus couponDiscount convenienceFees baseAmount'
        )
        .sort({ createdAt: -1 })
        .lean()) as any

      // If not found, wait 500ms and retry (in case pre-create just finished)
      if (!application) {
        await new Promise(resolve => setTimeout(resolve, 500))
        application = (await VisaApplication.findOne({
          trackingId,
          userId: userId,
        })
          .select(
            'totalAmount paymentStatus couponDiscount convenienceFees baseAmount'
          )
          .sort({ createdAt: -1 })
          .lean()) as any
      }

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found for trackingId' },
          { status: 404 }
        )
      }

      if (application.paymentStatus === 'completed') {
        return NextResponse.json(
          { error: 'Payment already completed for this application' },
          { status: 409 }
        )
      }

      // Always use application.totalAmount if it exists (it includes fees and discount)
      // Only fall back to clientAmount if totalAmount is missing or invalid
      amount =
        application.totalAmount && application.totalAmount > 0
          ? application.totalAmount
          : clientAmount

      // Store orderId in paymentDetails for later lookup
      // This will be updated with the actual gateway orderId after order creation
      if (orderId && application._id) {
        try {
          const existingPaymentDetails = application.paymentDetails || {}
          await VisaApplication.findByIdAndUpdate(
            application._id,
            {
              $set: {
                paymentDetails: {
                  ...existingPaymentDetails,
                  orderId: orderId, // Our generated orderId
                },
              },
            },
            { new: true }
          )
        } catch (updateError) {
          // Don't fail the request if this update fails
        }
      }
    } catch (e: any) {
      if (!amount) {
        return NextResponse.json(
          { error: 'Failed to derive amount from application' },
          { status: 500 }
        )
      }
    }

    // Ensure amount is a valid positive number before creating the order
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount for payment order' },
        { status: 400 }
      )
    }

    // Create order using the gateway
    // Cashfree requires customer_phone to be present and non-empty
    // Try to get phone from: 1) customerDetails, 2) user database, 3) default
    let customerPhone = customerDetails?.phone?.trim()

    if (!customerPhone) {
      // Try to fetch from user database
      const user = (await User.findById(userId).select('mobile').lean()) as {
        mobile?: string
      } | null
      customerPhone = user?.mobile?.trim()
    }

    // If still no phone, use default (Cashfree requires non-empty phone)
    if (!customerPhone || customerPhone.length === 0) {
      customerPhone = '9999999999' // Default phone number
    }

    const orderResponse = await gateway.createOrder(
      {
        amount,
        orderId,
        customerDetails: {
          name: customerDetails?.name || session?.user?.name || 'Customer',
          email: customerDetails?.email || session?.user?.email || '',
          phone: customerPhone, // Required by Cashfree - must be non-empty
          id: userId.toString(),
        },
        orderNote: orderNote || 'Payment',
        metadata: {
          ...(metadata || {}),
          trackingId,
        },
      },
      config
    )

    const { success: _success, ...orderPayload } = orderResponse as any

    // Extract the actual gateway orderId (Cashfree returns order_id in response)
    // Cashfree response may have order_id (snake_case) or orderId (camelCase)
    const gatewayOrderId =
      (orderPayload as any)?.orderId ||
      (orderPayload as any)?.order_id ||
      (orderResponse as any)?.order_id ||
      orderId

    // Update application with the gateway orderId for lookup
    let applicationId = null
    try {
      const VisaApplicationModel = (await import('@/models/VisaApplication'))
        .default
      const application = await VisaApplicationModel.findOne({
        trackingId,
        userId: userId,
      })

      if (application && gatewayOrderId) {
        const existingPaymentDetails = application.paymentDetails || {}
        await VisaApplicationModel.findByIdAndUpdate(
          application._id,
          {
            $set: {
              paymentDetails: {
                ...existingPaymentDetails,
                orderId: gatewayOrderId, // Store the gateway orderId (Cashfree order_id)
                gatewayOrderId: gatewayOrderId, // Also store separately for clarity
              },
              paymentId: gatewayOrderId, // Also store as paymentId for lookup
            },
          },
          { new: true }
        )
      }

      // Get application ID to return it for direct lookup
      applicationId = application?._id?.toString() || null
    } catch (e) {
      // If update fails, try to get applicationId anyway
      try {
        const VisaApplicationModel = (await import('@/models/VisaApplication'))
          .default
        const application = (await VisaApplicationModel.findOne({
          trackingId,
          userId: userId,
        })
          .select('_id')
          .lean()) as any
        applicationId = application?._id?.toString() || null
      } catch (e2) {
        // Could not fetch application ID - continue without it
      }
    }

    return NextResponse.json({
      success: true,
      gatewayId,
      ...orderPayload,
      trackingId,
      applicationId, // Return application ID for direct lookup
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment order',
      },
      { status: 500 }
    )
  }
}
