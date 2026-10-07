import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Agent from '@/models/Agent'
import VisaApplication from '@/models/VisaApplication'
import AgentCommission from '@/models/AgentCommission'

// GET /api/agent/dashboard - Get agent dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get agent info
    const agent = await Agent.findOne({ userId: session.user.id })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get applications count by status
    const applicationsStats = await VisaApplication.aggregate([
      { $match: { agentId: agent._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get total applications
    const totalApplications = await VisaApplication.countDocuments({ agentId: agent._id })

    // Get recent applications (last 10)
    const recentApplications = await VisaApplication.find({ agentId: agent._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Get commission stats
    const commissionStats = await AgentCommission.aggregate([
      { $match: { agentId: agent._id } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$commissionAmount' },
          count: { $sum: 1 }
        }
      }
    ])

    // Get monthly commission for last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyCommissions = await AgentCommission.aggregate([
      { 
        $match: { 
          agentId: agent._id,
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalAmount: { $sum: '$commissionAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Calculate total commission earned
    const totalCommissionEarned = await AgentCommission.aggregate([
      { $match: { agentId: agent._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ])

    // Calculate pending commission
    const pendingCommission = await AgentCommission.aggregate([
      { $match: { agentId: agent._id, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ])

    // Get performance metrics
    const performanceMetrics = {
      totalApplications,
      approvedApplications: applicationsStats.find(stat => stat._id === 'approved')?.count || 0,
      rejectedApplications: applicationsStats.find(stat => stat._id === 'rejected')?.count || 0,
      pendingApplications: applicationsStats.find(stat => stat._id === 'pending')?.count || 0,
      totalCommissionEarned: totalCommissionEarned[0]?.total || 0,
      pendingCommission: pendingCommission[0]?.total || 0,
      averageProcessingTime: agent.performance.averageProcessingTime,
      clientSatisfactionRating: agent.performance.clientSatisfactionRating
    }

    // Calculate approval rate
    const approvalRate = performanceMetrics.totalApplications > 0 
      ? (performanceMetrics.approvedApplications / performanceMetrics.totalApplications) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        agent: {
          agentId: agent.agentId,
          status: agent.status,
          commissionRate: agent.commissionRate,
          commissionType: agent.commissionType,
          kycStatus: agent.kycStatus,
          performance: agent.performance
        },
        stats: {
          ...performanceMetrics,
          approvalRate: Math.round(approvalRate * 100) / 100
        },
        applicationsStats,
        commissionStats,
        monthlyCommissions,
        recentApplications
      }
    })
  } catch (error) {
    console.error('Error fetching agent dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
