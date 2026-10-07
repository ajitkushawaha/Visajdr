import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import ServiceDetail from '@/models/ServiceDetail'
import { slugify } from '@/utils/slugify'

// GET - Fetch all service details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query: any = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ]
    }

    const serviceDetails = await ServiceDetail.find(query)
      .sort({ createdAt: -1 })
      .select('-__v')

    return NextResponse.json({
      success: true,
      serviceDetails,
      total: serviceDetails.length,
    })
  } catch (error) {
    console.error('Error fetching service details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service details' },
      { status: 500 }
    )
  }
}

// POST - Create new service detail
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    const data = await request.json()

    // Generate slug if not provided
    let slug = data.slug || slugify(data.title || '')

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required. Please provide a title or slug.' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingService = await ServiceDetail.findOne({ slug })
    if (existingService) {
      // Append number to make it unique
      let counter = 1
      let uniqueSlug = `${slug}-${counter}`
      while (await ServiceDetail.findOne({ slug: uniqueSlug })) {
        counter++
        uniqueSlug = `${slug}-${counter}`
      }
      slug = uniqueSlug
    }

    // Create service detail
    const serviceDetail = new ServiceDetail({
      ...data,
      slug,
    })

    await serviceDetail.save()

    return NextResponse.json({
      success: true,
      message: 'Service detail created successfully',
      serviceDetail,
    })
  } catch (error: any) {
    console.error('Error creating service detail:', error)

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A service with this slug already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create service detail',
      },
      { status: 500 }
    )
  }
}
