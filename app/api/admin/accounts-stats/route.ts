import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import TravelInsuranceApplication from '@/models/TravelInsuranceApplication'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get current date and previous month for comparison
    const now = new Date()
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all completed payments
    const allCompletedPayments = await Promise.all([
      VisaApplication.find({ paymentStatus: 'completed' }).select(
        'totalAmount createdAt'
      ),
      TravelInsuranceApplication.find({ paymentStatus: 'completed' }).select(
        'totalAmount createdAt'
      ),
    ])

    // Fetch today's completed payments
    const todayCompletedPayments = await Promise.all([
      VisaApplication.find({
        paymentStatus: 'completed',
        createdAt: { $gte: startOfToday },
      }).select('totalAmount'),
      TravelInsuranceApplication.find({
        paymentStatus: 'completed',
        createdAt: { $gte: startOfToday },
      }).select('totalAmount'),
    ])

    // Fetch this month's completed payments
    const thisMonthCompletedPayments = await Promise.all([
      VisaApplication.find({
        paymentStatus: 'completed',
        createdAt: { $gte: startOfThisMonth },
      }).select('totalAmount'),
      TravelInsuranceApplication.find({
        paymentStatus: 'completed',
        createdAt: { $gte: startOfThisMonth },
      }).select('totalAmount'),
    ])

    // Fetch last month's completed payments
    const lastMonthCompletedPayments = await Promise.all([
      VisaApplication.find({
        paymentStatus: 'completed',
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      }).select('totalAmount'),
      TravelInsuranceApplication.find({
        paymentStatus: 'completed',
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      }).select('totalAmount'),
    ])

    // Count all transactions by status
    const [visaCounts, insuranceCounts] = await Promise.all([
      VisaApplication.aggregate([
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
          },
        },
      ]),
      TravelInsuranceApplication.aggregate([
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    // Calculate totals
    const allPayments = [...allCompletedPayments[0], ...allCompletedPayments[1]]
    const todayPayments = [
      ...todayCompletedPayments[0],
      ...todayCompletedPayments[1],
    ]
    const thisMonthPayments = [
      ...thisMonthCompletedPayments[0],
      ...thisMonthCompletedPayments[1],
    ]
    const lastMonthPayments = [
      ...lastMonthCompletedPayments[0],
      ...lastMonthCompletedPayments[1],
    ]

    const totalRevenue = allPayments.reduce(
      (sum, payment) => sum + (payment.totalAmount || 0),
      0
    )
    const todayRevenue = todayPayments.reduce(
      (sum, payment) => sum + (payment.totalAmount || 0),
      0
    )
    const thisMonthRevenue = thisMonthPayments.reduce(
      (sum, payment) => sum + (payment.totalAmount || 0),
      0
    )
    const lastMonthRevenue = lastMonthPayments.reduce(
      (sum, payment) => sum + (payment.totalAmount || 0),
      0
    )

    // Calculate monthly growth
    const monthlyGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0

    // Calculate transaction counts
    const totalTransactions = allPayments.length
    const averageTransactionValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Combine status counts
    const statusCounts = [...visaCounts, ...insuranceCounts].reduce(
      (acc, item) => {
        acc[item._id] = (acc[item._id] || 0) + item.count
        return acc
      },
      {} as Record<string, number>
    )

    const pendingPayments = statusCounts['pending'] || 0
    const completedPayments = statusCounts['completed'] || 0
    const failedPayments = statusCounts['failed'] || 0

    // Count abandoned bookings (status: 'abandoned' and paymentStatus: not 'completed')
    const abandonedBookings = await VisaApplication.countDocuments({
      status: 'abandoned',
      paymentStatus: { $ne: 'completed' },
    })

    const stats = {
      totalRevenue,
      totalTransactions,
      pendingPayments,
      completedPayments,
      failedPayments,
      monthlyGrowth,
      todayRevenue,
      averageTransactionValue,
      thisMonthRevenue,
      lastMonthRevenue,
      abandonedBookings,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Failed to fetch accounts stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accounts statistics',
      },
      { status: 500 }
    )
  }
}
