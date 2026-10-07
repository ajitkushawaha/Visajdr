import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Page from '@/models/Page'
import Visa from '@/models/Visa'

export const dynamic = 'force-dynamic'

// GET - Fetch SEO data for a specific page path
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Try to find page by slug first
    const slug = path.startsWith('/') ? path.slice(1) : path
    const page = await Page.findOne({ slug, status: 'active' })

    if (page) {
      return NextResponse.json({
        success: true,
        seo: {
          metaTitle: page.metaTitle || page.title,
          metaDescription: page.metaDescription || page.description,
          metaKeywords: page.metaKeywords ? page.metaKeywords.split(',').map((k: string) => k.trim()) : [],
          ogTitle: page.metaTitle || page.title,
          ogDescription: page.metaDescription || page.description,
          ogImage: page.featuredImage || '',
          canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://Visa4.com'}${path}`,
          robots: 'index, follow'
        }
      })
    }

    // If not found in pages, try to find in visa quotations
    // Check if path matches visa pattern: /quotation/[country-slug-id]
    const visaMatch = path.match(/^\/quotation\/([^\/]+)$/)
    if (visaMatch) {
      const countrySlugId = visaMatch[1]

      // Extract visa ID from the slug (last part after the last dash)
      const parts = countrySlugId.split('-')
      const visaId = parts[parts.length - 1]

      // Try to find visa by ID first
      let visa = await Visa.findById(visaId)

      // If not found by ID, try by country name (fallback)
      if (!visa) {
        const countrySlug = parts.slice(0, -1).join('-')
        const countryName = countrySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        visa = await Visa.findOne({
          country: { $regex: new RegExp(`^${countryName}$`, 'i') },
          status: 'active'
        })
      }

      if (visa) {
        return NextResponse.json({
          success: true,
          seo: {
            metaTitle: visa.metaTitle || `${visa.country} ${visa.visaType} Visa - Visa4`,
            metaDescription: visa.metaDescription || `Apply for ${visa.country} ${visa.visaType} visa online with Visa4. Fast processing, expert guidance, and high success rate.`,
            metaKeywords: visa.metaKeyword ? visa.metaKeyword.split(',').map((k: string) => k.trim()) : [],
            ogTitle: visa.metaTitle || `${visa.country} ${visa.visaType} Visa - Visa4`,
            ogDescription: visa.metaDescription || `Apply for ${visa.country} ${visa.visaType} visa online with Visa4. Fast processing, expert guidance, and high success rate.`,
            ogImage: visa.countryFlag || '',
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://Visa4.com'}${path}`,
            robots: visa.metaRobots || 'INDEX, FOLLOW'
          }
        })
      }
    }

    // Return default SEO if no specific data found
    return NextResponse.json({
      success: true,
      seo: {
        metaTitle: 'Visa4 - Visa Services & Travel Solutions',
        metaDescription: 'Professional visa services and travel solutions. Expert guidance for all your visa needs.',
        metaKeywords: ['visa services', 'travel', 'Visa4', 'visa application'],
        ogTitle: 'Visa4 - Visa Services & Travel Solutions',
        ogDescription: 'Professional visa services and travel solutions. Expert guidance for all your visa needs.',
        ogImage: '',
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://Visa4.com'}${path}`,
        robots: 'index, follow'
      }
    })

  } catch (error) {
    console.error('Error fetching SEO data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
