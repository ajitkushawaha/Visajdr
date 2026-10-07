import { MetadataRoute } from 'next'
import connectDb from '@/lib/db'
import Blog from '@/models/Blog'
import ServiceDetail from '@/models/ServiceDetail'
import Visa from '@/models/Visa'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.visa4.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/career`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/travel-insurance`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/overstay-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic blog posts
  let blogPages: MetadataRoute.Sitemap = []
  try {
    await connectDb()
    const blogs = await Blog.find({ status: 'published' })
      .select('slug updatedAt publishedAt createdAt')
      .lean()
      .limit(1000) // Limit to prevent sitemap from being too large

    blogPages = blogs.map(blog => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified:
        blog.updatedAt || blog.publishedAt || blog.createdAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error)
  }

  // Dynamic service pages
  let servicePages: MetadataRoute.Sitemap = []
  try {
    const services = await ServiceDetail.find({ status: 'published' })
      .select('slug updatedAt createdAt')
      .lean()
      .limit(500)

    servicePages = services.map((service: any) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: service.updatedAt || service.createdAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching services for sitemap:', error)
  }

  // Dynamic country quotation pages
  let countryPages: MetadataRoute.Sitemap = []
  try {
    const visas = await Visa.find({ status: 'active' })
      .select('country countryCode updatedAt createdAt')
      .lean()
      .limit(200)

    // Get unique countries
    const uniqueCountries = Array.from(
      new Map(
        visas
          .filter(v => v.country && v.countryCode)
          .map(v => [
            v.country.toLowerCase(),
            {
              country: v.country,
              countryCode: v.countryCode,
              lastModified: v.updatedAt || v.createdAt || new Date(),
            },
          ])
      ).values()
    )

    countryPages = uniqueCountries.map(country => ({
      url: `${baseUrl}/quotation/${country.countryCode.toLowerCase()}`,
      lastModified: country.lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching countries for sitemap:', error)
  }

  // Combine all pages
  return [...staticPages, ...blogPages, ...servicePages, ...countryPages]
}
