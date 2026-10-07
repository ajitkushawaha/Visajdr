'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  Mail,
  Phone,
  Download,
  Eye,
  Image,
  Upload,
} from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/hooks/useCurrency'
import { DocumentStatusControl } from '@/components/admin/DocumentStatusControl'

interface VisaApplication {
  _id: string
  trackingId: string
  status: string
  paymentStatus: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality: string
    occupation?: string
    passportNumber?: string
    passportExpiry?: string
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
  rejectionReason?: string
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
  documents: {
    passport: {
      url: string
      publicId: string
      originalName: string
      status?: string
      rejectionReason?: string
    }
    photo: {
      url: string
      publicId: string
      originalName: string
      status?: string
      rejectionReason?: string
    }
    additionalInfo?: string
    additionalDocs?: Record<
      string,
      {
        url: string
        publicId?: string
        originalName: string
      }
    >
    embassySubmissionProof?: {
      url: string
      publicId: string
      originalName: string
      uploadedBy: string
      uploadedAt: string
    }
    embassyApprovalDocument?: {
      url: string
      publicId: string
      originalName: string
      uploadedBy: string
      uploadedAt: string
    }
    embassyRejectionLetter?: {
      url: string
      publicId: string
      originalName: string
      uploadedBy: string
      uploadedAt: string
    }
  }
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

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

export default function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { symbol: currencySymbol } = useCurrency()
  const { toast } = useToast()
  const [application, setApplication] = useState<VisaApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [applicationId, setApplicationId] = useState<string>('')
  const [testingUpload, setTestingUpload] = useState(false)

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setApplicationId(resolvedParams.id)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (applicationId) {
      fetchApplication()
    }
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`)
      const data = await response.json()

      if (response.ok) {
        setApplication(data.application)
        // Debug: Log document URLs
        console.log('📄 Application documents:', {
          passport: data.application?.documents?.passport?.url,
          photo: data.application?.documents?.photo?.url,
          additionalDocs: data.application?.documents?.additionalDocs,
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch application',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch application',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Application Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The requested application could not be found.
        </p>
        <Link href="/admin/applications">
          <Button className=" bg-gray-200 text-gray-900 hover:bg-gray-400">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4">
      {/* Header */}
      <Link href="/admin/applications" className="mb-4">
        <Button variant="outline" className="text-gray-800 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>
      </Link>
      <div className="flex items-center justify-between pt-4 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Application Details
            </h1>
            <p className="text-gray-600">
              Tracking ID: {application.trackingId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            className={
              statusColors[application.status as keyof typeof statusColors]
            }
          >
            {application.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge
            className={
              paymentStatusColors[
                application.paymentStatus as keyof typeof paymentStatusColors
              ]
            }
          >
            Payment: {application.paymentStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  First Name
                </label>
                <p className="text-base font-medium text-gray-900 capitalize mt-1">
                  {application.personalInfo.firstName}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last Name
                </label>
                <p className="text-base font-medium text-gray-900 capitalize mt-1">
                  {application.personalInfo.lastName}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <p className="text-base font-medium text-gray-900 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {application.personalInfo.email}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Phone
              </label>
              <p className="text-base font-medium text-gray-900 mt-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {application.personalInfo.phone}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nationality
              </label>
              <p className="text-base font-medium text-gray-900 capitalize mt-1">
                {application.personalInfo.nationality}
              </p>
            </div>
            {application.personalInfo.occupation && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Occupation
                </label>
                <p className="text-base font-medium text-gray-900 capitalize mt-1">
                  {application.personalInfo.occupation}
                </p>
              </div>
            )}
            {application.personalInfo.passportNumber && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Passport Number
                </label>
                <p className="text-base font-medium text-gray-900 uppercase mt-1">
                  {application.personalInfo.passportNumber}
                </p>
              </div>
            )}
            {application.personalInfo.passportExpiry && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Passport Expiry
                </label>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {new Date(
                    application.personalInfo.passportExpiry
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
            {application.personalInfo.startDate && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Start Date
                  </label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {new Date(
                      application.personalInfo.startDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                {application.personalInfo.endDate && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      End Date
                    </label>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {new Date(
                        application.personalInfo.endDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visa Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Visa Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Country
                </label>
                <p className="text-base font-medium text-gray-900 capitalize mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {application.visaDetails.country}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Visa Type
                </label>
                <p className="text-base font-medium text-gray-900 capitalize mt-1">
                  {application.visaDetails.visaType}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Processing Time
                </label>
                <p className="text-base font-medium text-gray-900 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {application.visaDetails.processingTime}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stay Period
                </label>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {application.visaDetails.stayPeriod}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Validity
              </label>
              <p className="text-base font-medium text-gray-900 mt-1">
                {application.visaDetails.validity}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Amount
              </label>
              <p className="text-xl font-bold text-green-600 mt-1 flex items-center gap-1">
                <span className="text-lg">{currencySymbol}</span>
                {application.totalAmount}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Application Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Get all documents dynamically from application.documents
              const allDocuments: Array<{
                key: string
                doc: any
                type: 'single' | 'additional'
              }> = []

              // Fields to exclude (not actual document files)
              const excludeFields = ['additionalInfo']

              // Iterate through all keys in documents object
              if (application.documents) {
                Object.keys(application.documents).forEach(key => {
                  // Skip excluded fields
                  if (excludeFields.includes(key)) return

                  const value = (application.documents as any)[key]

                  // Handle single document objects (passport, photo, embassy documents, etc.)
                  if (value && typeof value === 'object' && value.url) {
                    allDocuments.push({ key, doc: value, type: 'single' })
                  }
                  // Handle additionalDocs object (contains multiple dynamic documents)
                  else if (
                    key === 'additionalDocs' &&
                    value &&
                    typeof value === 'object'
                  ) {
                    Object.keys(value).forEach(subKey => {
                      const subDoc = value[subKey]
                      if (subDoc && subDoc.url) {
                        allDocuments.push({
                          key: `${key}.${subKey}`,
                          doc: subDoc,
                          type: 'additional',
                        })
                      }
                    })
                  }
                })
              }

              if (allDocuments.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">
                      No documents available
                    </p>
                    <p className="text-sm">
                      Documents have not been uploaded yet.
                    </p>
                  </div>
                )
              }

              // Helper function to format document key name
              const formatDocumentName = (key: string): string => {
                // Remove 'additionalDocs.' prefix if present
                const cleanKey = key.replace('additionalDocs.', '')
                // Convert camelCase to Title Case
                return cleanKey
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim()
              }

              // Helper function to check if URL is an image
              const isImageUrl = (url: string): boolean => {
                return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
              }

              // Helper function to check if URL is a PDF
              const isPdfUrl = (url: string): boolean => {
                return /\.pdf$/i.test(url)
              }

              return (
                <React.Fragment>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allDocuments.map(({ key, doc }) => {
                      if (!doc || !doc.url) return null

                      const displayName = formatDocumentName(key)
                      const isImage = isImageUrl(doc.url)
                      const isPdf = isPdfUrl(doc.url)

                      return (
                        <div key={key} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {displayName}
                          </h4>
                          <div className="space-y-2">
                            {isImage ? (
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={doc.url}
                                  alt={doc.originalName || displayName}
                                  className="w-full h-full object-cover"
                                  crossOrigin="anonymous"
                                  loading="lazy"
                                  onError={e => {
                                    console.error(
                                      `❌ ${displayName} image failed to load:`,
                                      doc.url
                                    )
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const parent = target.parentElement
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="flex items-center justify-center h-full text-gray-500">
                                          <FileText class="w-8 h-8" />
                                          <p class="ml-2 text-xs">Image failed to load</p>
                                        </div>
                                      `
                                    }
                                  }}
                                  onLoad={() => {
                                    console.log(
                                      `✅ ${displayName} image loaded:`,
                                      doc.url
                                    )
                                  }}
                                />
                              </div>
                            ) : isPdf ? (
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <div className="text-center">
                                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                  <p className="text-xs text-gray-500">
                                    PDF Document
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <div className="text-center">
                                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                  <p className="text-xs text-gray-500">
                                    Document
                                  </p>
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 truncate">
                              {doc.originalName || displayName}
                            </p>
                            {doc.uploadedAt && (
                              <p className="text-xs text-gray-500">
                                Uploaded:{' '}
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(
                                    doc.url,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = doc.url
                                  link.download =
                                    doc.originalName || displayName
                                  link.target = '_blank'
                                  link.rel = 'noopener noreferrer'
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                            {(key === 'passport' || key === 'photo') && (
                              <DocumentStatusControl
                                applicationId={application._id}
                                documentType={key as 'passport' | 'photo'}
                                currentStatus={doc.status || 'pending'}
                                currentRejectionReason={doc.rejectionReason}
                                onUpdate={fetchApplication}
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Additional Info */}
                  {application.documents?.additionalInfo && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Additional Information
                      </h4>
                      <p className="text-gray-700">
                        {application.documents.additionalInfo}
                      </p>
                    </div>
                  )}
                </React.Fragment>
              )
            })()}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {(application.notes ||
          application.rejectionReason ||
          application.agentId) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {application.notes && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Notes
                  </label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {application.notes}
                  </p>
                </div>
              )}

              {application.rejectionReason && (
                <div>
                  <label className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                    Rejection Reason
                  </label>
                  <p className="text-base font-medium text-red-600 mt-1">
                    {application.rejectionReason}
                  </p>
                </div>
              )}

              {application.agentId && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assigned Agent
                  </label>
                  <p className="text-base font-medium text-gray-900 capitalize mt-1">
                    {application.agentId.personalDetails.fullName}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {application.agentId.personalDetails.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Application Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Application Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {application.estimatedProcessingDate && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Estimated Processing Date</p>
                    <p className="text-sm text-gray-500">
                      {new Date(
                        application.estimatedProcessingDate
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {application.actualProcessingDate && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Processing Completed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(
                        application.actualProcessingDate
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {application.statusHistory &&
                application.statusHistory.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                      Status History
                    </h4>
                    {application.statusHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {entry.status.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500">
                            By {entry.changedByName} ({entry.changedByRole}) -{' '}
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
