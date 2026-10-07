'use client'

import React from 'react'

interface JsonLdProps {
  data: any
  id?: string
}

/**
 * A reusable component to inject JSON-LD structured data into the page.
 * Uses the Next.js recommended way of injecting structured data.
 */
export default function JsonLd({ data, id }: JsonLdProps) {
  if (!data) return null

  return (
    <script
      id={id || 'json-ld-structured-data'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
