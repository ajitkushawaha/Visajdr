import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ConvenienceFee from "@/models/ConvenienceFee";
import Visa from "@/models/Visa";
import { calculateConvenienceFees } from "@/lib/convenienceFee";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { baseAmount, paymentMethod, options, visaId } = body;


    // Validate input
    if (!baseAmount || !paymentMethod) {
      return NextResponse.json(
        { error: "Base amount and payment method are required" },
        { status: 400 }
      );
    }

    // Get visa-specific processing fee if visaId is provided
    let visaProcessingFee: number | undefined = undefined
    if (visaId) {
      try {
        const visa = await Visa.findById(visaId).select('processingFee').lean()
       
        if (visa?.processingFee && parseFloat(visa.processingFee) > 0) {
          visaProcessingFee = parseFloat(visa.processingFee)
        } else {
          console.log('⚠️ API: No visa-specific processing fee found or is 0')
        }
      } catch (error) {
        console.error('❌ API: Error fetching visa processing fee:', error)
        // Continue without visa-specific fee if there's an error
      }
    } else {
      console.log('⚠️ API: No visaId provided in request')
    }

    // Get convenience fees from ConvenienceFee collection
    const convenienceFeeDoc = await ConvenienceFee.findOne({});

    if (!convenienceFeeDoc) {
      return NextResponse.json({
        success: true,
        feeBreakdown: {
          onlineProcessing: visaProcessingFee || 0,
          paymentMethod: 0,
          expressService: 0,
          documentProcessing: 0,
          total: visaProcessingFee || 0,
          baseAmount: parseFloat(baseAmount),
          totalAmount: parseFloat(baseAmount) + (visaProcessingFee || 0)
        }
      });
    }

    // Convert to the format expected by calculateConvenienceFees
    const convenienceFeeSettings = {
      isActive: convenienceFeeDoc.isActive,
      fees: convenienceFeeDoc.fees
    };

    // Merge visa-specific processing fee into options (takes priority)
    const feeOptions = {
      ...options,
      visaProcessingFee: visaProcessingFee || options?.visaProcessingFee,
    }

    // Calculate fees
    const feeBreakdown = calculateConvenienceFees(
      parseFloat(baseAmount),
      paymentMethod,
      convenienceFeeSettings,
      feeOptions
    );

    console.log('🔍 API: Final fee breakdown:', {
      onlineProcessing: feeBreakdown.onlineProcessing,
      paymentMethod: feeBreakdown.paymentMethod,
      total: feeBreakdown.total,
      totalAmount: feeBreakdown.totalAmount,
      visaProcessingFeeUsed: feeOptions.visaProcessingFee,
    })

    return NextResponse.json({
      success: true,
      feeBreakdown,
      settings: {
        isActive: convenienceFeeSettings.isActive,
        feeDescriptions: convenienceFeeSettings.isActive ? 
          Object.entries(convenienceFeeSettings.fees)
            .filter(([_, fee]: [string, any]) => fee?.isActive)
            .map(([_, fee]: [string, any]) => fee.description)
          : []
      }
    });

  } catch (error) {
    console.error("Error calculating convenience fees:", error);
    return NextResponse.json(
      { error: "Failed to calculate convenience fees" },
      { status: 500 }
    );
  }
}
