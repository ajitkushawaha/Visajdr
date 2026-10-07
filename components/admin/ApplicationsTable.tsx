'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgGridReact } from 'ag-grid-react'
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  ICellRendererParams,
  themeQuartz,
  GridApi,
} from 'ag-grid-community'

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Eye,
  Pencil,
  Calendar,
  UserPlus,
  FileText,
  CheckCircle,
  X,
  Copy,
  AlertTriangle,
  Clock,
  MoreHorizontal,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

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
    startDate?: string
    endDate?: string
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
  notes?: string
  agentId?: {
    _id: string
    agentId: string
    personalDetails: {
      fullName: string
      email: string
    }
  }
  estimatedProcessingDate: string
  actualProcessingDate?: string
  rejectionReason?: string
  statusHistory?: Array<{
    status: string
    changedBy: string
    changedByRole: 'user' | 'admin' | 'agent'
    changedByName: string
    timestamp: string
    notes?: string
    reason?: string
  }>
}

interface ApplicationsTableProps {
  applications: VisaApplication[]
  total: number
  page: number
  totalPages: number
  statusSummary: Record<string, number>
  onStatusUpdate: (
    applicationId: string,
    status: string,
    notes?: string,
    estimatedProcessingDate?: string
  ) => void
  onPageChange: (page: number) => void
  onAssignAgent?: (applicationId: string, agentId: string) => void
  onReopen?: (applicationId: string, reason: string) => void
  onViewDetails?: (applicationId: string) => void
  isLoading?: boolean
}

// Dynamic status colors - will be populated from API
const getStatusColor = (
  status: string,
  statuses: Array<{ slug: string; color: string }>
): string => {
  const statusObj = statuses.find(s => s.slug === status)
  return statusObj?.color || 'bg-gray-100 text-gray-800'
}

// Fallback colors for backward compatibility
const fallbackStatusColors: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Submitted: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  abandoned: 'bg-orange-100 text-orange-800',
  under_review: 'bg-blue-100 text-blue-800',
  assigned_to_agent: 'bg-purple-100 text-purple-800',
  in_embassy: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  overdue: 'bg-red-500 text-white',
}

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

