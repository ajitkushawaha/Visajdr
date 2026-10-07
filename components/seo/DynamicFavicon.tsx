'use client'

import { useEffect } from 'react'

export default function DynamicFavicon() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        // Fetch company logo from settings
        const response = await fetch(
          `/api/public/company-logo?t=${Date.now()}`,
          {
            cache: 'no-store',
          }
        )
        if (response.ok) {
          const data = await response.json()
          const faviconUrl =
            data.success && (data.data?.faviconUrl || data.data?.logoUrl)
          const logoUrl = faviconUrl

          if (logoUrl) {
            // Update all favicon links in the head
            const faviconRels = ['icon', 'shortcut icon', 'apple-touch-icon']
            let foundAndUpdated = false

            faviconRels.forEach(rel => {
              const links = document.querySelectorAll(
                `link[rel="${rel}"], link[rel*="${rel}"]`
              )
              if (links.length > 0) {
                links.forEach(link => {
                  const htmlLink = link as HTMLLinkElement
                  htmlLink.href = logoUrl
                })
                foundAndUpdated = true
              }
            })

            // If no links were found/updated, create default fallback icon link
            if (!foundAndUpdated) {
              const newLink = document.createElement('link')
              newLink.rel = 'icon'
              newLink.href = logoUrl
              document.head.appendChild(newLink)
            }
          }
        }
      } catch (error) {
        // Fallback to default favicon files if API fails
        console.error('Error fetching company logo for favicon:', error)
        // Keep default favicon_io files as fallback
      }
    }

    updateFavicon()
  }, [])

  return null
}
