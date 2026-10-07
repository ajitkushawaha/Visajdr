import nodemailer from 'nodemailer'
import connectDb from './db'
import Notification from '@/models/Notification'
import User from '@/models/User'

// Email templates
const emailTemplates = {
  application: {
    subject: 'New Visa Application Assigned',
    template: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Visa Application</h2>
        <p>Hello ${data.agentName},</p>
        <p>A new visa application has been assigned to you:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Client:</strong> ${data.clientName}</p>
          <p><strong>Visa Type:</strong> ${data.visaType}</p>
          <p><strong>Country:</strong> ${data.country}</p>
          <p><strong>Application ID:</strong> ${data.applicationId}</p>
          <p><strong>Priority:</strong> ${data.priority}</p>
        </div>
        <p>Please review the application and take necessary action.</p>
        <p>Best regards,<br>Visa4 Team</p>
      </div>
    `,
  },
  document: {
    subject: 'Document Required - Visa Application',
    template: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Document Required</h2>
        <p>Hello ${data.agentName},</p>
        <p>Additional documents are required for the following application:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Client:</strong> ${data.clientName}</p>
          <p><strong>Application ID:</strong> ${data.applicationId}</p>
          <p><strong>Required Documents:</strong> ${data.requiredDocuments}</p>
          <p><strong>Deadline:</strong> ${data.deadline}</p>
        </div>
        <p>Please contact the client to collect the required documents.</p>
        <p>Best regards,<br>Visa4 Team</p>
      </div>
    `,
  },
  status: {
    subject: 'Visa Application Status Update',
    template: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Status Update</h2>
        <p>Hello ${data.agentName},</p>
        <p>The status of the following application has been updated:</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Client:</strong> ${data.clientName}</p>
          <p><strong>Application ID:</strong> ${data.applicationId}</p>
          <p><strong>New Status:</strong> <span style="color: #059669; font-weight: bold;">${data.status}</span></p>
          <p><strong>Updated By:</strong> ${data.updatedBy}</p>
        </div>
        <p>Please inform the client about this status change.</p>
        <p>Best regards,<br>Visa4 Team</p>
      </div>
    `,
  },
  reminder: {
    subject: 'Reminder - Action Required',
    template: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Action Required</h2>
        <p>Hello ${data.agentName},</p>
        <p>This is a reminder for the following task:</p>
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Task:</strong> ${data.task}</p>
          <p><strong>Due Date:</strong> ${data.dueDate}</p>
          <p><strong>Priority:</strong> ${data.priority}</p>
        </div>
        <p>Please take action before the deadline.</p>
        <p>Best regards,<br>Visa4 Team</p>
      </div>
    `,
  },
  query: {
    subject: 'New Client Query Assigned',
    template: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Client Query</h2>
        <p>Hello ${data.agentName},</p>
        <p>A new client query has been assigned to you:</p>
        <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Client:</strong> ${data.clientName}</p>
          <p><strong>Email:</strong> ${data.clientEmail}</p>
          <p><strong>Phone:</strong> ${data.clientPhone}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong> ${data.message}</p>
        </div>
        <p>Please respond to the client within 24 hours.</p>
        <p>Best regards,<br>Visa4 Team</p>
      </div>
    `,
  },
  document_rejected: {
    subject: 'Action Required: Document Rejected',
    template: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Document Rejected</h2>
        <p>Hello ${data.agentName},</p>
        <p>Important update regarding your visa application (${data.trackingId}):</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fee2e2;">
          <p><strong>Document:</strong> ${data.documentType}</p>
          <p><strong>Rejection Reason:</strong> ${data.rejectionReason}</p>
        </div>
        <p>Please log in to your dashboard immediately to upload a corrected document.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p>Best regards,<br>Visa4 Team</p>
      </div>
    `,
  },
}

// Import EmailService to reuse the centralized configuration
import { emailService } from './emailService'

// Send notification email
export const sendNotificationEmail = async (notificationId: string) => {
  try {
    await connectDb()

    const notification = await Notification.findById(notificationId).populate(
      'recipient',
      'name email role'
    )

    if (!notification || !notification.recipient) {
      throw new Error('Notification or recipient not found')
    }

    const recipient = notification.recipient as any
    const template =
      emailTemplates[notification.type as keyof typeof emailTemplates]

    if (!template) {
      throw new Error(`No email template found for type: ${notification.type}`)
    }

    // Initialize the email service to ensure configuration is loaded
    await emailService.initialize()

    // Use the centralized emailService to send the email
    // This will automatically use SendGrid or SMTP based on system configuration
    const success = await emailService.sendEmail({
      to: recipient.email,
      subject: template.subject,
      html: template.template({
        agentName: recipient.name,
        ...notification.metadata,
      }),
    })

    if (success) {
      // Update notification as email sent
      await Notification.findByIdAndUpdate(notificationId, {
        emailSent: true,
        emailSentAt: new Date(),
      })

      console.log(
        `Email sent successfully to ${recipient.email} for notification ${notificationId}`
      )
      return true
    } else {
      console.error(`Failed to send email to ${recipient.email}`)
      return false
    }
  } catch (error) {
    console.error('Error sending notification email:', error)
    return false
  }
}

// Create and send notification
export const createAndSendNotification = async (notificationData: {
  recipient: string
  type: 'application' | 'document' | 'status' | 'reminder' | 'query' | 'system'
  title: string
  message: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  relatedId?: string
  relatedType?: 'visa-application' | 'query' | 'supplier' | 'other'
  metadata?: any
  sendEmail?: boolean
}) => {
  try {
    await connectDb()

    const notification = new Notification({
      ...notificationData,
      priority: notificationData.priority || 'medium',
    })

    await notification.save()

    // Send email if requested
    if (notificationData.sendEmail) {
      await sendNotificationEmail(notification._id.toString())
    }

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Send bulk notifications
export const sendBulkNotifications = async (
  notifications: Array<{
    recipient: string
    type:
      | 'application'
      | 'document'
      | 'status'
      | 'reminder'
      | 'query'
      | 'system'
    title: string
    message: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    metadata?: any
  }>
) => {
  try {
    await connectDb()

    const createdNotifications = await Notification.insertMany(notifications)

    // Send emails for all notifications
    const emailPromises = createdNotifications.map(notification =>
      sendNotificationEmail(notification._id.toString())
    )

    await Promise.allSettled(emailPromises)

    return createdNotifications
  } catch (error) {
    console.error('Error sending bulk notifications:', error)
    throw error
  }
}

// Get notification statistics
export const getNotificationStats = async (recipientId?: string) => {
  try {
    await connectDb()

    const matchQuery = recipientId ? { recipient: recipientId } : {}

    const stats = await Notification.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead',
            },
          },
          byPriority: {
            $push: {
              priority: '$priority',
              isRead: '$isRead',
            },
          },
        },
      },
    ])

    return stats[0] || { total: 0, unread: 0, byType: [], byPriority: [] }
  } catch (error) {
    console.error('Error getting notification stats:', error)
    throw error
  }
}
