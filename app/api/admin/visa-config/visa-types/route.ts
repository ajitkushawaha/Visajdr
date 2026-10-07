// app/api/admin/visa-config/visa-types/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaConfig from '@/models/VisaConfig'

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

// GET - Fetch all visa types
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const visaTypes = await VisaConfig.findOne({ configType: 'visaType' })

    return NextResponse.json({
      success: true,
      data: visaTypes,
    })
  } catch (error) {
    console.error('Error fetching visa types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visa types' },
      { status: 500 }
    )
  }
}

// POST - Create new visa type
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, isActive = true, order = 0 } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    await connectDB()

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Find existing visa type config or create new one
    let visaConfig = await VisaConfig.findOne({ configType: 'visaType' })

    if (!visaConfig) {
      visaConfig = await VisaConfig.create({
        configType: 'visaType',
        items: [],
      })
    }

    // Add new item to the items array
    const newItem = {
      name,
      slug,
      displayName: name,
      description,
      isActive,
      order,
    }

    visaConfig.items.push(newItem)
    await visaConfig.save()

    return NextResponse.json({
      success: true,
      data: newItem,
    })
  } catch (error) {
    console.error('Error creating visa type:', error)
    return NextResponse.json(
      { error: 'Failed to create visa type' },
      { status: 500 }
    )
  }
}
