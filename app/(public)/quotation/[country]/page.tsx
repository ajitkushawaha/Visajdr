import connectDB from '@/lib/db'
import QuotationClient from './QuotationClient'
import Visa, { IVisa } from '@/models/Visa'
import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import { slugify } from '@/utils/slugify'
import { Viewport } from 'next'
import JsonLd from '@/components/seo/JsonLd'

// Enable dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0 // No caching - always fetch fresh data

// Disable all caching
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

type Props = {
  params: Promise<{ country: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params
  const seoData = await fetchSEOData(`/quotation/${resolvedParams.country}`)
  return generateSEOMetadata(seoData)
}

// Export viewport separately (Next.js 13+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1e40af',
}

// Utility to split slug and id
function splitSlugId(slugId: string): [string, string] {
  const parts = slugId.split('-')
  const visaId = parts.pop()! // last element is ID
  const countrySlug = parts.join('-') // rest is slug

  return [countrySlug, visaId]
}

// Utility to make slug human-readable
function formatCountryName(slug: string) {
  return decodeURIComponent(
    slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  )
}

export default async function QuotationPage({ params }: Props) {
  try {
    const resolvedParams = await params
    const [countrySlug, visaId] = splitSlugId(resolvedParams?.country)
    const readableCountry = formatCountryName(countrySlug)

    await connectDB()

    if (!visaId || visaId.length !== 24) {
      console.error('Invalid visa ID:', visaId)
      return <div>❌ Invalid visa ID format</div>
    }

    // Use select to only fetch needed fields for better performance
    // Include all quotation content fields: visaSchedule, documentRequirements, operatingSchedule, faq
    const visa = (await Visa.findById(visaId)
      .select(
        'visaType category status adultPrice processingTimeValue stayPeriod validity occupancyType countryImage countryCode documents planDisclaimer importantInformation visaDetail inclusions visaDocument processingTimeQuote visaSchedule documentRequirements operatingSchedule faq'
      )
      .lean()) as IVisa | null

    if (!visa || visa.status !== 'active') {
      console.error('Visa not found or inactive for ID:', visaId)
      return <div>❌ Visa not found or inactive. ID: {visaId}</div>
    }

    // Convert to plain object for Client Component
    const visaData = JSON.parse(JSON.stringify(visa))

    // Debug: Log countryImage to verify it's being fetched
    if (visa.countryImage) {
    } else {
      console.warn('⚠️ Server: No countryImage found for visa:', visaId)
    }

    // Product Schema for Visa Service
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.visa4.com'
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${readableCountry} ${visaData.visaType || 'Visa'}`,
      description: `Apply for ${readableCountry} ${visaData.visaType || 'visa'}. Processing time: ${visaData.processingTimeValue || 'Standard'}.`,
      image: visaData.countryImage || `${baseUrl}/logo.png`,
      offers: {
        '@type': 'Offer',
        price: visaData.adultPrice || '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${baseUrl}/quotation/${resolvedParams.country}`,
      },
      brand: {
        '@type': 'Brand',
        name: 'Visa4',
      },
    }

    // FAQ Schema
    const faqSchema =
      visaData.faq && visaData.faq.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: visaData.faq.map((f: any) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          }
        : null

    return (
      <>
        <JsonLd data={productSchema} id="product-schema" />
        {faqSchema && <JsonLd data={faqSchema} id="faq-schema" />}
        <QuotationClient
          visa={visaData}
          readableCountry={readableCountry}
          countryImage={visa.countryImage}
          countryCode={visa.countryCode}
        />
      </>
    )
  } catch (error) {
    console.error('Error loading quotation page:', error)
    return (
      <div>
        ❌ Error loading quotation page:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }
}
