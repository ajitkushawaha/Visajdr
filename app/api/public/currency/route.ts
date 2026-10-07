import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import CompanySettings from '@/models/CompanySettings'

export async function GET() {
  try {
    await connectDB()

    const settings = await CompanySettings.findOne({}).select('defaultCurrency').lean()

    const currency = settings?.defaultCurrency || 'INR'

    return NextResponse.json({
      success: true,
      currency,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: true,
        currency: 'INR', // Default fallback
      },
      { status: 200 }
    )
  }
}

