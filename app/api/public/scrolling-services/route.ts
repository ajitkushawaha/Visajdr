import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ScrollingServices from '@/models/ScrollingServices'

// GET - Fetch scrolling services (public)
export async function GET() {
  try {
    await connectDB()

    const scrollingServices = await ScrollingServices.findOne({ status: 'active' })

    if (!scrollingServices) {
      // Return default content if no CMS content exists
      return NextResponse.json({
        success: true,
        scrollingServices: {
          items: [
            {
              name: 'Travel Packages',
              icon: 'Briefcase',
              order: 0,
              status: 'active',
            },
            {
              name: 'Travel Planning',
              icon: 'TicketsPlane',
              order: 1,
              status: 'active',
            },
            {
              name: 'Visa Assistance',
              icon: 'TicketsPlane',
              order: 2,
              status: 'active',
            },
            {
              name: 'Global Reach Immigration',
              icon: 'Globe',
              order: 3,
              status: 'active',
            },
            {
              name: 'Travel Planning',
              icon: 'PlaneTakeoff',
              order: 4,
              status: 'active',
            },
          ],
        },
      })
    }

    return NextResponse.json({
      success: true,
      scrollingServices,
    })
  } catch (error) {
    console.error('Error fetching scrolling services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scrolling services' },
      { status: 500 }
    )
  }
}

