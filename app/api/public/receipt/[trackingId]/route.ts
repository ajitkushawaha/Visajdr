import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import VisaApplication from '@/models/VisaApplication';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the application by tracking ID and user ID
    const application = await VisaApplication.findOne({
      trackingId,
      userId: (session.user as any).id
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Generate receipt data with proper fallbacks
    const receiptData = {
      trackingId: application.trackingId,
      applicationId: application._id.toString(),
      status: application.status,
      submittedDate: application.createdAt,
      estimatedProcessingDate: application.estimatedProcessingDate,
      actualProcessingDate: application.actualProcessingDate,
      
      // Personal Information with fallbacks
      personalInfo: {
        firstName: application.personalInfo?.firstName || '',
        lastName: application.personalInfo?.lastName || '',
        email: application.personalInfo?.email || '',
        phone: application.personalInfo?.phone || '',
        nationality: application.personalInfo?.nationality || '',
        purpose: application.visaDetails?.visaType || application.personalInfo?.purpose || '' // Use visaType as purpose
      },
      
      // Visa Details with fallbacks
      visaDetails: {
        country: application.visaDetails?.country || '',
        visaType: application.visaDetails?.visaType || '',
        price: application.visaDetails?.price || 0,
        processingTime: application.visaDetails?.processingTime || '',
        stayPeriod: application.visaDetails?.stayPeriod || '',
        validity: application.visaDetails?.validity || ''
      },
      
      // Payment Information with fallbacks
      payment: {
        baseAmount: application.baseAmount || application.totalAmount || 0,
        convenienceFees: {
          onlineProcessing: application.convenienceFees?.onlineProcessing || 0,
          paymentMethod: application.convenienceFees?.paymentMethod || 0,
          expressService: application.convenienceFees?.expressService || 0,
          documentProcessing: application.convenienceFees?.documentProcessing || 0,
          total: application.convenienceFees?.total || 0
        },
        totalAmount: application.totalAmount || 0,
        paymentMethod: application.paymentMethod || 'upi',
        paymentStatus: application.paymentStatus || 'completed'
      },
      
      // Coupon Discount Information
      couponDiscount: application.couponDiscount ? {
        couponCode: application.couponDiscount.couponCode || '',
        discountAmount: application.couponDiscount.discountAmount || 0,
        discountType: application.couponDiscount.discountType || 'fixed'
      } : undefined,
      
      // Company Information
      company: {
        name: 'Visa4 Visa Services',
        address: 'Your Company Address',
        phone: '+91-XXXXXXXXXX',
        email: 'support@visa4.com'
      }
    };

    // Debug logging for coupon discount
    console.log('Receipt Data - Coupon Discount:', {
      hasCouponDiscount: !!receiptData.couponDiscount,
      couponDiscount: receiptData.couponDiscount,
      applicationCouponDiscount: application.couponDiscount
    });

    return NextResponse.json({
      success: true,
      receipt: receiptData
    });

  } catch (error) {
    console.error('Receipt generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}
