'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgGridReact } from 'ag-grid-react'
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  ICellRendererParams,
  GridApi,
} from 'ag-grid-community'

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  Clock,
  TrendingUp,
  FileText,
  MapPin,
  MoreHorizontal,
  Pencil,
  UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
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
} from '@/components/ui/dialog'

interface AbandonedApplication {
  _id: string
  trackingId: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  visaId: {
    country: string
    visaType: string
  }
  userId: {
    name: string
    email: string
    phone: string
  }
  totalAmount: number
  paymentStatus: 'pending' | 'completed' | 'failed'
  status: string
  abandonedAt: string
  createdAt: string
  convenienceFees?: {
    total: number
  }
  notes?: string
}

interface AbandonedBookingsTableProps {
  applications: AbandonedApplication[]
  loading: boolean
  onRefresh: () => void
  onSearch: (term: string) => void
  onPageChange: (page: number) => void
  currentPage: number
  totalPages: number
  totalItems: number
  onAssignAgent?: (applicationId: string, agentId: string) => void
}

export default function AbandonedBookingsTable({
  applications,
  loading,
  onRefresh,
  onSearch,
  onPageChange,
  currentPage,
  totalPages,
  totalItems,
  onAssignAgent,
}: AbandonedBookingsTableProps) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Assign Agent State
  const [isAssignAgentDialogOpen, setIsAssignAgentDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] =
    useState<AbandonedApplication | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [availableAgents, setAvailableAgents] = useState<any[]>([])
  const [isFollowupDialogOpen, setIsFollowupDialogOpen] = useState(false)
  const [followupNote, setFollowupNote] = useState('')
  const [followupClose, setFollowupClose] = useState(false)

  const fetchAvailableAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents')
      const data = await response.json()
      if (data.success) {
        setAvailableAgents(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    }
  }

  const openAssignAgentDialog = (application: AbandonedApplication) => {
    setSelectedApplication(application)
    setIsAssignAgentDialogOpen(true)
    fetchAvailableAgents()
  }

  const openFollowupDialog = (application: AbandonedApplication) => {
    setSelectedApplication(application)
    setFollowupNote(application.notes || '')
    setFollowupClose(false)
    setIsFollowupDialogOpen(true)
  }

  const handleAssignAgentSubmit = () => {
    if (selectedApplication && selectedAgentId && onAssignAgent) {
      onAssignAgent(selectedApplication._id, selectedAgentId)
      setIsAssignAgentDialogOpen(false)
      setSelectedAgentId('')
      setSelectedApplication(null)
    }
  }

  const handleFollowupSubmit = async () => {
    if (!selectedApplication) return
    const payload = {
      applicationId: selectedApplication._id,
      status: selectedApplication.status,
      notes: followupClose
        ? `Follow-up closed${followupNote ? ` — ${followupNote}` : ''}`
        : followupNote || '',
    }
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setIsFollowupDialogOpen(false)
        setSelectedApplication(null)
        onRefresh()
      }
    } catch (e) {
      // swallow for now
    }
  }

  useEffect(() => {
    if (gridApi) {
      if (loading) {
        gridApi.showLoadingOverlay()
      } else {
        gridApi.hideOverlay()
        if (applications.length === 0) {
          gridApi.showNoRowsOverlay()
        }
      }
    }
  }, [loading, applications, gridApi])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const columnDefs: ColDef<AbandonedApplication>[] = [
    {
      headerName: 'Applicant',
      width: 280,
      cellRenderer: (params: ICellRendererParams) => {
        const app = params.data
        if (!app) return null
        return (
          <div className="flex flex-col justify-center h-full py-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                {app.personalInfo?.firstName?.charAt(0) || 'U'}
                {app.personalInfo?.lastName?.charAt(0) || ''}
              </div>
              <span className="font-semibold text-gray-900 text-sm">
                {app.personalInfo?.firstName} {app.personalInfo?.lastName}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 ml-10">
              <div className="flex items-center text-xs text-gray-500">
                <Mail className="w-3 h-3 mr-1.5 opacity-70" />
                {app.personalInfo?.email || 'N/A'}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Phone className="w-3 h-3 mr-1.5 opacity-70" />
                {app.personalInfo?.phone || 'N/A'}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      headerName: 'Visa Details',
      width: 220,
      cellRenderer: (params: ICellRendererParams) => {
        const app = params.data
        if (!app) return null
        const isUnknown = !app.visaId?.country && !app.visaId?.visaType

        return (
          <div className="flex flex-col justify-center h-full py-2">
            {isUnknown ? (
              <span className="text-gray-400 italic text-sm">
                Details pending
              </span>
            ) : (
              <>
                <div className="flex items-center font-medium text-gray-900 text-sm mb-1">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                  {app.visaId?.country || 'Unknown Country'}
                </div>
                <div className="flex items-center text-xs text-gray-600 ml-5">
                  <FileText className="w-3 h-3 mr-1.5 opacity-70" />
                  {app.visaId?.visaType || 'Unknown Type'}
                </div>
              </>
            )}
            <div className="text-[10px] text-gray-400 mt-2 ml-1 font-mono bg-gray-50 w-fit px-1 rounded border">
              ID: {app.trackingId || app._id.substring(0, 8)}
            </div>
          </div>
        )
      },
    },
    {
      headerName: 'Follow-up',
      width: 220,
      cellRenderer: (params: ICellRendererParams) => {
        const app = params.data
        if (!app) return null
        const note = app.notes?.trim()
        return (
          <div className="flex flex-col justify-center h-full py-2">
            {note ? (
              <div className="text-xs text-gray-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                {note}
              </div>
            ) : (
              <span className="text-gray-400 text-sm italic">
                No follow-up yet
              </span>
            )}
            <div className="mt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => openFollowupDialog(app)}
              >
                Update status / follow-up
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      headerName: 'Amount',
      field: 'totalAmount',
      width: 120,
      cellClass: 'flex items-center',
      valueFormatter: params => formatCurrency(params.value),
      cellStyle: { fontWeight: 600, color: '#374151' },
    },
    {
      headerName: 'Status',
      width: 160,
      cellRenderer: (params: ICellRendererParams) => {
        const app = params.data
        if (!app) return null
        return (
          <div className="flex flex-col justify-center h-full gap-1.5">
            <Badge
              variant="outline"
              className="w-fit bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-2 py-0.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
              {app.status}
            </Badge>
            <Badge
              variant="outline"
              className={`w-fit text-[10px] px-2 py-0.5 ${
                app.paymentStatus === 'completed'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : app.paymentStatus === 'failed'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  app.paymentStatus === 'completed'
                    ? 'bg-green-500'
                    : app.paymentStatus === 'failed'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                }`}
              ></span>
              Payment: {app.paymentStatus}
            </Badge>
          </div>
        )
      },
    },
    {
      headerName: 'Timing',
      width: 220,
      cellRenderer: (params: ICellRendererParams) => {
        const app = params.data
        if (!app) return null
        return (
          <div className="flex flex-col justify-center h-full py-2 gap-1">
            <div className="flex items-center text-xs text-red-600 font-medium bg-red-50 w-fit px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3 mr-1.5" />
              Abandoned: {formatDate(app.abandonedAt)}
            </div>
            <div className="flex items-center text-xs text-gray-500 ml-0.5">
              <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
              Created: {formatDate(app.createdAt)}
            </div>
          </div>
        )
      },
    },
    {
      headerName: 'Actions',
      width: 80,
      pinned: 'right',
      cellClass: 'flex items-center justify-center',
      cellRenderer: (params: ICellRendererParams) => {
        const app = params.data
        if (!app) return null
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
                onClick={() => navigator.clipboard.writeText(app.trackingId)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href={`/admin/applications/${app._id}`} className="w-full">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => openFollowupDialog(app)}>
                <Pencil className="mr-2 h-4 w-4" />
                Update Status / Follow-up
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
  ]

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  }

  return (
    <>
      <Card className="w-full shadow-md border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Abandoned Bookings
              <Badge variant="secondary" className="ml-2">
                {totalItems}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    placeholder="Search bookings..."
                    className="pl-9 bg-white"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </form>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                className="bg-white hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] w-full ag-theme-quartz">
            <AgGridReact
              rowData={applications}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={false}
              rowHeight={80}
              headerHeight={48}
              onGridReady={params => setGridApi(params.api)}
              overlayLoadingTemplate={
                '<div class="flex flex-col items-center justify-center p-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div><p class="text-muted-foreground">Loading bookings...</p></div>'
              }
              overlayNoRowsTemplate={
                '<div class="flex flex-col items-center justify-center p-8 text-muted-foreground"><div class="mb-4 rounded-full bg-gray-100 p-3"><svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg></div><p class="text-lg font-medium">No abandoned bookings found</p><p class="text-sm">Try adjusting your search filters</p></div>'
              }
            />
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50/50">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isAssignAgentDialogOpen}
        onOpenChange={setIsAssignAgentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Agent</Label>
              <Select
                value={selectedAgentId}
                onValueChange={setSelectedAgentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map(agent => (
                    <SelectItem key={agent._id} value={agent._id}>
                      {agent.personalDetails?.fullName ||
                        agent.userId?.name ||
                        'Unknown Agent'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAssignAgentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignAgentSubmit}
                disabled={!selectedAgentId}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isFollowupDialogOpen}
        onOpenChange={setIsFollowupDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status / Follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Follow-up note</Label>
              <Input
                placeholder='e.g. "Next follow-up after 2 days"'
                value={followupNote}
                onChange={e => setFollowupNote(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="followupClose"
                checked={followupClose}
                onChange={e => setFollowupClose(e.target.checked)}
              />
              <Label htmlFor="followupClose">Close follow-up</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFollowupDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleFollowupSubmit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
