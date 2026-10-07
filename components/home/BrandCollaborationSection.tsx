'use client'

import React, { useState, useEffect } from 'react'
import Brand from '@/components/home/Brand'

interface BrandLogo {
  _id?: string
  name: string
  imagePath: string
  website?: string
  status: 'active' | 'inactive'
  order: number
}

interface BrandCollaborationSection {
  title: string
  subtitle?: string
  description?: string
  logos: BrandLogo[]
  status: 'active' | 'inactive'
  order: number
}

interface BrandCollaborationSectionProps {
  initialData?: BrandCollaborationSection | null
}

function BrandCollaborationSection({
  initialData,
}: BrandCollaborationSectionProps = {}) {
  const defaultContent: BrandCollaborationSection = {
    title: 'Ascending To greater heights With Our Partnerships',
    subtitle: '',
    description: '',
    logos: [],
    status: 'active',
    order: 0,
  }

  // Initialize with server-side data if provided
  const [sectionContent, setSectionContent] =
    useState<BrandCollaborationSection>(initialData || defaultContent)

  useEffect(() => {
    // Only fetch if no server-side data provided
    if (initialData) {
      setSectionContent(initialData)
      return
    }

    fetchBrandCollaborationContent()
  }, [initialData])

  const fetchBrandCollaborationContent = async () => {
    try {
      const response = await fetch('/api/public/brand-collaboration-content')
      const data = await response.json()

      if (data.success) {
        setSectionContent(data.brandCollaboration)
      }
    } catch (error) {
      console.error('Error fetching brand collaboration content:', error)
    }
  }

  return (
    <section className="py-10 bg-white flex flex-col items-center max-[600px]:px-5">
      <h1 className="py-5 text-lg md:text-3xl font-bold">
        {sectionContent.title}
      </h1>
      {sectionContent.subtitle && (
        <h2 className="text-lg text-gray-600 mb-4">
          {sectionContent.subtitle}
        </h2>
      )}
      {sectionContent.description && (
        <p className="text-gray-600 text-center mb-6">
          {sectionContent.description}
        </p>
      )}
      <Brand logos={sectionContent.logos} />
    </section>
  )
}

export default BrandCollaborationSection
