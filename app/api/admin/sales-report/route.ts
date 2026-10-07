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
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const period = searchParams.get('period') || '30days';

    // Create date range filter
    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      paymentStatus: 'completed'
    };

    // Fetch visa applications with payment data
    const visaApplications = await VisaApplication.find(dateFilter)
      .select('totalAmount paymentMethod createdAt')
      .sort({ createdAt: 1 });

    // Fetch travel insurance applications with payment data
    const insuranceApplications = await TravelInsuranceApplication.find(dateFilter)
      .select('totalAmount paymentMethod createdAt')
      .sort({ createdAt: 1 });

    // Group data by date
    const salesDataMap = new Map();

    // Process visa applications
    visaApplications.forEach(app => {
      const date = app.createdAt.toISOString().split('T')[0];
      if (!salesDataMap.has(date)) {
        salesDataMap.set(date, {
          _id: date,
          date: date,
          totalRevenue: 0,
          totalTransactions: 0,
          visaRevenue: 0,
          insuranceRevenue: 0,
          visaTransactions: 0,
          insuranceTransactions: 0,
          averageOrderValue: 0,
          paymentMethods: {
            razorpay: 0,
            stripe: 0,
            upi: 0,
            card: 0
          }
        });
      }
      
      const dayData = salesDataMap.get(date);
      dayData.totalRevenue += app.totalAmount || 0;
      dayData.totalTransactions += 1;
      dayData.visaRevenue += app.totalAmount || 0;
      dayData.visaTransactions += 1;
      
      // Track payment methods
      const method = app.paymentMethod || 'razorpay';
      if (dayData.paymentMethods[method] !== undefined) {
        dayData.paymentMethods[method] += app.totalAmount || 0;
      }
    });

    // Process insurance applications
    insuranceApplications.forEach(app => {
      const date = app.createdAt.toISOString().split('T')[0];
      if (!salesDataMap.has(date)) {
        salesDataMap.set(date, {
          _id: date,
          date: date,
          totalRevenue: 0,
          totalTransactions: 0,
          visaRevenue: 0,
          insuranceRevenue: 0,
          visaTransactions: 0,
          insuranceTransactions: 0,
          averageOrderValue: 0,
          paymentMethods: {
            razorpay: 0,
            stripe: 0,
            upi: 0,
            card: 0
          }
        });
      }
      
      const dayData = salesDataMap.get(date);
      dayData.totalRevenue += app.totalAmount || 0;
      dayData.totalTransactions += 1;
      dayData.insuranceRevenue += app.totalAmount || 0;
      dayData.insuranceTransactions += 1;
      
      // Track payment methods
      const method = app.paymentMethod || 'razorpay';
      if (dayData.paymentMethods[method] !== undefined) {
        dayData.paymentMethods[method] += app.totalAmount || 0;
      }
    });

    // Calculate average order values and convert to array
    const salesData = Array.from(salesDataMap.values()).map(dayData => ({
      ...dayData,
      averageOrderValue: dayData.totalTransactions > 0 ? dayData.totalRevenue / dayData.totalTransactions : 0
    }));

    // Generate monthly stats for the last 12 months
    const monthlyStats = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
      
      const monthFilter = {
        createdAt: {
          $gte: monthDate,
          $lt: nextMonth
        },
        paymentStatus: 'completed'
      };

      const [monthVisaCount, monthInsuranceCount] = await Promise.all([
        VisaApplication.countDocuments(monthFilter),
        TravelInsuranceApplication.countDocuments(monthFilter)
      ]);

      const [monthVisaRevenue, monthInsuranceRevenue] = await Promise.all([
        VisaApplication.aggregate([
          { $match: monthFilter },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        TravelInsuranceApplication.aggregate([
          { $match: monthFilter },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      const totalRevenue = (monthVisaRevenue[0]?.total || 0) + (monthInsuranceRevenue[0]?.total || 0);
      const totalTransactions = monthVisaCount + monthInsuranceCount;
      
      // Calculate growth (simplified - compare with previous month)
      const prevMonthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
      const prevNextMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 1);
      
      const prevMonthFilter = {
        createdAt: {
          $gte: prevMonthDate,
          $lt: prevNextMonth
        },
        paymentStatus: 'completed'
      };

      const [prevMonthVisaCount, prevMonthInsuranceCount] = await Promise.all([
        VisaApplication.countDocuments(prevMonthFilter),
        TravelInsuranceApplication.countDocuments(prevMonthFilter)
      ]);

      const [prevMonthVisaRevenue, prevMonthInsuranceRevenue] = await Promise.all([
        VisaApplication.aggregate([
          { $match: prevMonthFilter },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        TravelInsuranceApplication.aggregate([
          { $match: prevMonthFilter },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      const prevTotalRevenue = (prevMonthVisaRevenue[0]?.total || 0) + (prevMonthInsuranceRevenue[0]?.total || 0);
      const growth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;

      monthlyStats.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: totalRevenue,
        transactions: totalTransactions,
        growth: Math.round(growth * 100) / 100
      });
    }

    return NextResponse.json({
      success: true,
      salesData,
      monthlyStats,
      summary: {
        totalRevenue: salesData.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalTransactions: salesData.reduce((sum, item) => sum + item.totalTransactions, 0),
        totalVisaRevenue: salesData.reduce((sum, item) => sum + item.visaRevenue, 0),
        totalInsuranceRevenue: salesData.reduce((sum, item) => sum + item.insuranceRevenue, 0)
      }
    });

  } catch (error) {
    console.error('Failed to fetch sales report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales report' },
      { status: 500 }
    );
  }
}
