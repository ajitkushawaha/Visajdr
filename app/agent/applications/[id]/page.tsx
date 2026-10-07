'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
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
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Download,
  Eye,
  Upload,
  MessageSquare,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Send,
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
    purpose?: string
  }
  visaDetails: {
    country: string
    visaType: string
    price: number
    processingTime: string
    stayPeriod: string
    validity: string
  }
  documents: {
    passport: {
      url: string
      publicId: string
      originalName: string
      status?: 'pending' | 'approved' | 'rejected' | 'reuploaded'
      rejectionReason?: string
    }
    photo: {
      url: string
      publicId: string
      originalName: string
      status?: 'pending' | 'approved' | 'rejected' | 'reuploaded'
      rejectionReason?: string
    }
    additionalInfo?: string
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
  totalAmount: number
  createdAt: string
  updatedAt: string
  notes?: string
  estimatedProcessingDate: string
  actualProcessingDate?: string
  rejectionReason?: string
  statusHistory: Array<{
    status: string
    changedBy: string
    changedByRole: 'user' | 'admin' | 'agent'
    changedByName: string
    timestamp: string
    notes?: string
    reason?: string
  }>
}

interface Comment {
  _id: string
  userId: {
    _id: string
    name: string
  }
  userRole: 'user' | 'admin' | 'agent'
  userName: string
  message: string
  isInternal: boolean
  attachments?: Array<{
    url: string
    name: string
  }>
  createdAt: string
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

export default function AgentApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { isRedirecting, isLoading: sessionLoading } = useRoleRedirect([
    'agent',
  ])
  const { toast } = useToast()
  const [application, setApplication] = useState<VisaApplication | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updateNotes, setUpdateNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [newComment, setNewComment] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState('submission_proof')
  const [applicationId, setApplicationId] = useState<string>('')
  const [showPassportReject, setShowPassportReject] = useState(false)
  const [showPhotoReject, setShowPhotoReject] = useState(false)
  const [passportRejectReason, setPassportRejectReason] = useState('')
  const [photoRejectReason, setPhotoRejectReason] = useState('')

