import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import OTP from '@/models/OTP'
import { twilioService } from '@/lib/twilioService'
import { emailService } from '@/lib/emailService'

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    // Support flexible payload
    // identifier: can be email or mobile
    // type: 'login' | 'registration' (purpose)
    // channel: 'email' | 'mobile' (optional, inferred if not provided)

    const identifier = body.identifier || body.mobile
    const purpose = body.type || 'login' // 'type' from frontend is actually purpose

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      )
    }

    // Infer channel
    const isEmail = identifier.includes('@')
    const channel = isEmail ? 'email' : 'mobile'

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Invalidate previous OTPs
    await OTP.updateMany(
      { identifier, purpose, isUsed: false },
      { $set: { isUsed: true } }
    )

    // Save to DB
    await OTP.create({
      identifier,
      mobile: channel === 'mobile' ? identifier : undefined,
      email: channel === 'email' ? identifier : undefined,
      otp,
      type: channel,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins validity
    })

    console.log(`Sending OTP ${otp} to ${identifier} via ${channel}`)

    try {
      let success = false
      if (channel === 'mobile') {
        success = await twilioService.sendSMS(
          identifier,
          `Your verification code is ${otp}. Valid for 10 minutes.`
        )
      } else {
        success = await emailService.sendOTP(identifier, otp)
      }

      if (!success) {
        console.error(`Failed to send OTP via ${channel}`)
        return NextResponse.json(
          { error: `Failed to send OTP via ${channel}` },
          { status: 500 }
        )
      }
    } catch (sendError) {
      console.error('Service Error:', sendError)
      return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    })
  } catch (error) {
    console.error('Send OTP Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
