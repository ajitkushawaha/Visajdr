'use client'

import { useEffect } from 'react'

interface MetaTagsProps {
  googleSiteVerification?: string
}

export default function MetaTags({ googleSiteVerification }: MetaTagsProps) {
  useEffect(() => {
    if (!googleSiteVerification || googleSiteVerification.trim() === '') {
      return
    }

    // Check if meta tag already exists
    const existingMeta = document.querySelector(
      'meta[name="google-site-verification"]'
    )

    if (existingMeta) {
      // Update existing meta tag
      existingMeta.setAttribute('content', googleSiteVerification.trim())
      return
    }

    // Create and inject new meta tag
    const metaTag = document.createElement('meta')
    metaTag.setAttribute('name', 'google-site-verification')
    metaTag.setAttribute('content', googleSiteVerification.trim())
    document.head.appendChild(metaTag)
  }, [googleSiteVerification])

  return null // This component doesn't render anything
}
