import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDb from '@/lib/db'
import PaymentMethod from '@/models/PaymentMethod'
import { paymentGatewayRegistry } from '@/lib/payment-gateways/PaymentGatewayRegistry'
import '@/lib/payment-gateways/implementations' // Register gateways

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { gatewayId, orderId, paymentId, signature, amount } = body

    if (!gatewayId || !orderId) {
      return NextResponse.json(
        {
          error: 'Gateway ID and Order ID are required',
        },
        { status: 400 }
      )
    }

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
        environment: paymentMethod.environment,
        webhookSecret: paymentMethod.webhookSecret,
      }),
    }

    // Verify payment using the gateway
    const verifyResponse = await gateway.verifyPayment(
      {
        orderId,
        paymentId,
        signature,
        amount,
      },
      config
    )

    return NextResponse.json({
      success: true,
      gatewayId,
      ...verifyResponse,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify payment',
      },
      { status: 500 }
    )
  }
}
