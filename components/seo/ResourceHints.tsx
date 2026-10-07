/**
 * ResourceHints Component
 *
 * Adds preconnect and dns-prefetch hints for critical third-party domains
 * to reduce connection establishment time and improve page load performance.
 */

'use client'

import { useEffect } from 'react'

export default function ResourceHints() {
  useEffect(() => {
    // Check if links already exist to avoid duplicates
    const existingLinks = Array.from(
      document.head.querySelectorAll(
        'link[rel="preconnect"], link[rel="dns-prefetch"]'
      )
    )
    const existingHrefs = new Set(
      existingLinks.map(link => link.getAttribute('href'))
    )

    // Critical domains that need preconnect (full connection setup)
    // Preconnect establishes early connections to reduce latency
    const preconnectDomains = [
      { href: 'https://res.cloudinary.com', crossOrigin: true }, // Cloudinary images - critical for LCP
      { href: 'https://static.visa2fly.com', crossOrigin: true }, // Visa2fly country background images (JPG)
      { href: 'https://www.kwicklingo.com', crossOrigin: true }, // KwickLingo Chat widget
    ]

    // Domains that only need DNS prefetch (DNS lookup only, lighter than preconnect)
    const dnsPrefetchDomains = [
      'https://flagcdn.com', // Flag images
      'https://www.googletagmanager.com', // Google Analytics
      'https://www.google-analytics.com', // Google Analytics
      'https://fonts.googleapis.com', // Google Fonts
    ]

    // Preconnect to Google Fonts for faster font loading
    const googleFontsPreconnect = document.createElement('link')
    googleFontsPreconnect.rel = 'preconnect'
    googleFontsPreconnect.href = 'https://fonts.googleapis.com'
    if (
      !document.head.querySelector('link[href="https://fonts.googleapis.com"]')
    ) {
      document.head.appendChild(googleFontsPreconnect)
    }

    // Add preconnect links
    preconnectDomains.forEach(({ href, crossOrigin }) => {
      if (!existingHrefs.has(href)) {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = href
        if (crossOrigin) {
          link.crossOrigin = 'anonymous'
        }
        document.head.appendChild(link)
      }
    })

    // Add dns-prefetch links
    dnsPrefetchDomains.forEach(domain => {
      if (!existingHrefs.has(domain)) {
        const link = document.createElement('link')
        link.rel = 'dns-prefetch'
        link.href = domain
        document.head.appendChild(link)
      }
    })
  }, [])

  return null
}
