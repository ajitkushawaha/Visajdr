'use client'

// Avoid prerendering at build; this page depends on client-only data fetching
export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import ApplicationsTable from '@/components/admin/ApplicationsTable'

interface VisaApplication {
  _id: string
  trackingId: string
  status: string
  paymentStatus: string
  personalInfo: any
  visaDetails: any
  totalAmount: number
  createdAt: string
  updatedAt: string
  notes?: string
  agentId?: string
  estimatedProcessingDate: string
  actualProcessingDate?: string
  rejectionReason?: string
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<VisaApplication[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusSummary, setStatusSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const { toast } = useToast()

  const fetchApplications = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/applications?page=${pageNum}&limit=20`
      )
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications)
        setTotal(data.total)
        setPage(data.page)
        setTotalPages(data.totalPages)
        setStatusSummary(data.statusSummary)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch applications',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (
    applicationId: string,
    status: string,
    notes?: string,
    estimatedProcessingDate?: string
  ) => {
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          notes,
          estimatedProcessingDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application status updated successfully',
        })

        // Refresh the applications list
        fetchApplications(page)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update application status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchApplications(newPage)
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
        fetchApplications(page)
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

  const handleClearAllBookings = async () => {
    if (
      !confirm(
        '⚠️ WARNING: This will permanently delete ALL booking data (visa applications, travel insurance, and related commissions). This action cannot be undone!\n\nAre you absolutely sure you want to proceed?'
      )
    ) {
      return
    }

    if (
      !confirm(
        '⚠️ FINAL CONFIRMATION: You are about to delete ALL booking data. This is your last chance to cancel.'
      )
    ) {
      return
    }

    try {
      setClearing(true)
      const response = await fetch('/api/admin/bookings/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: `Cleared all booking data. Deleted ${data.deleted?.total || 0} records.`,
        })
        // Refresh the applications list
        fetchApplications(1)
      } else {
        toast({
          title: 'Error',
          description:
            data.error || data.message || 'Failed to clear booking data',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error clearing bookings:', error)
      toast({
        title: 'Error',
        description: 'Failed to clear booking data',
        variant: 'destructive',
      })
    } finally {
      setClearing(false)
    }
  }

  const handleReopen = async (applicationId: string, reason: string) => {
    try {
      const response = await fetch(
        `/api/admin/applications/${applicationId}/reopen`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reopenReason: reason }),
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application reopened successfully',
        })
        fetchApplications(page)
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to reopen application',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reopen application',
        variant: 'destructive',
      })
    }
  }

  const handleViewDetails = (applicationId: string) => {
    // Navigate to application details page
    window.open(`/admin/applications/${applicationId}`, '_blank')
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Visa Applications
          </h1>
          <p className="text-gray-600">
            Manage and track all visa applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchApplications(page)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={handleClearAllBookings}
            disabled={clearing || loading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {clearing ? 'Clearing...' : 'Clear All Bookings'}
          </Button>
        </div>
      </div>

      <ApplicationsTable
        isLoading={loading}
        applications={applications as any}
        total={total}
        page={page}
        totalPages={totalPages}
        statusSummary={statusSummary}
        onStatusUpdate={handleStatusUpdate}
        onPageChange={handlePageChange}
        onAssignAgent={handleAssignAgent}
        onReopen={handleReopen}
        onViewDetails={handleViewDetails}
      />

      {applications.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No applications found</p>
              <p>There are no visa applications to display at the moment.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
