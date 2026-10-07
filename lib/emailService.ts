import nodemailer from 'nodemailer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import { renderEmailTemplate } from './emailTemplateService'

interface EmailConfig {
  smtpServer: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
  mailer?: string
  sendgridApiKey?: string
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface BookingData {
  bookingId: string
  customerName: string
  customerEmail: string
  serviceType: 'visa' | 'travel-insurance'
  serviceDetails: any
  totalAmount: number
  bookingDate: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null

  async initialize() {
    try {
      await connectDB()

      // Get email settings from CompanySettings
      const CompanySettings = (await import('@/models/CompanySettings')).default
      const companySettings = await CompanySettings.findOne({}).lean()

      this.config = {
        smtpServer:
          companySettings?.smtpServer ||
          process.env.SMTP_SERVER ||
          'smtp.gmail.com',
        smtpPort: parseInt(
          companySettings?.portNumber || process.env.SMTP_PORT || '587'
        ),
        smtpUser: companySettings?.emailId || process.env.SMTP_USER || '',
        smtpPassword:
          companySettings?.emailPassword || process.env.SMTP_PASSWORD || '',
        fromEmail:
          companySettings?.fromEmail ||
          process.env.FROM_EMAIL ||
          'noreply@visa-service.com',
        fromName: process.env.FROM_NAME || 'Visa4 Visa Services',
        mailer: companySettings?.mailer || 'smtp',
        sendgridApiKey:
          companySettings?.sendgridApiKey || process.env.SENDGRID_API_KEY || '',
      }

      // Fix Gmail port if it's set to 465 but should be 587
      if (
        this.config.smtpServer.includes('gmail.com') &&
        this.config.smtpPort === 465
      ) {
        this.config.smtpPort = 587
        console.log('Fixed Gmail port from 465 to 587')
      }

      // Debug: Log email configuration (without password)
      console.log('Email configuration loaded:', {
        smtpServer: this.config.smtpServer,
        smtpPort: this.config.smtpPort,
        smtpUser: this.config.smtpUser,
        hasPassword: !!this.config.smtpPassword,
        fromEmail: this.config.fromEmail,
        fromName: this.config.fromName,
      })

      // Check if we have valid email credentials
      if (!this.config.smtpUser || !this.config.smtpPassword) {
        console.warn(
          'Email credentials not configured. Email notifications will be disabled.'
        )
        this.transporter = null
        return
      }

      // Create transporter with different configurations based on provider
      const transporterConfig: any = {
        host: this.config.smtpServer,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPassword,
        },
      }

      // Priority: SendGrid (Twilio) configuration
      if (
        this.config.mailer === 'twilio' ||
        companySettings?.notificationSettings?.email?.provider === 'twilio'
      ) {
        if (this.config.sendgridApiKey) {
          transporterConfig.host = 'smtp.sendgrid.net'
          transporterConfig.port = 587
          transporterConfig.secure = false
          transporterConfig.auth = {
            user: 'apikey',
            pass: this.config.sendgridApiKey,
          }
          console.log('Using SendGrid (Twilio) for email delivery')
        } else {
          console.warn('SendGrid API Key missing, falling back to SMTP')
        }
      }

      // Add TLS configuration for non-Gmail providers
      if (
        this.config.smtpServer.includes('secureserver.net') ||
        this.config.smtpServer.includes('outlook.com')
      ) {
        transporterConfig.tls = {
          rejectUnauthorized: false,
          ciphers: 'SSLv3',
        }
      } else if (this.config.smtpServer.includes('gmail.com')) {
        transporterConfig.tls = {
          rejectUnauthorized: false,
        }
      }

      this.transporter = nodemailer.createTransport(transporterConfig)

      // Verify connection
      try {
        await this.transporter.verify()
        console.log('Email service initialized successfully')
      } catch (verifyError) {
        console.error('Email verification failed:', verifyError)
        // Don't throw error, just log it and continue
        // The email sending methods will handle this gracefully
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error)
      throw error
    }
  }

  private generateVisaBookingTemplate(data: BookingData): EmailTemplate {
    const {
      customerName,
      bookingId,
      serviceDetails,
      totalAmount,
      bookingDate,
    } = data

    const subject = `Visa Booking Confirmation - ${bookingId}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visa Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #374151; }
          .detail-value { color: #6b7280; }
          .total { background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .status-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛂 Visa Booking Confirmation</h1>
            <p>Thank you for choosing Visa4 Visa Services</p>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Your visa application has been successfully submitted and confirmed. Here are your booking details:</p>
            
            <div class="booking-details">
              <h3>Booking Information</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking Date:</span>
                <span class="detail-value">${new Date(bookingDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge">Confirmed</span></span>
              </div>
            </div>

            <div class="booking-details">
              <h3>Visa Details</h3>
              <div class="detail-row">
                <span class="detail-label">Destination Country:</span>
                <span class="detail-value">${serviceDetails.country || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Visa Type:</span>
                <span class="detail-value">${serviceDetails.visaType || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Processing Type:</span>
                <span class="detail-value">${serviceDetails.processingType || 'Standard'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Processing Time:</span>
                <span class="detail-value">${serviceDetails.processingTime || '15'} days</span>
              </div>
            </div>

            <div class="total">
              Total Amount: ₹${totalAmount}
            </div>

            <div class="booking-details">
              <h3>Next Steps</h3>
              <ul>
                <li>You will receive a confirmation call within 24 hours</li>
                <li>Please prepare the required documents as per the checklist</li>
                <li>Our team will guide you through the document submission process</li>
                <li>Track your application status using your booking ID</li>
              </ul>
            </div>

            <p>If you have any questions, please contact our support team at support@euroworld.com or call +91-XXXX-XXXX.</p>
            
            <p>Thank you for choosing Visa4 Visa Services!</p>
            
            <div class="footer">
              <p>Visa4 Visa Services<br>
              Email: support@euroworld.com<br>
              Phone: +91-XXXX-XXXX</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Visa Booking Confirmation - ${bookingId}
      
      Dear ${customerName},
      
      Your visa application has been successfully submitted and confirmed.
      
      Booking Details:
      - Booking ID: ${bookingId}
      - Booking Date: ${new Date(bookingDate).toLocaleDateString()}
      - Status: Confirmed
      
      Visa Details:
      - Destination Country: ${serviceDetails.country || 'N/A'}
      - Visa Type: ${serviceDetails.visaType || 'N/A'}
      - Processing Type: ${serviceDetails.processingType || 'Standard'}
      - Processing Time: ${serviceDetails.processingTime || '15'} days
      
      Total Amount: ₹${totalAmount}
      
      Next Steps:
      - You will receive a confirmation call within 24 hours
      - Please prepare the required documents as per the checklist
      - Our team will guide you through the document submission process
      - Track your application status using your booking ID
      
      If you have any questions, please contact our support team.
      
      Thank you for choosing Visa4 Visa Services!
    `

    return { subject, html, text }
  }

