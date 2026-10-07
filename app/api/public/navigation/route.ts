import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Navigation from '@/models/Navigation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'main'

    // Fetch from navigations collection - only active navigations
    const navigations = await Navigation.find({
      status: 'active',
      type: type
    }).sort({ createdAt: 1 })

    // Convert to plain objects and ensure proper structure
    const activeNavigations = navigations.map(nav => ({
      _id: nav._id.toString(),
      name: nav.name,
      type: nav.type,
      items: nav.items || [],
      status: nav.status,
      createdAt: nav.createdAt?.toISOString(),
      updatedAt: nav.updatedAt?.toISOString()
    }))

    const response = NextResponse.json({
      success: true,
      data: activeNavigations,
      type
    })

    // Add cache headers for static generation
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')

    return response
  } catch (error) {
    console.error('Error fetching navigations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch navigations'
      },
      { status: 500 }
    )
  }
}
