'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Trash2,
  Filter,
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Reply,
} from 'lucide-react'

interface VisaQuery {
  _id: string
  trackingId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  country: string
  visaType: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  response?: string
  responseDate?: string
  tags: string[]
  source: string
  createdAt: string
  updatedAt: string
}

export default function VisaQueryListPage() {
  const [queries, setQueries] = useState<VisaQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [countries, setCountries] = useState<string[]>([])
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  })
  const [selectedQuery, setSelectedQuery] = useState<VisaQuery | null>(null)
  const [responseText, setResponseText] = useState('')
  const [showResponseModal, setShowResponseModal] = useState(false)

  useEffect(() => {
    fetchQueries()
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    filterStatus,
    filterPriority,
    filterCountry,
  ])

  const fetchQueries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: filterStatus,
        priority: filterPriority,
        country: filterCountry,
      })
      const response = await fetch(`/api/admin/visa-queries?${params}`)
      const data = await response.json()

      if (data.success) {
        setQueries(data.queries || [])
        setCountries(data.countries || [])
        setStats(
          data.stats || {
            total: 0,
            new: 0,
            inProgress: 0,
            resolved: 0,
            urgent: 0,
          }
        )
        setPagination(prev => ({
          ...prev,
          ...(data.pagination || {}),
        }))
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetToFirstPage = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusChange = async (queryId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/visa-queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId,
          updates: { status: newStatus },
        }),
      })

      if (response.ok) {
        fetchQueries()
      }
    } catch (error) {
      console.error('Error updating query status:', error)
    }
  }

  const handlePriorityChange = async (queryId: string, newPriority: string) => {
    try {
      const response = await fetch('/api/admin/visa-queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId,
          updates: { priority: newPriority },
        }),
      })

      if (response.ok) {
        fetchQueries()
      }
    } catch (error) {
      console.error('Error updating query priority:', error)
    }
  }

  const handleSendResponse = async () => {
    if (!selectedQuery || !responseText.trim()) {
      alert('Please enter a response')
      return
    }

    try {
      const response = await fetch('/api/admin/visa-queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId: selectedQuery._id,
          updates: {
            response: responseText,
            status: 'resolved',
          },
        }),
      })

      if (response.ok) {
        setResponseText('')
        setShowResponseModal(false)
        fetchQueries()
      }
    } catch (error) {
      console.error('Error sending response:', error)
    }
  }

  const handleDeleteQuery = async (queryId: string) => {
    if (!confirm('Are you sure you want to delete this query?')) return

    try {
      const response = await fetch(`/api/admin/visa-queries?id=${queryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchQueries()
      }
    } catch (error) {
      console.error('Error deleting query:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig['new']
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('-', ' ').charAt(0).toUpperCase() +
          status.replace('-', ' ').slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800' },
      medium: { color: 'bg-blue-100 text-blue-800' },
      high: { color: 'bg-orange-100 text-orange-800' },
      urgent: { color: 'bg-red-100 text-red-800' },
    }

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig['low']

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {priority === 'urgent' && <AlertTriangle className="h-3 w-3" />}
        {priority === 'high' && <AlertTriangle className="h-3 w-3" />}
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const totalQueries = stats.total
  const newQueries = stats.new
  const inProgressQueries = stats.inProgress
  const resolvedQueries = stats.resolved
  const urgentQueries = stats.urgent

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Visa Queries</h1>
          <p className="text-gray-600">
            Manage visa-related customer queries and support requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchQueries}
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{totalQueries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{newQueries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {inProgressQueries}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {resolvedQueries}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">
                  {urgentQueries}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value)
                    resetToFirstPage()
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filterStatus}
                onValueChange={value => {
                  setFilterStatus(value)
                  resetToFirstPage()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filterPriority}
                onValueChange={value => {
                  setFilterPriority(value)
                  resetToFirstPage()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Select
                value={filterCountry}
                onValueChange={value => {
                  setFilterCountry(value)
                  resetToFirstPage()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country.toLowerCase()}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchQueries} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Visa Queries ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading queries...</div>
          ) : queries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No queries found
            </div>
          ) : (
            <div className="space-y-4">
              {queries.map(query => (
                <div
                  key={query._id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{query.customerName}</h3>
                        {getStatusBadge(query.status)}
                        {getPriorityBadge(query.priority)}
                        {query.trackingId && (
                          <Badge variant="outline" className="font-mono">
                            {query.trackingId}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {query.customerEmail}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {query.customerPhone}
                        </span>
                        <span className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          {query.country} - {query.visaType}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(query.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Subject:</strong> {query.subject}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {query.message}
                      </p>
                      {query.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {query.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedQuery(query)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Query Details</DialogTitle>
                          </DialogHeader>
                          {selectedQuery && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    Customer Name
                                  </label>
                                  <p>{selectedQuery.customerName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Email
                                  </label>
                                  <p>{selectedQuery.customerEmail}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Phone
                                  </label>
                                  <p>{selectedQuery.customerPhone}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Country & Visa Type
                                  </label>
                                  <p>
                                    {selectedQuery.country} -{' '}
                                    {selectedQuery.visaType}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Subject
                                  </label>
                                  <p>{selectedQuery.subject}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Priority
                                  </label>
                                  <div>
                                    {getPriorityBadge(selectedQuery.priority)}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Message
                                </label>
                                <p className="mt-1 p-3 bg-gray-50 rounded">
                                  {selectedQuery.message}
                                </p>
                              </div>
                              {selectedQuery.response && (
                                <div>
                                  <label className="text-sm font-medium">
                                    Response
                                  </label>
                                  <p className="mt-1 p-3 bg-blue-50 rounded">
                                    {selectedQuery.response}
                                  </p>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Select
                                  value={selectedQuery.status}
                                  onValueChange={value =>
                                    handleStatusChange(selectedQuery._id, value)
                                  }
                                >
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="in-progress">
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value="resolved">
                                      Resolved
                                    </SelectItem>
                                    <SelectItem value="closed">
                                      Closed
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={selectedQuery.priority}
                                  onValueChange={value =>
                                    handlePriorityChange(
                                      selectedQuery._id,
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">
                                      Urgent
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {!selectedQuery.response && (
                                <div>
                                  <label className="text-sm font-medium">
                                    Send Response
                                  </label>
                                  <Textarea
                                    placeholder="Type your response here..."
                                    value={responseText}
                                    onChange={e =>
                                      setResponseText(e.target.value)
                                    }
                                    className="mt-1"
                                  />
                                  <Button
                                    onClick={handleSendResponse}
                                    className="mt-2"
                                  >
                                    <Reply className="h-4 w-4 mr-2" />
                                    Send Response
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuery(query._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} queries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={!pagination.hasPrev || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={!pagination.hasNext || loading}
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
