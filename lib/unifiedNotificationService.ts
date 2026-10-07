import { emailService } from './emailService'
import { twilioService } from './twilioService'
import CompanySettings from '@/models/CompanySettings'
import connectDB from './db'

interface NotificationPayload {
  toEmail?: string
  toPhone?: string
  subject: string
  body: string // Text body for SMS/WhatsApp
  html?: string // HTML body for Email
  data?: any // For complex templates
}

class UnifiedNotificationService {
  async send(payload: NotificationPayload) {
    try {
      await connectDB()
      const companySettings = await CompanySettings.findOne({}).lean()
      const settings = companySettings?.notificationSettings

      const promises = []

      // 1. Email Channel
      if (settings?.email?.isActive && payload.toEmail) {
        console.log('Orchestrating Email notification...')
        // We reuse the existing emailService logic
        // If the user wants Twilio SendGrid later, we can add that logic here
        promises.push(this.sendEmail(payload))
      }

      // 2. SMS Channel
      if (settings?.sms?.isActive && payload.toPhone) {
        console.log('Orchestrating SMS notification...')
        promises.push(twilioService.sendSMS(payload.toPhone, payload.body))
      }

      // 3. WhatsApp Channel
      if (settings?.whatsapp?.isActive && payload.toPhone) {
        console.log('Orchestrating WhatsApp notification...')
        promises.push(twilioService.sendWhatsApp(payload.toPhone, payload.body))
      }

      if (promises.length === 0) {
        console.warn(
          'No active notification channels configured or payload missing contact info.'
        )
        // FALLBACK: If everything is disabled, we still try to send Email via default SMTP
        // to ensure the user doesn't miss critical info.
        if (payload.toEmail) {
          console.log('Falling back to default SMTP Email...')
          return await this.sendEmail(payload)
        }
      }

      const results = await Promise.allSettled(promises)
      return results
    } catch (error) {
      console.error('Unified Notification Error:', error)
      // Extreme fallback if DB fails
      if (payload.toEmail) {
        return await this.sendEmail(payload)
      }
      return false
    }
  }

  private async sendEmail(payload: NotificationPayload) {
    // Reuse existing emailService logic but adapted for the unified interface
    // Our current emailService.ts is complex and handles templates itself.
    // For now, we will expose a simple method or trigger the specific confirmations.
    // NOTE: This will be refined as we update the calling points.
    return emailService.sendCustomEmail({
      to: payload.toEmail!,
      subject: payload.subject,
      html: payload.html || payload.body,
      text: payload.body,
    })
  }
}

export const notificationService = new UnifiedNotificationService()
