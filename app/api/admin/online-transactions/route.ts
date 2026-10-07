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
    const status = searchParams.get('status') || 'all';
    const gateway = searchParams.get('gateway') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filters
    let statusFilter = {};
    if (status !== 'all') {
      statusFilter = { paymentStatus: status };
    }

    let gatewayFilter = {};
    if (gateway !== 'all') {
      gatewayFilter = { paymentMethod: gateway };
    }

    const combinedFilter = { ...statusFilter, ...gatewayFilter };

    // Fetch visa applications with payment data
    const visaTransactions = await VisaApplication.find(combinedFilter)
      .select('trackingId personalInfo visaDetails paymentStatus paymentMethod totalAmount paymentId convenienceFees createdAt updatedAt')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch travel insurance applications with payment data
    const insuranceTransactions = await TravelInsuranceApplication.find(combinedFilter)
      .select('trackingId personalInfo selectedPlan paymentStatus paymentMethod totalAmount paymentId convenienceFees createdAt updatedAt')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total counts for pagination
    const totalVisaTransactions = await VisaApplication.countDocuments(combinedFilter);
    const totalInsuranceTransactions = await TravelInsuranceApplication.countDocuments(combinedFilter);
    const totalTransactions = totalVisaTransactions + totalInsuranceTransactions;

    // Transform visa transactions to match the interface
    const transformedVisaTransactions = visaTransactions.map(transaction => ({
      _id: transaction._id,
      transactionId: transaction.trackingId,
      paymentId: transaction.paymentId || `PAY_${transaction._id}`,
      customerName: transaction.userId ? `${transaction.userId.name || 'Unknown'}` : 'Unknown',
      customerEmail: transaction.userId ? transaction.userId.email : 'Unknown',
      serviceType: 'visa' as const,
      amount: transaction.totalAmount || 0,
      paymentMethod: transaction.paymentMethod || 'razorpay',
      paymentGateway: transaction.paymentMethod || 'razorpay',
      status: transaction.paymentStatus || 'pending',
      gatewayResponse: transaction.paymentId ? { id: transaction.paymentId } : null,
      createdAt: transaction.createdAt,
      completedAt: transaction.paymentStatus === 'completed' ? transaction.updatedAt : null,
      convenienceFees: transaction.convenienceFees ? {
        total: transaction.convenienceFees.total || 0,
        breakdown: transaction.convenienceFees
      } : undefined
    }));

    // Transform insurance transactions to match the interface
    const transformedInsuranceTransactions = insuranceTransactions.map(transaction => ({
      _id: transaction._id,
      transactionId: transaction.trackingId,
      paymentId: transaction.paymentId || `PAY_${transaction._id}`,
      customerName: transaction.userId ? `${transaction.userId.name || 'Unknown'}` : 'Unknown',
      customerEmail: transaction.userId ? transaction.userId.email : 'Unknown',
      serviceType: 'travel-insurance' as const,
      amount: transaction.totalAmount || 0,
      paymentMethod: transaction.paymentMethod || 'razorpay',
      paymentGateway: transaction.paymentMethod || 'razorpay',
      status: transaction.paymentStatus || 'pending',
      gatewayResponse: transaction.paymentId ? { id: transaction.paymentId } : null,
      createdAt: transaction.createdAt,
      completedAt: transaction.paymentStatus === 'completed' ? transaction.updatedAt : null,
      convenienceFees: transaction.convenienceFees ? {
        total: transaction.convenienceFees.total || 0,
        breakdown: transaction.convenienceFees
      } : undefined
    }));

    // Combine and sort all transactions by creation date
    const allTransactions = [...transformedVisaTransactions, ...transformedInsuranceTransactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalPages = Math.ceil(totalTransactions / limit);

    // Calculate summary statistics
    const totalVolume = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const successfulTransactions = allTransactions.filter(t => t.status === 'completed').length;
    const failedTransactions = allTransactions.filter(t => t.status === 'failed').length;
    const successRate = allTransactions.length > 0 ? (successfulTransactions / allTransactions.length) * 100 : 0;

    return NextResponse.json({
      success: true,
      transactions: allTransactions,
      total: totalTransactions,
      page,
      totalPages,
      pagination: {
        current: page,
        total: totalPages,
        limit,
        skip
      },
      summary: {
        totalVolume,
        successfulTransactions,
        failedTransactions,
        successRate: Math.round(successRate * 100) / 100,
        uniqueCustomers: new Set(allTransactions.map(t => t.customerEmail)).size
      }
    });

  } catch (error) {
    console.error('Failed to fetch online transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch online transactions' },
      { status: 500 }
    );
  }
}