  private generateTravelInsuranceTemplate(data: BookingData): EmailTemplate {
    const {
      customerName,
      bookingId,
      serviceDetails,
      totalAmount,
      bookingDate,
    } = data

    const subject = `Travel Insurance Booking Confirmation - ${bookingId}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Travel Insurance Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #374151; }
          .detail-value { color: #6b7280; }
          .total { background: #059669; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .status-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Travel Insurance Booking Confirmation</h1>
            <p>Your travel protection is now active</p>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Your travel insurance has been successfully purchased and is now active. Here are your policy details:</p>
            
            <div class="booking-details">
              <h3>Policy Information</h3>
              <div class="detail-row">
                <span class="detail-label">Policy ID:</span>
                <span class="detail-value">${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Purchase Date:</span>
                <span class="detail-value">${new Date(bookingDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge">Active</span></span>
              </div>
            </div>

            <div class="booking-details">
              <h3>Coverage Details</h3>
              <div class="detail-row">
                <span class="detail-label">Coverage Type:</span>
                <span class="detail-value">${serviceDetails.coverageType || 'Comprehensive'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Coverage Amount:</span>
                <span class="detail-value">₹${serviceDetails.coverageAmount || '5,00,000'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Trip Duration:</span>
                <span class="detail-value">${serviceDetails.tripDuration || '30'} days</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Destination:</span>
                <span class="detail-value">${serviceDetails.destination || 'Worldwide'}</span>
              </div>
            </div>

            <div class="total">
              Premium Paid: ₹${totalAmount}
            </div>

            <div class="booking-details">
              <h3>Coverage Includes</h3>
              <ul>
                <li>Medical expenses up to ₹${serviceDetails.coverageAmount || '5,00,000'}</li>
                <li>Trip cancellation and interruption</li>
                <li>Baggage loss and delay</li>
                <li>Emergency evacuation</li>
                <li>24/7 emergency assistance</li>
              </ul>
            </div>

            <div class="booking-details">
              <h3>Important Information</h3>
              <ul>
                <li>Keep this email as proof of insurance</li>
                <li>Emergency contact: +91-XXXX-XXXX</li>
                <li>Policy document will be sent separately</li>
                <li>Coverage is valid from your departure date</li>
              </ul>
            </div>

            <p>If you have any questions about your policy, please contact our insurance team.</p>
            
            <p>Safe travels!</p>
            
            <div class="footer">
              <p>Visa4 Travel Insurance<br>
              Email: insurance@euroworld.com<br>
              Phone: +91-XXXX-XXXX</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Travel Insurance Booking Confirmation - ${bookingId}
      
      Dear ${customerName},
      
      Your travel insurance has been successfully purchased and is now active.
      
      Policy Details:
      - Policy ID: ${bookingId}
      - Purchase Date: ${new Date(bookingDate).toLocaleDateString()}
      - Status: Active
      
      Coverage Details:
      - Coverage Type: ${serviceDetails.coverageType || 'Comprehensive'}
      - Coverage Amount: ₹${serviceDetails.coverageAmount || '5,00,000'}
      - Trip Duration: ${serviceDetails.tripDuration || '30'} days
      - Destination: ${serviceDetails.destination || 'Worldwide'}
      
      Premium Paid: ₹${totalAmount}
      
      Coverage Includes:
      - Medical expenses up to ₹${serviceDetails.coverageAmount || '5,00,000'}
      - Trip cancellation and interruption
      - Baggage loss and delay
      - Emergency evacuation
      - 24/7 emergency assistance
      
      Important Information:
      - Keep this email as proof of insurance
      - Emergency contact: +91-XXXX-XXXX
      - Policy document will be sent separately
      - Coverage is valid from your departure date
      
      If you have any questions about your policy, please contact our insurance team.
      
      Safe travels!
    `

    return { subject, html, text }
  }

