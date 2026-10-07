import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import GoogleReview from '@/models/GoogleReview'
import { createGoogleMyBusinessAPI } from '@/lib/googleMyBusiness'

// GET - Fetch all Google reviews from database (admin view)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'active', 'inactive', or all
    const sortBy = searchParams.get('sortBy') || 'createTime'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const query: any = {}
    if (status && status !== 'all') {
      query.status = status
    }

    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const reviews = await GoogleReview.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await GoogleReview.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get review statistics
    let stats = null
    try {
      const GoogleReviewsSettings = (
        await import('@/models/GoogleReviewsSettings')
      ).default
      const settings = await GoogleReviewsSettings.findOne()

      if (settings && settings.apiKey && settings.placeId) {
        const googleAPI = createGoogleMyBusinessAPI(
          settings.apiKey,
          settings.placeId
        )
        stats = await googleAPI.getReviewStats()
      }
    } catch (error) {
      console.error('Error fetching review stats:', error)
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          reviews,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          stats,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update review status (show/hide individual reviews)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    const { reviewId, status } = await request.json()

    if (!reviewId || !status) {
      return NextResponse.json(
        {
          error: 'Review ID and status are required',
        },
        { status: 400 }
      )
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        {
          error: "Status must be 'active' or 'inactive'",
        },
        { status: 400 }
      )
    }

    const review = await GoogleReview.findOneAndUpdate(
      { reviewId },
      { status },
      { new: true }
    )

    if (!review) {
      return NextResponse.json(
        {
          error: 'Review not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Review ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
        review,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating Google review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove synced review
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        {
          error: 'Review ID is required',
        },
        { status: 400 }
      )
    }

    const review = await GoogleReview.findOneAndDelete({ reviewId })

    if (!review) {
      return NextResponse.json(
        {
          error: 'Review not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting Google review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
