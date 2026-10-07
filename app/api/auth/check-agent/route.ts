import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      return NextResponse.json({
        exists: true,
        isAgent: user.role === 'agent',
      })
    }

    return NextResponse.json({
      exists: false,
      isAgent: false,
    })
  } catch (error) {
    console.error('Check Agent Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
