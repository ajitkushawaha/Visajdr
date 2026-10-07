import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/db'
import ConvenienceFee from '@/models/ConvenienceFee'

// GET - Fetch convenience fees
export async function GET() {
  try {
    await connectDb()
    let convenienceFee = await ConvenienceFee.findOne({}).lean()

    if (!convenienceFee) {
      // Create default if doesn't exist
      const defaultFee = new ConvenienceFee({
        isActive: false,
        processingFeeEnabled: false,
        fees: {
          onlineProcessing: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: 'Online processing convenience fee',
          },
          paymentMethod: {
            razorpay: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'Razorpay payment convenience fee',
            },
            stripe: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'Stripe payment convenience fee',
            },
            upi: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'UPI payment convenience fee',
            },
            card: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'Card payment convenience fee',
            },
            cashfree: {
              isActive: false,
              amount: 0,
              type: 'fixed',
              description: 'Cashfree payment convenience fee',
            },
          },
          expressService: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: 'Express processing service fee',
          },
          documentProcessing: {
            isActive: false,
            amount: 0,
            type: 'fixed',
            description: 'Document processing convenience fee',
          },
        },
      })
      await defaultFee.save()
      convenienceFee = defaultFee.toObject()
    }

    return NextResponse.json(
      {
        success: true,
        data: convenienceFee,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('GET convenience fees error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch convenience fees',
      },
      { status: 500 }
    )
  }
}

// PATCH - Update convenience fees
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    await connectDb()

    if (!body.convenienceFees) {
      return NextResponse.json(
        {
          success: false,
          error: 'convenienceFees is required',
        },
        { status: 400 }
      )
    }

    // Ensure processingFeeEnabled is explicitly set (handle undefined/null)
    const updateData = {
      ...body.convenienceFees,
      processingFeeEnabled:
        body.convenienceFees.processingFeeEnabled !== undefined
          ? body.convenienceFees.processingFeeEnabled
          : false,
    }

    const updated = await ConvenienceFee.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true, lean: true, runValidators: true }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Convenience fees updated successfully',
        data: updated,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('PATCH convenience fees error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update convenience fees',
      },
      { status: 500 }
    )
  }
}
