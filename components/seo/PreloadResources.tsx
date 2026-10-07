/**
 * PreloadResources Component
 *
 * Preloads critical resources like LCP image and fonts for faster page load
 * Uses script injection to run as early as possible
 */

'use client'

import { useEffect } from 'react'

interface PreloadResourcesProps {
  lcpImageUrl?: string
}

export default function PreloadResources({
  lcpImageUrl,
}: PreloadResourcesProps) {
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise run immediately
    const runPreload = () => {
      // Preload LCP image if provided
      if (lcpImageUrl) {
        const existingPreload = document.head.querySelector(
          `link[rel="preload"][href="${lcpImageUrl}"]`
        )
        if (!existingPreload) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = lcpImageUrl
          link.setAttribute('fetchpriority', 'high')
          // Insert at the beginning of head for highest priority
          document.head.insertBefore(link, document.head.firstChild)
        }
      }

      // Preconnect to Google Fonts for faster font loading
      const fontPreconnect = document.createElement('link')
      fontPreconnect.rel = 'preconnect'
      fontPreconnect.href = 'https://fonts.gstatic.com'
      fontPreconnect.crossOrigin = 'anonymous'
      if (
        !document.head.querySelector('link[href="https://fonts.gstatic.com"]')
      ) {
        document.head.appendChild(fontPreconnect)
      }
    }

    // Run immediately for critical resources
    runPreload()
  }, [lcpImageUrl])

  return null
}
