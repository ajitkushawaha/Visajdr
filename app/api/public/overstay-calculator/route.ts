import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import OverstayCalculatorConfig from '@/models/OverstayCalculatorConfig'

// GET - Fetch active overstay calculator configurations
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')

    // Build query - only fetch active configurations
    const query: any = { isActive: true }

    // Filter by country if provided
    if (country) {
      query.country = new RegExp(`^${country}$`, 'i')
    }

    const configs = await OverstayCalculatorConfig.find(query)
      .select('-createdAt -updatedAt -__v')
      .lean()

    return NextResponse.json({
      success: true,
      data: configs,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch overstay calculator configurations' },
      { status: 500 }
    )
  }
}