export default function ApplicationsTable({
  applications,
  total,
  page,
  totalPages,
  statusSummary,
  onStatusUpdate,
  onPageChange,
  onAssignAgent,
  onReopen,
  onViewDetails,
  isLoading = false,
}: ApplicationsTableProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] =
    useState<VisaApplication | null>(null)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updateNotes, setUpdateNotes] = useState('')
  const [updateDate, setUpdateDate] = useState('')
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isAssignAgentDialogOpen, setIsAssignAgentDialogOpen] = useState(false)
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [reopenReason, setReopenReason] = useState('')
  const [availableAgents, setAvailableAgents] = useState<any[]>([])
  const [completingPayment, setCompletingPayment] = useState<string | null>(
    null
  )
  const [applicationStatuses, setApplicationStatuses] = useState<
    Array<{ name: string; slug: string; color: string }>
  >([])

  useEffect(() => {
    if (gridApi) {
      if (isLoading) {
        gridApi.showLoadingOverlay()
      } else {
        gridApi.hideOverlay()
      }
    }
  }, [gridApi, isLoading])

  // Fetch dynamic application statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/public/application-status')
        const data = await response.json()
        if (data.success) {
          setApplicationStatuses(data.data)
        }
      } catch (error) {
        console.error('Error fetching application statuses:', error)
      }
    }
    fetchStatuses()
  }, [])

  const handleStatusUpdate = () => {
    if (selectedApplication && updateStatus) {
      onStatusUpdate(
        selectedApplication._id,
        updateStatus,
        updateNotes,
        updateDate
      )
      setIsUpdateDialogOpen(false)
      setUpdateStatus('')
      setUpdateNotes('')
      setUpdateDate('')
      setSelectedApplication(null)
    }
  }

  const openUpdateDialog = (application: VisaApplication) => {
    setSelectedApplication(application)
    setUpdateStatus(application.status)
    setUpdateNotes(application.notes || '')
    // Format date for input type="date"
    if (application.estimatedProcessingDate) {
      const date = new Date(application.estimatedProcessingDate)
      setUpdateDate(date.toISOString().split('T')[0])
    } else {
      setUpdateDate('')
    }
    setIsUpdateDialogOpen(true)
  }

  const openAssignAgentDialog = (application: VisaApplication) => {
    setSelectedApplication(application)
    setIsAssignAgentDialogOpen(true)
    fetchAvailableAgents()
  }

  const openReopenDialog = (application: VisaApplication) => {
    setSelectedApplication(application)
    setIsReopenDialogOpen(true)
  }

  const fetchAvailableAgents = async () => {
    try {
      console.log('Fetching available agents...')
      const response = await fetch('/api/admin/agents')
      const data = await response.json()
      console.log('Agents API response:', data)
      if (data.success) {
        const agents = data.data || []
        console.log('Available agents:', agents)
        setAvailableAgents(agents)
      } else {
        console.error('Failed to fetch agents:', data.error)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    }
  }

  const handleCompletePayment = async (application: VisaApplication) => {
    if (
      !confirm(
        `Are you sure you want to mark payment as completed for ${application.trackingId}?`
      )
    ) {
      return
    }

    try {
      setCompletingPayment(application._id)
      const response = await fetch('/api/admin/applications/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application._id,
          trackingId: application.trackingId,
          finalAmount: application.totalAmount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment marked as completed successfully',
        })
        // Trigger a refresh by calling onStatusUpdate with current status
        // This will cause parent to refetch
        window.location.reload()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to complete payment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error completing payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete payment',
        variant: 'destructive',
      })
    } finally {
      setCompletingPayment(null)
    }
  }

  const handleAssignAgent = () => {
    if (selectedApplication && selectedAgentId && onAssignAgent) {
      onAssignAgent(selectedApplication._id, selectedAgentId)
      setIsAssignAgentDialogOpen(false)
      setSelectedAgentId('')
    }
  }

  const handleReopen = () => {
    if (selectedApplication && reopenReason && onReopen) {
      onReopen(selectedApplication._id, reopenReason)
      setIsReopenDialogOpen(false)
      setReopenReason('')
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (value) {
      setDateFrom('')
      setDateTo('')
    }
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    if (value) {
      setSearchTerm('')
    }
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    if (value) {
      setSearchTerm('')
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('all')
  }

  const handleCopy = useCallback(
    (text: string, label: string) => {
      navigator.clipboard.writeText(text)
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      })
    },
    [toast]
  )

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

    let matchesStatus =
      statusFilter === 'all' || !statusFilter || app.status === statusFilter

    if (statusFilter === 'overdue') {
      const isFinal = [
        'approved',
        'rejected',
        'completed',
        'cancelled',
        'abandoned',
      ].includes(app.status)
      if (isFinal || !app.estimatedProcessingDate) {
        matchesStatus = false
      } else {
        const deadline = new Date(app.estimatedProcessingDate)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const due = new Date(
          deadline.getFullYear(),
          deadline.getMonth(),
          deadline.getDate()
        )
        matchesStatus = due.getTime() < today.getTime()
      }
    }

    let matchesDate = true
    if (dateFrom || dateTo) {
      const appDate = new Date(app.createdAt)
      appDate.setHours(0, 0, 0, 0)
      const appTime = appDate.getTime()

      if (dateFrom) {
        const [y, m, d] = dateFrom.split('-').map(Number)
        const fromDate = new Date(y, m - 1, d).getTime()
        matchesDate = matchesDate && appTime >= fromDate
      }

      if (dateTo) {
        const [y, m, d] = dateTo.split('-').map(Number)
        const toDate = new Date(y, m - 1, d).getTime()
        matchesDate = matchesDate && appTime <= toDate
      }
    }

    // Mutual exclusive check: if search term exists, ignore date. If date exists, ignore search (though we clear them in handlers, this is a safety check or just use logical AND)
    // Actually, since we clear the other inputs, we can just AND them.
    // But if we want to be strict:
    if (searchTerm) {
      return matchesSearch && matchesStatus
    }
    if (dateFrom || dateTo) {
      return matchesDate && matchesStatus
    }

    return matchesStatus
  })

  const [columnDefs, setColumnDefs] = useState<ColDef<VisaApplication>[]>([])

  useEffect(() => {
    setColumnDefs([
      {
        field: 'trackingId',
        headerName: 'Tracking ID',
        width: 140,
        cellRenderer: (params: ICellRendererParams) => (
          <div className="flex items-center gap-2 group">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {params.value}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleCopy(params.value, 'Tracking ID')}
              title="Copy Tracking ID"
            >
              <Copy className="w-3 h-3 text-gray-500" />
            </Button>
          </div>
        ),
      },
      {
        headerName: 'Applicant',
        minWidth: 200,
        flex: 1,
        valueGetter: (p: any) =>
          p.data.personalInfo.firstName + ' ' + p.data.personalInfo.lastName,
        cellRenderer: (params: ICellRendererParams) => (
          <div>
            <p className="font-medium">
              {params.data.personalInfo.firstName}{' '}
              {params.data.personalInfo.lastName}
            </p>
            <div className="flex items-center gap-1 group">
              <p className="text-sm text-gray-600">
                {params.data.personalInfo.email}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() =>
                  handleCopy(params.data.personalInfo.email, 'Email')
                }
                title="Copy Email"
              >
                <Copy className="w-3 h-3 text-gray-400" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {params.data.personalInfo.nationality}
            </p>
          </div>
        ),
      },
      {
        headerName: 'Visa Details',
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: ICellRendererParams) => (
          <div>
            <p className="font-medium capitalize">
              {params.data.visaDetails.country}
            </p>
            <p className="text-sm text-gray-600">
              {params.data.visaDetails.visaType}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Calendar className="w-3 h-3" />
              {params.data.visaDetails.processingTime}
            </div>
          </div>
        ),
      },
      {
        headerName: 'Timeline',
        width: 160,
        cellRenderer: (params: ICellRendererParams) => {
          const app = params.data
          // Check if application is in a final state
          const isFinal = [
            'approved',
            'rejected',
            'completed',
            'cancelled',
            'abandoned',
          ].includes(app.status)

          if (isFinal) {
            return (
              <div className="flex items-center text-gray-400 text-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                <span>Closed</span>
              </div>
            )
          }

          if (!app.estimatedProcessingDate) {
            return <span className="text-gray-400 text-sm">No deadline</span>
          }

          const deadline = new Date(app.estimatedProcessingDate)
          const now = new Date()
          // Reset time part for accurate day calculation
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          )
          const due = new Date(
            deadline.getFullYear(),
            deadline.getMonth(),
            deadline.getDate()
          )

          const diffTime = due.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays < 0) {
            return (
              <div className="flex flex-col">
                <Badge className="bg-red-500 text-white border-red-600 w-fit mb-1 hover:bg-red-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Overdue {Math.abs(diffDays)}d
                </Badge>
                <span className="text-xs text-gray-500">
                  Expected: {deadline.toLocaleDateString()}
                </span>
              </div>
            )
          } else if (diffDays === 0) {
            return (
              <div className="flex flex-col">
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 w-fit mb-1 hover:bg-orange-100">
                  <Clock className="w-3 h-3 mr-1" />
                  Due Today
                </Badge>
              </div>
            )
          } else {
            return (
              <div className="text-sm">
                <div className="flex items-center text-gray-600 font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  {diffDays} days left
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Due: {deadline.toLocaleDateString()}
                </p>
              </div>
            )
          }
        },
      },

      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        cellRenderer: (params: ICellRendererParams) => (
          <Badge
            className={`${
              getStatusColor(params.value, applicationStatuses) ||
              fallbackStatusColors[params.value] ||
              'bg-gray-100 text-gray-800'
            } hover:text-white transition-colors`}
          >
            {applicationStatuses.find(s => s.slug === params.value)?.name ||
              params.value.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        headerName: 'Travel Dates',
        minWidth: 160,
        cellRenderer: (params: ICellRendererParams) => (
          <div className="text-sm text-gray-600">
            {params.data.personalInfo.startDate ? (
              <>
                <p>
                  From:{' '}
                  {new Date(
                    params.data.personalInfo.startDate
                  ).toLocaleDateString()}
                </p>
                {params.data.personalInfo.endDate && (
                  <p>
                    To:{' '}
                    {new Date(
                      params.data.personalInfo.endDate
                    ).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <span className="text-gray-400">Not specified</span>
            )}
          </div>
        ),
      },
      {
        headerName: 'Agent',
        width: 150,
        cellRenderer: (params: ICellRendererParams) =>
          params.data.agentId ? (
            <div>
              <p className="text-sm font-medium">
                {params.data.agentId.personalDetails.fullName}
              </p>
              <div className="flex items-center gap-1 group">
                <p className="text-xs text-gray-500">
                  {params.data.agentId.agentId}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() =>
                    handleCopy(params.data.agentId.agentId, 'Agent ID')
                  }
                  title="Copy Agent ID"
                >
                  <Copy className="w-3 h-3 text-gray-400" />
                </Button>
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Not assigned</span>
          ),
      },
      {
        field: 'totalAmount',
        headerName: 'Amount',
        width: 100,
        valueFormatter: (params: any) => `₹${params.value.toLocaleString()}`,
        cellClass: 'font-medium',
      },
      {
        field: 'createdAt',
        headerName: 'Date',
        width: 120,
        cellRenderer: (params: ICellRendererParams) => (
          <div className="text-sm">
            <p>{new Date(params.value).toLocaleDateString()}</p>
            <p className="text-gray-500">
              {new Date(params.value).toLocaleTimeString()}
            </p>
          </div>
        ),
      },
      {
        headerName: 'Actions',
        width: 80,
        pinned: 'right',
        cellClass: 'flex items-center justify-center',
        cellRenderer: (params: ICellRendererParams) => {
          const app = params.data
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleCopy(app.trackingId, 'Tracking ID')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onViewDetails && (
                  <DropdownMenuItem onClick={() => onViewDetails(app._id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => openUpdateDialog(app)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Update Status
                </DropdownMenuItem>
                {onAssignAgent && (
                  <DropdownMenuItem onClick={() => openAssignAgentDialog(app)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Agent
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ])
  }, [applicationStatuses, onViewDetails, onAssignAgent])

  // Merge completed and cancelled for display
  const displayStatusEntries = React.useMemo(() => {
    const summary = { ...statusSummary }
    const completed = summary['completed'] || 0
    const cancelled = summary['cancelled'] || 0
    const docRejected = summary['document_rejected'] || 0
    const docReuploaded = summary['document_reuploaded'] || 0

    delete summary['completed']
    delete summary['cancelled']
    delete summary['abandoned']
    delete summary['document_rejected']
    delete summary['document_reuploaded']

    const entries: [string, string | number][] = Object.entries(summary)

    // Add merged entry if there are any
    if (completed > 0 || cancelled > 0) {
      entries.push(['completed_cancelled', `${completed}/${cancelled}`])
    }

    // Add Document Reject/Reupload card
    if (docRejected > 0 || docReuploaded > 0) {
      entries.push(['document_issues', `${docRejected}/${docReuploaded}`])
    }

    return entries
  }, [statusSummary])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {displayStatusEntries.map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === 'completed_cancelled'
                      ? 'bg-gray-200 text-gray-200'
                      : status === 'document_issues'
                        ? 'bg-red-500 text-white'
                        : getStatusColor(status, applicationStatuses) ||
                          fallbackStatusColors[status] ||
                          'bg-gray-100 text-gray-200'
                  }`}
                ></div>
                <div>
                  <p className="text-sm text-gray-600 capitalize">
                    {status === 'completed_cancelled'
                      ? 'Completed/Cancelled'
                      : status === 'document_issues'
                        ? 'Doc Rejected/Reuploaded'
                        : status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by Tracking ID/Name"
                  value={searchTerm}
                  onChange={e => handleSearchChange(e.target.value)}
                  className={`pl-10 ${dateFrom || dateTo ? 'opacity-50' : ''}`}
                  disabled={!!(dateFrom || dateTo)}
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <Label htmlFor="dateFrom" className="sr-only">
                From Date
              </Label>
              <Input
                id="dateFrom"
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={e => handleDateFromChange(e.target.value)}
                className={searchTerm ? 'opacity-50' : ''}
                disabled={!!searchTerm}
              />
            </div>

            <div className="md:col-span-3">
              <Label htmlFor="dateTo" className="sr-only">
                To Date
              </Label>
              <Input
                id="dateTo"
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={e => handleDateToChange(e.target.value)}
                className={searchTerm ? 'opacity-50' : ''}
                disabled={!!searchTerm}
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem
                      value="overdue"
                      className="text-red-600 font-medium"
                    >
                      ⚠️ Overdue
                    </SelectItem>
                    {applicationStatuses.length > 0
                      ? applicationStatuses.map(status => (
                          <SelectItem key={status.slug} value={status.slug}>
                            {status.name}
                          </SelectItem>
                        ))
                      : [
                          <SelectItem key="submitted" value="submitted">
                            Submitted
                          </SelectItem>,
                          <SelectItem key="pending" value="pending">
                            Pending
                          </SelectItem>,
                          <SelectItem key="under_review" value="under_review">
                            Under Review
                          </SelectItem>,
                          <SelectItem
                            key="assigned_to_agent"
                            value="assigned_to_agent"
                          >
                            Assigned to Agent
                          </SelectItem>,
                          <SelectItem key="in_embassy" value="in_embassy">
                            In Embassy
                          </SelectItem>,
                          <SelectItem key="approved" value="approved">
                            Approved
                          </SelectItem>,
                          <SelectItem key="rejected" value="rejected">
                            Rejected
                          </SelectItem>,
                          <SelectItem key="completed" value="completed">
                            Completed
                          </SelectItem>,
                          <SelectItem key="cancelled" value="cancelled">
                            Cancelled
                          </SelectItem>,
                        ]}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                title="Reset Filters"
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="flex flex-col h-[calc(100vh-300px)]">
        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          <div className="w-full h-full">
            <AgGridReact
              rowData={filteredApplications}
              columnDefs={columnDefs}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              theme={themeQuartz}
              onGridReady={params => setGridApi(params.api)}
            />
          </div>
        </CardContent>
        {/* Pagination Footer - Fixed at bottom of Card */}
        {totalPages > 1 && (
          <div className="border-t p-4 flex items-center justify-between bg-white rounded-b-lg">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of{' '}
              {total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <Label>Tracking ID</Label>
                <p className="font-mono bg-gray-100 p-2 rounded mt-1">
                  {selectedApplication.trackingId}
                </p>
              </div>

              <div>
                <Label>Applicant</Label>
                <p className="mt-1">
                  {selectedApplication.personalInfo.firstName}{' '}
                  {selectedApplication.personalInfo.lastName}
                </p>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationStatuses.length > 0
                      ? applicationStatuses.map(status => (
                          <SelectItem key={status.slug} value={status.slug}>
                            {status.name}
                          </SelectItem>
                        ))
                      : [
                          <SelectItem key="submitted" value="submitted">
                            Submitted
                          </SelectItem>,
                          <SelectItem key="pending" value="pending">
                            Pending
                          </SelectItem>,
                          <SelectItem key="under_review" value="under_review">
                            Under Review
                          </SelectItem>,
                          <SelectItem
                            key="assigned_to_agent"
                            value="assigned_to_agent"
                          >
                            Assigned to Agent
                          </SelectItem>,
                          <SelectItem key="in_embassy" value="in_embassy">
                            In Embassy
                          </SelectItem>,
                          <SelectItem key="approved" value="approved">
                            Approved
                          </SelectItem>,
                          <SelectItem key="rejected" value="rejected">
                            Rejected
                          </SelectItem>,
                          <SelectItem key="completed" value="completed">
                            Completed
                          </SelectItem>,
                          <SelectItem key="cancelled" value="cancelled">
                            Cancelled
                          </SelectItem>,
                        ]}
                  </SelectContent>
                </Select>
              </div>

              {selectedApplication.paymentStatus === 'pending' && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-yellow-800">Payment Status</Label>
                      <p className="text-sm text-yellow-700">
                        Payment is pending
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompletePayment(selectedApplication)}
                      disabled={completingPayment === selectedApplication._id}
                      className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Paid
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="deadline">
                  Estimated Completion Date (Deadline)
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={updateDate}
                  onChange={e => setUpdateDate(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set a deadline to track delays. Past deadlines will be marked
                  as "Overdue".
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this application..."
                  value={updateNotes}
                  onChange={e => setUpdateNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>Update Status</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Agent Dialog */}
      <Dialog
        open={isAssignAgentDialogOpen}
        onOpenChange={setIsAssignAgentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <Label>Application</Label>
                <p className="font-mono bg-gray-100 p-2 rounded mt-1">
                  {selectedApplication.trackingId}
                </p>
              </div>

              <div>
                <Label htmlFor="agent">Select Agent</Label>
                <Select
                  value={selectedAgentId}
                  onValueChange={setSelectedAgentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.length === 0 ? (
                      <div className="p-2 text-gray-500 text-center">
                        No agents available. Please create agents first.
                      </div>
                    ) : (
                      availableAgents.map(agent => (
                        <SelectItem key={agent._id} value={agent._id}>
                          {agent.personalDetails?.fullName || 'Unknown'} (
                          {agent.agentId || 'No ID'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {availableAgents.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {availableAgents.length} agent(s) available
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignAgentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssignAgent} disabled={!selectedAgentId}>
                  Assign Agent
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reopen Application Dialog */}
      <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen Application</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <Label>Application</Label>
                <p className="font-mono bg-gray-100 p-2 rounded mt-1">
                  {selectedApplication.trackingId}
                </p>
              </div>

              <div>
                <Label htmlFor="reason">Reopen Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for reopening this application..."
                  value={reopenReason}
                  onChange={e => setReopenReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsReopenDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleReopen} disabled={!reopenReason.trim()}>
                  Reopen Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
