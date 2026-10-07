import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { getToken } from 'next-auth/jwt'
import User from '@/models/User'
import Visa from '@/models/Visa'
import VisaApplication from '@/models/VisaApplication'
import TravelInsuranceApplication from '@/models/TravelInsuranceApplication'
import Blog from '@/models/Blog'
import JobApplication from '@/models/JobApplication'
import CareerCategory from '@/models/CareerCategory'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectDB()

    // Get user statistics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ status: 'active' })

    // Get visa application statistics
    const totalVisaApplications = await VisaApplication.countDocuments()
    // Using regex for case-insensitive match as status might be "Pending" or "pending"
    const pendingVisaApplications = await VisaApplication.countDocuments({
      status: { $regex: /^pending$/i },
    })
    const underReviewVisaApplications = await VisaApplication.countDocuments({
      status: 'under_review',
    })
    const approvedVisaApplications = await VisaApplication.countDocuments({
      status: 'approved',
    })
    const rejectedVisaApplications = await VisaApplication.countDocuments({
      status: 'rejected',
    })
    const completedVisaApplications = await VisaApplication.countDocuments({
      status: 'completed',
    })

    // Get visa product statistics
    const totalVisaProducts = await Visa.countDocuments()
    const activeVisaProducts = await Visa.countDocuments({ status: 'active' })

    // Get travel insurance statistics
    const totalInsuranceApplications =
      await TravelInsuranceApplication.countDocuments()
    const pendingInsuranceApplications =
      await TravelInsuranceApplication.countDocuments({ status: 'pending' })
    const approvedInsuranceApplications =
      await TravelInsuranceApplication.countDocuments({ status: 'approved' })
    const rejectedInsuranceApplications =
      await TravelInsuranceApplication.countDocuments({ status: 'rejected' })

    // Get blog statistics
    const totalBlogPosts = await Blog.countDocuments()
    const publishedBlogPosts = await Blog.countDocuments({
      status: 'published',
    })
    const draftBlogPosts = await Blog.countDocuments({ status: 'draft' })

    // Get career statistics
    const totalJobApplications = await JobApplication.countDocuments()
    // Using regex for case-insensitive match
    const pendingJobApplications = await JobApplication.countDocuments({
      status: { $regex: /^pending$/i },
    })
    const shortlistedJobApplications = await JobApplication.countDocuments({
      status: { $regex: /^shortlisted$/i },
    })
    const rejectedJobApplications = await JobApplication.countDocuments({
      status: { $regex: /^rejected$/i },
    })
    const totalCareerCategories = await CareerCategory.countDocuments()

    // Calculate total revenue (from visa and insurance applications)
    const visaRevenue = await VisaApplication.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ])

    const insuranceRevenue = await TravelInsuranceApplication.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ])

    const totalRevenue =
      (visaRevenue[0]?.total || 0) + (insuranceRevenue[0]?.total || 0)

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentVisaApplications = await VisaApplication.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    const recentInsuranceApplications =
      await TravelInsuranceApplication.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      })

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    const stats = {
      // User Statistics
      totalUsers,
      activeUsers,

      // Visa Application Statistics
      totalVisaApplications,
      pendingVisaApplications,
      underReviewVisaApplications,
      approvedVisaApplications,
      rejectedVisaApplications,
      completedVisaApplications,

      // Visa Product Statistics
      totalVisaProducts,
      activeVisaProducts,

      // Travel Insurance Statistics
      totalInsuranceApplications,
      pendingInsuranceApplications,
      approvedInsuranceApplications,
      rejectedInsuranceApplications,

      // Blog Statistics
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,

      // Career Statistics
      totalJobApplications,
      pendingJobApplications,
      shortlistedJobApplications,
      rejectedJobApplications,
      totalCareerCategories,

      // Revenue Statistics
      totalRevenue: Math.round(totalRevenue),

      // Recent Activity (Last 7 days)
      recentVisaApplications,
      recentInsuranceApplications,
      recentUsers,

      // Legacy fields for backward compatibility
      totalBookings: totalVisaApplications + totalInsuranceApplications,
      pendingBookings: pendingVisaApplications + pendingInsuranceApplications,
      cancelledBookings:
        rejectedVisaApplications + rejectedInsuranceApplications,
      totalRefunds: 0, // Placeholder - would come from Refund model
      openRefunds: 0,
      closedRefunds: 0,
      totalAmendments: 0, // Placeholder - would come from Amendment model
      requestedAmendments: 0,
      approvedAmendments: 0,
      rejectedAmendments: 0,
      processingAmendments: 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
