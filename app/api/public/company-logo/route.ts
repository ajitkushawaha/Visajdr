import { NextResponse } from 'next/server'
import connectDb from '@/lib/db'
import CompanySettings from '@/models/CompanySettings'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDb()

    const settings = await CompanySettings.findOne({}).lean()

    if (!settings) {
      return NextResponse.json(
        {
        success: true,
        data: {
          logoUrl: null,
          companyName: 'Visa4',
        },
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        }
      }
    )
    }

    return NextResponse.json({
      success: true,
      data: {
        logoUrl: settings.logoUrl || null,
        faviconUrl: settings.faviconUrl || null,
        companyName: settings.companyName || 'Visa4',
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    })
  } catch (error) {
    console.error('Error fetching company logo:', error)
    return NextResponse.json(
      {
        success: true,
        data: {
          logoUrl: null,
          companyName: 'Visa4',
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        }
      }
    )
  }
}

