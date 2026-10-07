// app/api/register/route.ts

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Agent from '@/models/Agent'
import { emailService } from '@/lib/emailService'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role, mobile } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.googleId) {
      // If user exists with Google ID, do not allow registration
      return NextResponse.json(
        { message: 'User already exists with Google' },
        { status: 409 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const newUser = await User.create({
      name,
      email,
      mobile: mobile || undefined,
      password: hashedPassword,
      role,
      isEmailVerified: true, // Set to true since OTP was verified
      status: {
        isActive: role === 'agent' ? false : true, // Disable agent users by default
      },
    })

    // If user is registering as an agent, create an Agent record
    if (role === 'agent') {
      const newAgent = await Agent.create({
        userId: newUser._id,
        status: 'disabled',
        commissionRate: 5.0, // Default commission rate
        commissionType: 'percentage',
        kycStatus: 'pending',
        personalDetails: {
          fullName: name,
          email: email,
          phone: mobile || '0000000000', // Use provided mobile or default
          address: 'To be updated', // Default address - to be updated later
          city: 'To be updated', // Default city - to be updated later
          state: 'To be updated', // Default state - to be updated later
          pincode: '000000', // Default pincode - to be updated later
          dateOfBirth: new Date('1990-01-01'), // Default date - to be updated later
          emergencyContact: {
            name: 'To be updated', // Default name - to be updated later
            phone: '0000000000', // Default phone - to be updated later
            relation: 'To be updated', // Default relation - to be updated later
          },
        },
        businessDetails: {
          businessType: 'individual',
          yearsOfExperience: 0,
        },
        bankDetails: {
          accountHolderName: 'To be updated', // Default name - to be updated later
          accountNumber: '0000000000000000', // Default account - to be updated later
          ifscCode: 'BANK0000000', // Default IFSC - to be updated later
          bankName: 'To be updated', // Default bank - to be updated later
        },
        performance: {
          totalApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          totalCommissionEarned: 0,
          averageProcessingTime: 0,
          clientSatisfactionRating: 0,
        },
        settings: {
          emailNotifications: true,
          smsNotifications: true,
          commissionAlerts: true,
          applicationUpdates: true,
        },
        isActive: true,
      })

      console.log('Agent record created:', newAgent.agentId)

      // Send welcome email to agent
      try {
        await emailService.sendEmail({
          to: email,
          subject: 'Welcome to Visa4 - Agent Registration Successful',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to Visa4!</h1>
                <p style="color: #6b7280; font-size: 16px;">Thank you for registering as an agent</p>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1f2937; margin-bottom: 15px;">Registration Details</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Agent ID:</strong> ${newAgent.agentId}</p>
                <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Disabled (Pending Approval)</span></p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin-bottom: 15px;">Next Steps</h3>
                <p style="color: #92400e; margin-bottom: 10px;">Your agent account has been created successfully, but it's currently disabled pending approval.</p>
                <p style="color: #92400e; margin-bottom: 10px;">Our team will contact you within 24-48 hours to arrange a meeting for:</p>
                <ul style="color: #92400e; margin-left: 20px;">
                  <li>KYC (Know Your Customer) verification</li>
                  <li>Document verification</li>
                  <li>Account approval process</li>
                  <li>Commission structure discussion</li>
                </ul>
              </div>
              
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin-bottom: 15px;">What to Expect</h3>
                <p style="color: #065f46; margin-bottom: 10px;">During the meeting, please have the following documents ready:</p>
                <ul style="color: #065f46; margin-left: 20px;">
                  <li>PAN Card</li>
                  <li>Aadhar Card</li>
                  <li>Bank Statement (last 3 months)</li>
                  <li>Address Proof</li>
                  <li>Passport size photograph</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px;">If you have any questions, please contact our support team.</p>
                <p style="color: #6b7280; font-size: 14px;">Thank you for choosing Visa4!</p>
              </div>
            </div>
          `,
        })
        console.log('Welcome email sent to agent:', email)
      } catch (emailError) {
        console.error('Error sending welcome email to agent:', emailError)
        // Don't fail the registration if email fails
      }

      console.log('Agent created with disabled status:', {
        agentId: newAgent.agentId,
        email: email,
        status: 'disabled',
      })
    }

    return NextResponse.json(
      { message: 'User registered', user: newUser },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error in register API:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
