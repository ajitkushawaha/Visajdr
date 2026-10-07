'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
  FileText,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import AbandonedBookingsTable from '@/components/admin/AbandonedBookingsTable'

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
}

interface Stats {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
}

export default function AbandonedBookings() {
  const [applications, setApplications] = useState<AbandonedApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [runningCleanup, setRunningCleanup] = useState(false)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAbandonedBookings()
  }, [currentPage, searchTerm])

  const fetchAbandonedBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(
        `/api/admin/applications/abandoned?${params}`
      )
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications || [])
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.total || 0)
        setStats(data.stats || stats)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch abandoned bookings',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch abandoned bookings:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch abandoned bookings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleRunCleanup = async () => {
    try {
      setRunningCleanup(true)
      const response = await fetch('/api/cron/cleanup-pending')
      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Cleanup Completed',
          description: `Moved ${data.abandoned || 0} pending booking(s) to abandoned status.`,
        })
        // Refresh the list after cleanup
        await fetchAbandonedBookings()
      } else {
        toast({
          title: 'Cleanup Failed',
          description: data.error || 'Failed to run cleanup',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to run cleanup:', error)
      toast({
        title: 'Error',
        description: 'Failed to run cleanup',
        variant: 'destructive',
      })
    } finally {
      setRunningCleanup(false)
    }
  }

  const handleAssignAgent = async (applicationId: string, agentId: string) => {
    try {
      const response = await fetch('/api/admin/applications/assign-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, agentId }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Agent assigned successfully',
        })
        fetchAbandonedBookings()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to assign agent',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign agent',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (app: AbandonedApplication) => {
    window.open(`/admin/applications/${app._id}`, '_blank')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Abandoned Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Lead generation - incomplete bookings for follow-up
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRunCleanup}
            variant="outline"
            size="sm"
            disabled={runningCleanup}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${runningCleanup ? 'animate-spin' : ''}`}
            />
            Run Cleanup
          </Button>
          <Button
            onClick={fetchAbandonedBookings}
            variant="outline"
            size="sm"
            className="text-gray-700 hover:text-gray-900"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Abandoned
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Abandoned Bookings Table */}
      <AbandonedBookingsTable
        applications={applications}
        loading={loading}
        onRefresh={fetchAbandonedBookings}
        onSearch={handleSearch}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onEdit={handleEdit}
        onAssignAgent={handleAssignAgent}
      />
    </div>
  )
}
