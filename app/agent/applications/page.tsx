'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import useRoleRedirect from '@/utils/protectedRoute'

interface VisaApplication {
  _id: string
  trackingId: string
  status:
    | 'submitted'
    | 'pending'
    | 'under_review'
    | 'assigned_to_agent'
    | 'in_embassy'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed'
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality: string
  }
  visaDetails: {
    country: string
    visaType: string
    price: number
    processingTime: string
    stayPeriod: string
    validity: string
  }
  totalAmount: number
  createdAt: string
  updatedAt: string
  estimatedProcessingDate: string
  actualProcessingDate?: string
  rejectionReason?: string
}

const statusColors = {
  submitted: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  assigned_to_agent: 'bg-purple-100 text-purple-800',
  in_embassy: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'submitted':
      return <FileText className="w-4 h-4" />
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'under_review':
      return <AlertCircle className="w-4 h-4" />
    case 'assigned_to_agent':
      return <User className="w-4 h-4" />
    case 'in_embassy':
      return <MapPin className="w-4 h-4" />
    case 'approved':
      return <CheckCircle className="w-4 h-4" />
    case 'rejected':
      return <XCircle className="w-4 h-4" />
    case 'completed':
      return <CheckCircle className="w-4 h-4" />
    case 'cancelled':
      return <XCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

export default function AgentApplicationsPage() {
  const { isRedirecting, isLoading: sessionLoading } = useRoleRedirect([
    'agent',
  ])
  const [applications, setApplications] = useState<VisaApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusSummary, setStatusSummary] = useState<Record<string, number>>({})

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const now = new Date()

  const isTerminalStatus = (status: string) =>
    ['approved', 'completed', 'cancelled'].includes(status)

  const isOverdue = (app: VisaApplication) => {
    if (!app.estimatedProcessingDate) return false
    if (isTerminalStatus(app.status)) return false
    return new Date(app.estimatedProcessingDate) < now
  }

  const getPriorityLevel = (
    app: VisaApplication
  ): 'low' | 'medium' | 'high' | 'urgent' => {
    if (isTerminalStatus(app.status)) return 'low'
    if (!app.estimatedProcessingDate) return 'medium'
    const due = new Date(app.estimatedProcessingDate).getTime()
    const diffDays = Math.floor((due - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'urgent'
    if (diffDays <= 1) return 'urgent'
    if (diffDays <= 3) return 'high'
    return 'medium'
  }

  useEffect(() => {
    fetchApplications()
  }, [page, statusFilter, countryFilter, dateFrom, dateTo])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (countryFilter) params.append('country', countryFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const response = await fetch(`/api/agent/applications?${params}`)
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications || [])
        setTotalPages(data.totalPages || 1)
        setStatusSummary(data.statusSummary || {})
      } else {
        console.error('Error fetching applications:', data.error)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCountryFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalInfo.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.personalInfo.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  if (sessionLoading || isRedirecting) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {sessionLoading ? 'Loading session...' : 'Redirecting...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">
          Manage your assigned visa applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(statusSummary).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]?.replace('bg-', 'bg-').replace('text-', 'text-')}`}
                ></div>
                <div>
                  <p className="text-sm text-gray-600 capitalize">
                    {status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="assigned_to_agent">
                    Assigned to Agent
                  </SelectItem>
                  <SelectItem value="in_embassy">In Embassy</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                placeholder="Filter by country"
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
              />
            </div>

            <div>
              <Input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map(app => (
            <Card key={app._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {app.personalInfo.firstName} {app.personalInfo.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {app.personalInfo.email}
                    </p>
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {app.trackingId}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Badge
                      className={`${statusColors[app.status as keyof typeof statusColors]} text-xs`}
                    >
                      {getStatusIcon(app.status)}
                      <span className="ml-1">
                        {app.status.replace('_', ' ')}
                      </span>
                    </Badge>
                    {isOverdue(app) && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        Overdue
                      </Badge>
                    )}
                    <Badge
                      className={
                        getPriorityLevel(app) === 'urgent'
                          ? 'bg-red-100 text-red-800 text-xs'
                          : getPriorityLevel(app) === 'high'
                            ? 'bg-orange-100 text-orange-800 text-xs'
                            : getPriorityLevel(app) === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 text-xs'
                              : 'bg-gray-100 text-gray-800 text-xs'
                      }
                    >
                      {getPriorityLevel(app).toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {app.visaDetails.country} - {app.visaDetails.visaType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Submitted: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>Amount: ₹{app.totalAmount.toLocaleString()}</span>
                  </div>

                  {app.rejectionReason && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {app.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link href={`/agent/applications/${app._id}`}>
                    <Button className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No applications found</p>
                  <p className="text-sm">
                    No applications match your current filters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
