import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Traveler from '@/models/Traveler'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const data = await req.json()

    await connectDB()

    // Ensure the traveler belongs to the user
    const traveler = await Traveler.findOne({
      _id: id,
      userId: session.user.id,
    })

    if (!traveler) {
      return NextResponse.json({ error: 'Traveler not found' }, { status: 404 })
    }

    const updatedTraveler = await Traveler.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    )

    return NextResponse.json({ success: true, traveler: updatedTraveler })
  } catch (error) {
    console.error('Error updating traveler:', error)
    return NextResponse.json(
      { error: 'Failed to update traveler' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await connectDB()

    const result = await Traveler.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!result) {
      return NextResponse.json({ error: 'Traveler not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Traveler deleted' })
  } catch (error) {
    console.error('Error deleting traveler:', error)
    return NextResponse.json(
      { error: 'Failed to delete traveler' },
      { status: 500 }
    )
  }
}
