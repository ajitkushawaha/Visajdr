'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  Edit,
  Save,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EmailTemplate {
  _id?: string
  name: string
  type:
    | 'booking-confirmation'
    | 'application-submitted'
    | 'status-update'
    | 'agent-assigned'
    | 'visa-approved'
    | 'visa-rejected'
    | 'password-reset'
    | 'application-reopened'
    | 'invoice'
    | 'application-incomplete'
    | 'application-under-review'
    | 'application-in-embassy'
    | 'application-cancelled'
    | 'application-completed'
    | 'document-rejected'
  subject: string
  htmlBody: string
  textBody: string
  isActive: boolean
  variables?: string[]
  description?: string
  createdAt?: string
  updatedAt?: string
}

const defaultTemplates: Partial<EmailTemplate>[] = [
  {
    name: 'Booking Confirmation',
    type: 'booking-confirmation',
    subject: 'Visa Booking Confirmation - {{bookingId}}',
    description: 'Sent when a visa booking is confirmed',
    variables: [
      'bookingId',
      'customerName',
      'country',
      'visaType',
      'totalAmount',
    ],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Booking Confirmation</h2>
  <p>Hello {{customerName}},</p>
  <p>Thank you for booking with us. Your booking has been confirmed.</p>
  <p><strong>Booking ID:</strong> {{bookingId}}</p>
  <p><strong>Country:</strong> {{country}}</p>
  <p><strong>Visa Type:</strong> {{visaType}}</p>
  <p><strong>Total Amount:</strong> {{totalAmount}}</p>
  <p>You can track your application status in your dashboard.</p>
</div>`,
    textBody: `Hello {{customerName}},

Thank you for booking with us. Your booking has been confirmed.

Booking ID: {{bookingId}}
Country: {{country}}
Visa Type: {{visaType}}
Total Amount: {{totalAmount}}

You can track your application status in your dashboard.`,
  },
  {
    name: 'Application Submitted',
    type: 'application-submitted',
    subject: 'Your Visa Application Has Been Submitted - {{trackingId}}',
    description: 'Sent when application is submitted after payment',
    variables: ['trackingId', 'customerName', 'country', 'visaType'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Application Submitted</h2>
  <p>Hello {{customerName}},</p>
  <p>Your visa application for {{country}} has been successfully submitted.</p>
  <p><strong>Tracking ID:</strong> {{trackingId}}</p>
  <p>We will review your application shortly.</p>
</div>`,
    textBody: `Hello {{customerName}},

Your visa application for {{country}} has been successfully submitted.

Tracking ID: {{trackingId}}

We will review your application shortly.`,
  },
  {
    name: 'Status Update',
    type: 'status-update',
    subject: 'Visa Application Status Update - {{trackingId}}',
    description: 'Sent when application status changes',
    variables: ['trackingId', 'customerName', 'status', 'country'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Status Update</h2>
  <p>Hello {{customerName}},</p>
  <p>There is an update on your visa application for {{country}}.</p>
  <p><strong>Tracking ID:</strong> {{trackingId}}</p>
  <p><strong>New Status:</strong> {{status}}</p>
  <p>Please check your dashboard for more details.</p>
</div>`,
    textBody: `Hello {{customerName}},

There is an update on your visa application for {{country}}.

Tracking ID: {{trackingId}}
New Status: {{status}}

Please check your dashboard for more details.`,
  },
  {
    name: 'Agent Assigned',
    type: 'agent-assigned',
    subject: 'Agent Assigned to Your Application - {{trackingId}}',
    description: 'Sent when an agent is assigned to application',
    variables: ['trackingId', 'customerName', 'agentName', 'agentEmail'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Agent Assigned</h2>
  <p>Hello {{customerName}},</p>
  <p>An agent has been assigned to your visa application ({{trackingId}}).</p>
  <p><strong>Agent Name:</strong> {{agentName}}</p>
  <p><strong>Agent Email:</strong> {{agentEmail}}</p>
  <p>They will be handling your application process.</p>
</div>`,
    textBody: `Hello {{customerName}},

An agent has been assigned to your visa application ({{trackingId}}).

Agent Name: {{agentName}}
Agent Email: {{agentEmail}}

They will be handling your application process.`,
  },
  {
    name: 'Visa Approved',
    type: 'visa-approved',
    subject: 'Congratulations! Your Visa Has Been Approved - {{trackingId}}',
    description: 'Sent when visa is approved',
    variables: ['trackingId', 'customerName', 'country', 'visaType'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #16a34a;">Visa Approved!</h2>
  <p>Hello {{customerName}},</p>
  <p>Congratulations! Your visa for {{country}} has been approved.</p>
  <p><strong>Tracking ID:</strong> {{trackingId}}</p>
  <p>You can download your visa from your dashboard.</p>
</div>`,
    textBody: `Hello {{customerName}},

Congratulations! Your visa for {{country}} has been approved.

Tracking ID: {{trackingId}}

You can download your visa from your dashboard.`,
  },
  {
    name: 'Visa Rejected',
    type: 'visa-rejected',
    subject: 'Visa Application Update - {{trackingId}}',
    description: 'Sent when visa is rejected',
    variables: ['trackingId', 'customerName', 'country', 'rejectionReason'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #dc2626;">Visa Application Rejected</h2>
  <p>Hello {{customerName}},</p>
  <p>We regret to inform you that your visa application for {{country}} has been rejected.</p>
  <p><strong>Tracking ID:</strong> {{trackingId}}</p>
  <p><strong>Reason:</strong> {{rejectionReason}}</p>
  <p>Please contact support for more information.</p>
</div>`,
    textBody: `Hello {{customerName}},

We regret to inform you that your visa application for {{country}} has been rejected.

Tracking ID: {{trackingId}}
Reason: {{rejectionReason}}

Please contact support for more information.`,
  },
  {
    name: 'Password Reset',
    type: 'password-reset',
    subject: 'Password Reset Request',
    description: 'Sent for password reset',
    variables: ['customerName', 'resetLink'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Password Reset</h2>
  <p>Hello {{customerName}},</p>
  <p>We received a request to reset your password.</p>
  <p><a href="{{resetLink}}">Click here to reset your password</a></p>
  <p>If you didn't request this, please ignore this email.</p>
</div>`,
    textBody: `Hello {{customerName}},

We received a request to reset your password.

Reset Link: {{resetLink}}

If you didn't request this, please ignore this email.`,
  },
  {
    name: 'Application Reopened',
    type: 'application-reopened',
    subject: 'Application Reopened - {{trackingId}}',
    description: 'Sent when application is reopened',
    variables: ['trackingId', 'customerName', 'reason'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Application Reopened</h2>
  <p>Hello {{customerName}},</p>
  <p>Your visa application ({{trackingId}}) has been reopened.</p>
  <p><strong>Reason:</strong> {{reason}}</p>
  <p>Please check your dashboard for next steps.</p>
</div>`,
    textBody: `Hello {{customerName}},

Your visa application ({{trackingId}}) has been reopened.

Reason: {{reason}}

Please check your dashboard for next steps.`,
  },
  {
    name: 'Invoice',
    type: 'invoice',
    subject: 'Invoice - {{invoiceNumber}} - Visa Application Payment',
    description: 'Sent after payment completion with invoice breakdown',
    variables: [
      'customerName',
      'trackingId',
      'invoiceNumber',
      'invoiceDate',
      'baseAmount',
      'convenienceFeesTotal',
      'onlineProcessingFee',
      'paymentMethodFee',
      'expressServiceFee',
      'documentProcessingFee',
      'subtotal',
      'discountAmount',
      'discountCode',
      'discountType',
      'totalAmount',
      'paymentMethod',
      'paymentId',
      'orderId',
      'country',
      'visaType',
      'processingTime',
      'baseUrl',
    ],
    // Invoice HTML is handled specially in the load function due to its complexity
    htmlBody: '',
    textBody: '',
  },
  {
    name: 'Application Incomplete',
    type: 'application-incomplete',
    subject: 'Action Required: Application Incomplete - {{trackingId}}',
    description: 'Sent when application is incomplete',
    variables: ['trackingId', 'customerName', 'reason'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #dc2626;">Application Incomplete</h2>
  <p>Hello {{customerName}},</p>
  <p>Your visa application ({{trackingId}}) is incomplete.</p>
  <p><strong>Reason:</strong> {{reason}}</p>
  <p>Please log in to your dashboard to complete your application.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{baseUrl}}/dashboard" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
  </div>
</div>`,
    textBody: `Application Incomplete

Hello {{customerName}},

Your visa application ({{trackingId}}) is incomplete.

Reason: {{reason}}

Please log in to your dashboard to complete your application.`,
  },
  {
    name: 'Application Under Review',
    type: 'application-under-review',
    subject: 'Application Under Review - {{trackingId}}',
    description: 'Sent when application is under review',
    variables: ['trackingId', 'customerName', 'country', 'visaType'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Application Under Review</h2>
  <p>Hello {{customerName}},</p>
  <p>Your visa application for {{country}} ({{visaType}}) is now under review.</p>
  <p><strong>Tracking ID:</strong> {{trackingId}}</p>
  <p>We will notify you once there is an update.</p>
</div>`,
    textBody: `Hello {{customerName}},

Your visa application for {{country}} ({{visaType}}) is now under review.

Tracking ID: {{trackingId}}

We will notify you once there is an update.`,
  },
  {
    name: 'Application In Embassy',
    type: 'application-in-embassy',
    subject: 'Application In Embassy - {{trackingId}}',
    description: 'Sent when application is submitted to embassy',
    variables: [
      'trackingId',
      'customerName',
      'country',
      'visaType',
      'embassyName',
    ],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Application Submitted to Embassy</h2>
  <p>Hello {{customerName}},</p>
  <p>Your visa application for {{country}} has been submitted to the {{embassyName}}.</p>
  <p><strong>Tracking ID:</strong> {{trackingId}}</p>
  <p>This process typically takes some time. We will notify you as soon as we hear back.</p>
</div>`,
    textBody: `Hello {{customerName}},

Your visa application for {{country}} has been submitted to the {{embassyName}}.

Tracking ID: {{trackingId}}

This process typically takes some time. We will notify you as soon as we hear back.`,
  },
  {
    name: 'Application Cancelled',
    type: 'application-cancelled',
    subject: 'Application Cancelled - {{trackingId}}',
    description: 'Sent when application is cancelled',
    variables: ['trackingId', 'customerName', 'reason'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #dc2626;">Application Cancelled</h2>
  <p>Hello {{customerName}},</p>
  <p>Your visa application ({{trackingId}}) has been cancelled.</p>
  <p><strong>Reason:</strong> {{reason}}</p>
  <p>If you believe this is an error, please contact support.</p>
</div>`,
    textBody: `Hello {{customerName}},

Your visa application ({{trackingId}}) has been cancelled.

Reason: {{reason}}

If you believe this is an error, please contact support.`,
  },
  {
    name: 'Application Completed',
    type: 'application-completed',
    subject: 'Application Completed - {{trackingId}}',
    description: 'Sent when application process is completed',
    variables: ['trackingId', 'customerName', 'country'],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #16a34a;">Application Completed</h2>
  <p>Hello {{customerName}},</p>
  <p>The process for your visa application for {{country}} has been completed.</p>
  <p><strong>Tracking ID:</strong> {{trackingId}}</p>
  <p>Please check your dashboard for final documents or details.</p>
</div>`,
    textBody: `Hello {{customerName}},

The process for your visa application for {{country}} has been completed.

Tracking ID: {{trackingId}}

Please check your dashboard for final documents or details.`,
  },
  {
    name: 'Document Rejected',
    type: 'document-rejected',
    subject: 'Action Required: Document Rejected - {{trackingId}}',
    description: 'Sent when a document is rejected',
    variables: [
      'trackingId',
      'customerName',
      'documentType',
      'rejectionReason',
    ],
    htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #dc2626;">Document Rejected</h2>
  <p>Hello {{customerName}},</p>
  <p>Important update regarding your visa application ({{trackingId}}):</p>
  <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fee2e2;">
    <p><strong>Document:</strong> {{documentType}}</p>
    <p><strong>Rejection Reason:</strong> {{rejectionReason}}</p>
  </div>
  <p>Please log in to your dashboard immediately to upload a corrected document.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{baseUrl}}/dashboard" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
  </div>
</div>`,
    textBody: `Document Rejected

Hello {{customerName}},

Important update regarding your visa application ({{trackingId}}):

Document: {{documentType}}
Rejection Reason: {{rejectionReason}}

Please log in to your dashboard immediately to upload a corrected document.`,
  },
]

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  )
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  )
  const [formData, setFormData] = useState<EmailTemplate>({
    name: '',
    type: 'booking-confirmation',
    subject: '',
    htmlBody: '',
    textBody: '',
    isActive: true,
    variables: [],
    description: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/email-templates')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.templates || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch email templates',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch email templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      type: 'booking-confirmation',
      subject: '',
      htmlBody: '',
      textBody: '',
      isActive: true,
      variables: [],
      description: '',
    })
    setShowDialog(true)
  }

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      ...template,
      variables: template.variables || [],
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const url = editingTemplate
        ? `/api/admin/email-templates/${editingTemplate._id}`
        : '/api/admin/email-templates'
      const method = editingTemplate ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: editingTemplate
            ? 'Template updated successfully'
            : 'Template created successfully',
        })
        setShowDialog(false)
        fetchTemplates()
      } else {
        throw new Error(data.error || 'Failed to save template')
      }
    } catch (error: any) {
      console.error('Error saving template:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        })
        fetchTemplates()
      } else {
        throw new Error(data.error || 'Failed to delete template')
      }
    } catch (error: any) {
      console.error('Error deleting template:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const response = await fetch(
        `/api/admin/email-templates/${template._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isActive: !template.isActive,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: `Template ${!template.isActive ? 'activated' : 'deactivated'}`,
        })
        fetchTemplates()
      } else {
        throw new Error(data.error || 'Failed to update template')
      }
    } catch (error: any) {
      console.error('Error toggling template:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update template',
        variant: 'destructive',
      })
    }
  }

  const loadDefaultTemplate = (type: string) => {
    const defaultTemplate = defaultTemplates.find(t => t.type === type)
    if (defaultTemplate) {
      const baseData = {
        name: defaultTemplate.name || '',
        subject: defaultTemplate.subject || '',
        description: defaultTemplate.description || '',
        variables: defaultTemplate.variables || [],
      }

      // For invoice template, also load HTML and text body
      if (type === 'invoice') {
        setFormData(prev => ({
          ...prev,
          ...baseData,
          htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - {{invoiceNumber}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
  <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 20px;">📄</div>
      <h1 style="margin: 0; font-size: 32px; font-weight: 700;">INVOICE</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Payment Confirmation & Receipt</p>
    </div>

    <!-- Invoice Header Info -->
    <div style="padding: 30px; background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        <div>
          <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">Bill To:</h3>
          <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">{{customerName}}</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">Invoice Details:</h3>
          <p style="margin: 0 0 5px 0; color: #374151; font-size: 14px;"><strong>Invoice #:</strong> <span style="font-family: 'Courier New', monospace;">{{invoiceNumber}}</span></p>
          <p style="margin: 0 0 5px 0; color: #374151; font-size: 14px;"><strong>Date:</strong> {{invoiceDate}}</p>
          <p style="margin: 5px 0 0 0; color: #374151; font-size: 14px;"><strong>Tracking ID:</strong> <span style="font-family: 'Courier New', monospace; background: #1e40af; color: white; padding: 4px 8px; border-radius: 4px;">{{trackingId}}</span></p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <!-- Visa Details -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #3b82f6; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🛂 Service Details</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #374151;">Destination:</span>
            <span style="color: #6b7280;">{{country}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #374151;">Visa Type:</span>
            <span style="color: #6b7280;">{{visaType}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #374151;">Processing Time:</span>
            <span style="color: #6b7280;">{{processingTime}}</span>
          </div>
        </div>
      </div>

      <!-- Invoice Breakdown -->
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
        <div style="background: #1e40af; color: white; padding: 20px;">
          <h3 style="margin: 0; font-size: 20px; font-weight: 600;">💰 Payment Breakdown</h3>
        </div>
        <div style="padding: 0;">
          <!-- Base Amount -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb;">
            <div>
              <span style="font-weight: 600; color: #374151; font-size: 16px;">Base Visa Fee</span>
            </div>
            <span style="font-weight: 600; color: #374151; font-size: 16px;">₹{{baseAmount}}</span>
          </div>

          <!-- Convenience Fees (conditional) -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f3f4f6; background: #f9fafb;">
            <div>
              <span style="color: #6b7280; font-size: 14px;">Total Convenience Fees</span>
            </div>
            <span style="color: #6b7280; font-size: 14px;">₹{{convenienceFeesTotal}}</span>
          </div>

          <!-- Subtotal -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #e5e7eb; background: #f0f9ff;">
            <div>
              <span style="font-weight: 600; color: #1e40af; font-size: 16px;">Subtotal</span>
            </div>
            <span style="font-weight: 600; color: #1e40af; font-size: 16px;">₹{{subtotal}}</span>
          </div>

          <!-- Discount (conditional) -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #e5e7eb; background: #f0fdf4;">
            <div>
              <span style="font-weight: 600; color: #16a34a; font-size: 16px;">Discount {{discountCode}}</span>
            </div>
            <span style="font-weight: 600; color: #16a34a; font-size: 16px;">-₹{{discountAmount}}</span>
          </div>

          <!-- Total -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 25px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);">
            <div>
              <span style="font-weight: 700; color: white; font-size: 20px;">Total Amount</span>
            </div>
            <span style="font-weight: 700; color: white; font-size: 24px;">₹{{totalAmount}}</span>
          </div>
        </div>
      </div>

      <!-- Payment Details -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">💳 Payment Information</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #374151;">Payment Method:</span>
            <span style="color: #6b7280;">{{paymentMethod}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #374151;">Payment ID:</span>
            <span style="font-family: 'Courier New', monospace; color: #6b7280; font-size: 12px;">{{paymentId}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #374151;">Order ID:</span>
            <span style="font-family: 'Courier New', monospace; color: #6b7280; font-size: 12px;">{{orderId}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 2px solid #e5e7eb; margin-top: 8px;">
            <span style="font-weight: 700; color: #16a34a; font-size: 16px;">Payment Status:</span>
            <span style="background: #16a34a; color: white; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 14px;">✅ PAID</span>
          </div>
        </div>
      </div>

      <!-- Important Notes -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
        <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📝 Important Notes</h3>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          <li style="margin-bottom: 8px;">This invoice serves as your payment receipt</li>
          <li style="margin-bottom: 8px;">Please keep this invoice for your records</li>
          <li style="margin-bottom: 8px;">Your application is now being processed</li>
          <li style="margin-bottom: 8px;">You can track your application using the Tracking ID above</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{baseUrl}}/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          📊 Track Your Application
        </a>
      </div>

      <!-- Support Info -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 25px; text-align: center;">
        <p style="margin: 0 0 15px 0; color: #374151; font-weight: 600; font-size: 18px;">Need Help?</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          📧 Email: support@euroworld.com<br>
          📞 Phone: +91-XXXX-XXXX<br>
          💬 WhatsApp: +91-XXXX-XXXX
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
        <strong>Visa4 Visa Services</strong><br>
        Your trusted partner for visa applications
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        This is an automated invoice. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>`,
          textBody: `Invoice - {{invoiceNumber}}

Bill To: {{customerName}}

Invoice #: {{invoiceNumber}}
Date: {{invoiceDate}}
Tracking ID: {{trackingId}}

Service Details:
- Destination: {{country}}
- Visa Type: {{visaType}}
- Processing Time: {{processingTime}}

Payment Breakdown:
- Base Visa Fee: ₹{{baseAmount}}
- Total Convenience Fees: ₹{{convenienceFeesTotal}}
- Subtotal: ₹{{subtotal}}
- Discount {{discountCode}}: -₹{{discountAmount}}
- Total Amount: ₹{{totalAmount}}

Payment Information:
- Payment Method: {{paymentMethod}}
- Payment ID: {{paymentId}}
- Order ID: {{orderId}}
- Payment Status: PAID

This invoice serves as your payment receipt. Please keep it for your records.

Track your application: {{baseUrl}}/dashboard`,
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          ...baseData,
          htmlBody: defaultTemplate.htmlBody || '',
          textBody: defaultTemplate.textBody || '',
        }))
      }
    }
  }

  // Replace variables in template with sample data
  const replaceVariables = (
    template: string,
    variables: string[] = []
  ): string => {
    const sampleData: Record<string, string> = {
      bookingId: 'EU-20251122-XXXXX',
      trackingId: 'EU-20251122-XXXXX',
      customerName: 'John Doe',
      userName: 'John Doe',
      name: 'John Doe',
      country: 'United States',
      visaType: 'Tourist Visa',
      totalAmount: '180',
      processingTime: '15 Business Days',
      status: 'Submitted',
      agentName: 'Jane Smith',
      agentEmail: 'jane.smith@euroworld.com',
      resetLink: 'https://visa4.com/auth/reset-password?token=xxxxx',
      downloadUrl: 'https://visa4.com/dashboard/download/xxxxx',
      rejectionReason: 'Incomplete documentation provided',
      reason: 'Additional documents required',
      baseUrl: 'https://visa4.com',
      invoiceNumber: 'INV-EU-20251122-XXXXX',
      invoiceDate: 'November 22, 2024',
      baseAmount: '150.00',
      convenienceFeesTotal: '30.00',
      onlineProcessingFee: '10.00',
      paymentMethodFee: '15.00',
      expressServiceFee: '5.00',
      documentProcessingFee: '0.00',
      subtotal: '180.00',
      discountAmount: '0.00',
      discountCode: '',
      discountType: '',
      paymentMethod: 'Online',
      paymentId: 'PAY-XXXXX',
      orderId: 'ORD-XXXXX',
    }

    let result = template
    const allVariables = Array.from(
      new Set([...variables, ...Object.keys(sampleData)])
    )

    for (const variable of allVariables) {
      const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g')
      result = result.replace(regex, sampleData[variable] || `{{${variable}}}`)
    }
    return result
  }

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setShowPreviewDialog(true)
  }

  const handlePreviewForm = () => {
    // Preview the current form data
    setPreviewTemplate(formData)
    setShowPreviewDialog(true)
  }

  const getPreviewHtml = (template: EmailTemplate | null): string => {
    if (!template) return ''
    return replaceVariables(template.htmlBody, template.variables || [])
  }

  const getPreviewSubject = (template: EmailTemplate | null): string => {
    if (!template) return ''
    return replaceVariables(template.subject, template.variables || [])
  }

  const getPreviewText = (template: EmailTemplate | null): string => {
    if (!template) return ''
    return replaceVariables(template.textBody, template.variables || [])
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'booking-confirmation': 'bg-blue-100 text-blue-800',
      'application-submitted': 'bg-green-100 text-green-800',
      'status-update': 'bg-yellow-100 text-yellow-800',
      'agent-assigned': 'bg-purple-100 text-purple-800',
      'visa-approved': 'bg-emerald-100 text-emerald-800',
      'visa-rejected': 'bg-red-100 text-red-800',
      'password-reset': 'bg-orange-100 text-orange-800',
      'application-reopened': 'bg-indigo-100 text-indigo-800',
      invoice: 'bg-teal-100 text-teal-800',
      'application-incomplete': 'bg-red-100 text-red-800',
      'application-under-review': 'bg-yellow-100 text-yellow-800',
      'application-in-embassy': 'bg-purple-100 text-purple-800',
      'application-cancelled': 'bg-gray-100 text-gray-800',
      'application-completed': 'bg-emerald-100 text-emerald-800',
      'document-rejected': 'bg-red-100 text-red-800',
    }
    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type.replace(/-/g, ' ')}
      </Badge>
    )
  }

  const getFilteredTemplates = (category: string) => {
    switch (category) {
      case 'status':
        return templates.filter(t =>
          [
            'status-update',
            'application-submitted',
            'application-under-review',
            'application-in-embassy',
            'application-completed',
            'visa-approved',
            'visa-rejected',
          ].includes(t.type)
        )
      case 'issues':
        return templates.filter(t =>
          [
            'application-incomplete',
            'application-cancelled',
            'application-reopened',
            'document-rejected',
          ].includes(t.type)
        )
      case 'finance':
        return templates.filter(t =>
          ['booking-confirmation', 'invoice'].includes(t.type)
        )
      case 'other':
        return templates.filter(t =>
          ['password-reset', 'agent-assigned'].includes(t.type)
        )
      default:
        return templates
    }
  }

  const renderTemplateList = (list: EmailTemplate[]) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No templates found in this category
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(template => (
          <div
            key={template._id}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${
              !template.isActive ? 'opacity-60 bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="font-semibold text-lg truncate pr-2">
                {template.name}
              </div>
              {getTypeBadge(template.type)}
            </div>

            <div className="text-sm text-gray-500 mb-4 h-10 overflow-hidden text-ellipsis line-clamp-2">
              {template.description || template.subject}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-xs text-gray-400">
                {template.variables?.length || 0} variables
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(template)}
                  className={
                    template.isActive ? 'text-green-600' : 'text-gray-400'
                  }
                  title={template.isActive ? 'Deactivate' : 'Activate'}
                >
                  {template.isActive ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(template)}
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(template._id!)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-2">
            Manage email templates for visa application communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchTemplates}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            variant="outline"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {templates.filter(t => !t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Template Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(templates.map(t => t.type)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="status">Status & Updates</TabsTrigger>
                <TabsTrigger value="issues">Issues & Actions</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="other">Account & Agent</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {renderTemplateList(templates)}
              </TabsContent>
              <TabsContent value="status" className="mt-0">
                {renderTemplateList(getFilteredTemplates('status'))}
              </TabsContent>
              <TabsContent value="issues" className="mt-0">
                {renderTemplateList(getFilteredTemplates('issues'))}
              </TabsContent>
              <TabsContent value="finance" className="mt-0">
                {renderTemplateList(getFilteredTemplates('finance'))}
              </TabsContent>
              <TabsContent value="other" className="mt-0">
                {renderTemplateList(getFilteredTemplates('other'))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate
                ? 'Edit Email Template'
                : 'Create Email Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Booking Confirmation"
                />
              </div>
              <div>
                <Label htmlFor="type">Template Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => {
                    setFormData(prev => ({ ...prev, type: value }))
                    loadDefaultTemplate(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking-confirmation">
                      Booking Confirmation
                    </SelectItem>
                    <SelectItem value="application-submitted">
                      Application Submitted
                    </SelectItem>
                    <SelectItem value="status-update">Status Update</SelectItem>
                    <SelectItem value="agent-assigned">
                      Agent Assigned
                    </SelectItem>
                    <SelectItem value="visa-approved">Visa Approved</SelectItem>
                    <SelectItem value="visa-rejected">Visa Rejected</SelectItem>
                    <SelectItem value="password-reset">
                      Password Reset
                    </SelectItem>
                    <SelectItem value="application-reopened">
                      Application Reopened
                    </SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="application-incomplete">
                      Application Incomplete
                    </SelectItem>
                    <SelectItem value="application-under-review">
                      Application Under Review
                    </SelectItem>
                    <SelectItem value="application-in-embassy">
                      Application In Embassy
                    </SelectItem>
                    <SelectItem value="application-cancelled">
                      Application Cancelled
                    </SelectItem>
                    <SelectItem value="application-completed">
                      Application Completed
                    </SelectItem>
                    <SelectItem value="document-rejected">
                      Document Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of when this template is used"
              />
            </div>

            <div>
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={e =>
                  setFormData(prev => ({ ...prev, subject: e.target.value }))
                }
                placeholder="e.g., Visa Booking Confirmation - {{bookingId}}"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{variableName}}'} for dynamic content
              </p>
            </div>

            <div>
              <Label htmlFor="htmlBody">HTML Body *</Label>
              <Textarea
                id="htmlBody"
                value={formData.htmlBody}
                onChange={e =>
                  setFormData(prev => ({ ...prev, htmlBody: e.target.value }))
                }
                rows={12}
                placeholder="Enter HTML email template..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{variableName}}'} for dynamic content
              </p>
            </div>

            <div>
              <Label htmlFor="textBody">Plain Text Body *</Label>
              <Textarea
                id="textBody"
                value={formData.textBody}
                onChange={e =>
                  setFormData(prev => ({ ...prev, textBody: e.target.value }))
                }
                rows={8}
                placeholder="Enter plain text email template..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{variableName}}'} for dynamic content
              </p>
            </div>

            <div>
              <Label htmlFor="variables">
                Available Variables (comma-separated)
              </Label>
              <Input
                id="variables"
                value={formData.variables?.join(', ') || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    variables: e.target.value
                      .split(',')
                      .map(v => v.trim())
                      .filter(v => v),
                  }))
                }
                placeholder="e.g., bookingId, customerName, country"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e =>
                  setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                }
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Template is active
              </Label>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewForm}
                disabled={!formData.htmlBody || !formData.subject}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Template Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              {/* Email Subject Preview */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Subject:
                </div>
                <div className="text-lg text-gray-900">
                  {getPreviewSubject(previewTemplate)}
                </div>
              </div>

              {/* Email HTML Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    HTML Preview
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {previewTemplate.type}
                    </Badge>
                  </div>
                </div>
                <div className="bg-white p-4 overflow-x-auto">
                  <div
                    className="email-preview max-w-full"
                    style={{
                      maxWidth: '100%',
                      width: '100%',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: getPreviewHtml(previewTemplate),
                    }}
                  />
                </div>
              </div>

              {/* Plain Text Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <span className="text-sm font-semibold text-gray-700">
                    Plain Text Preview
                  </span>
                </div>
                <div className="bg-white p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                    {getPreviewText(previewTemplate)}
                  </pre>
                </div>
              </div>

              {/* Variable Information */}
              {previewTemplate.variables &&
                previewTemplate.variables.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900 mb-2">
                      Sample Variables Used:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.variables.map((variable, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Variables are replaced with sample data for preview
                      purposes.
                    </p>
                  </div>
                )}
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
