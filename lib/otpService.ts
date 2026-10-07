import nodemailer from 'nodemailer';

// Email OTP Service
export async function sendEmailOTP(email: string, otp: string, purpose: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = purpose === 'registration' 
      ? 'Verify Your Email - Registration' 
      : purpose === 'login'
      ? 'Your Login OTP'
      : 'Verify Your Email';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">EuroWorld</h1>
          <p style="color: white; margin: 10px 0 0 0;">Your Travel Partner</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your verification code is:
          </p>
          <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 EuroWorld. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html,
    });

    console.log(`Email OTP sent to ${email}`);
  } catch (error) {
    console.error('Email OTP error:', error);
    throw error;
  }
}

// SMS OTP Service (using Twilio or similar service)
export async function sendSMSOTP(mobile: string, otp: string, purpose: string) {
  try {
    // For now, we'll just log the OTP to console
    // In production, integrate with SMS service like Twilio, AWS SNS, etc.
    console.log(`SMS OTP for ${mobile}: ${otp}`);
    
    // Example Twilio integration (uncomment when you have Twilio credentials):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const message = await client.messages.create({
      body: `Your EuroWorld verification code is: ${otp}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile
    });

    console.log(`SMS sent with SID: ${message.sid}`);
    */

    // For development/testing, we'll just return success
    return { success: true };
  } catch (error) {
    console.error('SMS OTP error:', error);
    throw error;
  }
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

