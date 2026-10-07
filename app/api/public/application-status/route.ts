import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ApplicationStatus from '@/models/ApplicationStatus'

// GET - Fetch active application statuses for public use (e.g., in dropdowns)
export async function GET() {
  try {
    await connectDB()

    const statuses = await ApplicationStatus.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('name slug color')
      .lean()

    return NextResponse.json({ success: true, data: statuses })
  } catch (error) {
    console.error('Error fetching application statuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application statuses' },
      { status: 500 }
    )
  }
}

