import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ConvenienceFee from '@/models/ConvenienceFee';
import { calculateConvenienceFees } from '@/lib/convenienceFee';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseAmount, paymentMethod, options = {} } = body;

    if (!baseAmount || !paymentMethod) {
      return NextResponse.json({
        success: false,
        error: 'baseAmount and paymentMethod are required'
      }, { status: 400 });
    }

    await connectDB();
    const convenienceFeeDoc = await ConvenienceFee.findOne({});
    
    if (!convenienceFeeDoc) {
      return NextResponse.json({
        success: true,
        data: {
          baseAmount: parseFloat(baseAmount),
          totalAmount: parseFloat(baseAmount),
          convenienceFees: [],
          hasFees: false
        }
      });
    }

    // Convert to the format expected by calculateConvenienceFees
    const convenienceFeeSettings = {
      isActive: convenienceFeeDoc.isActive,
      fees: convenienceFeeDoc.fees
    };

    const feeCalculation = calculateConvenienceFees(
      parseFloat(baseAmount),
      paymentMethod,
      convenienceFeeSettings,
      options
    );

    // Create a detailed fee breakdown
    const fees = [];
    if (feeCalculation.onlineProcessing > 0) {
      fees.push({
        type: 'onlineProcessing',
        description: 'Online Processing Fee',
        amount: feeCalculation.onlineProcessing
      });
    }
    if (feeCalculation.paymentMethod > 0) {
      fees.push({
        type: 'paymentMethod',
        description: 'Payment Method Fee',
        amount: feeCalculation.paymentMethod
      });
    }
    if (feeCalculation.expressService > 0) {
      fees.push({
        type: 'expressService',
        description: 'Express Service Fee',
        amount: feeCalculation.expressService
      });
    }
    if (feeCalculation.documentProcessing > 0) {
      fees.push({
        type: 'documentProcessing',
        description: 'Document Processing Fee',
        amount: feeCalculation.documentProcessing
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        baseAmount: parseFloat(baseAmount),
        totalAmount: feeCalculation.totalAmount,
        convenienceFees: fees,
        hasFees: fees.length > 0,
        breakdown: {
          baseAmount: parseFloat(baseAmount),
          totalFees: feeCalculation.total,
          totalAmount: feeCalculation.totalAmount
        }
      }
    });

  } catch (error) {
    console.error('Total amount calculation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate total amount'
    }, { status: 500 });
  }
}
