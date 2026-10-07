import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import ScrollingServices from '@/models/ScrollingServices'

// GET - Fetch scrolling services
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    // Find the active scrolling services or create a default one
    let scrollingServices = await ScrollingServices.findOne({
      status: 'active',
    })

    if (!scrollingServices) {
      // Create default scrolling services if none exists
      scrollingServices = new ScrollingServices({
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
        status: 'active',
      })
      await scrollingServices.save()
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

// POST/PUT - Update scrolling services
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, status = 'active' } = body

    // Validate required fields
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find existing scrolling services or create new one
    let scrollingServices = await ScrollingServices.findOne({
      status: 'active',
    })

    if (scrollingServices) {
      // Update existing scrolling services
      scrollingServices.items = items
      scrollingServices.status = status
      await scrollingServices.save()
    } else {
      // Create new scrolling services
      scrollingServices = new ScrollingServices({
        items,
        status,
      })
      await scrollingServices.save()
    }

    return NextResponse.json({
      success: true,
      scrollingServices,
      message: 'Scrolling services updated successfully',
    })
  } catch (error) {
    console.error('Error updating scrolling services:', error)
    return NextResponse.json(
      { error: 'Failed to update scrolling services' },
      { status: 500 }
    )
  }
}
