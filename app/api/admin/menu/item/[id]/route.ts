import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import Navigation from '@/models/Navigation'

// Helper to find and update item recursively
const updateItemRecursive = (
  items: any[],
  targetId: string,
  updates: any
): boolean => {
  if (!items) return false

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Check if this is the item we want to update
    if (item._id && item._id.toString() === targetId) {
      // Apply updates
      if (updates.label !== undefined) item.label = updates.label
      if (updates.href !== undefined) item.href = updates.href
      if (updates.status !== undefined) {
        item.status = updates.status
        item.isActive = updates.status === 'active'
      }
      return true
    }

    // Check dropdown items
    if (item.dropdownItems && item.dropdownItems.length > 0) {
      if (updateItemRecursive(item.dropdownItems, targetId, updates))
        return true
    }

    // Check children
    if (item.children && item.children.length > 0) {
      if (updateItemRecursive(item.children, targetId, updates)) return true
    }
  }

  return false
}

// Helper to find and delete item recursively
const deleteItemRecursive = (items: any[], targetId: string): boolean => {
  if (!items) return false

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Check if this is the item to delete
    if (item._id && item._id.toString() === targetId) {
      items.splice(i, 1)
      return true
    }

    // Check dropdown items
    if (item.dropdownItems && item.dropdownItems.length > 0) {
      if (deleteItemRecursive(item.dropdownItems, targetId)) return true
    }

    // Check children
    if (item.children && item.children.length > 0) {
      if (deleteItemRecursive(item.children, targetId)) return true
    }
  }

  return false
}

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

    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'Invalid Item ID provided' },
        { status: 400 }
      )
    }

    await connectDB()

    // Since items can be nested arbitrarily deep, and we don't know the path,
    // we need to find the document containing this ID.
    // The previous implementation only checked top-level items.

    // First, try to find it efficiently if it's a top-level item (common case)
    let navigation = await Navigation.findOne({ 'items._id': id })

    // If not found at top level, we need to search deeper.
    // Since we don't know which navigation it belongs to, we might need to search all active navigations
    // or rely on the client sending the navigation ID (which it currently doesn't seem to do in the URL).
    // However, usually there are only a few navigation menus (Main, Footer, etc.).
    if (!navigation) {
      const allNavigations = await Navigation.find({})
      for (const nav of allNavigations) {
        // Create a temporary clone to check if item exists (or just trust the recursive update)
        // Actually, we can just try to update each one until we find it.
        // But we need to save the one that changed.

        // We need to work with the Mongoose document to ensure save() works correctly
        // but the recursive function needs to mutate the items array.

        // Let's check if this nav contains the item
        // We can convert to object to check existence quickly, but for update we need the doc.
        const navObj = nav.toObject()
        const foundInDropdown = JSON.stringify(navObj).includes(id) // Quick dirty check

        if (foundInDropdown) {
          navigation = nav
          break
        }
      }
    }

    if (!navigation) {
      return NextResponse.json(
        { error: 'Navigation item not found' },
        { status: 404 }
      )
    }

    // Now perform the recursive update on the found document
    // We need to access the items array directly on the document
    // Note: Mongoose arrays are special, so we might need to mark as modified
    const updated = updateItemRecursive(navigation.items, id, body)

    if (!updated) {
      return NextResponse.json(
        { error: 'Item ID found in document but could not be updated' },
        { status: 404 }
      )
    }

    // Mark items as modified to ensure Mongoose saves the changes
    navigation.markModified('items')
    await navigation.save()

    return NextResponse.json({
      success: true,
      message: 'Navigation item updated successfully',
      navigation: {
        _id: navigation._id.toString(),
        name: navigation.name,
        type: navigation.type,
        items: navigation.items || [],
        status: navigation.status,
        createdAt: navigation.createdAt?.toISOString(),
        updatedAt: navigation.updatedAt?.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating navigation item:', error)
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

    // Same logic as PATCH: find the navigation doc first
    let navigation = await Navigation.findOne({ 'items._id': id })

    if (!navigation) {
      const allNavigations = await Navigation.find({})
      for (const nav of allNavigations) {
        const navObj = nav.toObject()
        if (JSON.stringify(navObj).includes(id)) {
          navigation = nav
          break
        }
      }
    }

    if (!navigation) {
      return NextResponse.json(
        { error: 'Navigation item not found' },
        { status: 404 }
      )
    }

    const deleted = deleteItemRecursive(navigation.items, id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Item could not be deleted' },
        { status: 404 }
      )
    }

    navigation.markModified('items')
    await navigation.save()

    return NextResponse.json({
      success: true,
      message: 'Navigation item deleted successfully',
      navigation: {
        _id: navigation._id.toString(),
        name: navigation.name,
        type: navigation.type,
        items: navigation.items || [],
        status: navigation.status,
        createdAt: navigation.createdAt?.toISOString(),
        updatedAt: navigation.updatedAt?.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error deleting navigation item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
