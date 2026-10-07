import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import PaymentMethod from '@/models/PaymentMethod'
import { paymentGatewayRegistry } from '@/lib/payment-gateways/PaymentGatewayRegistry'
import '@/lib/payment-gateways/implementations' // Register gateways

/**
 * @deprecated Use /api/payments/create-order instead
 * This endpoint is kept for backward compatibility
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, orderId, customerDetails, orderNote } = body

    if (!amount || !orderId) {
      return NextResponse.json(
        {
          error: 'Amount and Order ID are required',
        },
        { status: 400 }
      )
    }

    await connectDB()

    // Use new unified system
    const gateway = paymentGatewayRegistry.get('cashfree')
    if (!gateway) {
      return NextResponse.json(
        {
          error: 'Cashfree gateway not available',
        },
        { status: 400 }
      )
    }

    // Get Cashfree settings from PaymentMethod collection
    const paymentMethod = await PaymentMethod.findOne({
      gateway: 'cashfree',
    }).lean()
    if (!paymentMethod) {
      return NextResponse.json(
        {
          error: 'Cashfree not configured',
        },
        { status: 400 }
      )
    }

    const cashfreeConfig = {
      gateway: paymentMethod.gateway,
      isActive: paymentMethod.isActive,
      appId: paymentMethod.appId,
      secretKey: paymentMethod.secretKey,
      environment: paymentMethod.environment,
      webhookSecret: paymentMethod.webhookSecret,
    }

    // Use unified gateway system
    const orderResponse = await gateway.createOrder(
      {
        amount,
        orderId,
        customerDetails: {
          name: customerDetails?.name || session.user.name || 'Customer',
          email: customerDetails?.email || session.user.email || '',
          phone: customerDetails?.phone || '',
          id: session.user.id.toString(),
        },
        orderNote: orderNote || 'Visa application payment',
      },
      cashfreeConfig
    )

    return NextResponse.json({
      success: true,
      paymentSessionId: orderResponse.paymentSessionId,
      orderId: orderId,
      amount: amount,
    })
  } catch (error: any) {
    console.error('Cashfree order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
