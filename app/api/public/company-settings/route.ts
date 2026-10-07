import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import CompanySettings from '@/models/CompanySettings'

export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  try {
    await connectDB()

    const settings = await CompanySettings.findOne({}).lean()

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          copyright: '© 2025 Visa4. All rights reserved.',
          companyName: 'Visa4',
          logoUrl: '/logo.png',
          streetAddress: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          supportNo: '',
          supportEmail: '',
          facebookLink: '',
          instagramLink: '',
          twitterLink: '',
          linkedinLink: '',
          youtubeLink: '',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        copyright:
          settings.copyright || '© 2025 Visa4. All rights reserved.',
        companyName: settings.companyName || 'Visa4',
        logoUrl: settings.logoUrl || '/logo.png',
        description: 'Login in to unlock your next adventure',
        streetAddress: settings.streetAddress || '',
        city: settings.city || '',
        state: settings.state || '',
        country: settings.country || '',
        zipCode: settings.zipCode || '',
        supportNo: settings.supportNo || '',
        supportEmail: settings.supportEmail || '',
        facebookLink: settings.facebookLink || '',
        instagramLink: settings.instagramLink || '',
        twitterLink: settings.twitterLink || '',
        linkedinLink: settings.linkedinLink || '',
        youtubeLink: settings.youtubeLink || '',
      },
    })
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return NextResponse.json(
      {
        success: true,
        data: {
          copyright: '© 2025 Visa4. All rights reserved.',
          companyName: 'Visa4',
          logoUrl: '/logo.png',
          streetAddress: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          supportNo: '',
          supportEmail: '',
          facebookLink: '',
          instagramLink: '',
          twitterLink: '',
          linkedinLink: '',
          youtubeLink: '',
        },
      },
      { status: 200 } // Return default even on error
    )
  }
}

