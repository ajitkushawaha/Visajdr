'use client'

import { useEffect, useState } from 'react'
import Head from 'next/head'

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

interface DynamicSEOProps {
  pagePath: string
  fallbackSEO?: Partial<SEOData>
}

export default function DynamicSEO({ pagePath, fallbackSEO }: DynamicSEOProps) {
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSEOData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/public/seo?path=${encodeURIComponent(pagePath)}`
        )

        if (response.ok) {
          const data = await response.json()
          setSeoData(data.seo)
        } else {
          // Use fallback SEO if API fails
          setSeoData(fallbackSEO as SEOData)
        }
      } catch (error) {
        console.error('Error fetching SEO data:', error)
        // Use fallback SEO on error
        setSeoData(fallbackSEO as SEOData)
      } finally {
        setLoading(false)
      }
    }

    fetchSEOData()
  }, [pagePath, fallbackSEO])

  // Don't render anything while loading to avoid flash
  if (loading || !seoData) {
    return null
  }

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

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && metaKeywords.length > 0 && (
        <meta name="keywords" content={metaKeywords.join(', ')} />
      )}
      <meta name="robots" content={robots} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitle || metaTitle} />
      <meta
        property="og:description"
        content={ogDescription || metaDescription}
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:site_name" content="Visa4" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || metaTitle} />
      <meta
        name="twitter:description"
        content={ogDescription || metaDescription}
      />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1e40af" />
      <meta name="author" content="Visa4" />
      <meta name="generator" content="Next.js" />
    </Head>
  )
}
