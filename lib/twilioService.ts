import twilio from 'twilio'
import CompanySettings from '@/models/CompanySettings'
import connectDB from './db'

interface TwilioConfig {
  accountSid: string
  authToken: string
  phoneNumber: string
  whatsappNumber: string
}

class TwilioService {
  private client: twilio.Twilio | null = null
  private config: TwilioConfig | null = null

  async initialize() {
    try {
      await connectDB()
      const companySettings = await CompanySettings.findOne({}).lean()

      if (
        !companySettings?.twilioSettings?.accountSid ||
        !companySettings?.twilioSettings?.authToken
      ) {
        // Fallback to Env variables if database settings are missing
        this.config = {
          accountSid: process.env.TWILIO_ACCOUNT_SID || '',
          authToken: process.env.TWILIO_AUTH_TOKEN || '',
          phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
          whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
        }
      } else {
        this.config = {
          accountSid: companySettings.twilioSettings.accountSid,
          authToken: companySettings.twilioSettings.authToken,
          phoneNumber: companySettings.twilioSettings.phoneNumber,
          whatsappNumber: companySettings.twilioSettings.whatsappNumber,
        }
      }

      if (this.config.accountSid && this.config.authToken) {
        this.client = twilio(this.config.accountSid, this.config.authToken)
        console.log('Twilio Service Initialized')
      } else {
        console.warn('Twilio credentials not configured')
      }
    } catch (error) {
      console.error('Failed to initialize Twilio service:', error)
    }
  }

  async sendSMS(to: string, body: string) {
    if (!this.client || !this.config) await this.initialize()
    if (!this.client || !this.config?.phoneNumber) {
      console.error('Twilio client or phone number not configured')
      return false
    }

    try {
      const message = await this.client.messages.create({
        body,
        from: this.config.phoneNumber,
        to,
      })
      console.log('SMS sent successfully:', message.sid)
      return true
    } catch (error) {
      console.error('Failed to send SMS:', error)
      return false
    }
  }

  async sendWhatsApp(to: string, body: string) {
    if (!this.client || !this.config) await this.initialize()
    if (!this.client || !this.config?.whatsappNumber) {
      console.error('Twilio client or WhatsApp number not configured')
      return false
    }

    try {
      // Ensure "to" format: whatsapp:+91xxxxxxxxxx
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
      const formattedFrom = this.config.whatsappNumber.startsWith('whatsapp:')
        ? this.config.whatsappNumber
        : `whatsapp:${this.config.whatsappNumber}`

      const message = await this.client.messages.create({
        body,
        from: formattedFrom,
        to: formattedTo,
      })
      console.log('WhatsApp message sent successfully:', message.sid)
      return true
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      return false
    }
  }
}

export const twilioService = new TwilioService()
