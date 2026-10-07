import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ServiceDetail from '@/models/ServiceDetail'

// GET - Fetch service detail by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB()

    const serviceDetail = await ServiceDetail.findOne({
      slug: params.slug,
      status: 'published'
    })

    if (!serviceDetail) {
      return NextResponse.json(
        { error: 'Service detail not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      serviceDetail
    })
  } catch (error) {
    console.error('Error fetching service detail:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service detail' },
      { status: 500 }
    )
  }
}


