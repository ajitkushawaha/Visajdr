'use client'

import React, { useState, useEffect } from 'react'
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryOptimize'

interface BrandLogo {
  _id?: string
  name: string
  imagePath: string // Stores Cloudinary URL for PNG images
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

interface BrandProps {
  logos?: BrandLogo[]
}

const Brand = ({ logos: initialLogos }: BrandProps = {}) => {
  const [sectionContent, setSectionContent] =
    useState<BrandCollaborationSection>({
      title: 'Ascending To greater heights With Our Partnerships',
      subtitle: '',
      description: '',
      logos: initialLogos || [],
      status: 'active',
      order: 0,
    })

  useEffect(() => {
    if (initialLogos && initialLogos.length > 0) {
      setSectionContent(prev => ({ ...prev, logos: initialLogos }))
    } else {
      fetchBrandCollaborationContent()
    }
  }, [initialLogos])

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

  const logos = sectionContent.logos.filter(
    logo => logo.status === 'active' && logo.imagePath // Only show logos with imagePath (PNG only)
  )

  // Fallback logos if no CMS data - using Cloudinary URLs
  const fallbackLogos: BrandLogo[] = [
    {
      _id: '1',
      name: 'IXIGO',
      imagePath:
        'https://res.cloudinary.com/dosglhfhy/image/upload/v1757807686/brand-logos/ixigo-logo.png',
      website: '',
      status: 'active',
      order: 0,
    },
    {
      _id: '2',
      name: 'ACKO',
      imagePath:
        'https://res.cloudinary.com/dosglhfhy/image/upload/v1757807688/brand-logos/acko-logo.png',
      website: '',
      status: 'active',
      order: 1,
    },
    {
      _id: '3',
      name: 'SpiceJet',
      imagePath:
        'https://res.cloudinary.com/dosglhfhy/image/upload/v1757807689/brand-logos/spicejet-logo.png',
      website: '',
      status: 'active',
      order: 2,
    },
    {
      _id: '4',
      name: 'Razorpay',
      imagePath:
        'https://res.cloudinary.com/dosglhfhy/image/upload/v1757807690/brand-logos/razorpay-logo.png',
      website: '',
      status: 'active',
      order: 3,
    },
    {
      _id: '5',
      name: 'Zomato',
      imagePath:
        'https://res.cloudinary.com/dosglhfhy/image/upload/v1757807692/brand-logos/zomato-logo.png',
      website: '',
      status: 'active',
      order: 4,
    },
    {
      _id: '6',
      name: 'Company 6',
      imagePath: '',
      website: '',
      status: 'active',
      order: 5,
    },
    {
      _id: '7',
      name: 'Company 7',
      imagePath: '',
      website: '',
      status: 'active',
      order: 6,
    },
    {
      _id: '8',
      name: 'Company 8',
      imagePath: '',
      website: '',
      status: 'active',
      order: 7,
    },
    {
      _id: '9',
      name: 'Company 9',
      imagePath: '',
      website: '',
      status: 'active',
      order: 8,
    },
    {
      _id: '10',
      name: 'Company 10',
      imagePath: '',
      website: '',
      status: 'active',
      order: 9,
    },
  ]

  // Use the new fallback logos with PNG files
  const displayLogos = logos.length > 0 ? logos : fallbackLogos

  // Duplicate logos for seamless scrolling (3 sets)
  const scrollLogos = [...displayLogos, ...displayLogos, ...displayLogos]

  return (
    <div className="w-full overflow-hidden relative py-10">
      <div className="flex animate-scroll hover:pause-animation w-max">
        {scrollLogos.map((logo, index) => (
          <div
            key={`${logo._id || 'logo'}-${index}`}
            className="flex-shrink-0 flex flex-col items-center justify-center  p-4 mx-4 bg-white rounded-lg transition-transform duration-300 min-w-[150px] md:min-w-[180px] h-28"
          >
            {logo.imagePath ? (
              <div className="relative flex items-center justify-center gap-10 h-10">
                <img
                  src={(() => {
                    const imgUrl = logo.imagePath
                    if (imgUrl.includes('cloudinary.com')) {
                      return optimizeCloudinaryUrl(imgUrl, {
                        quality: 'auto:best',
                        format: 'auto',
                      })
                    }
                    return imgUrl
                  })()}
                  alt={logo.name}
                  style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                  loading="lazy"
                  onError={e => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && parent.nextElementSibling) {
                      parent.nextElementSibling.classList.remove('hidden')
                      parent.nextElementSibling.classList.add('flex')
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 w-32 bg-gray-200 rounded text-gray-500 text-sm font-medium">
                {logo.name}
              </div>
            )}
            <div className="hidden items-center justify-center h-16 w-32 bg-gray-200 rounded text-gray-500 text-xs">
              {logo.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Brand
