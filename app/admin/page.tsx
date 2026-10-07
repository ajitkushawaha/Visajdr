'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import withRole from '@/utils/withRole'
import { useSession } from 'next-auth/react'
import { adminThemeClasses } from '@/lib/adminTheme'
import { useCurrency } from '@/hooks/useCurrency'
import {
  Users,
  FileText,
  Shield,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Activity,
  BarChart3,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface DashboardStats {
  // User Statistics
  totalUsers: number
  activeUsers: number

  // Visa Application Statistics
  totalVisaApplications: number
  pendingVisaApplications: number
  underReviewVisaApplications: number
  approvedVisaApplications: number
  rejectedVisaApplications: number
  completedVisaApplications: number

  // Visa Product Statistics
  totalVisaProducts: number
  activeVisaProducts: number

  // Travel Insurance Statistics
  totalInsuranceApplications: number
  pendingInsuranceApplications: number
  approvedInsuranceApplications: number
  rejectedInsuranceApplications: number

  // Blog Statistics
  totalBlogPosts: number
  publishedBlogPosts: number
  draftBlogPosts: number

  // Career Statistics
  totalJobApplications: number
  pendingJobApplications: number
  shortlistedJobApplications: number
  rejectedJobApplications: number
  totalCareerCategories: number

  // Revenue Statistics
  totalRevenue: number

  // Recent Activity (Last 7 days)
  recentVisaApplications: number
  recentInsuranceApplications: number
  recentUsers: number

  // Legacy fields
  totalBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalRefunds: number
  openRefunds: number
  closedRefunds: number
  totalAmendments: number
  requestedAmendments: number
  approvedAmendments: number
  rejectedAmendments: number
  processingAmendments: number
}

const AdminDashboard = () => {
  const { data: session } = useSession()
  const { symbol: currencySymbol } = useCurrency()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalVisaApplications: 0,
    pendingVisaApplications: 0,
    underReviewVisaApplications: 0,
    approvedVisaApplications: 0,
    rejectedVisaApplications: 0,
    completedVisaApplications: 0,
    totalVisaProducts: 0,
    activeVisaProducts: 0,
    totalInsuranceApplications: 0,
    pendingInsuranceApplications: 0,
    approvedInsuranceApplications: 0,
    rejectedInsuranceApplications: 0,
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    draftBlogPosts: 0,
    totalJobApplications: 0,
    pendingJobApplications: 0,
    shortlistedJobApplications: 0,
    rejectedJobApplications: 0,
    totalCareerCategories: 0,
    totalRevenue: 0,
    recentVisaApplications: 0,
    recentInsuranceApplications: 0,
    recentUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRefunds: 0,
    openRefunds: 0,
    closedRefunds: 0,
    totalAmendments: 0,
    requestedAmendments: 0,
    approvedAmendments: 0,
    rejectedAmendments: 0,
    processingAmendments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          Authorization: `Bearer ${session?.user}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch dashboard stats')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className={adminThemeClasses.card.container}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-8 w-16 bg-slate-200 rounded"></div>
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      <div className="h-3 w-20 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className={adminThemeClasses.card.container}>
              <CardHeader className={adminThemeClasses.card.header}>
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="animate-pulse">
                  <div className="h-64 bg-slate-100"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={adminThemeClasses.typography.heading.h1}>
            Admin Dashboard
          </h1>
          <p className={adminThemeClasses.typography.body.base}>
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={adminThemeClasses.badge.success}>
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
          <div className="text-sm text-slate-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className={adminThemeClasses.card.container}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalUsers}
                </div>
                <div className="text-gray-600 font-medium">Total Users</div>
                <div className="text-sm text-gray-500 mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  me pa
                  {stats.activeUsers} active
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Applications */}
        <Card className={adminThemeClasses.card.container}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalVisaApplications +
                    stats.totalInsuranceApplications}
                </div>
                <div className="text-gray-600 font-medium">
                  Total Applications
                </div>
                <div className="text-sm text-gray-500 mt-1 flex items-center">
                  <Clock className="h-3 w-3 text-orange-500 mr-1" />
                  {stats.pendingVisaApplications +
                    stats.pendingInsuranceApplications}{' '}
                  pending
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className={adminThemeClasses.card.container}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-gray-600 font-medium">Total Revenue</div>
                <div className="text-sm text-gray-500 mt-1 flex items-center">
                  <BarChart3 className="h-3 w-3 text-gray-500 mr-1" />
                  All time
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <span className="text-gray-600 font-semibold text-xl">
                  {currencySymbol}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className={adminThemeClasses.card.container}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.recentUsers +
                    stats.recentVisaApplications +
                    stats.recentInsuranceApplications}
                </div>
                <div className="text-gray-600 font-medium">Recent Activity</div>
                <div className="text-sm text-gray-500 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 text-gray-500 mr-1" />
                  Last 7 days
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visa Applications */}
        <Card className={adminThemeClasses.card.container}>
          <CardHeader className="bg-green-100 p-2 border-b-2 border-green-500">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <FileText className="h-5 w-5 text-gray-600" />
              Visa Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={adminThemeClasses.table.header}>
                  <tr>
                    <th className={adminThemeClasses.table.headerCell}>
                      Status
                    </th>
                    <th className={adminThemeClasses.table.headerCell}>
                      Count
                    </th>
                    <th className={adminThemeClasses.table.headerCell}>
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={adminThemeClasses.table.row}>
                    <td className={adminThemeClasses.table.cell}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <Badge className={adminThemeClasses.badge.warning}>
                          Pending
                        </Badge>
                      </div>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      <span className="font-semibold">
                        {stats.pendingVisaApplications}
                      </span>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      {stats.totalVisaApplications > 0
                        ? Math.round(
                            (stats.pendingVisaApplications /
                              stats.totalVisaApplications) *
                              100
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className={adminThemeClasses.table.row}>
                    <td className={adminThemeClasses.table.cell}>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <Badge className={adminThemeClasses.badge.info}>
                          Under Review
                        </Badge>
                      </div>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      <span className="font-semibold">
                        {stats.underReviewVisaApplications}
                      </span>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      {stats.totalVisaApplications > 0
                        ? Math.round(
                            (stats.underReviewVisaApplications /
                              stats.totalVisaApplications) *
                              100
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className={adminThemeClasses.table.row}>
                    <td className={adminThemeClasses.table.cell}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge className={adminThemeClasses.badge.success}>
                          Approved
                        </Badge>
                      </div>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      <span className="font-semibold">
                        {stats.approvedVisaApplications}
                      </span>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      {stats.totalVisaApplications > 0
                        ? Math.round(
                            (stats.approvedVisaApplications /
                              stats.totalVisaApplications) *
                              100
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className={adminThemeClasses.table.row}>
                    <td className={adminThemeClasses.table.cell}>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <Badge className={adminThemeClasses.badge.error}>
                          Rejected
                        </Badge>
                      </div>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      <span className="font-semibold">
                        {stats.rejectedVisaApplications}
                      </span>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      {stats.totalVisaApplications > 0
                        ? Math.round(
                            (stats.rejectedVisaApplications /
                              stats.totalVisaApplications) *
                              100
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {stats.totalVisaApplications}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Travel Insurance Applications */}
        <Card className={adminThemeClasses.card.container}>
          <CardHeader className="bg-red-100 p-2 border-b-2 border-red-500">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <Shield className="h-5 w-5 text-gray-600" />
              Travel Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={adminThemeClasses.table.header}>
                  <tr>
                    <th className={adminThemeClasses.table.headerCell}>
                      Status
                    </th>
                    <th className={adminThemeClasses.table.headerCell}>
                      Count
                    </th>
                    <th className={adminThemeClasses.table.headerCell}>
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={adminThemeClasses.table.row}>
                    <td className={adminThemeClasses.table.cell}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <Badge className={adminThemeClasses.badge.warning}>
                          Pending
                        </Badge>
                      </div>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      <span className="font-semibold">
                        {stats.pendingInsuranceApplications}
                      </span>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      {stats.totalInsuranceApplications > 0
                        ? Math.round(
                            (stats.pendingInsuranceApplications /
                              stats.totalInsuranceApplications) *
                              100
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className={adminThemeClasses.table.row}>
                    <td className={adminThemeClasses.table.cell}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge className={adminThemeClasses.badge.success}>
                          Approved
                        </Badge>
                      </div>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      <span className="font-semibold">
                        {stats.approvedInsuranceApplications}
                      </span>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      {stats.totalInsuranceApplications > 0
                        ? Math.round(
                            (stats.approvedInsuranceApplications /
                              stats.totalInsuranceApplications) *
                              100
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className={adminThemeClasses.table.row}>
                    <td className={adminThemeClasses.table.cell}>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <Badge className={adminThemeClasses.badge.error}>
                          Rejected
                        </Badge>
                      </div>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      <span className="font-semibold">
                        {stats.rejectedInsuranceApplications}
                      </span>
                    </td>
                    <td className={adminThemeClasses.table.cell}>
                      {stats.totalInsuranceApplications > 0
                        ? Math.round(
                            (stats.rejectedInsuranceApplications /
                              stats.totalInsuranceApplications) *
                              100
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {stats.totalInsuranceApplications}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Management */}
        <Card className={adminThemeClasses.card.container}>
          <CardHeader className="bg-blue-100 p-2 border-b-2 border-blue-500">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <FileText className="h-5 w-5 text-gray-600" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Blog Posts</span>
                <Badge className={adminThemeClasses.badge.neutral}>
                  {stats.totalBlogPosts}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Published</span>
                <Badge className={adminThemeClasses.badge.success}>
                  {stats.publishedBlogPosts}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Drafts</span>
                <Badge className={adminThemeClasses.badge.warning}>
                  {stats.draftBlogPosts}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Visa Products</span>
                <Badge className={adminThemeClasses.badge.neutral}>
                  {stats.totalVisaProducts}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Products</span>
                <Badge className={adminThemeClasses.badge.success}>
                  {stats.activeVisaProducts}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Management */}
        <Card className={adminThemeClasses.card.container}>
          <CardHeader className="bg-yellow-100 p-2 border-b-2 border-yellow-500">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 text-gray-600" />
              Career Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Job Applications</span>
                <Badge className={adminThemeClasses.badge.neutral}>
                  {stats.totalJobApplications}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <Badge className={adminThemeClasses.badge.warning}>
                  {stats.pendingJobApplications}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Shortlisted</span>
                <Badge className={adminThemeClasses.badge.info}>
                  {stats.shortlistedJobApplications}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected</span>
                <Badge className={adminThemeClasses.badge.error}>
                  {stats.rejectedJobApplications}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categories</span>
                <Badge className={adminThemeClasses.badge.neutral}>
                  {stats.totalCareerCategories}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className={adminThemeClasses.card.container}>
          <CardHeader className="bg-purple-100 p-2 border-b-2 border-purple-500">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <Activity className="h-5 w-5 text-gray-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Users</span>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-green-500" />
                  <Badge className={adminThemeClasses.badge.success}>
                    {stats.recentUsers}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Visa Applications</span>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <Badge className={adminThemeClasses.badge.info}>
                    {stats.recentVisaApplications}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Insurance Applications
                </span>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <Badge className={adminThemeClasses.badge.neutral}>
                    {stats.recentInsuranceApplications}
                  </Badge>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Last 7 days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default withRole(AdminDashboard, ['admin'])
