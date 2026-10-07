import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import GoogleReviewsSettings from '@/models/GoogleReviewsSettings'

export const dynamic = 'force-dynamic'

// GET - Fetch Google Reviews settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    let settings = await GoogleReviewsSettings.findOne()

    if (!settings) {
      // Create default settings if none exist
      settings = await GoogleReviewsSettings.create({
        apiKey: '',
        placeId: '',
        isConfigured: false,
        autoSyncEnabled: false,
        syncInterval: 24,
      })
    }

    // Don't send the full API key for security - only send a masked version
    const maskedApiKey = settings.apiKey
      ? `${settings.apiKey.substring(0, 8)}${'*'.repeat(Math.max(0, settings.apiKey.length - 12))}${settings.apiKey.substring(settings.apiKey.length - 4)}`
      : ''

    return NextResponse.json(
      {
        success: true,
        data: {
          apiKey: maskedApiKey,
          hasApiKey: !!settings.apiKey,
          placeId: settings.placeId,
          isConfigured:
            settings.isConfigured && !!settings.apiKey && !!settings.placeId,
          lastSyncedAt: settings.lastSyncedAt,
          autoSyncEnabled: settings.autoSyncEnabled,
          syncInterval: settings.syncInterval,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching Google Reviews settings:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST - Save Google Reviews settings
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

    const body = await request.json()
    const { apiKey, placeId, autoSyncEnabled, syncInterval } = body

    if (!apiKey || !placeId) {
      return NextResponse.json(
        {
          error: 'API Key and Place ID are required',
        },
        { status: 400 }
      )
    }

    // Get or create settings
    let settings = await GoogleReviewsSettings.findOne()

    if (!settings) {
      settings = await GoogleReviewsSettings.create({
        apiKey,
        placeId,
        isConfigured: true,
        autoSyncEnabled: autoSyncEnabled ?? false,
        syncInterval: syncInterval ?? 24,
      })
    } else {
      settings.apiKey = apiKey
      settings.placeId = placeId
      settings.isConfigured = true
      if (autoSyncEnabled !== undefined) {
        settings.autoSyncEnabled = autoSyncEnabled
      }
      if (syncInterval !== undefined) {
        settings.syncInterval = syncInterval
      }
      await settings.save()
    }

    // Mask API key for response
    const maskedApiKey = `${settings.apiKey.substring(0, 8)}${'*'.repeat(Math.max(0, settings.apiKey.length - 12))}${settings.apiKey.substring(settings.apiKey.length - 4)}`

    return NextResponse.json(
      {
        success: true,
        message: 'Settings saved successfully',
        data: {
          apiKey: maskedApiKey,
          hasApiKey: true,
          placeId: settings.placeId,
          isConfigured: true,
          lastSyncedAt: settings.lastSyncedAt,
          autoSyncEnabled: settings.autoSyncEnabled,
          syncInterval: settings.syncInterval,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving Google Reviews settings:', error)
    return NextResponse.json(
      {
        error: 'Failed to save settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
