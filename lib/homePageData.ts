/**
 * Server-side data fetching for home page
 * Fetches all section data in parallel for optimal performance
 */
import connectDB from '@/lib/db'
import HeroSection from '@/models/HeroSection'
import ServicesSection from '@/models/ServicesSection'
import WhyChooseUsSection from '@/models/WhyChooseUsSection'
import CTASection from '@/models/CTASection'
import BrandCollaboration from '@/models/BrandCollaboration'
import TestimonialsSection from '@/models/TestimonialsSection'
import TrustVisaAgentSection from '@/models/TrustVisaAgentSection'
import FAQ from '@/models/FAQ'
import Blog from '@/models/Blog'
import Visa from '@/models/Visa'
import RecognitionSection from '@/models/RecognitionSection'
import mongoose from 'mongoose'

export interface HomePageData {
  heroContent: any
  services: any[]
  serviceSectionContent: any
  visaConfig: any
  whyChooseUs: any
  ctaSection: any
  brandCollaboration: any
  recognitionSection: any
  testimonials: any
  trustVisaAgent: any
  recentBlogs: any[]
  faqs: any[]
  countries: any[]
}

// Helper function to serialize MongoDB objects to plain objects
// This ensures all ObjectIds, Dates, and Buffers are converted to plain values
function serializeObject(obj: any): any {
  if (obj === null || obj === undefined) return null
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) {
    return obj.map(serializeObject)
  }
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        // Handle _id first (most common case) - convert to string
        if (key === '_id') {
          if (value && typeof value === 'object' && value.buffer) {
            // Handle ObjectId that has been converted to object with buffer property
            // Convert buffer to ObjectId string format (24 hex characters)
            try {
              const buffer = Buffer.isBuffer(value.buffer)
                ? value.buffer
                : Buffer.from(value.buffer)
              serialized[key] = buffer.toString('hex')
            } catch {
              // Fallback: try to get string representation
              serialized[key] = value.toString
                ? value.toString()
                : String(value)
            }
          } else if (value && typeof value.toString === 'function') {
            try {
              serialized[key] = value.toString()
            } catch {
              serialized[key] = String(value)
            }
          } else if (
            value &&
            value.constructor &&
            value.constructor.name === 'ObjectId'
          ) {
            serialized[key] = value.toString()
          } else if (
            value &&
            value.constructor &&
            value.constructor.name === 'Buffer'
          ) {
            serialized[key] = value.toString('hex')
          } else {
            serialized[key] = value ? String(value) : value
          }
        }
        // Handle ObjectId
        else if (
          value &&
          typeof value === 'object' &&
          value.constructor &&
          value.constructor.name === 'ObjectId'
        ) {
          serialized[key] = value.toString()
        }
        // Handle Date
        else if (value instanceof Date) {
          serialized[key] = value.toISOString()
        }
        // Handle Buffer
        else if (
          value &&
          value.constructor &&
          value.constructor.name === 'Buffer'
        ) {
          serialized[key] = value.toString('hex')
        }
        // Handle nested objects
        else if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          value.constructor === Object
        ) {
          serialized[key] = serializeObject(value)
        }
        // Handle arrays
        else if (Array.isArray(value)) {
          serialized[key] = serializeObject(value)
        }
        // Primitive values
        else {
          serialized[key] = value
        }
      }
    }
    return serialized
  }
  return obj
}

