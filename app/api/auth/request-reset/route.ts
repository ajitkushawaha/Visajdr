import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import PasswordResetToken from '@/models/PasswordResetToken'
import crypto from 'crypto'
import { emailService } from '@/lib/emailService'

export async function POST(req: Request) {
  await connectDB()
  const { email } = await req.json()

  const user = await User.findOne({ email })
  console.log(email, user)
  if (!user) {
    return NextResponse.json(
      { error: 'Account with this email does not exist' },
      { status: 404 }
    )
  }

  if (user.googleId) {
    return NextResponse.json(
      { error: 'Google accounts cannot reset password' },
      { status: 400 }
    )
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  await PasswordResetToken.deleteMany({ userId: user._id }) // remove old tokens
  await PasswordResetToken.create({ userId: user._id, token, expires })

  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  // Send email using EmailService
  try {
    console.log('Initializing email service for password reset...')
    await emailService.initialize()

    console.log('Sending password reset email to:', email)
    const emailSent = await emailService.sendPasswordResetEmail(
      email,
      resetLink,
      user.name || 'User'
    )

    if (!emailSent) {
      console.error(
        '❌ Failed to send password reset email - email service returned false'
      )
      console.error(
        'Check SMTP configuration in CompanySettings or environment variables'
      )
      // Still return success message to user (security best practice)
      return NextResponse.json({
        message: 'Reset link sent successfully! Please check your email inbox.',
        warning:
          'Email may not have been sent. Please check your spam folder or contact support.',
      })
    }

    console.log('✅ Password reset email sent successfully to:', email)
  } catch (emailError: any) {
    console.error('❌ Error sending password reset email:', emailError)
    console.error('Error details:', {
      message: emailError.message,
      code: emailError.code,
      responseCode: emailError.responseCode,
      command: emailError.command,
    })
    // Still return success message to user (security best practice)
    return NextResponse.json({
      message: 'Reset link sent successfully! Please check your email inbox.',
      warning:
        'There may be an issue with email delivery. Please check your spam folder or contact support.',
    })
  }

  return NextResponse.json({
    message: 'Reset link sent successfully! Please check your email inbox.',
  })
}
