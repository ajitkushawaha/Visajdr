'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrendingUp, Calendar, Filter, Download, Eye } from 'lucide-react'
import useRoleRedirect from '@/utils/protectedRoute'
import Link from 'next/link'
import { useCurrency } from '@/hooks/useCurrency'

interface Commission {
  _id: string
  applicationId: {
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
  }
  commissionAmount: number
  commissionRate: number
  commissionType: 'percentage' | 'fixed'
  baseAmount: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  paymentPeriod: string
  paidAt?: string
  paymentReference?: string
  createdAt: string
}

interface CommissionStats {
  totalCommissions: number
  pendingCommissions: number
  paidCommissions: number
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
}

export default function AgentCommissionsPage() {
  const { symbol: currencySymbol } = useCurrency()
  const { isRedirecting, isLoading: sessionLoading } = useRoleRedirect([
    'agent',
  ])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    paymentPeriod: '',
    search: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchCommissions()
    fetchCommissionStats()
  }, [filters, pagination.page])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentPeriod && { paymentPeriod: filters.paymentPeriod }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/agent/commissions?${params}`)
      const data = await response.json()

      if (data.success) {
        setCommissions(data.commissions)
        setPagination(prev => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }))
      }
    } catch (error) {
      console.error('Error fetching commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommissionStats = async () => {
    try {
      const response = await fetch('/api/agent/commissions/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching commission stats:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    }
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  if (sessionLoading || isRedirecting || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading commissions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Commission Management
          </h1>
          <p className="text-gray-600">
            Track your earnings and commission history
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/agent/dashboard">
            <Eye className="h-4 w-4 mr-2" />
            View Dashboard
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total Commissions
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.totalCommissions}
                  </p>
                </div>
                <span className="text-2xl font-semibold text-blue-600">
                  {currencySymbol}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.pendingCommissions}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Paid
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.paidCommissions}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
                <span className="text-2xl font-semibold text-purple-600">
                  {currencySymbol}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select
                value={filters.status || 'all'}
                onValueChange={value =>
                  setFilters(prev => ({
                    ...prev,
                    status: value === 'all' ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Payment Period
              </label>
              <Input
                type="month"
                value={filters.paymentPeriod}
                onChange={e =>
                  setFilters(prev => ({
                    ...prev,
                    paymentPeriod: e.target.value,
                  }))
                }
                placeholder="Select period"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search
              </label>
              <Input
                value={filters.search}
                onChange={e =>
                  setFilters(prev => ({ ...prev, search: e.target.value }))
                }
                placeholder="Search by tracking ID or client name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl font-semibold text-gray-400 mx-auto mb-4 block">
                {currencySymbol}
              </span>
              <p className="text-gray-500">No commissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Application
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Base Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Commission Rate
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Commission Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Payment Period
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(commission => (
                    <tr
                      key={commission._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {commission.applicationId.trackingId}
                          </p>
                          <p className="text-sm text-gray-500">
                            {commission.applicationId.visaDetails.country} -{' '}
                            {commission.applicationId.visaDetails.visaType}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {commission.applicationId.personalInfo.firstName}{' '}
                            {commission.applicationId.personalInfo.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {commission.applicationId.personalInfo.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          {formatCurrency(commission.baseAmount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          {commission.commissionType === 'percentage'
                            ? `${commission.commissionRate}%`
                            : formatCurrency(commission.commissionRate)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-600">
                          {formatCurrency(commission.commissionAmount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(commission.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {commission.paymentPeriod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/agent/applications/${commission.applicationId._id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
