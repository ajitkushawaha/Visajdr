import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import VisaApplication from "@/models/VisaApplication";
import TravelInsuranceApplication from "@/models/TravelInsuranceApplication";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const skip = (page - 1) * limit;

    // Build status filter
    let statusFilter = {};
    if (status !== 'all') {
      statusFilter = { paymentStatus: status };
    }

    // Fetch visa applications with payment data
    const visaPayments = await VisaApplication.find(statusFilter)
      .select('trackingId personalInfo visaDetails paymentStatus paymentMethod totalAmount createdAt updatedAt')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch travel insurance applications with payment data
    const insurancePayments = await TravelInsuranceApplication.find(statusFilter)
      .select('trackingId personalInfo selectedPlan paymentStatus paymentMethod totalAmount createdAt updatedAt')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total counts for pagination
    const totalVisaPayments = await VisaApplication.countDocuments(statusFilter);
    const totalInsurancePayments = await TravelInsuranceApplication.countDocuments(statusFilter);
    const totalPayments = totalVisaPayments + totalInsurancePayments;

    // Transform visa payments to match the interface
    const transformedVisaPayments = visaPayments.map(payment => ({
      _id: payment._id,
      trackingId: payment.trackingId,
      customerName: payment.userId ? `${payment.userId.name || 'Unknown'}` : 'Unknown',
      customerEmail: payment.userId ? payment.userId.email : 'Unknown',
      serviceType: 'visa' as const,
      amount: payment.totalAmount,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      paymentId: payment.paymentId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    }));

    // Transform insurance payments to match the interface
    const transformedInsurancePayments = insurancePayments.map(payment => ({
      _id: payment._id,
      trackingId: payment.trackingId,
      customerName: payment.userId ? `${payment.userId.name || 'Unknown'}` : 'Unknown',
      customerEmail: payment.userId ? payment.userId.email : 'Unknown',
      serviceType: 'travel-insurance' as const,
      amount: payment.totalAmount,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      paymentId: payment.paymentId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    }));

    // Combine and sort all payments by creation date
    const allPayments = [...transformedVisaPayments, ...transformedInsurancePayments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalPages = Math.ceil(totalPayments / limit);

    return NextResponse.json({
      success: true,
      payments: allPayments,
      total: totalPayments,
      page,
      totalPages,
      pagination: {
        current: page,
        total: totalPages,
        limit,
        skip
      }
    });

  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
