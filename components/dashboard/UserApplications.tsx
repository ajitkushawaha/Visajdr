'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useReceipt } from '@/hooks/useReceipt'
import { toast } from 'sonner'
import { DocumentReupload } from '@/components/dashboard/DocumentReupload'

interface UserApplication {
  _id: string
  trackingId: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed'
  paymentStatus: 'pending' | 'completed' | 'failed'
  visaDetails: {
    country: string
    visaType: string
    price: number
    processingTime: string
    stayPeriod: string
    validity: string
  }
  estimatedProcessingDate: string
  actualProcessingDate?: string
  createdAt: string
  updatedAt: string
  notes?: string
  rejectionReason?: string
  totalAmount: number
  documents?: {
    passport?: {
      status?: string
      rejectionReason?: string
    }
    photo?: {
      status?: string
      rejectionReason?: string
    }
  }
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Your application is waiting for review',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-800',
    icon: FileText,
    description: 'Your application is being reviewed',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Congratulations! Your visa is approved',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Your application was not approved',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Your visa process is complete',
  },
}

export default function UserApplications() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<UserApplication[]>([])
  const [loading, setLoading] = useState(true)
  const { downloadApplicationReceipt, loading: receiptLoading } = useReceipt()

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchUserApplications()
    }
  }, [session])

  const fetchUserApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/applications/user')
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications || [])
      } else {
        console.error('Failed to fetch applications:', data.error)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReceipt = async (trackingId: string) => {
    try {
      await downloadApplicationReceipt(trackingId)
      toast.success('Receipt downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download receipt. Please try again.')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No applications yet</h3>
            <p className="mb-4">
              You haven't submitted any visa applications yet.
            </p>
            <Link href="/apply">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Apply for Visa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
          <p className="text-gray-600">
            Track the status of your visa applications
          </p>
        </div>
        <Link href="/apply">
          <Button className="bg-blue-600 hover:bg-blue-700">
            New Application
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {applications.map(app => {
          const hasRejection =
            app.documents?.passport?.status === 'rejected' ||
            app.documents?.photo?.status === 'rejected'

          let status =
            statusConfig[app.status as keyof typeof statusConfig] ||
            statusConfig['pending']

          // Override status display if documents are rejected
          if (hasRejection) {
            status = {
              label: 'Action Required',
              color: 'bg-red-600 text-white animate-pulse',
              icon: AlertCircle,
              description: 'Please re-upload rejected documents to proceed',
            }
          }

          return (
            <Card key={app._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Application Info */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.visaDetails.country} - {app.visaDetails.visaType}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Tracking ID:{' '}
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {app.trackingId}
                          </code>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={status.color}>{status.label}</Badge>
                        <Badge
                          className={
                            app.paymentStatus === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {app.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    {/* Status Description */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {React.createElement(status.icon, {
                        className: 'w-5 h-5 mt-0.5 text-gray-600',
                      })}
                      <p className="text-gray-700 text-sm">
                        {status.description}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Processing:</span>
                        <span className="font-medium">
                          {app.visaDetails.processingTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Stay:</span>
                        <span className="font-medium">
                          {app.visaDetails.stayPeriod}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Validity:</span>
                        <span className="font-medium">
                          {app.visaDetails.validity}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {app.notes && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 mb-1">
                          Notes from Team
                        </h4>
                        <p className="text-yellow-800 text-sm">{app.notes}</p>
                      </div>
                    )}

                    {app.rejectionReason && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-900 mb-1">
                          Rejection Reason
                        </h4>
                        <p className="text-red-800 text-sm">
                          {app.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Document Rejection & Re-upload */}
                    {/* DEBUG: Show status to verify data */}
                    <div className="text-xs text-red-500 font-bold border border-red-500 p-1 mb-2">
                      DEBUG: Passport Status = "
                      {app.documents?.passport?.status}", Photo Status = "
                      {app.documents?.photo?.status}"
                    </div>

                    {app.documents?.passport?.status === 'rejected' && (
                      <DocumentReupload
                        applicationId={app._id}
                        documentType="passport"
                        rejectionReason={
                          app.documents.passport.rejectionReason ||
                          'No reason provided'
                        }
                        onUploadComplete={fetchUserApplications}
                      />
                    )}
                    {app.documents?.photo?.status === 'rejected' && (
                      <DocumentReupload
                        applicationId={app._id}
                        documentType="photo"
                        rejectionReason={
                          app.documents.photo.rejectionReason ||
                          'No reason provided'
                        }
                        onUploadComplete={fetchUserApplications}
                      />
                    )}
                  </div>

                  {/* Right Side - Actions and Dates */}
                  <div className="lg:w-48 space-y-4">
                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{app.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Submitted</p>
                        <p className="font-medium">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Estimated Completion</p>
                        <p className="font-medium">
                          {new Date(
                            app.estimatedProcessingDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {app.actualProcessingDate && (
                        <div>
                          <p className="text-gray-600">Actual Completion</p>
                          <p className="font-medium">
                            {new Date(
                              app.actualProcessingDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link
                        href={`/track?trackingId=${app.trackingId}`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          Track Status
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleDownloadReceipt(app.trackingId)}
                        disabled={receiptLoading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {receiptLoading ? 'Downloading...' : 'Download Receipt'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
