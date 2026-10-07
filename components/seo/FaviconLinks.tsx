/**
 * FaviconLinks Component
 *
 * This component ensures explicit favicon link tags are present in the HTML head
 * for better search engine indexing. Search engines like Google need these links
 * to properly display favicons in search results.
 *
 * Note: In Next.js App Router, we use a client component with useEffect to inject
 * these links, as the metadata API should handle it but explicit links ensure
 * better compatibility with search engines.
 */

'use client'

import { useEffect } from 'react'

export default function FaviconLinks() {
  useEffect(() => {
    // Ensure all favicon links are present in the head
    const links = [
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      {
        rel: 'icon',
        href: '/favicon_io/favicon-16x16.png',
        type: 'image/png',
        sizes: '16x16',
      },
      {
        rel: 'icon',
        href: '/favicon_io/favicon-32x32.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        rel: 'apple-touch-icon',
        href: '/favicon_io/apple-touch-icon.png',
        sizes: '180x180',
      },
      {
        rel: 'icon',
        href: '/favicon_io/android-chrome-192x192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        rel: 'icon',
        href: '/favicon_io/android-chrome-512x512.png',
        type: 'image/png',
        sizes: '512x512',
      },
      { rel: 'manifest', href: '/favicon_io/site.webmanifest' },
    ]

    links.forEach(({ rel, href, type, sizes }) => {
      // Check if link already exists
      const existingLink = document.querySelector(
        `link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ''}`
      ) as HTMLLinkElement

      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = rel
        link.href = href
        if (type) link.type = type
        if (sizes) link.setAttribute('sizes', sizes)
        document.head.appendChild(link)
      } else if (existingLink.href !== href) {
        // Update if href is different
        existingLink.href = href
        if (type) existingLink.type = type
      }
    })
  }, [])

  return null
}
