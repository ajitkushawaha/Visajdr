import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Traveler from '@/models/Traveler'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const travelers = await Traveler.find({ userId: session.user.id }).sort({
      createdAt: -1,
    })

    return NextResponse.json({ success: true, travelers })
  } catch (error) {
    console.error('Error fetching travelers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travelers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Basic validation
    if (!data.personalInfo?.firstName || !data.personalInfo?.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const traveler = await Traveler.create({
      ...data,
      userId: session.user.id,
    })

    return NextResponse.json({ success: true, traveler }, { status: 201 })
  } catch (error) {
    console.error('Error creating traveler:', error)
    return NextResponse.json(
      { error: 'Failed to create traveler' },
      { status: 500 }
    )
  }
}
