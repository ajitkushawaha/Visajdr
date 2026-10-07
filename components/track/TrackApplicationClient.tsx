'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import useRoleRedirect from '@/utils/protectedRoute'

interface ApplicationStatus {
  trackingId: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed'
  paymentStatus: 'pending' | 'completed' | 'failed'
  totalAmount: number
  visaDetails: {
    country: string
    visaType: string
    price: number
    processingTime: string
    stayPeriod: string
    validity: string
  }
  personalInfo: {
    firstName: string
    lastName: string
    nationality: string
  }
  estimatedProcessingDate: string
  actualProcessingDate?: string
  createdAt: string
  updatedAt: string
  notes?: string
  rejectionReason?: string
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Clock,
    description:
      'Your application has been submitted and is waiting for review',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: FileText,
    description: 'Your application is currently being reviewed by our team',
  },
  approved: {
    label: 'Approved',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    description: 'Congratulations! Your visa application has been approved',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: XCircle,
    description:
      'Your application has been rejected. Please check the reason below',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    description:
      'Your visa application process has been completed successfully',
  },
}

export default function TrackApplicationClient() {
  useRoleRedirect(['user'])
  const searchParams = useSearchParams()
  const [trackingId, setTrackingId] = useState(
    searchParams.get('trackingId') || ''
  )
  const [application, setApplication] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trackApplication = async () => {
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID')
      return
    }

    setLoading(true)
    setError('')
    setApplication(null)

    try {
      const response = await fetch(
        `/api/applications/track/${trackingId.trim()}`
      )
      const data = await response.json()

      if (response.ok && data.success) {
        setApplication(data.application)
      } else {
        setError(data.error || 'Application not found')
      }
    } catch (err) {
      setError('Failed to track application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 md:px-8">
      <div className="w-full md:w-4/5  mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-brand-primary mb-4">
            Track Your Visa Application
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Enter your tracking ID to check the status of your application
          </p>
        </div>

        {/* Tracking Input */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="trackingId" className="sr-only">
                  Tracking ID
                </Label>
                <Input
                  id="trackingId"
                  placeholder="Enter your tracking ID (e.g., EU-20241201-ABC12)"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && trackApplication()}
                  className="text-center text-lg"
                />
              </div>
              <Button
                onClick={trackApplication}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Tracking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Track
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Status */}
        {application && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span>Application Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(application.status).bgColor} ${getStatusConfig(application.status).color}`}
                >
                  {getStatusConfig(application.status).label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Description */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                {React.createElement(getStatusConfig(application.status).icon, {
                  className: `w-5 h-5 mt-0.5 ${getStatusConfig(application.status).color}`,
                })}
                <p className="text-gray-700">
                  {getStatusConfig(application.status).description}
                </p>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-brand-primary">
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium capitalize">
                        {application.personalInfo.firstName}{' '}
                        {application.personalInfo.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nationality:</span>
                      <span className="font-medium capitalize">
                        {application.personalInfo.nationality}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking ID:</span>
                      <span className="font-medium font-mono text-xs">
                        {application.trackingId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visa Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-brand-primary">
                    Visa Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 capitalize">Country:</span>
                      <span className="font-medium capitalize">
                        {application.visaDetails.country}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {application.visaDetails.visaType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium">
                        ₹
                        {application.totalAmount?.toLocaleString() ||
                          application.visaDetails.price?.toLocaleString() ||
                          'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Processing Time</p>
                  <p className="font-medium text-blue-900">
                    {application.visaDetails.processingTime}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Stay Period</p>
                  <p className="font-medium text-blue-900">
                    {application.visaDetails.stayPeriod}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Validity</p>
                  <p className="font-medium text-blue-900">
                    {application.visaDetails.validity}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-brand-primary">
                  Application Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Application Submitted</p>
                      <p className="text-sm text-gray-600">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {application.status !== 'pending' && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Under Review</p>
                        <p className="text-sm text-gray-600">
                          {new Date(application.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.status === 'approved' && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Application Approved</p>
                        <p className="text-sm text-gray-600">
                          {application.actualProcessingDate
                            ? new Date(
                                application.actualProcessingDate
                              ).toLocaleDateString()
                            : 'Recently approved'}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Application Rejected</p>
                        <p className="text-sm text-gray-600">
                          {application.actualProcessingDate
                            ? new Date(
                                application.actualProcessingDate
                              ).toLocaleDateString()
                            : 'Recently rejected'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {application.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-brand-primary mb-2">
                    Notes from Team
                  </h4>
                  <p className="text-yellow-800 text-sm">{application.notes}</p>
                </div>
              )}

              {application.rejectionReason && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-brand-primary mb-2">
                    Rejection Reason
                  </h4>
                  <p className="text-red-800 text-sm">
                    {application.rejectionReason}
                  </p>
                </div>
              )}

              {/* Estimated Processing Date */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-brand-primary">
                    Estimated Processing Date
                  </span>
                </div>
                <p className="text-gray-700">
                  {new Date(
                    application.estimatedProcessingDate
                  ).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-brand-primary mb-4">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium mb-2">Can't find your application?</p>
                <ul className="space-y-1">
                  <li>• Check if you entered the tracking ID correctly</li>
                  <li>
                    • Ensure you're using the tracking ID from your confirmation
                    email
                  </li>
                  <li>• Contact our support team for assistance</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">
                  Application status not updating?
                </p>
                <ul className="space-y-1">
                  <li>• Status updates are made in real-time</li>
                  <li>• Processing times may vary based on visa type</li>
                  <li>
                    • You'll receive email notifications for major updates
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
