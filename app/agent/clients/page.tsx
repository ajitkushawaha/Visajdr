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
import {
  Users,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react'
import useRoleRedirect from '@/utils/protectedRoute'
import Link from 'next/link'

interface Client {
  _id: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality: string
  }
  totalApplications: number
  approvedApplications: number
  pendingApplications: number
  rejectedApplications: number
  totalSpent: number
  lastApplicationDate: string
  applications: Array<{
    _id: string
    trackingId: string
    status: string
    visaDetails: {
      country: string
      visaType: string
    }
    createdAt: string
  }>
}

interface ClientStats {
  totalClients: number
  activeClients: number
  totalApplications: number
  totalRevenue: number
}

export default function AgentClientsPage() {
  const { isRedirecting, isLoading: sessionLoading } = useRoleRedirect([
    'agent',
  ])
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    nationality: '',
    status: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchClients()
    fetchClientStats()
  }, [filters, pagination.page])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.nationality && { nationality: filters.nationality }),
        ...(filters.status && { status: filters.status }),
      })

      const response = await fetch(`/api/agent/clients?${params}`)
      const data = await response.json()

      if (data.success) {
        setClients(data.clients)
        setPagination(prev => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }))
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClientStats = async () => {
    try {
      const response = await fetch('/api/agent/clients/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching client stats:', error)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  if (sessionLoading || isRedirecting || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clients...</p>
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
            Client Management
          </h1>
          <p className="text-gray-600">
            Manage your clients and their applications
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
                    Total Clients
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.totalClients}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Active Clients
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.activeClients}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.totalApplications}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
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
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={filters.search}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Search by name or email"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nationality
              </label>
              <Select
                value={filters.nationality || 'all'}
                onValueChange={value =>
                  setFilters(prev => ({
                    ...prev,
                    nationality: value === 'all' ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Nationalities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nationalities</SelectItem>
                  <SelectItem value="Indian">Indian</SelectItem>
                  <SelectItem value="American">American</SelectItem>
                  <SelectItem value="British">British</SelectItem>
                  <SelectItem value="Canadian">Canadian</SelectItem>
                  <SelectItem value="Australian">Australian</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No clients found</p>
          </div>
        ) : (
          clients.map(client => (
            <Card
              key={client._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {getInitials(
                        client.personalInfo.firstName,
                        client.personalInfo.lastName
                      )}
                    </span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {client.personalInfo.firstName}{' '}
                      {client.personalInfo.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {client.personalInfo.nationality}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">
                      {client.personalInfo.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{client.personalInfo.phone}</span>
                  </div>
                </div>

                {/* Application Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {client.totalApplications}
                    </p>
                    <p className="text-xs text-gray-500">Total Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {client.approvedApplications}
                    </p>
                    <p className="text-xs text-gray-500">Approved</p>
                  </div>
                </div>

                {/* Revenue */}
                <div className="text-center pt-3 border-t">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(client.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>

                {/* Recent Applications */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Recent Applications:
                  </p>
                  {client.applications.slice(0, 2).map(app => (
                    <div
                      key={app._id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium">{app.trackingId}</span>
                        <p className="text-gray-500 capitalize">
                          {app.visaDetails.country} - {app.visaDetails.visaType}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  ))}
                  {client.applications.length > 2 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{client.applications.length - 2} more applications
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/agent/applications?client=${client._id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Apps
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/agent/clients/${client._id}`}>
                      <Users className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
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
    </div>
  )
}
