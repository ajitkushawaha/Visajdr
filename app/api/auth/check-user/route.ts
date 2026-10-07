import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(req: Request) {
  try {
    await connectDB()
    const { identifier } = await req.json()

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      )
    }

    // Determine if email or mobile
    // Simple check: if it contains @ it's email, otherwise assume mobile
    const isEmail = identifier.includes('@')

    // Create query
    let query
    if (isEmail) {
      // Case insensitive email search
      query = { email: { $regex: new RegExp(`^${identifier}$`, 'i') } }
    } else {
      // For mobile, we might need to handle formats, but for now exact match
      // Assuming identifier comes in formatted or we strip chars?
      // User input might be "9876543210", stored might be "+919876543210"
      // We should probably normalize on client side or search partial.
      // Let's assume client sends E.164 or we search leniently.
      // For now, let's try exact match and maybe regex for suffix
      query = { mobile: identifier }
    }

    const user = await User.findOne(query).select('name email mobile role')

    if (user) {
      return NextResponse.json({
        exists: true,
        mobile: user.mobile,
        email: user.email,
        name: user.name,
        role: user.role,
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error('Check User Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
