import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/db'
import PaymentMethod from '@/models/PaymentMethod'

// GET - Fetch all payment methods
export async function GET() {
  try {
    await connectDb()
    const paymentMethods = await PaymentMethod.find({}).lean()

    // Convert to object format for backward compatibility
    const paymentMethodsObj: any = {}
    paymentMethods.forEach(pm => {
      paymentMethodsObj[pm.gateway] = {
        isActive: pm.isActive,
        ...(pm.gateway === 'razorpay' && {
          keyId: pm.keyId || '',
          keySecret: pm.keySecret || '',
          webhookSecret: pm.webhookSecret || '',
        }),
        ...(pm.gateway === 'stripe' && {
          publishableKey: pm.publishableKey || '',
          secretKey: pm.secretKey || '',
          webhookSecret: pm.webhookSecret || '',
        }),
        ...(pm.gateway === 'paypal' && {
          clientId: pm.clientId || '',
          clientSecret: pm.clientSecret || '',
          mode: pm.mode || 'sandbox',
        }),
        ...(pm.gateway === 'upi' && {
          upiId: pm.upiId || '',
          merchantName: pm.merchantName || '',
        }),
        ...(pm.gateway === 'cashfree' && {
          appId: pm.appId || '',
          secretKey: pm.secretKey || '',
          environment: pm.environment || 'sandbox',
          webhookSecret: pm.webhookSecret || '',
        }),
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: paymentMethodsObj,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('GET payment methods error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment methods',
      },
      { status: 500 }
    )
  }
}

// PATCH - Update payment methods
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    await connectDb()

    if (!body.paymentGateways) {
      return NextResponse.json(
        {
          success: false,
          error: 'paymentGateways is required',
        },
        { status: 400 }
      )
    }

    // Check if any gateway is being activated
    const gatewayBeingActivated = Object.entries(body.paymentGateways).find(
      ([_, data]: [string, any]) => data.isActive === true
    )

    // If a gateway is being activated, deactivate all others
    if (gatewayBeingActivated) {
      const [activeGatewayName] = gatewayBeingActivated

      // Deactivate all other gateways
      await PaymentMethod.updateMany(
        { gateway: { $ne: activeGatewayName } },
        { $set: { isActive: false } }
      )
    }

    const updatedMethods: any = {}

    // Update each payment method
    for (const [gateway, data] of Object.entries(body.paymentGateways)) {
      if (
        !['razorpay', 'stripe', 'paypal', 'upi', 'cashfree'].includes(gateway)
      ) {
        continue
      }

      const gatewayData = data as any
      const updateData: any = {
        gateway: gateway,
        isActive:
          gatewayData.isActive !== undefined ? gatewayData.isActive : false,
      }

      // Add gateway-specific fields
      if (gateway === 'razorpay') {
        updateData.keyId = gatewayData.keyId || ''
        updateData.keySecret = gatewayData.keySecret || ''
        updateData.webhookSecret = gatewayData.webhookSecret || ''
      } else if (gateway === 'stripe') {
        updateData.publishableKey = gatewayData.publishableKey || ''
        updateData.secretKey = gatewayData.secretKey || ''
        updateData.webhookSecret = gatewayData.webhookSecret || ''
      } else if (gateway === 'paypal') {
        updateData.clientId = gatewayData.clientId || ''
        updateData.clientSecret = gatewayData.clientSecret || ''
        updateData.mode = gatewayData.mode || 'sandbox'
      } else if (gateway === 'upi') {
        updateData.upiId = gatewayData.upiId || ''
        updateData.merchantName = gatewayData.merchantName || ''
      } else if (gateway === 'cashfree') {
        updateData.appId = gatewayData.appId || ''
        updateData.secretKey = gatewayData.secretKey || ''
        updateData.environment = gatewayData.environment || 'sandbox'
        updateData.webhookSecret = gatewayData.webhookSecret || ''
      }

      const updated = await PaymentMethod.findOneAndUpdate(
        { gateway: gateway },
        updateData,
        { upsert: true, new: true, lean: true }
      )

      updatedMethods[gateway] = {
        isActive: updated?.isActive,
        ...(gateway === 'razorpay' && {
          keyId: updated?.keyId || '',
          keySecret: updated?.keySecret || '',
          webhookSecret: updated?.webhookSecret || '',
        }),
        ...(gateway === 'stripe' && {
          publishableKey: updated?.publishableKey || '',
          secretKey: updated?.secretKey || '',
          webhookSecret: updated?.webhookSecret || '',
        }),
        ...(gateway === 'paypal' && {
          clientId: updated?.clientId || '',
          clientSecret: updated?.clientSecret || '',
          mode: updated?.mode || 'sandbox',
        }),
        ...(gateway === 'upi' && {
          upiId: updated?.upiId || '',
          merchantName: updated?.merchantName || '',
        }),
        ...(gateway === 'cashfree' && {
          appId: updated?.appId || '',
          secretKey: updated?.secretKey || '',
          environment: updated?.environment || 'sandbox',
          webhookSecret: updated?.webhookSecret || '',
        }),
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment methods updated successfully',
        data: updatedMethods,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('PATCH payment methods error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update payment methods',
      },
      { status: 500 }
    )
  }
}