  const isImageFile = (url?: string, name?: string) => {
    const s = (url || name || '').toLowerCase()
    return (
      s.endsWith('.jpg') ||
      s.endsWith('.jpeg') ||
      s.endsWith('.png') ||
      s.endsWith('.webp')
    )
  }

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
      fetchComments()
    }
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/agent/applications/${applicationId}`)
      const data = await response.json()

      if (response.ok) {
        setApplication(data.application)
        setUpdateStatus(data.application.status)
        setUpdateNotes(data.application.notes || '')
        setRejectionReason(data.application.rejectionReason || '')
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

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/comments`
      )
      const data = await response.json()

      if (response.ok) {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`/api/agent/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateStatus,
          notes: updateNotes,
          rejectionReason: rejectionReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application status updated successfully',
        })
        setIsUpdateDialogOpen(false)
        fetchApplication()
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

  const handleDocumentUpload = async () => {
    if (!uploadFile) return

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('documentType', uploadType)
      if (rejectionReason) formData.append('notes', rejectionReason)

      const response = await fetch(
        `/api/agent/applications/${applicationId}/upload-document`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Document uploaded successfully',
        })
        setIsUploadDialogOpen(false)
        setUploadFile(null)
        setRejectionReason('')
        fetchApplication()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to upload document',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      })
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const formData = new FormData()
      formData.append('message', newComment)
      formData.append('isInternal', 'false') // Agents can only add public comments

      const response = await fetch(
        `/api/applications/${applicationId}/comments`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Comment added successfully',
        })
        setNewComment('')
        setIsCommentDialogOpen(false)
        fetchComments()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to add comment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      })
    }
  }

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(
        `/api/agent/applications/${applicationId}/pdf`,
        {
          method: 'GET',
        }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `application-${application?.trackingId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: 'Success',
          description: 'PDF generated and downloaded successfully',
        })
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to generate PDF',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      })
    }
  }

  const updateDocumentStatus = async (
    documentType: 'passport' | 'photo',
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    try {
      const response = await fetch(
        `/api/agent/applications/${applicationId}/documents`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentType,
            status,
            rejectionReason: status === 'rejected' ? reason || '' : undefined,
          }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update document status')
      }
      toast({
        title: 'Success',
        description: `Document ${status} successfully`,
      })
      setShowPassportReject(false)
      setShowPhotoReject(false)
      setPassportRejectReason('')
      setPhotoRejectReason('')
      fetchApplication()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      })
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
        <Link href="/agent/applications">
          <Button className="mt-4">Back to Applications</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/agent/applications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Application Details</h1>
            <p className="text-gray-600">
              Tracking ID: {application.trackingId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsUpdateDialogOpen(true)}>
            Update Status
          </Button>
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCommentDialogOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Comment
          </Button>
          <Button variant="outline" onClick={handleGeneratePDF}>
            <Download className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Application Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Applicant Name
                  </Label>
                  <p className="text-lg">
                    {application.personalInfo.firstName}{' '}
                    {application.personalInfo.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {application.personalInfo.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Phone
                  </Label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {application.personalInfo.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Nationality
                  </Label>
                  <p>{application.personalInfo.nationality}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Purpose
                  </Label>
                  <p>{application.personalInfo.purpose || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Total Amount
                  </Label>
                  <p className="text-lg font-semibold">
                    ₹{application.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visa Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Visa Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Destination
                  </Label>
                  <p className="text-lg font-semibold">
                    {application.visaDetails.country}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Visa Type
                  </Label>
                  <p>{application.visaDetails.visaType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Processing Time
                  </Label>
                  <p>{application.visaDetails.processingTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Stay Period
                  </Label>
                  <p>{application.visaDetails.stayPeriod}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Validity
                  </Label>
                  <p>{application.visaDetails.validity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Price
                  </Label>
                  <p>₹{application.visaDetails.price.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  User Documents
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium">Passport</p>
                    {application.documents?.passport?.url &&
                      isImageFile(
                        application.documents.passport.url,
                        application.documents.passport.originalName
                      ) && (
                        <div className="mt-2">
                          <Image
                            src={application.documents.passport.url}
                            alt={
                              application.documents.passport.originalName ||
                              'Passport'
                            }
                            width={280}
                            height={180}
                            className="rounded border object-cover"
                          />
                        </div>
                      )}
                    <div className="flex items-center gap-2 mt-2">
                      {application.documents?.passport?.url && (
                        <>
                          <a
                            href={application.documents.passport.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </a>
                          <a
                            href={application.documents.passport.url}
                            download={
                              application.documents.passport.originalName
                            }
                          >
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </>
                      )}
                    </div>
                    {application.documents.passport?.status && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <Badge
                            variant={
                              application.documents.passport.status ===
                              'approved'
                                ? 'default'
                                : application.documents.passport.status ===
                                    'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className={
                              application.documents.passport.status ===
                              'approved'
                                ? 'bg-green-600'
                                : ''
                            }
                          >
                            {application.documents.passport.status.toUpperCase()}
                          </Badge>
                        </div>
                        {application.documents.passport.status === 'rejected' &&
                          application.documents.passport.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                              <strong>Reason:</strong>{' '}
                              {application.documents.passport.rejectionReason}
                            </div>
                          )}
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-200 hover:bg-green-50 text-green-700"
                            onClick={() =>
                              updateDocumentStatus('passport', 'approved')
                            }
                            disabled={
                              application.documents.passport.status ===
                              'approved'
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 hover:bg-red-50 text-red-700"
                            onClick={() => setShowPassportReject(v => !v)}
                            disabled={
                              application.documents.passport.status ===
                              'rejected'
                            }
                          >
                            Reject
                          </Button>
                        </div>
                        {showPassportReject && (
                          <div className="mt-2">
                            <Label className="text-sm">Rejection Reason</Label>
                            <Textarea
                              value={passportRejectReason}
                              onChange={e =>
                                setPassportRejectReason(e.target.value)
                              }
                              rows={3}
                            />
                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateDocumentStatus(
                                    'passport',
                                    'rejected',
                                    passportRejectReason
                                  )
                                }
                                disabled={!passportRejectReason.trim()}
                              >
                                Confirm Rejection
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowPassportReject(false)
                                  setPassportRejectReason('')
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="font-medium">Photo</p>
                    {application.documents?.photo?.url &&
                      isImageFile(
                        application.documents.photo.url,
                        application.documents.photo.originalName
                      ) && (
                        <div className="mt-2">
                          <Image
                            src={application.documents.photo.url}
                            alt={
                              application.documents.photo.originalName ||
                              'Photo'
                            }
                            width={280}
                            height={180}
                            className="rounded border object-cover"
                          />
                        </div>
                      )}
                    <div className="flex items-center gap-2 mt-2">
                      {application.documents?.photo?.url && (
                        <>
                          <a
                            href={application.documents.photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </a>
                          <a
                            href={application.documents.photo.url}
                            download={application.documents.photo.originalName}
                          >
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </>
                      )}
                    </div>
                    {application.documents.photo?.status && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <Badge
                            variant={
                              application.documents.photo.status === 'approved'
                                ? 'default'
                                : application.documents.photo.status ===
                                    'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className={
                              application.documents.photo.status === 'approved'
                                ? 'bg-green-600'
                                : ''
                            }
                          >
                            {application.documents.photo.status.toUpperCase()}
                          </Badge>
                        </div>
                        {application.documents.photo.status === 'rejected' &&
                          application.documents.photo.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                              <strong>Reason:</strong>{' '}
                              {application.documents.photo.rejectionReason}
                            </div>
                          )}
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-200 hover:bg-green-50 text-green-700"
                            onClick={() =>
                              updateDocumentStatus('photo', 'approved')
                            }
                            disabled={
                              application.documents.photo.status === 'approved'
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 hover:bg-red-50 text-red-700"
                            onClick={() => setShowPhotoReject(v => !v)}
                            disabled={
                              application.documents.photo.status === 'rejected'
                            }
                          >
                            Reject
                          </Button>
                        </div>
                        {showPhotoReject && (
                          <div className="mt-2">
                            <Label className="text-sm">Rejection Reason</Label>
                            <Textarea
                              value={photoRejectReason}
                              onChange={e =>
                                setPhotoRejectReason(e.target.value)
                              }
                              rows={3}
                            />
                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateDocumentStatus(
                                    'photo',
                                    'rejected',
                                    photoRejectReason
                                  )
                                }
                                disabled={!photoRejectReason.trim()}
                              >
                                Confirm Rejection
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowPhotoReject(false)
                                  setPhotoRejectReason('')
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Documents */}
              {(application.documents.embassySubmissionProof ||
                application.documents.embassyApprovalDocument ||
                application.documents.embassyRejectionLetter) && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Uploaded Documents
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {application.documents.embassySubmissionProof && (
                      <div className="border rounded-lg p-4">
                        <p className="font-medium">Embassy Submission Proof</p>
                        <p className="text-xs text-gray-500">
                          Uploaded:{' '}
                          {new Date(
                            application.documents.embassySubmissionProof.uploadedAt
                          ).toLocaleDateString()}
                        </p>
                        {isImageFile(
                          application.documents.embassySubmissionProof.url,
                          application.documents.embassySubmissionProof
                            .originalName
                        ) && (
                          <div className="mt-2">
                            <Image
                              src={
                                application.documents.embassySubmissionProof.url
                              }
                              alt={
                                application.documents.embassySubmissionProof
                                  .originalName || 'Embassy Submission Proof'
                              }
                              width={280}
                              height={180}
                              className="rounded border object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={
                              application.documents.embassySubmissionProof.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </a>
                          <a
                            href={
                              application.documents.embassySubmissionProof.url
                            }
                            download={
                              application.documents.embassySubmissionProof
                                .originalName
                            }
                          >
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                    {application.documents.embassyApprovalDocument && (
                      <div className="border rounded-lg p-4">
                        <p className="font-medium">Approval Document</p>
                        <p className="text-xs text-gray-500">
                          Uploaded:{' '}
                          {new Date(
                            application.documents.embassyApprovalDocument.uploadedAt
                          ).toLocaleDateString()}
                        </p>
                        {isImageFile(
                          application.documents.embassyApprovalDocument.url,
                          application.documents.embassyApprovalDocument
                            .originalName
                        ) && (
                          <div className="mt-2">
                            <Image
                              src={
                                application.documents.embassyApprovalDocument
                                  .url
                              }
                              alt={
                                application.documents.embassyApprovalDocument
                                  .originalName || 'Approval Document'
                              }
                              width={280}
                              height={180}
                              className="rounded border object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={
                              application.documents.embassyApprovalDocument.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </a>
                          <a
                            href={
                              application.documents.embassyApprovalDocument.url
                            }
                            download={
                              application.documents.embassyApprovalDocument
                                .originalName
                            }
                          >
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                    {application.documents.embassyRejectionLetter && (
                      <div className="border rounded-lg p-4">
                        <p className="font-medium">Rejection Letter</p>
                        <p className="text-xs text-gray-500">
                          Uploaded:{' '}
                          {new Date(
                            application.documents.embassyRejectionLetter.uploadedAt
                          ).toLocaleDateString()}
                        </p>
                        {isImageFile(
                          application.documents.embassyRejectionLetter.url,
                          application.documents.embassyRejectionLetter
                            .originalName
                        ) && (
                          <div className="mt-2">
                            <Image
                              src={
                                application.documents.embassyRejectionLetter.url
                              }
                              alt={
                                application.documents.embassyRejectionLetter
                                  .originalName || 'Rejection Letter'
                              }
                              width={280}
                              height={180}
                              className="rounded border object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={
                              application.documents.embassyRejectionLetter.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </a>
                          <a
                            href={
                              application.documents.embassyRejectionLetter.url
                            }
                            download={
                              application.documents.embassyRejectionLetter
                                .originalName
                            }
                          >
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.map(comment => (
                  <div
                    key={comment._id}
                    className="border-l-4 border-blue-200 pl-4 py-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{comment.userName}</span>
                      <Badge
                        variant={
                          comment.userRole === 'admin' ? 'default' : 'secondary'
                        }
                      >
                        {comment.userRole}
                      </Badge>
                      {comment.isInternal && (
                        <Badge variant="outline">Internal</Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.message}</p>
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2">
                        {comment.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
                          >
                            <Download className="w-3 h-3" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No comments yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                {getStatusIcon(application.status)}
                <Badge
                  className={
                    statusColors[
                      application.status as keyof typeof statusColors
                    ]
                  }
                >
                  {application.status.replace('_', ' ')}
                </Badge>
              </div>
              {application.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-red-700">
                    {application.rejectionReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.statusHistory?.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {getStatusIcon(entry.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {entry.status.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {entry.changedByRole}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {entry.changedByName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-700 mt-1">
                          {entry.notes}
                        </p>
                      )}
                      {entry.reason && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {entry.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{application.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    // Fetch statuses dynamically - for now use hardcoded list as fallback
                    // In production, fetch from /api/public/application-status
                    const agentStatuses = [
                      { slug: 'under_review', name: 'Under Review' },
                      { slug: 'in_embassy', name: 'In Embassy' },
                      { slug: 'approved', name: 'Approved' },
                      { slug: 'rejected', name: 'Rejected' },
                    ]
                    return agentStatuses.map(status => (
                      <SelectItem key={status.slug} value={status.slug}>
                        {status.name}
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
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

            {updateStatus === 'rejected' && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

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
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="uploadType">Document Type</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submission_proof">
                    Embassy Submission Proof
                  </SelectItem>
                  <SelectItem value="approval_document">
                    Approval Document
                  </SelectItem>
                  <SelectItem value="rejection_letter">
                    Rejection Letter
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={e => setUploadFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>

            {uploadType === 'rejection_letter' && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleDocumentUpload} disabled={!uploadFile}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Message</Label>
              <Textarea
                id="comment"
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCommentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
