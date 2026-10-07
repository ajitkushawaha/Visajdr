import connectDB from '@/lib/db'
import User from '@/models/User'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // ✅ User is admin, proceed
  await connectDB()
  // Exclude admin users from the list - only show regular users and agents
  const users = await User.find({ role: { $ne: 'admin' } })
  return NextResponse.json({ users, total: users.length })
}
