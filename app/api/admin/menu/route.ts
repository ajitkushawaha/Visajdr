import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Navigation from '@/models/Navigation'


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

    // Fetch from navigations collection
    const navigations = await Navigation.find({}).sort({ type: 1 })

    return NextResponse.json({
      success: true,
      navigations: navigations.map(nav => ({
        _id: nav._id.toString(),
        name: nav.name,
        type: nav.type,
        items: nav.items || [],
        status: nav.status,
        createdAt: nav.createdAt?.toISOString(),
        updatedAt: nav.updatedAt?.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    
    await connectDB()

    // Create new navigation group
    const newNavigation = new Navigation({
      name: body.name,
      type: body.type,
      items: body.items || [],
      status: body.status || 'active'
    })

    await newNavigation.save()

    return NextResponse.json({
      success: true,
      navigation: {
        _id: newNavigation._id.toString(),
        name: newNavigation.name,
        type: newNavigation.type,
        items: newNavigation.items || [],
        status: newNavigation.status,
        createdAt: newNavigation.createdAt?.toISOString(),
        updatedAt: newNavigation.updatedAt?.toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
