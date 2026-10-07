import { Metadata } from 'next'
import connectDB from '@/lib/db'
import Page from '@/models/Page'
import Visa from '@/models/Visa'
import HeroSection from '@/models/HeroSection'
import CompanySettings from '@/models/CompanySettings'

interface SEOData {
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  canonical: string
  robots: string
}

interface ServerSEOProps {
  seoData: SEOData
}

export function generateMetadata(seoData: SEOData): Metadata {
  const {
    metaTitle,
    metaDescription,
    metaKeywords,
    ogTitle,
    ogDescription,
    ogImage,
    canonical,
    robots,
  } = seoData

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    robots: robots,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: ogTitle || metaTitle,
      description: ogDescription || metaDescription,
      type: 'website',
      url: canonical,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: ogTitle || metaTitle,
            },
          ]
        : [],
      siteName: 'Visa4',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle || metaTitle,
      description: ogDescription || metaDescription,
      images: ogImage ? [ogImage] : [],
    },
    other: {
      'theme-color': '#1e40af',
      author: 'Visa4',
      generator: 'Next.js',
    },
  }
}

// Utility function to fetch SEO data server-side (directly from database)
export async function fetchSEOData(path: string): Promise<SEOData> {
  try {
    // Ensure database connection
    const db = await connectDB()
    if (!db) {
      throw new Error('Database connection failed')
    }

    // Fetch company settings to get dynamic logoUrl
    const settings = (await CompanySettings.findOne({}).lean()) as any
    const defaultLogo = settings?.logoUrl || '/logo.png'

    // Try to find page by slug first
    const slug = path.startsWith('/') ? path.slice(1) : path
    const page: any = await Page.findOne({ slug, status: 'active' }).lean()

    if (page) {
      return {
        metaTitle: page.metaTitle || page.title || '',
        metaDescription: page.metaDescription || page.description || '',
        metaKeywords: page.metaKeywords
          ? page.metaKeywords.split(',').map((k: string) => k.trim())
          : [],
        ogTitle: page.metaTitle || page.title || '',
        ogDescription: page.metaDescription || page.description || '',
        ogImage: page.featuredImage || defaultLogo,
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://Visa4.com'}${path}`,
        robots: 'index, follow',
      }
    }

    // Fallback for homepage if no page document exists
    if (slug === '') {
      const heroData: any = await HeroSection.findOne({
        status: 'active',
      }).lean()
      if (heroData) {
        const computedTitle =
          heroData.metaTitle ||
          (typeof heroData.title === 'string' &&
          heroData.title.trim().length > 8 &&
          !/^get$/i.test(heroData.title.trim())
            ? heroData.title
            : 'Visa Services | Visa4 – Apply Online Easily')
        const computedDescription =
          heroData.metaDescription ||
          heroData.description ||
          'Get fast, reliable visa services with Visa4. Apply online for tourist, business, and student visas with expert support.'
        return {
          metaTitle: computedTitle,
          metaDescription: computedDescription,
          metaKeywords: [
            'visa services',
            'apply visa online',
            'tourist visa',
            'business visa',
            'Visa4 visa',
          ],
          ogTitle: computedTitle || 'Visa4 - Premium Visa Services',
          ogDescription:
            computedDescription ||
            'Professional visa services and travel solutions. Expert guidance for all your visa needs.',
          ogImage: defaultLogo,
          canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://Visa4.com'}/`,
          robots: 'index, follow',
        }
      }

      return {
        metaTitle: 'Visa Services | Visa4 – Apply Online Easily',
        metaDescription:
          'Get fast, reliable visa services with Visa4. Apply online for tourist, business, and student visas with expert support.',
        metaKeywords: [
          'visa services',
          'apply visa online',
          'tourist visa',
          'business visa',
          'Visa4 visa',
        ],
        ogTitle: 'Visa Services | Visa4 – Apply Online Easily',
        ogDescription:
          'Get fast, reliable visa services with Visa4. Apply online for tourist, business, and student visas with expert support.',
        ogImage: defaultLogo,
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://Visa4.com'}/`,
        robots: 'index, follow',
      }
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
      let visa: any = await Visa.findById(visaId).lean()

      // If not found by ID, try by country name (fallback)
      if (!visa) {
        const countrySlug = parts.slice(0, -1).join('-')
        const countryName = countrySlug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
        visa = await Visa.findOne({
          country: { $regex: new RegExp(`^${countryName}$`, 'i') },
          status: 'active',
        }).lean()
      }

      if (visa) {
        return {
          metaTitle:
            visa.metaTitle || `${visa.country} ${visa.visaType} Visa - Visa4`,
          metaDescription:
            visa.metaDescription ||
            `Apply for ${visa.country} ${visa.visaType} visa online with Visa4. Fast processing, expert guidance, and high success rate.`,
          metaKeywords: visa.metaKeyword
            ? visa.metaKeyword.split(',').map((k: string) => k.trim())
            : [],
          ogTitle:
            visa.metaTitle || `${visa.country} ${visa.visaType} Visa - Visa4`,
          ogDescription:
            visa.metaDescription ||
            `Apply for ${visa.country} ${visa.visaType} visa online with Visa4. Fast processing, expert guidance, and high success rate.`,
          ogImage: visa.countryFlag || '',
          canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://Visa4.com'}${path}`,
          robots: visa.metaRobots || 'INDEX, FOLLOW',
        }
      }
    }
  } catch (error) {
    // Silently fail and use fallback - don't log to avoid noise
    // console.error('Error fetching SEO data:', error)
  }

  // Fallback SEO data
  return {
    metaTitle: 'Visa4 - Visa Services & Travel Solutions',
    metaDescription:
      'Professional visa services and travel solutions. Expert guidance for all your visa needs.',
    metaKeywords: ['visa services', 'travel', 'Visa4', 'visa application'],
    ogTitle: 'Visa4 - Visa Services & Travel Solutions',
    ogDescription:
      'Professional visa services and travel solutions. Expert guidance for all your visa needs.',
    ogImage: '',
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://Visa4.com'}${path}`,
    robots: 'index, follow',
  }
}
