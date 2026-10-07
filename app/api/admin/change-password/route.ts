// app/api/admin/change-password/route.js
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { newPassword, oldPassword } = await req.json()
    if (!oldPassword || !newPassword) {
      return Response.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 })
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return Response.json(
        { message: 'Old password is incorrect' },
        { status: 400 }
      )
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    return Response.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error(error)
    return Response.json({ message: 'Server error' }, { status: 500 })
  }
}
