import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Navigation from '@/models/Navigation'

interface NavigationItem {
  _id?: string
  label: string
  href: string
  icon?: string
  order?: number
  isActive?: boolean
  target?: '_self' | '_blank'
  hasDropdown?: boolean
  dropdownItems?: NavigationItem[]
  children?: NavigationItem[]
  status?: 'active' | 'inactive'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || !(session as any).user?.email || (session as any).user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    // Fetch all navigation types
    const navigations = await Navigation.find({}).sort({ type: 1 })

    // Organize by categories
    const categories = {
      main: navigations.find(nav => nav.type === 'main') || null,
      footer: navigations.find(nav => nav.type === 'footer') || null,
      mobile: navigations.find(nav => nav.type === 'mobile') || null,
      sidebar: navigations.find(nav => nav.type === 'sidebar') || null
    }

    // Get statistics
    const stats = {
      totalNavigations: navigations.length,
      activeNavigations: navigations.filter(nav => nav.status === 'active').length,
      totalItems: navigations.reduce((sum, nav) => sum + (nav.items?.length || 0), 0),
      activeItems: navigations.reduce((sum, nav) => 
        sum + (nav.items?.filter((item: NavigationItem) => item.isActive && item.status === 'active').length || 0), 0
      )
    }

    return NextResponse.json({
      success: true,
      categories,
      stats,
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
    console.error('Error fetching navigation categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || !(session as any).user?.email || (session as any).user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, name, items, status } = body

    await connectDB()

    // Check if navigation type already exists
    const existingNav = await Navigation.findOne({ type })
    if (existingNav) {
      return NextResponse.json(
        { error: `Navigation type '${type}' already exists` },
        { status: 400 }
      )
    }

    // Create new navigation
    const newNavigation = new Navigation({
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Navigation`,
      type,
      items: items || [],
      status: status || 'active'
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
    console.error('Error creating navigation category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
