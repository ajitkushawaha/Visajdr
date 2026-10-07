import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Navigation from '@/models/Navigation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id } = await params
    
    await connectDB()

    // Update the navigation in database
    const updatedNavigation = await Navigation.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedNavigation) {
      return NextResponse.json(
        { error: 'Navigation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      navigation: {
        _id: updatedNavigation._id.toString(),
        name: updatedNavigation.name,
        type: updatedNavigation.type,
        items: updatedNavigation.items || [],
        status: updatedNavigation.status,
        createdAt: updatedNavigation.createdAt?.toISOString(),
        updatedAt: updatedNavigation.updatedAt?.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    await connectDB()

    // Delete navigation from database
    const deletedNavigation = await Navigation.findByIdAndDelete(id)

    if (!deletedNavigation) {
      return NextResponse.json(
        { error: 'Navigation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Navigation deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
