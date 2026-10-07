// app/api/admin/visa-config/[type]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import mongoose from 'mongoose'

// PATCH - Update a specific configuration item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await params
    const body = await request.json()

    await connectDB()
    const db = mongoose.connection.db

    // Map type to collection name
    const collectionMap: { [key: string]: string } = {
      visaTypes: 'visatypes',
      documentTypes: 'documenttypes',
      visaCategories: 'visacategories',
      processingTimeTypes: 'processingtimetypes',
      occupancyTypes: 'occupancytypes',
    }

    const collectionName = collectionMap[type]
    if (!collectionName) {
      return NextResponse.json(
        { error: 'Invalid configuration type' },
        { status: 400 }
      )
    }

    // Update the document
    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await db
      .collection(collectionName)
      .updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `${type} updated successfully`,
    })
  } catch (error) {
    console.error('Error updating visa configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update visa configuration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific configuration item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await params

    await connectDB()
    const db = mongoose.connection.db

    // Map type to collection name
    const collectionMap: { [key: string]: string } = {
      visaTypes: 'visatypes',
      documentTypes: 'documenttypes',
      visaCategories: 'visacategories',
      processingTimeTypes: 'processingtimetypes',
      occupancyTypes: 'occupancytypes',
    }

    const collectionName = collectionMap[type]
    if (!collectionName) {
      return NextResponse.json(
        { error: 'Invalid configuration type' },
        { status: 400 }
      )
    }

    // Delete the document
    const result = await db.collection(collectionName).deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting visa configuration:', error)
    return NextResponse.json(
      { error: 'Failed to delete visa configuration' },
      { status: 500 }
    )
  }
}
