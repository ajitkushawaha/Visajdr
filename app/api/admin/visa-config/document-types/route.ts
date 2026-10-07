// app/api/admin/visa-config/document-types/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaConfig from '@/models/VisaConfig'

// GET - Fetch all document types
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const documentTypes = await VisaConfig.findOne({
      configType: 'documentType',
    })

    return NextResponse.json({
      success: true,
      data: documentTypes,
    })
  } catch (error) {
    console.error('Error fetching document types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document types' },
      { status: 500 }
    )
  }
}

// POST - Create new document type
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      displayName,
      description,
      isRequired = false,
      isActive = true,
      order = 0,
      exampleImage,
      exampleLink,
    } = body

    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Name and display name are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Find existing document type config or create new one
    let visaConfig = await VisaConfig.findOne({ configType: 'documentType' })

    if (!visaConfig) {
      visaConfig = await VisaConfig.create({
        configType: 'documentType',
        items: [],
      })
    }

    // Add new item to the items array
    const newItem = {
      name,
      slug,
      displayName,
      description,
      isRequired,
      isActive,
      order,
      exampleImage: exampleImage || '',
      exampleLink: exampleLink || '',
    }

    visaConfig.items.push(newItem)
    await visaConfig.save()

    return NextResponse.json({
      success: true,
      data: newItem,
    })
  } catch (error) {
    console.error('Error creating document type:', error)
    return NextResponse.json(
      { error: 'Failed to create document type' },
      { status: 500 }
    )
  }
}