  async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      if (!this.transporter || !this.config) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        throw new Error('Email service not initialized')
      }

      const subject = `Your Verification Code - ${otp}`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Verification Code</h2>
          <p>Your OTP is:</p>
          <h1 style="background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `

      await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: email,
        subject,
        html,
        text: `Your OTP is ${otp}. Valid for 10 minutes.`,
      })

      return true
    } catch (error) {
      console.error('Failed to send OTP email:', error)
      return false
    }
  }

  async sendBookingConfirmation(data: BookingData): Promise<boolean> {
    try {
      if (!this.transporter || !this.config) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        throw new Error('Email service not initialized')
      }

      // Generate email template based on service type
      const template =
        data.serviceType === 'visa'
          ? this.generateVisaBookingTemplate(data)
          : this.generateTravelInsuranceTemplate(data)

      // Send email
      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: data.customerEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      })

      console.log('Email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error)
      return false
    }
  }

  async sendStatusUpdate(
    bookingId: string,
    customerEmail: string,
    status: string,
    serviceType: 'visa' | 'travel-insurance'
  ): Promise<boolean> {
    try {
      if (!this.transporter || !this.config) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        throw new Error('Email service not initialized')
      }

      const subject = `📊 ${serviceType === 'visa' ? 'Visa' : 'Travel Insurance'} Status Update - ${bookingId}`

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Status Update</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your ${serviceType === 'visa' ? 'visa application' : 'travel insurance policy'} has been updated</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Dear Customer,</p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">We have an important update regarding your ${serviceType === 'visa' ? 'visa application' : 'travel insurance policy'}. Please review the details below.</p>
              
              <!-- Status Update Card -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 16px; padding: 30px; margin: 30px 0;">
                <h3 style="color: #1e40af; margin: 0 0 25px 0; font-size: 24px; font-weight: 700;">📋 Update Details</h3>
                <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="display: grid; gap: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid #e0f2fe;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Booking ID:</span>
                      <span style="font-family: 'Courier New', monospace; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px;">${bookingId}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">New Status:</span>
                      <span style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase;">${status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Required -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">📝 Next Steps</h3>
                <p style="margin: 0 0 15px 0; color: #374151;">Please log in to your account to view complete details and any required actions.</p>
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" 
                     style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    📊 View Full Details
                  </a>
                </div>
              </div>

              <!-- Support Info -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #374151; font-weight: 600; font-size: 18px;">Questions?</p>
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
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const text = `
        Status Update
        
        Your ${serviceType === 'visa' ? 'visa application' : 'travel insurance policy'} status has been updated.
        
        Booking ID: ${bookingId}
        New Status: ${status}
        
        Please log in to your account to view more details.
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: customerEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log('Status update email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send status update email:', error)
      return false
    }
  }

  async sendDocumentRejected(
    trackingId: string,
    customerEmail: string,
    reason: string
  ): Promise<boolean> {
    try {
      if (!this.transporter || !this.config) {
        await this.initialize()
      }
      if (!this.transporter || !this.config) {
        throw new Error('Email service not initialized')
      }
      const subject = `❗ Document Rejected - ${trackingId}`
      const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document Rejected</title>
        </head>
        <body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f8fafc;line-height:1.6;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <div style="background:#ef4444;color:white;padding:32px 24px;text-align:center;">
              <div style="font-size:42px;margin-bottom:12px;">⚠️</div>
              <h1 style="margin:0;font-size:24px;font-weight:700;">Document Rejected</h1>
              <p style="margin:8px 0 0 0;font-size:15px;opacity:0.9;">Tracking ID: ${trackingId}</p>
            </div>
            <div style="padding:28px 24px;">
              <p style="font-size:16px;color:#374151;margin:0 0 16px 0;">Dear Customer,</p>
              <p style="font-size:16px;color:#374151;margin:0 0 16px 0;">One or more documents associated with your application have been rejected during review.</p>
              <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:0 10px 10px 0;margin:16px 0;">
                <h3 style="color:#b91c1c;margin:0 0 8px 0;font-size:18px;font-weight:600;">Reason</h3>
                <p style="margin:0;color:#7f1d1d;font-size:15px;">${reason || 'Not specified'}</p>
              </div>
              <div style="background:#f9fafb;padding:16px;border-radius:10px;margin:16px 0;">
                <h3 style="color:#111827;margin:0 0 8px 0;font-size:18px;font-weight:600;">Next Steps</h3>
                <ul style="margin:0;padding-left:20px;color:#374151;font-size:15px;">
                  <li>Prepare a correct and clear document.</li>
                  <li>Log in to your dashboard and re-upload the document.</li>
                  <li>Our team will re-review and update your application.</li>
                </ul>
                <div style="text-align:center;margin-top:16px;">
                  <a href="${dashboardUrl}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">
                    Re-upload Documents
                  </a>
                </div>
              </div>
              <div style="background:#f9fafb;border-radius:10px;padding:16px;text-align:center;margin-top:24px;">
                <p style="margin:0;color:#6b7280;font-size:14px;">
                  Email: support@euroworld.com • Phone: +91-XXXX-XXXX
                </p>
              </div>
            </div>
            <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
      const text = `
        Document Rejected
        Tracking ID: ${trackingId}
        Reason: ${reason || 'Not specified'}
        Please log in to your dashboard to re-upload the document: ${dashboardUrl}
      `
      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: customerEmail,
        subject,
        text,
        html,
      })
      console.log('Document rejected email sent:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send document rejected email:', error)
      return false
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(
    userEmail: string,
    resetLink: string,
    userName: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.warn(
          'Email service not configured. Skipping password reset email.'
        )
        return false
      }

      // Try to use database template, fallback to hardcoded
      const template = await renderEmailTemplate(
        'password-reset',
        {
          customerName: userName,
          resetLink,
        },
        {
          subject: `🔐 Password Reset Request - Visa4 Visa Services`,
          html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Password Reset Request</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We received a request to reset your password</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Dear {{customerName}},</p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">We received a request to reset your password for your Visa4 Visa Services account. If you made this request, please click the button below to reset your password.</p>
              
              <!-- Reset Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{resetLink}}" 
                   style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; text-decoration: none; padding: 18px 36px; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 12px rgba(220, 38, 38, 0.3);">
                  🔑 Reset My Password
                </a>
              </div>

              <!-- Security Information -->
              <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #b91c1c; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">⚠️ Important Security Information</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">This link will expire in <strong>1 hour</strong> for your security</li>
                  <li style="margin-bottom: 10px;">If you didn't request this reset, please ignore this email</li>
                  <li style="margin-bottom: 10px;">Your password will remain unchanged until you create a new one</li>
                  <li style="margin-bottom: 10px;">For security, never share this link with anyone</li>
                </ul>
              </div>

              <!-- Alternative Method -->
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🔗 Alternative Method</h3>
                <p style="margin: 0 0 15px 0; color: #374151;">If the button above doesn't work, copy and paste this link into your browser:</p>
                <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; word-break: break-all; font-family: 'Courier New', monospace; font-size: 12px; color: #6b7280;">
                  {{resetLink}}
                </div>
              </div>

              <!-- Support Info -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #374151; font-weight: 600; font-size: 18px;">Need Help?</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  If you're having trouble resetting your password or didn't request this reset,<br>
                  please contact our support team immediately.
                </p>
                <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                  📧 Email: support@euroworld.com<br>
                  📞 Phone: +91-XXXX-XXXX<br>
                  💬 WhatsApp: +91-XXXX-XXXX
                </p>
              </div>

              <!-- Security Notice -->
              <div style="text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">🛡️ Security First</h3>
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  We take your account security seriously. This password reset link is unique to you<br>
                  and will only work once. If you have any concerns, please contact us immediately.
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
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
          text: `
        Password Reset Request - Visa4 Visa Services
        
        Dear {{customerName}},
        
        We received a request to reset your password for your Visa4 Visa Services account.
        
        To reset your password, please click the following link:
        {{resetLink}}
        
        This link will expire in 1 hour for your security.
        
        If you didn't request this password reset, please ignore this email.
        Your password will remain unchanged until you create a new one.
        
        For security reasons, never share this link with anyone.
        
        If you're having trouble, please contact our support team:
        Email: support@euroworld.com
        Phone: +91-XXXX-XXXX
        
        Best regards,
        Visa4 Visa Services Team
      `,
        }
      )

      console.log('Attempting to send password reset email:', {
        from: this.config.fromEmail,
        to: userEmail,
        subject: template.subject,
      })

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: userEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      })

      console.log('✅ Password reset email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
      })

      if (info.rejected && info.rejected.length > 0) {
        console.error('❌ Email was rejected:', info.rejected)
        return false
      }

      return true
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode,
        command: error.command,
        response: error.response,
      })
      return false
    }
  }

  // Send application submitted confirmation
  async sendApplicationSubmitted(
    userEmail: string,
    trackingId: string,
    visaDetails: any
  ): Promise<boolean> {
    try {
      console.log('📧 sendApplicationSubmitted called:', {
        userEmail,
        trackingId,
        hasVisaDetails: !!visaDetails,
      })

      if (!this.transporter) {
        console.log('📧 Initializing email service...')
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error(
          '❌ Email service not configured. Cannot send email notification.',
          {
            hasTransporter: !!this.transporter,
            hasConfig: !!this.config,
            configUser: this.config?.smtpUser,
            hasPassword: !!this.config?.smtpPassword,
          }
        )
        return false
      }

      console.log('📧 Email service initialized, proceeding to send email')

      // Try to use database template, fallback to hardcoded
      const template = await renderEmailTemplate(
        'application-submitted',
        {
          trackingId,
          customerName: visaDetails.customerName || 'Applicant',
          country: visaDetails.country || 'N/A',
          visaType: visaDetails.visaType || 'N/A',
          processingTime: visaDetails.processingTime || 'Standard (15-30 days)',
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        },
        {
          subject: `🎉 Visa Application Submitted Successfully - ${trackingId}`,
          html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Visa Application Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">🛂</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Application Submitted Successfully!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your visa application is now being processed</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Dear Applicant,</p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">Thank you for choosing Visa4 Visa Services! Your visa application has been successfully submitted and is now in our system.</p>
              
              <!-- Application Details Card -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; margin: 30px 0;">
                <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📋 Application Details</h3>
                <div style="display: grid; gap: 15px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #d1d5db;">
                    <span style="font-weight: 600; color: #374151;">Tracking ID:</span>
                    <span style="font-family: 'Courier New', monospace; background: #1e40af; color: white; padding: 6px 12px; border-radius: 6px; font-weight: 600;">{{trackingId}}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #d1d5db;">
                    <span style="font-weight: 600; color: #374151;">Destination:</span>
                    <span style="color: #6b7280;">{{country}}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #d1d5db;">
                    <span style="font-weight: 600; color: #374151;">Visa Type:</span>
                    <span style="color: #6b7280;">{{visaType}}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                    <span style="font-weight: 600; color: #374151;">Processing Time:</span>
                    <span style="color: #6b7280;">{{processingTime}}</span>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">🚀 What Happens Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">Our team will review your application within 24 hours</li>
                  <li style="margin-bottom: 8px;">You'll receive updates via email at each stage</li>
                  <li style="margin-bottom: 8px;">An agent will be assigned to handle your case</li>
                  <li style="margin-bottom: 8px;">Track your progress using the tracking ID above</li>
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
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600;">Need Help?</p>
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
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
          text: `
        Visa Application Submitted Successfully
        
        Tracking ID: {{trackingId}}
        Destination: {{country}}
        Visa Type: {{visaType}}
        Processing Time: {{processingTime}}
        
        You can track your application status by logging into your account.
      `,
        }
      )

      console.log('📧 Attempting to send email:', {
        from: this.config.fromEmail,
        to: userEmail,
        subject: template.subject,
      })

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: userEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      })

      console.log('✅ Application submitted email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
      })

      if (info.rejected && info.rejected.length > 0) {
        console.error('❌ Email was rejected:', info.rejected)
        return false
      }

      return true
    } catch (error: any) {
      console.error('❌ Failed to send application submitted email:', error)
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode,
        command: error.command,
        response: error.response,
        stack: error.stack,
      })
      return false
    }
  }

  // Send agent assigned notification
  async sendAgentAssigned(
    userEmail: string,
    agentName: string,
    trackingId: string,
    visaDetails: any
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const subject = `👤 Agent Assigned to Your Visa Application - ${trackingId}`
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agent Assignment Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">👤</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Agent Assigned!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your dedicated agent is ready to help</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Dear Applicant,</p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">Great news! We've assigned a dedicated agent to handle your visa application. Your case is now in expert hands.</p>
              
              <!-- Agent Assignment Card -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 12px; padding: 30px; margin: 30px 0;">
                <h3 style="color: #0369a1; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">👨‍💼 Your Assigned Agent</h3>
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                  <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
                    <span style="color: white; font-size: 24px; font-weight: 600;">${agentName.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 style="margin: 0; color: #374151; font-size: 18px;">${agentName}</h4>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Senior Visa Specialist</p>
                  </div>
                </div>
                <div style="background: white; border-radius: 8px; padding: 20px;">
                  <div style="display: grid; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="font-weight: 600; color: #374151;">Tracking ID:</span>
                      <span style="font-family: 'Courier New', monospace; background: #0369a1; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${trackingId}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="font-weight: 600; color: #374151;">Destination:</span>
                      <span style="color: #6b7280;">${visaDetails.country}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                      <span style="font-weight: 600; color: #374151;">Visa Type:</span>
                      <span style="color: #6b7280;">${visaDetails.visaType}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- What to Expect -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">🎯 What to Expect</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">Your agent will contact you within 24 hours</li>
                  <li style="margin-bottom: 8px;">They'll guide you through the entire process</li>
                  <li style="margin-bottom: 8px;">Regular updates on your application status</li>
                  <li style="margin-bottom: 8px;">Direct communication channel for any questions</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  📊 View Application Status
                </a>
              </div>

              <!-- Contact Info -->
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600;">Questions? Contact Your Agent</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Your agent will reach out to you directly<br>
                  Or contact our support team for immediate assistance
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
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const text = `
        Agent Assigned to Your Visa Application
        
        Tracking ID: ${trackingId}
        Destination: ${visaDetails.country}
        Visa Type: ${visaDetails.visaType}
        Assigned Agent: ${agentName}
        
        Your assigned agent will now handle your application.
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: userEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log('Agent assigned email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send agent assigned email:', error)
      return false
    }
  }

  // Send agent notification
  async sendAgentNotification(
    agentEmail: string,
    trackingId: string,
    applicantName: string,
    country: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const subject = `New Visa Application Assignment - ${trackingId}`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Application Assignment</h2>
          <p>Dear Agent,</p>
          <p>A new visa application has been assigned to you. Please review and process it accordingly.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Application Details</h3>
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Applicant:</strong> ${applicantName}</p>
            <p><strong>Destination:</strong> ${country}</p>
          </div>
          
          <p>Please log into your agent dashboard to view the full application details and begin processing.</p>
          
          <p>Best regards,<br>EU World Team</p>
        </div>
      `

      const text = `
        New Visa Application Assignment
        
        Tracking ID: ${trackingId}
        Applicant: ${applicantName}
        Destination: ${country}
        
        Please log into your agent dashboard to view the full application details.
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: agentEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log('Agent notification email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send agent notification email:', error)
      return false
    }
  }

  // Send visa approved notification
  async sendVisaApproved(
    userEmail: string,
    trackingId: string,
    visaDetails: any,
    downloadUrl: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const subject = `🎉 Congratulations! Your Visa Has Been Approved - ${trackingId}`
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Visa Approval Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Visa Approved!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Congratulations! Your visa application has been successful</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0; font-weight: 600;">Dear Applicant,</p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">Fantastic news! Your visa application has been approved and is ready for download. We're thrilled to be part of your journey!</p>
              
              <!-- Approval Details Card -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #16a34a; border-radius: 16px; padding: 30px; margin: 30px 0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 24px;">✅</span>
                </div>
                <h3 style="color: #15803d; margin: 0 0 25px 0; font-size: 24px; font-weight: 700;">🎯 Approval Details</h3>
                <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="display: grid; gap: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid #dcfce7;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Tracking ID:</span>
                      <span style="font-family: 'Courier New', monospace; background: #16a34a; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px;">${trackingId}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid #dcfce7;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Destination:</span>
                      <span style="color: #6b7280; font-size: 16px;">${visaDetails.country}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid #dcfce7;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Visa Type:</span>
                      <span style="color: #6b7280; font-size: 16px;">${visaDetails.visaType}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Status:</span>
                      <span style="background: #16a34a; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase;">✅ APPROVED</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Download Section -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">📥 Download Your Visa</h3>
                <p style="margin: 0 0 20px 0; color: #374151;">Your visa document is ready for download. Please save it securely and carry a printed copy when traveling.</p>
                <div style="text-align: center;">
                  <a href="${downloadUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; text-decoration: none; padding: 18px 36px; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 12px rgba(245, 158, 11, 0.3);">
                    📄 Download Visa Document
                  </a>
                </div>
              </div>

              <!-- Important Information -->
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">⚠️ Important Information</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">Print your visa and carry it with your passport</li>
                  <li style="margin-bottom: 10px;">Check visa validity dates before traveling</li>
                  <li style="margin-bottom: 10px;">Keep digital copies on your phone as backup</li>
                  <li style="margin-bottom: 10px;">Contact us if you notice any errors immediately</li>
                </ul>
              </div>

              <!-- Congratulations Message -->
              <div style="text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">🌟 Congratulations!</h3>
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  We're delighted to have helped you secure your visa. Have a wonderful and safe journey!<br>
                  <strong>Bon voyage! 🛫✈️</strong>
                </p>
              </div>

              <!-- Support Info -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
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
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const text = `
        Visa Approved!
        
        Tracking ID: ${trackingId}
        Destination: ${visaDetails.country}
        Visa Type: ${visaDetails.visaType}
        Status: APPROVED
        
        Download your visa document: ${downloadUrl}
        
        Congratulations on your visa approval!
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: userEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log('Visa approved email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send visa approved email:', error)
      return false
    }
  }

  // Send visa rejected notification
  async sendVisaRejected(
    userEmail: string,
    trackingId: string,
    visaDetails: any,
    reason: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const subject = `📋 Visa Application Update - ${trackingId}`
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Visa Application Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Application Update</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Important information about your visa application</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Dear Applicant,</p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">We regret to inform you that your visa application has been rejected. We understand this may be disappointing, and we're here to help you understand the next steps.</p>
              
              <!-- Rejection Details Card -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #dc2626; border-radius: 16px; padding: 30px; margin: 30px 0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 24px;">❌</span>
                </div>
                <h3 style="color: #b91c1c; margin: 0 0 25px 0; font-size: 24px; font-weight: 700;">📋 Application Details</h3>
                <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="display: grid; gap: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid #fee2e2;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Tracking ID:</span>
                      <span style="font-family: 'Courier New', monospace; background: #dc2626; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px;">${trackingId}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid #fee2e2;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Destination:</span>
                      <span style="color: #6b7280; font-size: 16px;">${visaDetails.country}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid #fee2e2;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Visa Type:</span>
                      <span style="color: #6b7280; font-size: 16px;">${visaDetails.visaType}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid #fee2e2;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Status:</span>
                      <span style="background: #dc2626; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase;">❌ REJECTED</span>
                    </div>
                    <div style="padding: 15px 0;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px; display: block; margin-bottom: 10px;">Reason for Rejection:</span>
                      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; color: #7f1d1d; font-size: 14px; line-height: 1.5;">
                        ${reason}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🔄 What You Can Do Next</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">Review the rejection reason carefully</li>
                  <li style="margin-bottom: 10px;">Contact our support team for detailed explanation</li>
                  <li style="margin-bottom: 10px;">Consider reapplying with additional documentation</li>
                  <li style="margin-bottom: 10px;">Explore alternative visa options or destinations</li>
                </ul>
              </div>

              <!-- Support Section -->
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">💬 We're Here to Help</h3>
                <p style="margin: 0 0 20px 0; color: #374151;">Our team is ready to assist you with any questions or concerns about your application.</p>
                <div style="text-align: center;">
                  <a href="mailto:support@euroworld.com" 
                     style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    📧 Contact Support Team
                  </a>
                </div>
              </div>

              <!-- Encouragement Message -->
              <div style="text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">💪 Don't Give Up!</h3>
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  Visa rejections are not uncommon, and many successful applications come after initial setbacks.<br>
                  <strong>We're committed to helping you achieve your travel goals! 🌍</strong>
                </p>
              </div>

              <!-- Support Info -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #374151; font-weight: 600; font-size: 18px;">Need Immediate Assistance?</p>
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
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const text = `
        Visa Application Update
        
        Tracking ID: ${trackingId}
        Destination: ${visaDetails.country}
        Visa Type: ${visaDetails.visaType}
        Status: REJECTED
        Reason: ${reason}
        
        If you believe this decision was made in error, please contact our support team.
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: userEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log('Visa rejected email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send visa rejected email:', error)
      return false
    }
  }

  // Send application reopened notification
  async sendApplicationReopened(
    userEmail: string,
    trackingId: string,
    reason: string,
    newAgentName?: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const subject = `Application Reopened - ${trackingId}`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Reopened</h2>
          <p>Dear Applicant,</p>
          <p>Your visa application has been reopened for further processing. Here are the details:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Reopening Details</h3>
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            ${newAgentName ? `<p><strong>New Agent:</strong> ${newAgentName}</p>` : ''}
          </div>
          
          <p>Your application will now be processed again. We will keep you updated on the progress.</p>
          <p>You can track your application status by logging into your account.</p>
          
          <p>Best regards,<br>EU World Team</p>
        </div>
      `

      const text = `
        Application Reopened
        
        Tracking ID: ${trackingId}
        Reason: ${reason}
        ${newAgentName ? `New Agent: ${newAgentName}` : ''}
        
        Your application will now be processed again.
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: userEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log(
        'Application reopened email sent successfully:',
        info.messageId
      )
      return true
    } catch (error) {
      console.error('Failed to send application reopened email:', error)
      return false
    }
  }

  // Send comment notification
  async sendCommentNotification(
    userEmail: string,
    trackingId: string,
    commenterName: string,
    message: string,
    applicantName: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const subject = `New Comment on Application ${trackingId}`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Comment Added</h2>
          <p>Dear User,</p>
          <p>A new comment has been added to the application for ${applicantName}.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Comment Details</h3>
            <p><strong>Tracking ID:</strong> ${trackingId}</p>
            <p><strong>Commenter:</strong> ${commenterName}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          
          <p>Please log into your account to view the full conversation and respond if needed.</p>
          
          <p>Best regards,<br>EU World Team</p>
        </div>
      `

      const text = `
        New Comment Added
        
        Tracking ID: ${trackingId}
        Commenter: ${commenterName}
        Message: ${message}
        
        Please log into your account to view the full conversation.
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: userEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log(
        'Comment notification email sent successfully:',
        info.messageId
      )
      return true
    } catch (error) {
      console.error('Failed to send comment notification email:', error)
      return false
    }
  }

  // Send agent status update notification to agent
  async sendAgentStatusUpdate(
    agentEmail: string,
    agentName: string,
    status: string,
    previousStatus?: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const statusConfig = {
        pending: {
          color: '#f59e0b',
          bgColor: '#fef3c7',
          icon: '⏳',
          title: 'Agent Status: Pending Approval',
          message:
            'Your agent account is currently pending approval. Our team will review your application and update you soon.',
        },
        approved: {
          color: '#16a34a',
          bgColor: '#f0fdf4',
          icon: '✅',
          title: 'Agent Status: Approved',
          message:
            'Congratulations! Your agent account has been approved. You can now log in and start processing visa applications.',
        },
        disabled: {
          color: '#dc2626',
          bgColor: '#fef2f2',
          icon: '🚫',
          title: 'Agent Status: Disabled',
          message:
            'Your agent account has been disabled. Please contact our support team for more information.',
        },
        rejected: {
          color: '#dc2626',
          bgColor: '#fef2f2',
          icon: '❌',
          title: 'Agent Status: Rejected',
          message:
            'Your agent application has been rejected. Please contact our support team for more information.',
        },
        suspended: {
          color: '#f59e0b',
          bgColor: '#fef3c7',
          icon: '⏸️',
          title: 'Agent Status: Suspended',
          message:
            'Your agent account has been temporarily suspended. Please contact our support team for more information.',
        },
        inactive: {
          color: '#6b7280',
          bgColor: '#f9fafb',
          icon: '💤',
          title: 'Agent Status: Inactive',
          message:
            'Your agent account has been marked as inactive. Please contact our support team to reactivate your account.',
        },
      }

      const config = statusConfig[status as keyof typeof statusConfig]
      const subject = `${config.icon} Agent Status Update - ${config.title}`

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agent Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">${config.icon}</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">${config.title}</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your agent account status has been updated</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Dear ${agentName},</p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">${config.message}</p>
              
              <!-- Status Update Card -->
              <div style="background: ${config.bgColor}; border: 2px solid ${config.color}; border-radius: 16px; padding: 30px; margin: 30px 0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: ${config.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 24px;">${config.icon}</span>
                </div>
                <h3 style="color: ${config.color}; margin: 0 0 25px 0; font-size: 24px; font-weight: 700;">📋 Account Status Details</h3>
                <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="display: grid; gap: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid ${config.bgColor};">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Agent Name:</span>
                      <span style="color: #6b7280; font-size: 16px;">${agentName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid ${config.bgColor};">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Previous Status:</span>
                      <span style="color: #6b7280; font-size: 16px;">${previousStatus ? previousStatus.charAt(0).toUpperCase() + previousStatus.slice(1) : 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Current Status:</span>
                      <span style="background: ${config.color}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase;">${config.icon} ${status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              ${
                status === 'approved'
                  ? `
              <!-- Success Actions -->
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🎉 Welcome to the Team!</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">Access your agent dashboard</li>
                  <li style="margin-bottom: 10px;">Start processing visa applications</li>
                  <li style="margin-bottom: 10px;">View your commission settings</li>
                  <li style="margin-bottom: 10px;">Access training materials and resources</li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login" 
                     style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    🚀 Login to Agent Dashboard
                  </a>
                </div>
              </div>
              `
                  : ''
              }

              ${
                ['disabled', 'rejected', 'suspended', 'inactive'].includes(
                  status
                )
                  ? `
              <!-- Account Issues -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🔄 Next Steps</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">Contact our support team for detailed information</li>
                  <li style="margin-bottom: 10px;">Review your account details and compliance requirements</li>
                  <li style="margin-bottom: 10px;">Follow any instructions provided by our team</li>
                  <li style="margin-bottom: 10px;">Submit any required documentation if requested</li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="mailto:support@euroworld.com" 
                     style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    📧 Contact Support Team
                  </a>
                </div>
              </div>
              `
                  : ''
              }

              ${
                status === 'pending'
                  ? `
              <!-- Pending Information -->
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">⏳ Processing Information</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">Our team is reviewing your agent application</li>
                  <li style="margin-bottom: 10px;">Processing typically takes 2-5 business days</li>
                  <li style="margin-bottom: 10px;">You'll receive an email once your application is reviewed</li>
                  <li style="margin-bottom: 10px;">Contact support if you have any questions</li>
                </ul>
              </div>
              `
                  : ''
              }

              <!-- Support Info -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
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
                Agent Management System
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const text = `
        Agent Status Update - ${config.title}
        
        Dear ${agentName},
        
        ${config.message}
        
        Agent Name: ${agentName}
        Previous Status: ${previousStatus ? previousStatus.charAt(0).toUpperCase() + previousStatus.slice(1) : 'N/A'}
        Current Status: ${status.toUpperCase()}
        
        ${status === 'approved' ? 'You can now log in to your agent dashboard and start processing applications.' : ''}
        ${['disabled', 'rejected', 'suspended', 'inactive'].includes(status) ? 'Please contact our support team for more information.' : ''}
        ${status === 'pending' ? 'Our team is reviewing your application. Processing typically takes 2-5 business days.' : ''}
        
        If you have any questions, please contact our support team.
        
        Best regards,
        Visa4 Visa Services Team
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: agentEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log(
        'Agent status update email sent successfully:',
        info.messageId
      )
      return true
    } catch (error) {
      console.error('Failed to send agent status update email:', error)
      return false
    }
  }

  // Send KYC status update notification to agent
  async sendKycStatusUpdate(
    agentEmail: string,
    agentName: string,
    kycStatus: string,
    previousStatus?: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const statusConfig = {
        pending: {
          color: '#f59e0b',
          bgColor: '#fef3c7',
          icon: '⏳',
          title: 'KYC Verification Pending',
          message:
            'Your KYC verification is currently under review. Our team will process your documents and update you soon.',
        },
        verified: {
          color: '#16a34a',
          bgColor: '#f0fdf4',
          icon: '✅',
          title: 'KYC Verification Approved',
          message:
            'Congratulations! Your KYC verification has been approved. You can now access all agent features and start processing applications.',
        },
        rejected: {
          color: '#dc2626',
          bgColor: '#fef2f2',
          icon: '❌',
          title: 'KYC Verification Rejected',
          message:
            'Your KYC verification has been rejected. Please review the requirements and resubmit your documents with the necessary corrections.',
        },
      }

      const config = statusConfig[kycStatus as keyof typeof statusConfig]
      const subject = `${config.icon} KYC Status Update - ${config.title}`

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KYC Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">${config.icon}</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">${config.title}</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your KYC verification status has been updated</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Dear ${agentName},</p>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">${config.message}</p>
              
              <!-- Status Update Card -->
              <div style="background: ${config.bgColor}; border: 2px solid ${config.color}; border-radius: 16px; padding: 30px; margin: 30px 0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: ${config.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 24px;">${config.icon}</span>
                </div>
                <h3 style="color: ${config.color}; margin: 0 0 25px 0; font-size: 24px; font-weight: 700;">📋 KYC Status Details</h3>
                <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <div style="display: grid; gap: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid ${config.bgColor};">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Agent Name:</span>
                      <span style="color: #6b7280; font-size: 16px;">${agentName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 2px solid ${config.bgColor};">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Previous Status:</span>
                      <span style="color: #6b7280; font-size: 16px;">${previousStatus ? previousStatus.charAt(0).toUpperCase() + previousStatus.slice(1) : 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
                      <span style="font-weight: 700; color: #374151; font-size: 16px;">Current Status:</span>
                      <span style="background: ${config.color}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase;">${config.icon} ${kycStatus.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              ${
                kycStatus === 'verified'
                  ? `
              <!-- Success Actions -->
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🎉 What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">Access your agent dashboard</li>
                  <li style="margin-bottom: 10px;">Start processing visa applications</li>
                  <li style="margin-bottom: 10px;">View your commission settings</li>
                  <li style="margin-bottom: 10px;">Access all agent features and tools</li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/agent/dashboard" 
                     style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    🚀 Access Agent Dashboard
                  </a>
                </div>
              </div>
              `
                  : ''
              }

              ${
                kycStatus === 'rejected'
                  ? `
              <!-- Rejection Actions -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🔄 Next Steps</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">Review the rejection reason carefully</li>
                  <li style="margin-bottom: 10px;">Gather the required documents</li>
                  <li style="margin-bottom: 10px;">Resubmit your KYC documents</li>
                  <li style="margin-bottom: 10px;">Contact support if you need assistance</li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/agent/profile" 
                     style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    📄 Update KYC Documents
                  </a>
                </div>
              </div>
              `
                  : ''
              }

              ${
                kycStatus === 'pending'
                  ? `
              <!-- Pending Information -->
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">⏳ Processing Information</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 10px;">Our team is reviewing your submitted documents</li>
                  <li style="margin-bottom: 10px;">Processing typically takes 1-3 business days</li>
                  <li style="margin-bottom: 10px;">You'll receive an email once verification is complete</li>
                  <li style="margin-bottom: 10px;">Contact support if you have any questions</li>
                </ul>
              </div>
              `
                  : ''
              }

              <!-- Support Info -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
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
                Agent Management System
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const text = `
        KYC Status Update - ${config.title}
        
        Dear ${agentName},
        
        ${config.message}
        
        Agent Name: ${agentName}
        Previous Status: ${previousStatus ? previousStatus.charAt(0).toUpperCase() + previousStatus.slice(1) : 'N/A'}
        Current Status: ${kycStatus.toUpperCase()}
        
        ${kycStatus === 'verified' ? 'You can now access your agent dashboard and start processing applications.' : ''}
        ${kycStatus === 'rejected' ? 'Please review the requirements and resubmit your documents.' : ''}
        ${kycStatus === 'pending' ? 'Our team is reviewing your documents. Processing typically takes 1-3 business days.' : ''}
        
        If you have any questions, please contact our support team.
        
        Best regards,
        Visa4 Visa Services Team
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: agentEmail,
        subject: subject,
        text: text,
        html: html,
      })

      console.log('KYC status update email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send KYC status update email:', error)
      return false
    }
  }

  // Generic email sending method
  async sendEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string
    subject: string
    html: string
    text?: string
  }): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ''), // Convert HTML to text if no text provided
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // Send agent notification email (generic)
  async sendAgentGenericNotification(data: {
    to: string
    agentName: string
    title: string
    message: string
    type: string
    priority: string
  }): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const priorityConfig = {
        urgent: { color: '#EF4444', icon: '🚨' },
        high: { color: '#F59E0B', icon: '⚠️' },
        medium: { color: '#3B82F6', icon: 'ℹ️' },
        low: { color: '#6B7280', icon: '📝' },
      }

      const typeConfig = {
        application: { icon: '📋', label: 'Application Update' },
        document: { icon: '📄', label: 'Document Request' },
        status: { icon: '🔄', label: 'Status Change' },
        commission: { icon: '💰', label: 'Commission Update' },
        payout: { icon: '💸', label: 'Payout Notification' },
        reminder: { icon: '⏰', label: 'Reminder' },
        query: { icon: '❓', label: 'Query Response' },
        system: { icon: '⚙️', label: 'System Alert' },
      }

      const priority =
        priorityConfig[data.priority as keyof typeof priorityConfig] ||
        priorityConfig.medium
      const type = typeConfig[data.type as keyof typeof typeConfig] || {
        icon: '📢',
        label: 'Notification',
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agent Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${priority.color} 0%, ${priority.color}dd 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
                ${priority.icon} ${type.icon} Agent Notification
              </h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                ${type.label} - ${data.priority.charAt(0).toUpperCase() + data.priority.slice(1)} Priority
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${data.agentName}</strong>,
              </p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${priority.color};">
                <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">
                  ${data.title}
                </h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                  ${data.message}
                </p>
              </div>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">Next Steps:</h3>
                <ul style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Log in to your agent dashboard to view details</li>
                  <li>Check for any required actions or updates</li>
                  <li>Contact admin if you need clarification</li>
                  <li>Keep track of important deadlines</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/agent/login" 
                   style="background-color: ${priority.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  View Dashboard
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If you have any questions or need assistance, please contact our support team.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6B7280; font-size: 12px; margin: 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const text = `
        Agent Notification - ${data.title}
        
        Hello ${data.agentName},
        
        ${data.message}
        
        Type: ${type.label}
        Priority: ${data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}
        
        Next Steps:
        - Log in to your agent dashboard to view details
        - Check for any required actions or updates
        - Contact admin if you need clarification
        - Keep track of important deadlines
        
        Dashboard: ${process.env.NEXTAUTH_URL}/agent/login
        
        If you have any questions or need assistance, please contact our support team.
        
        This is an automated message. Please do not reply to this email.
      `

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: data.to,
        subject: `Agent Notification - ${data.title}`,
        html,
        text,
      })

      console.log('Agent notification email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send agent notification email:', error)
      return false
    }
  }

  // Send invoice email with proper breakdown
  async sendInvoiceEmail(
    customerEmail: string,
    customerName: string,
    invoiceData: {
      trackingId: string
      invoiceNumber: string
      invoiceDate: string
      baseAmount: number
      convenienceFees: {
        onlineProcessing?: number
        paymentMethod?: number
        expressService?: number
        documentProcessing?: number
        total: number
      }
      couponDiscount?: {
        couponCode?: string
        discountAmount: number
        discountType?: 'percentage' | 'fixed'
      }
      totalAmount: number
      paymentMethod: string
      paymentId?: string
      orderId?: string
      visaDetails: {
        country: string
        visaType: string
        processingTime: string
      }
    }
  ): Promise<boolean> {
    try {
      console.log('📧 sendInvoiceEmail called:', {
        customerEmail,
        customerName,
        trackingId: invoiceData.trackingId,
      })

      if (!this.transporter) {
        console.log('📧 Initializing email service for invoice...')
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error(
          '❌ Email service not configured. Cannot send invoice email.',
          {
            hasTransporter: !!this.transporter,
            hasConfig: !!this.config,
            configUser: this.config?.smtpUser,
            hasPassword: !!this.config?.smtpPassword,
          }
        )
        return false
      }

      console.log(
        '📧 Email service initialized, proceeding to send invoice email'
      )

      const {
        trackingId,
        invoiceNumber,
        invoiceDate,
        baseAmount,
        convenienceFees,
        couponDiscount,
        totalAmount,
        paymentMethod,
        paymentId,
        orderId,
        visaDetails,
      } = invoiceData

      // Calculate subtotal (base + fees)
      const subtotal = baseAmount + (convenienceFees?.total || 0)

      // Try to use database template, fallback to hardcoded
      const template = await renderEmailTemplate(
        'invoice',
        {
          customerName,
          trackingId,
          invoiceNumber,
          invoiceDate,
          baseAmount: baseAmount.toFixed(2),
          convenienceFeesTotal: (convenienceFees?.total || 0).toFixed(2),
          onlineProcessingFee: (convenienceFees?.onlineProcessing || 0).toFixed(
            2
          ),
          paymentMethodFee: (convenienceFees?.paymentMethod || 0).toFixed(2),
          expressServiceFee: (convenienceFees?.expressService || 0).toFixed(2),
          documentProcessingFee: (
            convenienceFees?.documentProcessing || 0
          ).toFixed(2),
          subtotal: subtotal.toFixed(2),
          discountAmount: couponDiscount?.discountAmount
            ? couponDiscount.discountAmount.toFixed(2)
            : '0.00',
          discountCode: couponDiscount?.couponCode || '',
          discountType: couponDiscount?.discountType || '',
          totalAmount: totalAmount.toFixed(2),
          paymentMethod:
            paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
          paymentId: paymentId || 'N/A',
          orderId: orderId || 'N/A',
          country: visaDetails.country,
          visaType: visaDetails.visaType,
          processingTime: visaDetails.processingTime,
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        },
        {
          subject: `📄 Invoice - ${invoiceNumber} - Visa Application Payment`,
          html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice - ${invoiceNumber}</title>
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
                  <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">${customerName}</p>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${customerEmail}</p>
                </div>
                <div style="text-align: right;">
                  <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">Invoice Details:</h3>
                  <p style="margin: 0 0 5px 0; color: #374151; font-size: 14px;"><strong>Invoice #:</strong> <span style="font-family: 'Courier New', monospace;">${invoiceNumber}</span></p>
                  <p style="margin: 0 0 5px 0; color: #374151; font-size: 14px;"><strong>Date:</strong> ${invoiceDate}</p>
                  <p style="margin: 5px 0 0 0; color: #374151; font-size: 14px;"><strong>Tracking ID:</strong> <span style="font-family: 'Courier New', monospace; background: #1e40af; color: white; padding: 4px 8px; border-radius: 4px;">${trackingId}</span></p>
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
                    <span style="color: #6b7280;">${visaDetails.country}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #374151;">Visa Type:</span>
                    <span style="color: #6b7280;">${visaDetails.visaType}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #374151;">Processing Time:</span>
                    <span style="color: #6b7280;">${visaDetails.processingTime}</span>
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
                    <span style="font-weight: 600; color: #374151; font-size: 16px;">₹${baseAmount.toFixed(2)}</span>
                  </div>

                  <!-- Convenience Fees -->
                  ${
                    (convenienceFees?.onlineProcessing || 0) > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f3f4f6; background: #f9fafb;">
                    <div>
                      <span style="color: #6b7280; font-size: 14px;">Online Processing Fee</span>
                    </div>
                    <span style="color: #6b7280; font-size: 14px;">₹${(convenienceFees.onlineProcessing || 0).toFixed(2)}</span>
                  </div>
                  `
                      : ''
                  }
                  ${
                    (convenienceFees?.paymentMethod || 0) > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f3f4f6; background: #f9fafb;">
                    <div>
                      <span style="color: #6b7280; font-size: 14px;">Payment Method Fee</span>
                    </div>
                    <span style="color: #6b7280; font-size: 14px;">₹${(convenienceFees.paymentMethod || 0).toFixed(2)}</span>
                  </div>
                  `
                      : ''
                  }
                  ${
                    (convenienceFees?.expressService || 0) > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f3f4f6; background: #f9fafb;">
                    <div>
                      <span style="color: #6b7280; font-size: 14px;">Express Service Fee</span>
                    </div>
                    <span style="color: #6b7280; font-size: 14px;">₹${(convenienceFees.expressService || 0).toFixed(2)}</span>
                  </div>
                  `
                      : ''
                  }
                  ${
                    (convenienceFees?.documentProcessing || 0) > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f3f4f6; background: #f9fafb;">
                    <div>
                      <span style="color: #6b7280; font-size: 14px;">Document Processing Fee</span>
                    </div>
                    <span style="color: #6b7280; font-size: 14px;">₹${(convenienceFees.documentProcessing || 0).toFixed(2)}</span>
                  </div>
                  `
                      : ''
                  }
                  ${
                    (convenienceFees?.total || 0) > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 2px solid #e5e7eb; background: #f9fafb;">
                    <div>
                      <span style="font-weight: 600; color: #374151; font-size: 14px;">Total Convenience Fees</span>
                    </div>
                    <span style="font-weight: 600; color: #374151; font-size: 14px;">₹${(convenienceFees.total || 0).toFixed(2)}</span>
                  </div>
                  `
                      : ''
                  }

                  <!-- Subtotal -->
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #e5e7eb; background: #f0f9ff;">
                    <div>
                      <span style="font-weight: 600; color: #1e40af; font-size: 16px;">Subtotal</span>
                    </div>
                    <span style="font-weight: 600; color: #1e40af; font-size: 16px;">₹${subtotal.toFixed(2)}</span>
                  </div>

                  <!-- Discount -->
                  ${
                    couponDiscount && couponDiscount.discountAmount > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #e5e7eb; background: #f0fdf4;">
                    <div>
                      <span style="font-weight: 600; color: #16a34a; font-size: 16px;">Discount ${couponDiscount.couponCode ? `(${couponDiscount.couponCode})` : ''}</span>
                      ${couponDiscount.discountType === 'percentage' ? `<span style="color: #6b7280; font-size: 12px; display: block; margin-top: 4px;">${((couponDiscount.discountAmount / subtotal) * 100).toFixed(1)}% off</span>` : ''}
                    </div>
                    <span style="font-weight: 600; color: #16a34a; font-size: 16px;">-₹${couponDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                  `
                      : ''
                  }

                  <!-- Total -->
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 25px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);">
                    <div>
                      <span style="font-weight: 700; color: white; font-size: 20px;">Total Amount</span>
                    </div>
                    <span style="font-weight: 700; color: white; font-size: 24px;">₹${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Details -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">💳 Payment Information</h3>
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #374151;">Payment Method:</span>
                    <span style="color: #6b7280;">${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</span>
                  </div>
                  ${
                    paymentId
                      ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #374151;">Payment ID:</span>
                    <span style="font-family: 'Courier New', monospace; color: #6b7280; font-size: 12px;">${paymentId}</span>
                  </div>
                  `
                      : ''
                  }
                  ${
                    orderId
                      ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #374151;">Order ID:</span>
                    <span style="font-family: 'Courier New', monospace; color: #6b7280; font-size: 12px;">${orderId}</span>
                  </div>
                  `
                      : ''
                  }
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
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" 
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
        </html>
      `,
          text: `
        Invoice - ${invoiceNumber}
        
        Bill To: ${customerName}
        Email: ${customerEmail}
        
        Invoice #: ${invoiceNumber}
        Date: ${invoiceDate}
        Tracking ID: ${trackingId}
        
        Service Details:
        - Destination: ${visaDetails.country}
        - Visa Type: ${visaDetails.visaType}
        - Processing Time: ${visaDetails.processingTime}
        
        Payment Breakdown:
        - Base Visa Fee: ₹${baseAmount.toFixed(2)}
        ${(convenienceFees?.onlineProcessing || 0) > 0 ? `- Online Processing Fee: ₹${(convenienceFees.onlineProcessing || 0).toFixed(2)}` : ''}
        ${(convenienceFees?.paymentMethod || 0) > 0 ? `- Payment Method Fee: ₹${(convenienceFees.paymentMethod || 0).toFixed(2)}` : ''}
        ${(convenienceFees?.expressService || 0) > 0 ? `- Express Service Fee: ₹${(convenienceFees.expressService || 0).toFixed(2)}` : ''}
        ${(convenienceFees?.documentProcessing || 0) > 0 ? `- Document Processing Fee: ₹${(convenienceFees.documentProcessing || 0).toFixed(2)}` : ''}
        ${(convenienceFees?.total || 0) > 0 ? `- Total Convenience Fees: ₹${(convenienceFees.total || 0).toFixed(2)}` : ''}
        - Subtotal: ₹${subtotal.toFixed(2)}
        ${couponDiscount && couponDiscount.discountAmount > 0 ? `- Discount ${couponDiscount.couponCode ? `(${couponDiscount.couponCode})` : ''}: -₹${couponDiscount.discountAmount.toFixed(2)}` : ''}
        - Total Amount: ₹${totalAmount.toFixed(2)}
        
        Payment Information:
        - Payment Method: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
        ${paymentId ? `- Payment ID: ${paymentId}` : ''}
        ${orderId ? `- Order ID: ${orderId}` : ''}
        - Payment Status: PAID
        
        This invoice serves as your payment receipt. Please keep it for your records.
        
        Track your application: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard
      `,
        }
      )

      console.log('📧 Attempting to send invoice email:', {
        from: this.config.fromEmail,
        to: customerEmail,
        subject: template.subject,
      })

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: customerEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      })

      console.log('✅ Invoice email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
      })

      if (info.rejected && info.rejected.length > 0) {
        console.error('❌ Invoice email was rejected:', info.rejected)
        return false
      }

      return true
    } catch (error: any) {
      console.error('❌ Failed to send invoice email:', error)
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode,
        command: error.command,
        response: error.response,
      })
      return false
    }
  }

  async sendCustomEmail(payload: {
    to: string
    subject: string
    html: string
    text: string
  }): Promise<boolean> {
    try {
      if (!this.transporter || !this.config) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        throw new Error('Email service not initialized')
      }

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      })

      console.log('Custom email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send custom email:', error)
      return false
    }
  }

  // Send application incomplete/payment reminder
  async sendApplicationIncompleteReminder(
    email: string,
    customerName: string,
    trackingId: string,
    visaCountry: string,
    paymentLink: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize()
      }

      if (!this.transporter || !this.config) {
        console.error('Email service not initialized')
        return false
      }

      const subject = `Complete Your Visa Application - ${visaCountry}`

      // Try to use database template, fallback to hardcoded
      const template = await renderEmailTemplate(
        'application-incomplete',
        {
          customerName,
          trackingId,
          country: visaCountry,
          paymentLink,
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        },
        {
          subject: subject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
                .footer { margin-top: 20px; font-size: 12px; color: #777; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Complete Your Visa Application for ${visaCountry}</h2>
                <p>Dear ${customerName},</p>
                <p>We noticed that you haven't completed the payment for your visa application (Tracking ID: ${trackingId}).</p>
                <p>To proceed with your application, please complete the payment process by clicking the button below:</p>
                <p style="text-align: center;">
                  <a href="${paymentLink}" class="button" style="color: white;">Complete Payment</a>
                </p>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p>${paymentLink}</p>
                <p>If you have any questions, please contact our support team.</p>
                <div class="footer">
                  <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
            Complete Your Visa Application for ${visaCountry}
            
            Dear ${customerName},
            
            We noticed that you haven't completed the payment for your visa application (Tracking ID: ${trackingId}).
            
            To proceed with your application, please complete the payment process by visiting the following link:
            ${paymentLink}
            
            If you have any questions, please contact our support team.
          `,
        }
      )

      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      })

      console.log(
        'Application incomplete reminder sent successfully:',
        info.messageId
      )
      return true
    } catch (error) {
      console.error('Failed to send application incomplete reminder:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
