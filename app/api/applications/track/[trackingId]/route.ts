import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import { getToken } from 'next-auth/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    // Check if user is authenticated
    const token = await getToken({ req: request })

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to track applications' },
        { status: 401 }
      )
    }

    await connectDB()

    const { trackingId } = await params

    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      )
    }

    const application = await VisaApplication.findOne({ trackingId })
      .populate(
        'visaId',
        'country visaType countryFlag processingTime stayPeriod validity'
      )
      .lean()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Get visa data (from populated visaId or fallback to visaDetails)
    const visa = application.visaId as any
    const visaDetails = {
      country: visa?.country || application.visaDetails?.country || 'N/A',
      visaType: visa?.visaType || application.visaDetails?.visaType || 'N/A',
      price: application.totalAmount || application.visaDetails?.price || 0,
      processingTime:
        visa?.processingTime ||
        visa?.processingTimeValue ||
        application.visaDetails?.processingTime ||
        'N/A',
      stayPeriod:
        visa?.stayPeriod || application.visaDetails?.stayPeriod || 'N/A',
      validity: visa?.validity || application.visaDetails?.validity || 'N/A',
    }

    // Return application details (excluding sensitive information) - using REAL data from database
    const publicApplication = {
      trackingId: application.trackingId,
      status: application.status,
      paymentStatus: application.paymentStatus,
      totalAmount: application.totalAmount,
      visaDetails: visaDetails, // Use real data from database
      personalInfo: {
        firstName: application.personalInfo?.firstName || '',
        lastName: application.personalInfo?.lastName || '',
        nationality: application.personalInfo?.nationality || '',
      },
      estimatedProcessingDate: application.estimatedProcessingDate,
      actualProcessingDate: application.actualProcessingDate,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      notes: application.notes,
      rejectionReason: application.rejectionReason,
    }

    return NextResponse.json({
      success: true,
      application: publicApplication,
    })
  } catch (error) {
    console.error('Track application error:', error)
    return NextResponse.json(
      { error: 'Failed to track application' },
      { status: 500 }
    )
  }
}
