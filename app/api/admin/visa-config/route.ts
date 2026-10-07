// app/api/admin/visa-config/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import mongoose from 'mongoose'

// GET - Fetch all visa configurations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const db = mongoose.connection.db

    const [
      visaTypes,
      documentTypes,
      visaCategories,
      processingTimeTypes,
      occupancyTypes,
    ] = await Promise.all([
      db
        .collection('visatypes')
        .find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .toArray(),
      db
        .collection('documenttypes')
        .find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .toArray(),
      db
        .collection('visacategories')
        .find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .toArray(),
      db
        .collection('processingtimetypes')
        .find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .toArray(),
      db
        .collection('occupancytypes')
        .find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .toArray(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        visaTypes,
        documentTypes,
        visaCategories,
        processingTimeTypes,
        occupancyTypes,
      },
    })
  } catch (error) {
    console.error('Error fetching visa configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visa configurations' },
      { status: 500 }
    )
  }
}

// POST - Create new configuration item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('POST request body:', body)

    const { type, data } = body
    console.log('type:', type)
    // Validate required fields
    if (!type || !data || !data.name) {
      return NextResponse.json(
        {
          error: 'Missing required fields: type and data.name are required',
        },
        { status: 400 }
      )
    }

    await connectDB()
    const db = mongoose.connection.db

    const slug = data.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const documentData = {
      ...data,
      slug,
      isActive: data.isActive !== undefined ? data.isActive : true,
      order: data.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    let result
    let collectionName

    switch (type) {
      case 'visaTypes':
        collectionName = 'visatypes'
        break
      case 'documentTypes':
        collectionName = 'documenttypes'
        break
      case 'visaCategorys':
        collectionName = 'visacategories'
        break
      case 'processingTimeTypes':
        collectionName = 'processingtimetypes'
        break
      case 'occupancyTypes':
        collectionName = 'occupancytypes'
        break
      default:
        return NextResponse.json(
          {
            error:
              'Invalid configuration type. Valid types: visaType, documentType, visaCategory, processingTimeType, occupancyType',
          },
          { status: 400 }
        )
    }

    result = await db.collection(collectionName).insertOne(documentData)

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...documentData },
    })
  } catch (error) {
    console.error('Error creating visa configuration:', error)
    return NextResponse.json(
      { error: 'Failed to create visa configuration' },
      { status: 500 }
    )
  }
}
