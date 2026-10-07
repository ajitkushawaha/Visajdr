import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Visa from '@/models/Visa'

export const revalidate = 3600 // Revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Visa ID is required' }, { status: 400 })
    }

    const visa = await Visa.findById(id).lean()
    
    if (!visa || visa.status !== 'active') {
      return NextResponse.json({ error: 'Visa not found' }, { status: 404 })
    }

    // Return only necessary fields for public use
    return NextResponse.json({
      success: true,
      data: {
        _id: visa._id,
        country: visa.country,
        visaType: visa.visaType,
        category: visa.category,
        hotListed: visa.hotListed,
        adultPrice: visa.adultPrice,
        processingTimeValue: visa.processingTimeValue,
        processingTimeDays: visa.processingTimeDays,
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching visa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

