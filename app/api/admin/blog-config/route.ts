import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import BlogConfig from '@/models/BlogConfig'

export const dynamic = 'force-dynamic'

// GET - Fetch blog configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const count = await BlogConfig.countDocuments({})
    console.log('Fetching blog config. total docs:', count)

    const config = (await BlogConfig.findOne({}).lean()) as any

    if (!config) {
      return NextResponse.json({
        success: true,
        data: {
          authors: [],
          categories: [],
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        authors: config.authors || [],
        categories: config.categories || [],
      },
    })
  } catch (error) {
    console.error('Error fetching blog config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog configuration' },
      { status: 500 }
    )
  }
}

// POST - Create or update blog configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    console.log(
      'Updating blog config with body:',
      JSON.stringify(body, null, 2)
    )

    // Use findOneAndUpdate with upsert to ensure only one document exists
    const config = await BlogConfig.findOneAndUpdate(
      {},
      {
        $set: {
          authors: body.authors || [],
          categories: body.categories || [],
          ...(body.headerCTA !== undefined && { headerCTA: body.headerCTA }),
          ...(body.visaPlanCTA !== undefined && {
            visaPlanCTA: body.visaPlanCTA,
          }),
          ...(body.footerCTA !== undefined && { footerCTA: body.footerCTA }),
          ...(body.sidebarCTA !== undefined && { sidebarCTA: body.sidebarCTA }),
        },
      },
      { new: true, upsert: true, runValidators: true }
    )

    console.log(
      'Updated config with categories count:',
      (config as any).categories?.length
    )

    // Safety check: if there are multiple documents, delete all but the current one
    const count = await BlogConfig.countDocuments({})
    if (count > 1) {
      console.warn(`Found ${count} blog config documents. Cleaning up...`)
      await BlogConfig.deleteMany({ _id: { $ne: (config as any)._id } })
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Blog configuration updated successfully',
    })
  } catch (error) {
    console.error('Error updating blog config:', error)
    return NextResponse.json(
      { error: 'Failed to update blog configuration' },
      { status: 500 }
    )
  }
}