export async function fetchHomePageData(): Promise<HomePageData> {
  try {
    await connectDB()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database not connected')
    }

    // Fetch all data in parallel for optimal performance
    const [
      heroSectionRaw,
      serviceSectionRaw,
      whyChooseUsRaw,
      ctaSectionRaw,
      brandCollaborationRaw,
      recognitionSectionRaw,
      testimonialsSectionRaw,
      trustVisaAgentRaw,
      recentBlogsRaw,
      faqsRaw,
      visasRaw,
      visaConfigDataRaw,
    ] = await Promise.all([
      // Hero Section
      HeroSection.findOne({ status: 'active' })
        .lean()
        .catch(() => null),

      // Service Section Content
      ServicesSection.findOne({ status: 'active' })
        .lean()
        .catch(() => null),

      // Why Choose Us
      WhyChooseUsSection.findOne({ status: 'active' })
        .lean()
        .catch(() => null),

      // CTA Section
      CTASection.findOne({ status: 'active' })
        .lean()
        .catch(() => null),

      // Brand Collaboration
      BrandCollaboration.findOne({ status: 'active' })
        .lean()
        .catch(() => null),

      // Recognition Section
      RecognitionSection.findOne({ status: 'active' })
        .lean()
        .catch(() => null),

      // Testimonials
      TestimonialsSection.findOne({ status: 'active' })
        .lean()
        .catch(() => null),

      // Trust Visa Agent
      TrustVisaAgentSection.findOne({ status: 'active' })
        .lean()
        .catch(() => null),

      // Recent Blogs
      Blog.find({ status: 'published' })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(3)
        .select(
          '_id title slug excerpt featuredImage author publishedAt createdAt'
        )
        .lean()
        .catch(() => []),

      // FAQs
      FAQ.find({ status: 'active' })
        .sort({ order: 1 })
        .lean()
        .catch(() => []),

      // Visas (for services and countries list)
      Visa.find({ status: 'active' })
        .lean()
        .catch(() => []),

      // Visa Config (using raw MongoDB for collections)
      Promise.all([
        db
          .collection('processingtimetypes')
          .find({ isActive: true })
          .sort({ order: 1, name: 1 })
          .project({ _id: 1, name: 1, slug: 1, order: 1 })
          .toArray()
          .catch(() => []),
        db
          .collection('visatypes')
          .find({ isActive: true })
          .sort({ order: 1, name: 1 })
          .project({ _id: 1, name: 1, slug: 1, order: 1 })
          .toArray()
          .catch(() => []),
        db
          .collection('documenttypes')
          .find({ isActive: true })
          .sort({ order: 1, name: 1 })
          .project({
            _id: 1,
            name: 1,
            slug: 1,
            displayName: 1,
            order: 1,
            exampleImage: 1,
            icon: 1,
          })
          .toArray()
          .catch(() => []),
        db
          .collection('visacategories')
          .find({ isActive: true })
          .sort({ order: 1, name: 1 })
          .project({ _id: 1, name: 1, slug: 1, order: 1 })
          .toArray()
          .catch(() => []),
        db
          .collection('occupancytypes')
          .find({ isActive: true })
          .sort({ order: 1, name: 1 })
          .project({ _id: 1, name: 1, slug: 1, order: 1 })
          .toArray()
          .catch(() => []),
      ])
        .then(
          ([
            processingTimeTypes,
            visaTypes,
            documentTypes,
            visaCategories,
            occupancyTypes,
          ]) => ({
            processingTimeTypes,
            visaTypes,
            documentTypes,
            visaCategories,
            occupancyTypes,
          })
        )
        .catch(() => null),
    ])

    // Process services data (replicate logic from API route)
    const countryGroups = (visasRaw || []).reduce((acc: any, visa: any) => {
      const country = visa.country
      if (!acc[country]) {
        acc[country] = {
          country: country,
          countryFlag: visa.countryFlag || '',
          countryCode: visa.countryCode || '',
          countryImage: visa.countryImage || '',
          visaTypes: [],
          totalVisas: 0,
          minPrice: Infinity,
          maxPrice: 0,
        }
      }

      const basePrice = parseInt(visa.adultPrice) || 0
      let pricingOptions = {
        day: basePrice,
        week: basePrice,
        schengen: basePrice,
      }

      if (visa.occupancyType === 'single') {
        pricingOptions = {
          day: Math.round(basePrice * 1.5),
          week: Math.round(basePrice * 1.2),
          schengen:
            visa.category === 'schengen'
              ? Math.round(basePrice * 1.3)
              : basePrice,
        }
      }

      acc[country].visaTypes.push({
        type: visa.visaType,
        price: visa.adultPrice,
        pricingOptions: pricingOptions,
        processingTime: visa.processingTimeValue || visa.processingTimeQuote,
        processingTimeValue: visa.processingTimeValue,
        processingTimeDays: visa.processingTimeDays,
        operatingHours: visa.operatingSchedule?.visa4Hours || '',
        stayPeriod: visa.stayPeriod,
        validity: visa.validity,
        category: visa.category,
        hotListed: visa.hotListed === 'true',
        restListed: visa.restListed === 'true',
        occupancyType: visa.occupancyType,
        eVisa: visa.eVisa === 'true',
      })

      acc[country].totalVisas++
      const price = parseInt(visa.adultPrice) || 0
      acc[country].minPrice = Math.min(acc[country].minPrice, price)
      acc[country].maxPrice = Math.max(acc[country].maxPrice, price)

      return acc
    }, {})

    const servicesData = Object.values(countryGroups)
      .map((country: any) => ({
        ...country,
        minPrice: country.minPrice === Infinity ? 0 : country.minPrice,
        maxPrice: country.maxPrice,
        hotlistedCount: country.visaTypes.filter((vt: any) => vt.hotListed)
          .length,
        restlistedCount: country.visaTypes.filter((vt: any) => vt.restListed)
          .length,
      }))
      .sort((a: any, b: any) => {
        if (b.hotlistedCount !== a.hotlistedCount) {
          return b.hotlistedCount - a.hotlistedCount
        }
        return b.totalVisas - a.totalVisas
      })

    // Process service section content
    const serviceSectionData = serviceSectionRaw || {
      title: 'Our Services',
      subtitle: 'Comprehensive Solutions for Your European Journey',
      description:
        'We provide end-to-end visa and travel services to make your European adventure seamless.',
    }

    // Get unique countries from visas
    const uniqueCountries = Array.from(
      new Map(
        (visasRaw || []).map((v: any) => {
          const processingUnit =
            v.processingTimeDays === 'in-weeks' ? 'Weeks' : 'Days'
          const processingTime = v.processingTimeValue
            ? `Visa in ${v.processingTimeValue} ${processingUnit}`
            : 'Visa Available'

          return [
            v.country,
            {
              id: v._id.toString(),
              country: v.country,
              flag: v.countryFlag || '🏳️',
              image: v.countryImage || '',
              processingTime,
            },
          ]
        })
      ).values()
    )

    // Process recent blogs
    const formattedBlogs = (recentBlogsRaw || []).map((blog: any) => ({
      title: blog.title,
      date: blog.publishedAt
        ? new Date(blog.publishedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : new Date(blog.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      author: blog.author,
      excerpt: blog.excerpt,
      image: blog.featuredImage || '/visa/blog-placeholder.png',
      href: `/blog/${blog.slug}`,
    }))

    // Default hero content if not found
    const defaultHeroContent = {
      title:
        'Apply for Your Visa Online with Visa4 - Fast, Secure & Hassle-Free',
      description:
        'Professional visa and travel services to help you explore Europe with confidence.',
      highlightedText: 'Visa4',
      highlightedTextColor: 'text-red-500',
      backgroundImage: '/visa/Vector.png',
      mainImage: '/visa/Rectangle.png',
      mainImageAlt: 'Dubai City',
      bottomLabel: 'Get Appointment Picked Within 72 Hours',
      searchPlaceholder: 'Search for your destination...',
      floatingCountries: [
        { country: 'China', flag: '🇨🇳', position: 'top-left' },
        { country: 'Albania', flag: '🇦🇱', position: 'top-right' },
        { country: 'India', flag: '🇮🇳', position: 'center-left' },
        { country: 'Germany', flag: '🇩🇪', position: 'bottom-left' },
        { country: 'UAE', flag: '🇦🇪', position: 'bottom-right' },
      ],
    }

    // Serialize all data before returning to ensure plain objects
    // This converts MongoDB ObjectIds, Dates, and Buffers to plain values
    const serialize = (data: any) => {
      if (data === null || data === undefined) return null
      // First try JSON serialization (handles most cases)
      try {
        // Convert ObjectIds to strings before JSON.stringify
        const preprocessed = serializeObject(data)
        return JSON.parse(JSON.stringify(preprocessed))
      } catch (error) {
        // Fallback to manual serialization
        return serializeObject(data)
      }
    }

    return {
      heroContent: serialize(heroSectionRaw) || defaultHeroContent,
      services: serialize(servicesData),
      serviceSectionContent: serialize(serviceSectionData),
      visaConfig: serialize(visaConfigDataRaw),
      whyChooseUs: serialize(whyChooseUsRaw),
      ctaSection: serialize(ctaSectionRaw),
      brandCollaboration: serialize(brandCollaborationRaw),
      recognitionSection: serialize(recognitionSectionRaw),
      testimonials: serialize(testimonialsSectionRaw),
      trustVisaAgent: serialize(trustVisaAgentRaw),
      recentBlogs: serialize(formattedBlogs),
      faqs: serialize(faqsRaw || []),
      countries: serialize(uniqueCountries),
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    // Return minimal defaults on error
    return {
      heroContent: {
        mainImage: '/visa/Rectangle.png',
        mainImageAlt: 'Dubai City',
      },
      services: [],
      serviceSectionContent: null,
      visaConfig: null,
      whyChooseUs: null,
      ctaSection: null,
      brandCollaboration: null,
      recognitionSection: null,
      testimonials: null,
      trustVisaAgent: null,
      recentBlogs: [],
      faqs: [],
      countries: [],
    }
  }
}
