import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Cashfree } from 'cashfree-pg'
import ConvenienceFee from '@/models/ConvenienceFee'
import PaymentMethod from '@/models/PaymentMethod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    await connectDB()

    const config = await ConvenienceFee.findOne({}).lean()

    const cashfreeConfig = config?.fees?.paymentMethod?.cashfree
    console.log('🔎 ConvenienceFee paymentMethod.cashfree:', cashfreeConfig)

    const paymentMethod = await PaymentMethod.findOne({
      gateway: 'cashfree',
    }).lean()

    if (!paymentMethod?.appId || !paymentMethod.appId.trim()) {
      return NextResponse.json(
        {
          error:
            'Cashfree App ID is required. Please configure it in admin settings.',
        },
        { status: 400 }
      )
    }

    if (!paymentMethod?.secretKey || !paymentMethod.secretKey.trim()) {
      return NextResponse.json(
        {
          error:
            'Cashfree Secret Key is required. Please configure it in admin settings.',
        },
        { status: 400 }
      )
    }
    // Configure Cashfree SDK using static properties (per migration guide)
    const clientId = paymentMethod.appId.trim()
    const clientSecret = paymentMethod.secretKey.trim()
    const env =
      paymentMethod.environment === 'production' ? 'PRODUCTION' : 'SANDBOX'
    const apiVersion = '2023-08-01'

    try {
      ;(Cashfree as any).XClientId = clientId
      ;(Cashfree as any).XClientSecret = clientSecret
      if ((Cashfree as any).Environment) {
        ;(Cashfree as any).XEnvironment =
          env === 'PRODUCTION'
            ? (Cashfree as any).Environment.PRODUCTION
            : (Cashfree as any).Environment.SANDBOX
      } else {
        ;(Cashfree as any).XEnvironment = env
      }
    } catch (sdkInitError: any) {
      console.error('Cashfree SDK init error:', sdkInitError)
      return NextResponse.json(
        { error: 'Failed to initialize Cashfree SDK' },
        { status: 500 }
      )
    }

    // Fetch order using Cashfree SDK (static method) or fall back to direct API call
    let orderResponse: any
    try {
      if (typeof (Cashfree as any).PGFetchOrder === 'function') {
        const response = await (Cashfree as any).PGFetchOrder(
          apiVersion,
          orderId
        )
        orderResponse = response?.data || response
      } else {
        const baseUrl =
          env === 'PRODUCTION'
            ? 'https://api.cashfree.com'
            : 'https://sandbox.cashfree.com'
        const res = await fetch(`${baseUrl}/pg/orders/${orderId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'x-api-version': apiVersion,
            'x-client-id': clientId,
            'x-client-secret': clientSecret,
          },
        })

        const text = await res.text()
        let data: any
        try {
          data = JSON.parse(text)
        } catch {
          data = { message: text || res.statusText }
        }

        if (!res.ok) {
          throw new Error(
            `Cashfree API error (${res.status}): ${data.message || res.statusText}`
          )
        }

        orderResponse = data
      }
    } catch (sdkError: any) {
      console.error('Cashfree SDK error:', sdkError)
      throw new Error(
        `Cashfree SDK error: ${sdkError.message || 'Unknown error'}`
      )
    }

    if (!orderResponse) {
      throw new Error('Failed to fetch order - no response from Cashfree SDK')
    }

    const paymentStatus =
      orderResponse?.payment_status || orderResponse?.order_status || 'PENDING'
    const paymentMessage =
      orderResponse?.payment_message || orderResponse?.status || undefined

    const isSuccess = paymentStatus === 'PAID' || paymentStatus === 'SUCCESS'
    const normalizedStatus = isSuccess
      ? 'success'
      : paymentStatus === 'ACTIVE' || paymentStatus === 'PENDING'
        ? 'pending'
        : 'failed'

    return NextResponse.json({
      success: true,
      verified: isSuccess,
      status: normalizedStatus,
      orderId: orderResponse?.order_id || orderResponse?.cf_order_id || orderId,
      orderAmount: orderResponse?.order_amount,
      paymentStatus,
      paymentMessage,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
