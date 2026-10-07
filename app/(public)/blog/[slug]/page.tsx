import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import CopyLinkButton from '@/app/admin/blog/CopyLinkButton'
import ReadingProgress from '@/components/blog/ReadingProgress'
import TableOfContents from '@/components/blog/TableOfContents'
import RelatedBlogImage from '@/components/blog/RelatedBlogImage'
import { addHeadingIds } from '@/lib/addHeadingIds'
import { processBlogContent } from '@/lib/processBlogContent'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  ArrowRight,
  Send,
} from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'

// Enable ISR (Incremental Static Regeneration) - revalidate every hour
export const revalidate = 0

type Blog = {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  featuredImageAlt?: string
  author?: string
  authorAvatar?: string
  status: string
  category?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  publishedAt?: string
  readMinutes?: number
  updatedAt?: string
  createdAt?: string
}

type RelatedBlog = {
  title: string
  date: string
  author: string
  excerpt: string
  image: string
  href: string
  category?: string
}

type Props = { params: { slug: string } }

export async function getPostBySlug(slug: string): Promise<Blog | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/public/blog/${slug}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!res.ok) return null

    const text = await res.text()
    try {
      const data = JSON.parse(text)
      return data ?? null // assuming your API returns { blog: {...} }
    } catch {
      return null // not JSON → 404
    }
  } catch (e) {
    console.error('Error fetching post:', e)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.metaKeywords?.split(',').map(k => k.trim()),
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
    },
    alternates: { canonical: `/blog/${post.slug}` },
  }
}

