'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FileText,
  TrendingUp,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import useRoleRedirect from '@/utils/protectedRoute'
import { useCurrency } from '@/hooks/useCurrency'
import Link from 'next/link'

interface DashboardData {
  agent: {
    agentId: string
    status: string
    commissionRate: number
    commissionType: string
    kycStatus: string
    performance: {
      totalApplications: number
      approvedApplications: number
      totalCommissionEarned: number
      averageProcessingTime: number
      clientSatisfactionRating: number
    }
  }
  stats: {
    totalApplications: number
    approvedApplications: number
    rejectedApplications: number
    pendingApplications: number
    totalCommissionEarned: number
    pendingCommission: number
    averageProcessingTime: number
    clientSatisfactionRating: number
    approvalRate: number
  }
  recentApplications: Array<{
    _id: string
    trackingId: string
    personalInfo: {
      firstName: string
      lastName: string
      email: string
    }
    visaDetails: {
      country: string
      visaType: string
    }
    status: string
    createdAt: string
  }>
}

export default function AgentDashboard() {
  const { symbol: currencySymbol } = useCurrency()
  const { isRedirecting, isLoading: sessionLoading } = useRoleRedirect([
    'agent',
  ])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agent/dashboard')
      const data = await response.json()
      if (data.success) {
        setDashboardData(data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      under_review: {
        color: 'bg-blue-100 text-blue-800',
        label: 'Under Review',
      },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      completed: { color: 'bg-purple-100 text-purple-800', label: 'Completed' },
    }
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  if (sessionLoading || isRedirecting || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {sessionLoading
                ? 'Loading session...'
                : isRedirecting
                  ? 'Redirecting...'
                  : 'Loading dashboard data...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, Agent {dashboardData.agent.agentId}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-100 border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.totalApplications}
                </p>
              </div>
              <div className="p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Approved
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.approvedApplications}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboardData.stats.approvalRate}% approval rate
                </p>
              </div>
              <div className="p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Commissions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {currencySymbol}
                  {dashboardData.stats.totalCommissionEarned.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg">
                <span className="text-green-600 font-semibold text-xl">
                  {currencySymbol}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pending Commission
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {currencySymbol}
                  {dashboardData.stats.pendingCommission.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Button className="bg-black text-white hover:bg-gray-800" asChild>
          <Link href="/agent/applications">View All Applications</Link>
        </Button>
        <Button variant="outline" className="text-gray-600" asChild>
          <Link href="/agent/applications?status=pending">Pending Review</Link>
        </Button>
        <Button variant="outline" className="text-gray-600" asChild>
          <Link href="/agent/applications?status=approved">Approved</Link>
        </Button>
        <Button variant="outline" className="text-gray-600" asChild>
          <Link href="/agent/applications?status=rejected">Rejected</Link>
        </Button>
      </div>

      {/* Recent Applications Table */}
      <Card className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Applications
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/agent/applications">
                  <Filter className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentApplications.length > 0 ? (
                  dashboardData.recentApplications.map(application => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.trackingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-600 text-white text-xs">
                              {getInitials(
                                application.personalInfo.firstName,
                                application.personalInfo.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {application.personalInfo.firstName}{' '}
                              {application.personalInfo.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {application.personalInfo.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {application.visaDetails.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.visaDetails.visaType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <Link href={`/agent/applications/${application._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
