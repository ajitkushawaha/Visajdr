import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import BlogConfig from '@/models/BlogConfig'

export const revalidate = 3600 // Revalidate every hour

// GET - Fetch blog configuration (public)
export async function GET() {
  try {
    await connectDB()

    const config = await BlogConfig.findOne({})

    const cacheHeaders = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, s-maxage=3600',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
    }

    if (!config) {
      // Return default structure if no config exists
      return NextResponse.json({
        success: true,
        data: {
          authors: [],
          headerCTA: {
            title: 'Ready to Start Your Visa Application?',
            buttonText: 'Start Visa Application',
            buttonLink: '/select-plan',
            travelersCount: '1,50,000+',
            travelersText: 'Join 1,50,000+ Travelers',
            trustText: 'who trust our guide.',
            travelerImages: [],
            isActive: true,
          },
          visaPlanCTA: {
            badgeText: 'Popular',
            title: 'Choose Your Visa Plan',
            description: 'Get your visa processed quickly and efficiently',
            processingTime: '3-5 Days',
            price: 'Starting at ₹99',
            buttonText: 'Apply Now',
            buttonLink: '/select-plan',
            whatsappLink: 'https://wa.me/1234567890',
            phoneLink: 'tel:+1234567890',
            isActive: true,
          },
          footerCTA: {
            title: 'Ready to Apply for Your Visa?',
            description: 'Get expert assistance with your visa application. Our team is here to help you every step of the way.',
            buttonText: 'Start Application',
            buttonLink: '/select-plan',
            isActive: true,
          },
        },
      }, {
        headers: cacheHeaders,
      })
    }

    return NextResponse.json({
      success: true,
      data: config,
    }, {
      headers: cacheHeaders,
    })
  } catch (error) {
    console.error('Error fetching blog config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog configuration' },
      { status: 500 }
    )
  }
}

