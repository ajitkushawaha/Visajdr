import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import Visa from '@/models/Visa'
import connectDb from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    const updateData = await request.json()
    const updatePayload = {
      ...updateData,
      ...(typeof updateData.hotListed !== 'undefined'
        ? {
            hotListed:
              String(updateData.hotListed).toLowerCase() === 'true'
                ? 'true'
                : 'false',
          }
        : {}),
      ...(typeof updateData.restListed !== 'undefined'
        ? {
            restListed:
              String(updateData.restListed).toLowerCase() === 'true'
                ? 'true'
                : 'false',
          }
        : {}),
      updatedAt: new Date(),
    }

    // Update the visa
    const updatedVisa = await Visa.findByIdAndUpdate(id, updatePayload, {
      new: true,
    })

    if (!updatedVisa) {
      return NextResponse.json({ error: 'Visa not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Visa updated successfully',
      visa: updatedVisa,
    })
  } catch (error) {
    console.error('Error updating visa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    const deletedVisa = await Visa.findByIdAndDelete(id)

    if (!deletedVisa) {
      return NextResponse.json({ error: 'Visa not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Visa deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting visa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
