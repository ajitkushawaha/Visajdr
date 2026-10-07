import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const application = await VisaApplication.findOne({
      _id: id,
      userId: (session.user as any).id,
    }).lean()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}
