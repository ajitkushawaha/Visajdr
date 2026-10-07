import { NextResponse } from 'next/server'
import connectDb from '@/lib/db'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { createAuthOptions } from '@/lib/authConfig'

// GET admin profile from User model
export async function GET() {
  try {
    const authOptions = await createAuthOptions()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDb()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user profile data
    return NextResponse.json({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      avatar: user.avatar || '',
      role: user.role || 'admin',
    })
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// UPDATE admin profile in User model
export async function PUT(req) {
  try {
    const authOptions = await createAuthOptions()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDb()

    const data = await req.json()
    const { name, email, mobile, avatar } = data

    // Find current admin user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If email is being changed, check for uniqueness
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Update user fields
    if (name !== undefined) user.name = name
    if (email !== undefined) user.email = email
    if (mobile !== undefined) user.mobile = mobile
    if (avatar !== undefined) user.avatar = avatar

    await user.save()

    // Return updated profile
    return NextResponse.json({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      avatar: user.avatar || '',
      role: user.role || 'admin',
    })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
