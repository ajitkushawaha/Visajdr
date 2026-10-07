import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Agent from '@/models/Agent'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, role } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await User.findOne({ email })

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return NextResponse.json({ accountInactive: false })
    }

    // Skip active status check for admin
    if (role?.toLowerCase() !== 'admin' && !user.status?.isActive) {
      return NextResponse.json({
        accountInactive: true,
        reason: 'Account is inactive and awaiting admin approval',
      })
    }

    // For agents, also check agent status
    if (role?.toLowerCase() === 'agent') {
      const agent = await Agent.findOne({ userId: user._id })

      if (!agent) {
        return NextResponse.json({
          accountInactive: true,
          reason: 'Agent record not found',
        })
      }

      if (
        agent.status === 'inactive' ||
        agent.status === 'disabled' ||
        agent.status === 'suspended'
      ) {
        return NextResponse.json({
          accountInactive: true,
          reason: `Agent account is ${agent.status}`,
        })
      }
    }

    return NextResponse.json({ accountInactive: false })
  } catch (error: any) {
    console.error('Error checking user status:', error)
    // On error, return not inactive (allow login attempt)
    return NextResponse.json({ accountInactive: false })
  }
}