// Function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200 // Average reading speed
  const text = content.replace(/<[^>]*>/g, '') // Remove HTML tags
  const wordCount = text.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  return Math.max(1, readingTime) // At least 1 minute
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return notFound()

  // Calculate reading time
  const readingTime = calculateReadingTime(post.content)

  // fetch related posts (latest 6 published)
  let related: RelatedBlog[] = []
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const relatedRes = await fetch(`${baseUrl}/api/public/recent-blogs`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
    if (relatedRes.ok) {
      try {
        const recentblog = await relatedRes.json()
        related = (recentblog?.blogs || []).slice(0, 6)
      } catch {
        related = []
      }
    }
  } catch (error) {
    console.error('Error fetching related posts:', error)
    related = []
  }

  // Get all unique tags for the sidebar - use fallback if none exist
  const allTags =
    post.tags && post.tags.length > 0
      ? post.tags
      : ['Visa Application', 'Travel Tips', 'Immigration', 'Documents Required']

  // Fetch blog configuration for author profiles (optional)
  let blogConfig = null
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const configRes = await fetch(`${baseUrl}/api/public/blog-config`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })
    if (configRes.ok) {
      const configData = await configRes.json()
      blogConfig = configData.success ? configData.data : null
    }
  } catch (error) {
    console.error('Error fetching blog config:', error)
  }

  // Get author from config or use post author
  const authorConfig =
    blogConfig?.authors?.find(
      (a: any) => a.name === post.author && a.isActive !== false
    ) || null

  // Get CTAs from blog post (blog-specific) with fallbacks
  const postData = post as any

  // Helper to check if CTA object exists and has content
  const hasCTA = (cta: any) => {
    return (
      cta &&
      typeof cta === 'object' &&
      (cta.isActive === true || Object.keys(cta).length > 1)
    )
  }

  // Hardcoded default values for all visa blogs
  const DEFAULT_TRAVELERS_TEXT = 'Join 1,50,000+ Travelers'
  const DEFAULT_TRUST_TEXT = 'who trust our guide.'
  const DEFAULT_WHATSAPP_LINK = 'https://wa.me/9822553417'
  const DEFAULT_PHONE_LINK = 'tel:+919822553417'
  const DEFAULT_TRAVELER_IMAGES = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D',
    'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D',
  ]

  const headerCTA = hasCTA(postData.headerCTA)
    ? {
        title:
          postData.headerCTA.title ||
          blogConfig?.headerCTA?.title ||
          'Ready to Start Your Visa Application?',
        buttonText:
          postData.headerCTA.buttonText ||
          blogConfig?.headerCTA?.buttonText ||
          'Start Visa Application',
        buttonLink:
          postData.headerCTA.buttonLink ||
          blogConfig?.headerCTA?.buttonLink ||
          '/select-plan',
        travelersText:
          postData.headerCTA.travelersText ||
          blogConfig?.headerCTA?.travelersText ||
          DEFAULT_TRAVELERS_TEXT,
        trustText:
          postData.headerCTA.trustText ||
          blogConfig?.headerCTA?.trustText ||
          DEFAULT_TRUST_TEXT,
        travelerImages:
          postData.headerCTA.travelerImages &&
          postData.headerCTA.travelerImages.length > 0
            ? postData.headerCTA.travelerImages
            : blogConfig?.headerCTA?.travelerImages &&
                blogConfig?.headerCTA?.travelerImages.length > 0
              ? blogConfig?.headerCTA?.travelerImages
              : DEFAULT_TRAVELER_IMAGES,
        isActive: postData.headerCTA.isActive === true,
      }
    : {
        title:
          blogConfig?.headerCTA?.title ||
          'Ready to Start Your Visa Application?',
        buttonText:
          blogConfig?.headerCTA?.buttonText || 'Start Visa Application',
        buttonLink: blogConfig?.headerCTA?.buttonLink || '/select-plan',
        travelersText:
          blogConfig?.headerCTA?.travelersText || DEFAULT_TRAVELERS_TEXT,
        trustText: blogConfig?.headerCTA?.trustText || DEFAULT_TRUST_TEXT,
        travelerImages:
          blogConfig?.headerCTA?.travelerImages || DEFAULT_TRAVELER_IMAGES,
        isActive: blogConfig?.headerCTA?.isActive === true,
      }

  // Fetch visa details if visaPlanCTA has selectedVisaId
  let visaDetails: any = null
  if (postData.visaPlanCTA?.selectedVisaId) {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const visaRes = await fetch(
        `${baseUrl}/api/public/visa/${postData.visaPlanCTA.selectedVisaId}`,
        {
          next: { revalidate: 3600 }, // Revalidate every hour
        }
      )
      if (visaRes.ok) {
        const response = await visaRes.json()
        visaDetails = response.success ? response.data : response
      }
    } catch (error) {
      console.error('Error fetching visa details:', error)
    }
  }

  // Determine plan name and badge visibility from visa details
  const getPlanName = () => {
    if (visaDetails) {
      // Use category (standard/premium) - capitalize first letter
      if (visaDetails.category) {
        const category = visaDetails.category.toLowerCase()
        if (category === 'premium' || category === 'standard') {
          return category.charAt(0).toUpperCase() + category.slice(1)
        }
        // If category is something else, capitalize it
        return (
          visaDetails.category.charAt(0).toUpperCase() +
          visaDetails.category.slice(1).toLowerCase()
        )
      }
      // Fallback to visaType if category not available
      if (visaDetails.visaType) {
        return visaDetails.visaType
      }
    }
    // Fallback to default
    return 'Standard'
  }

  const shouldShowPopularBadge = () => {
    if (visaDetails) {
      return visaDetails.hotListed === 'true' || visaDetails.hotListed === true
    }
    // Fallback to configured badgeText
    return postData.visaPlanCTA?.badgeText === 'Popular'
  }

  // Generate WhatsApp message with plan details
  const generateWhatsAppMessage = (
    planName: string,
    processingTime: string,
    price: string,
    country: string
  ) => {
    const message = `Hello! I'm interested in applying for ${country} Visa.

📋 Plan Details:
• Plan: ${planName}
• Processing Time: ${processingTime}
• Price: ${price}

📝 Blog: ${post.title}

Please help me with the visa application process.`

    return encodeURIComponent(message)
  }

  // Generate WhatsApp link with message
  const getWhatsAppLink = (
    baseLink: string,
    planName: string,
    processingTime: string,
    price: string
  ) => {
    // Extract phone number from link (format: https://wa.me/1234567890 or tel:+1234567890)
    const phoneMatch = baseLink.match(/(?:wa\.me\/|tel:)([0-9+]+)/)
    if (phoneMatch && phoneMatch[1]) {
      const phoneNumber = phoneMatch[1].replace(/^\+/, '') // Remove leading + if present
      const country = visaDetails?.country || post.title.split(' ')[0] || 'Visa'
      const message = generateWhatsAppMessage(
        planName,
        processingTime,
        price,
        country
      )
      return `https://wa.me/${phoneNumber}?text=${message}`
    }
    // Fallback to original link if phone number not found
    return baseLink
  }

  const visaPlanCTA = hasCTA(postData.visaPlanCTA)
    ? {
        badgeText:
          postData.visaPlanCTA.badgeText ||
          blogConfig?.visaPlanCTA?.badgeText ||
          'Popular',
        planName: getPlanName(),
        showPopularBadge: shouldShowPopularBadge(),
        title:
          postData.visaPlanCTA.title ||
          blogConfig?.visaPlanCTA?.title ||
          'Choose Your Visa Plan',
        description:
          postData.visaPlanCTA.description ||
          blogConfig?.visaPlanCTA?.description ||
          'Get your visa processed quickly and efficiently',
        processingTime:
          postData.visaPlanCTA.processingTime ||
          blogConfig?.visaPlanCTA?.processingTime ||
          '3-5 Days',
        price:
          postData.visaPlanCTA.price ||
          blogConfig?.visaPlanCTA?.price ||
          'Starting at ₹99',
        buttonText:
          postData.visaPlanCTA.buttonText ||
          blogConfig?.visaPlanCTA?.buttonText ||
          'Apply Now',
        buttonLink:
          postData.visaPlanCTA.buttonLink ||
          blogConfig?.visaPlanCTA?.buttonLink ||
          '/select-plan',
        whatsappLink:
          postData.visaPlanCTA.whatsappLink || DEFAULT_WHATSAPP_LINK,
        phoneLink: postData.visaPlanCTA.phoneLink || DEFAULT_PHONE_LINK,
        isActive: postData.visaPlanCTA.isActive === true,
      }
    : {
        badgeText: blogConfig?.visaPlanCTA?.badgeText || 'Popular',
        planName: 'Standard',
        showPopularBadge: blogConfig?.visaPlanCTA?.badgeText === 'Popular',
        title: blogConfig?.visaPlanCTA?.title || 'Choose Your Visa Plan',
        description:
          blogConfig?.visaPlanCTA?.description ||
          'Get your visa processed quickly and efficiently',
        processingTime: blogConfig?.visaPlanCTA?.processingTime || '3-5 Days',
        price: blogConfig?.visaPlanCTA?.price || 'Starting at ₹99',
        buttonText: blogConfig?.visaPlanCTA?.buttonText || 'Apply Now',
        buttonLink: blogConfig?.visaPlanCTA?.buttonLink || '/select-plan',
        whatsappLink: DEFAULT_WHATSAPP_LINK,
        phoneLink: DEFAULT_PHONE_LINK,
        isActive: blogConfig?.visaPlanCTA?.isActive === true,
      }

  const footerCTA = hasCTA(postData.footerCTA)
    ? {
        title:
          postData.footerCTA.title ||
          blogConfig?.footerCTA?.title ||
          'Ready to Apply for Your Visa?',
        description:
          postData.footerCTA.description ||
          blogConfig?.footerCTA?.description ||
          'Get expert assistance with your visa application. Our team is here to help you every step of the way.',
        buttonText:
          postData.footerCTA.buttonText ||
          blogConfig?.footerCTA?.buttonText ||
          'Start Application',
        buttonLink:
          postData.footerCTA.buttonLink ||
          blogConfig?.footerCTA?.buttonLink ||
          '/select-plan',
        isActive: postData.footerCTA.isActive === true,
      }
    : {
        title: blogConfig?.footerCTA?.title || 'Ready to Apply for Your Visa?',
        description:
          blogConfig?.footerCTA?.description ||
          'Get expert assistance with your visa application. Our team is here to help you every step of the way.',
        buttonText: blogConfig?.footerCTA?.buttonText || 'Start Application',
        buttonLink: blogConfig?.footerCTA?.buttonLink || '/select-plan',
        isActive: blogConfig?.footerCTA?.isActive === true,
      }

  // Get traveler images (up to 3) - use defaults if not enough provided
  const travelerImages =
    headerCTA.travelerImages && headerCTA.travelerImages.length > 0
      ? headerCTA.travelerImages.slice(0, 3)
      : DEFAULT_TRAVELER_IMAGES.slice(0, 3)

  // Ensure we always have 3 images (fill with defaults if needed)
  const finalTravelerImages = [...travelerImages]
  while (finalTravelerImages.length < 3) {
    finalTravelerImages.push(
      DEFAULT_TRAVELER_IMAGES[finalTravelerImages.length] ||
        DEFAULT_TRAVELER_IMAGES[0]
    )
  }

  // Base URL for schema
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.visa4.com'

  // Determine author image
  const authorImage =
    authorConfig?.profileImage || `${baseUrl}/avtarplaceholder.png`

  // Blog Schema Data
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage || `${baseUrl}/placeholder.jpg`,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: authorConfig?.name || post.author || 'Visa4 Expert',
      url: `${baseUrl}/blog`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Visa4',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
    keywords: post.tags?.join(', '),
  }

  // Breadcrumb Schema Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${baseUrl}/blog/${post.slug}`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={blogJsonLd} id="blog-posting-schema" />
      <JsonLd data={breadcrumbJsonLd} id="breadcrumb-schema" />
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm md:text-base text-gray-600">
          <Link
            href="/"
            className="hover:text-blue-600 transition-colors font-medium"
          >
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link
            href="/blog"
            className="hover:text-blue-600 transition-colors font-medium"
          >
            Blog
          </Link>
          <span className="mx-2">›</span>
          <span className="transition-colors font-medium">{post.title}</span>
        </nav>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
              {authorConfig?.profileImage ? (
                <div className="w-14 h-14  rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                  <Image
                    src={authorConfig.profileImage}
                    alt={authorConfig.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14  bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl md:text-2xl font-bold">
                    {(authorConfig?.name || post.author || 'A')?.charAt(0)}
                  </span>
                </div>
              )}

              <span className="text-sm ">By {post.author || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm ">{readingTime} Min Read</span>
            </div>

            <div className="flex items-center gap-2 text-sm  text-gray-600">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recently'}
              </span>
            </div>
            <h3 className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full text-sm md:text-base font-semibold hover:bg-blue-100 transition-colors shadow-sm">
              Apply Visa Online
            </h3>
          </div>

          {/* Header CTA Card */}
          {headerCTA.isActive && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-2 mb-10 max-w-6xl mx-auto border border-blue-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-md pl-2 font-semibold text-gray-900 mb-0">
                  {headerCTA.title}
                </p>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <Link
                    href={headerCTA.buttonLink}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm md:text-base rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    {headerCTA.buttonText}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.98016 5.33331L5.39573 1.75998L6.34181 0.813313L11.5252 5.99998L6.34181 11.1866L5.39573 10.24L8.98016 6.66665H0.865234V5.33331H8.98016Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                  {(headerCTA.travelersText || headerCTA.trustText) && (
                    <div className="flex items-center">
                      <div className="relative w-20 h-12 flex items-center">
                        {/* First layer - leftmost */}
                        <div className="absolute left-0 z-10">
                          <Image
                            src={
                              finalTravelerImages[0] ||
                              DEFAULT_TRAVELER_IMAGES[0]
                            }
                            alt="Traveler 1"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            loading="eager"
                          />
                        </div>
                        {/* Second layer - middle */}
                        <div className="absolute left-4 z-20">
                          <Image
                            src={
                              finalTravelerImages[1] ||
                              DEFAULT_TRAVELER_IMAGES[1]
                            }
                            alt="Traveler 2"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            loading="eager"
                          />
                        </div>
                        {/* Third layer - rightmost */}
                        <div className="absolute left-8 z-30">
                          <Image
                            src={
                              finalTravelerImages[2] ||
                              DEFAULT_TRAVELER_IMAGES[2]
                            }
                            alt="Traveler 3"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            loading="eager"
                          />
                        </div>
                      </div>
                      <div className="text-left">
                        {headerCTA.travelersText && (
                          <p className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                            {headerCTA.travelersText}
                          </p>
                        )}
                        {headerCTA.trustText && (
                          <p className="text-xs text-gray-600 leading-tight">
                            {headerCTA.trustText}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Featured Image */}
          <div className="mb-12 max-w-6xl mx-auto">
            <RelatedBlogImage
              src={post.featuredImage || '/placeholder.svg'}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Left Column (70%) */}
          <div className="lg:col-span-8">
            <article
              className="prose prose-base md:prose-lg max-w-none font-sans
              prose-headings:text-gray-900 prose-headings:font-bold 
              prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 md:prose-h1:mb-8 prose-h1:mt-0 prose-h1:leading-tight prose-h1:border-b-4 prose-h1:border-blue-500 prose-h1:pb-3 md:prose-h1:pb-4 prose-h1:text-gray-900
              prose-h2:text-xl md:prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3 md:prose-h2:mb-4 prose-h2:mt-6 md:prose-h2:mt-8 prose-h2:leading-tight prose-h2:text-blue-700 prose-h2:relative prose-h2:pl-4
              prose-h3:text-lg md:prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 md:prose-h3:mb-3 prose-h3:mt-4 md:prose-h3:mt-6 prose-h3:leading-tight prose-h3:text-gray-800
              prose-h4:text-base md:prose-h4:text-lg prose-h4:font-semibold prose-h4:mb-2 prose-h4:mt-3 md:prose-h4:mt-4 prose-h4:text-gray-800 prose-h4:px-3 md:prose-h4:px-4 prose-h4:py-2 prose-h4:rounded prose-h4:border-l-4 prose-h4:border-blue-500
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 md:prose-p:mb-5 prose-p:text-base md:prose-p:text-lg prose-p:bg-transparent
              prose-p:first-of-type:text-lg md:prose-p:first-of-type:text-xl prose-p:first-of-type:text-gray-800 prose-p:first-of-type:font-normal prose-p:first-of-type:mb-6 md:prose-p:first-of-type:mb-8 prose-p:first-of-type:bg-transparent
              prose-a:text-blue-600 prose-a:no-underline prose-a:font-medium prose-a:border-b prose-a:border-transparent hover:prose-a:border-blue-600
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:text-gray-600 prose-ul:mb-5 md:prose-ul:mb-6 prose-ul:pl-0 prose-ul:space-y-2 md:prose-ul:space-y-3 prose-ul:list-none
              prose-li:text-gray-600 prose-li:mb-2 md:prose-li:mb-3 prose-li:leading-relaxed prose-li:relative prose-li:pl-6 prose-li:bg-transparent prose-li:text-base md:prose-li:text-lg
              prose-ol:text-gray-600 prose-ol:mb-5 md:prose-ol:mb-6 prose-ol:pl-6 prose-ol:space-y-2 md:prose-ol:space-y-3
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 md:prose-blockquote:pl-6 prose-blockquote:py-3 md:prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:my-5 md:prose-blockquote:my-6 prose-blockquote:text-gray-700 prose-blockquote:bg-transparent prose-blockquote:text-base md:prose-blockquote:text-lg
              prose-code:text-xs md:prose-code:text-sm prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-gray-800 prose-code:font-mono
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 md:prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-5 md:prose-pre:my-6 prose-pre:font-mono prose-pre:text-xs md:prose-pre:text-sm
              prose-table:text-xs md:prose-table:text-sm prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:rounded-lg prose-table:overflow-hidden prose-table:my-5 md:prose-table:my-6 prose-table:shadow-lg
              prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:px-3 md:prose-th:px-4 prose-th:py-2 md:prose-th:py-3 prose-th:font-semibold prose-th:text-left prose-th:text-gray-900
              prose-td:border prose-td:border-gray-300 prose-td:px-3 md:prose-td:px-4 prose-td:py-2 md:prose-td:py-3 prose-td:text-gray-600
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-5 md:prose-img:my-6 prose-img:w-full prose-img:h-auto
              prose-hr:border-gray-200 prose-hr:my-6 md:prose-hr:my-8 prose-hr:border-t-2"
            >
              <section
                className="blog-content"
                dangerouslySetInnerHTML={{
                  __html: addHeadingIds(processBlogContent(post.content)),
                }}
              />
            </article>

            {/* Tags */}
            {post.tags?.length ? (
              <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">
                  Tags:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Share */}
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm md:text-base font-semibold text-gray-900">
                  Share:
                </span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.title
                  )}&url=${encodeURIComponent(
                    'https://visa4.com/blog/' + post.slug
                  )}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    'https://visa4.com/blog/' + post.slug
                  )}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <CopyLinkButton url={`https://visa4.com/blog/${post.slug}`} />
              </div>
            </div>

            {/* CTA Box - Visa Application */}
            {footerCTA.isActive && (
              <div className="mt-6 md:mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 md:p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                      {footerCTA.title}
                    </h3>
                    {footerCTA.description && (
                      <p className="text-blue-100 text-base md:text-lg leading-relaxed">
                        {footerCTA.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      href={footerCTA.buttonLink}
                      className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 font-semibold text-base md:text-lg rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {footerCTA.buttonText}
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column (30%) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Visa Plan Card */}
              {visaPlanCTA.isActive && (
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow border border-gray-200">
                  <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">
                    {visaPlanCTA.title || 'Choose Your Visa Plan'}
                  </h3>

                  {/* Visa Plan Card */}
                  <div className="relative bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-5 mb-4">
                    {/* Popular Badge */}
                    {visaPlanCTA.badgeText && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {visaPlanCTA.badgeText}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Document Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>

                      {/* Plan Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                          {visaPlanCTA.planName}
                        </h4>
                        {visaPlanCTA.processingTime && (
                          <p className="text-sm text-gray-600 mb-2">
                            Get your visa by {visaPlanCTA.processingTime}
                          </p>
                        )}
                        {visaPlanCTA.price && (
                          <p className="text-lg font-bold text-blue-600">
                            {visaPlanCTA.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {/* Apply Now Button */}
                    <Link
                      href={visaPlanCTA.buttonLink}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-blue-600 text-white text-sm md:text-base font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <span>{visaPlanCTA.buttonText || 'Apply Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {/* WhatsApp Button */}
                    {visaPlanCTA.whatsappLink && (
                      <a
                        href={getWhatsAppLink(
                          visaPlanCTA.whatsappLink,
                          visaPlanCTA.planName,
                          visaPlanCTA.processingTime,
                          visaPlanCTA.price
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-200 rounded-full hover:border-green-500 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
                        aria-label="WhatsApp"
                      >
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </a>
                    )}

                    {/* Phone Button */}
                    {visaPlanCTA.phoneLink && (
                      <a
                        href={visaPlanCTA.phoneLink}
                        className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-200 rounded-full hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                        aria-label="Call"
                      >
                        <Phone className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Posts */}
              {related.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-5 md:p-6 shadow-sm">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">
                    Recent Posts
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {related.map((item: RelatedBlog) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group block"
                      >
                        <div className="flex gap-3 items-start hover:bg-white p-2.5 md:p-3 rounded-lg transition-all duration-200">
                          <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <RelatedBlogImage
                              src={item.image || '/placeholder.svg'}
                              alt={item.title || 'Blog'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500">{item.date}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* Author Profile Section */}
              <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
                <div className="bg-gray-50 rounded-xl p-5 md:p-6">
                  <div className="flex flex-col items-center justify-center gap-4">
                    {authorConfig?.profileImage ? (
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 ">
                        <Image
                          src={authorConfig.profileImage}
                          alt={authorConfig.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className=" w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ">
                        <span className="text-white text-xl md:text-2xl font-bold">
                          {(authorConfig?.name || post.author || 'A')?.charAt(
                            0
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 text-center">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                        {authorConfig?.name || post.author || 'Admin'}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {authorConfig?.bio ||
                          'Expert visa consultant with years of experience helping travelers navigate visa applications and travel requirements.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Your Visa CTA */}
              {blogConfig?.sidebarCTA?.isActive !== false && (
                <div className="mt-8">
                  <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-100/50 text-center space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {blogConfig?.sidebarCTA?.title ||
                        'Secure Your Visa in 4 Quick Steps'}
                    </h3>
                    <Link
                      href={
                        blogConfig?.sidebarCTA?.buttonLink || '/select-plan'
                      }
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg uppercase tracking-wider text-sm"
                    >
                      {blogConfig?.sidebarCTA?.buttonText || 'View Prices'}
                      <Send className="w-5 h-5 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
              {/* Tags */}
              <div className="bg-gray-50 rounded-2xl p-5 md:p-6 shadow-sm">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Link
                      key={tag}
                      href={`/blog?search=${encodeURIComponent(tag)}`}
                      className="px-2.5 md:px-3 py-1 md:py-1.5 bg-white border border-gray-200 rounded-full text-xs md:text-sm text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
