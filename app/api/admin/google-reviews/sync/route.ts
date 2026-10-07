import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import { createGoogleMyBusinessAPI } from '@/lib/googleMyBusiness'
import GoogleReviewsSettings from '@/models/GoogleReviewsSettings'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    // Fetch settings from database
    let settings = await GoogleReviewsSettings.findOne()

    if (!settings || !settings.apiKey || !settings.placeId) {
      return NextResponse.json(
        {
          error:
            'Google Places API credentials not configured. Please configure your API Key and Place ID in Admin Settings → Google Reviews.',
        },
        { status: 400 }
      )
    }

    // Create API instance with database settings
    const googleAPI = createGoogleMyBusinessAPI(
      settings.apiKey,
      settings.placeId
    )
    const result = await googleAPI.syncReviews()

    // Update last synced timestamp
    settings.lastSyncedAt = new Date()
    await settings.save()

    return NextResponse.json(
      {
        success: true,
        message: `Sync completed successfully`,
        data: {
          synced: result.synced,
          updated: result.updated,
          errors: result.errors,
          total: result.synced + result.updated,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error syncing Google reviews:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync Google reviews',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
