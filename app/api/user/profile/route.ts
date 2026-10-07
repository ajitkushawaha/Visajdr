import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById((session?.user as any).id).select(
      '-password'
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const {
      name,
      mobile,
      address,
      passportDetails,
      documents,
      gender,
      nationality,
      occupation,
    } = data

    await connectDB()

    // Build update object
    const updateData: any = {}

    console.log('Profile update data received:', {
      name,
      mobile,
      gender,
      nationality,
      occupation,
      passportDetails,
    })

    // Always update these fields if present in request (allow empty strings to clear them if needed)
    if (typeof name !== 'undefined') updateData.name = name
    if (typeof mobile !== 'undefined') updateData.mobile = mobile
    if (typeof gender !== 'undefined') updateData.gender = gender
    if (typeof nationality !== 'undefined') updateData.nationality = nationality
    if (typeof occupation !== 'undefined') updateData.occupation = occupation
    if (typeof address !== 'undefined') updateData.address = address

    if (typeof passportDetails !== 'undefined') {
      // Handle empty date string which causes CastError
      if (passportDetails.passportExpiry === '') {
        passportDetails.passportExpiry = null
      }
      updateData.passportDetails = passportDetails
    }

    if (typeof documents !== 'undefined') updateData.documents = documents

    const user = await User.findByIdAndUpdate(
      (session?.user as any).id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
