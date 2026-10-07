'use client'
import React, { useState, useEffect } from 'react'
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryOptimize'
import { Star } from 'lucide-react'

interface CTAStatCard {
  _id?: string
  title: string
  value: string
  description: string
  backgroundColor: string
  textColor?: string
  order: number
  status: 'active' | 'inactive'
}

interface CTASection {
  _id?: string
  iconPath: string
  badgeText: string
  title: string
  subtitle?: string
  backgroundImagePath: string
  backgroundColor?: string
  stats: CTAStatCard[]
  status: 'active' | 'inactive'
  order: number
}

interface CTASectionProps {
  initialData?: CTASection | null
}

const CTASection = ({ initialData }: CTASectionProps = {}) => {
  const defaultContent: CTASection = {
    iconPath: '/visa/Frame.png',
    badgeText: 'Process Overview',
    title: 'We Trust The Process do you?',
    subtitle: '',
    backgroundImagePath: '/visa/trustbg.png',
    backgroundColor: '#F8F7FA',
    stats: [
      {
        title: 'Google Rating',
        value: '4.8',
        description: 'Google Rating',
        backgroundColor: '#C91E24', // Darker red for better contrast
        textColor: 'white',
        order: 0,
        status: 'active',
      },
      {
        title: 'Visa Approval Rate',
        value: '99.3%',
        description: 'Visa Approval Rate',
        backgroundColor: '#07034F',
        textColor: 'white',
        order: 1,
        status: 'active',
      },
      {
        title: 'Visa Processed',
        value: '40000+',
        description: 'Visa Processed',
        backgroundColor: '#D9731A', // Darker orange for better contrast
        textColor: 'white',
        order: 2,
        status: 'active',
      },
    ],
    status: 'active',
    order: 0,
  }

  // Initialize with server-side data if provided
  const [sectionContent, setSectionContent] = useState<CTASection>(
    initialData || defaultContent
  )
  const [loading, setLoading] = useState(!initialData)

  useEffect(() => {
    // Only fetch if no server-side data provided
    if (initialData) {
      setSectionContent(initialData)
      setLoading(false)
      return
    }

    fetchCTASectionContent()
  }, [initialData])

  const fetchCTASectionContent = async () => {
    try {
      const response = await fetch('/api/public/cta-section-content')
      const data = await response.json()

      if (data.success && data.ctaSection) {
        setSectionContent(data.ctaSection)
      }
    } catch (error) {
      console.error('Error fetching CTA section content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="w-full flex flex-col items-center justify-center py-10 max-[600px]:py-0">
        <div className="w-11/12 max-[600px]:w-full rounded-3xl shadow-sm bg-gray-100 flex flex-col items-center gap-5 py-12 px-6 min-h-[400px]">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Filter active stats and sort by order
  const activeStats = sectionContent.stats
    .filter(stat => stat.status === 'active')
    .sort((a, b) => a.order - b.order)

  return (
    <section className="w-full flex flex-col items-center justify-center py-10 max-[600px]:py-0">
      <div
        className="w-11/12 max-[600px]:w-full  flex flex-col items-center gap-5 py-12 px-6"
       
      >
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            {sectionContent.iconPath && (
              <img
                src={(() => {
                  const imgUrl = sectionContent.iconPath
                  if (imgUrl.includes('cloudinary.com')) {
                    return optimizeCloudinaryUrl(imgUrl, {
                      quality: 'auto:good',
                      format: 'auto',
                    })
                  }
                  return imgUrl
                })()}
                alt="Process Icon"
                style={{ height: 16, width: 'auto' }}
                loading="lazy"
              />
            )}
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-600">
              {sectionContent.badgeText}
            </p>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {sectionContent.title}
          </h2>
          {sectionContent.subtitle && (
            <p className="text-sm text-gray-600 mt-2">
              {sectionContent.subtitle}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl ">
          {activeStats.map((stat, index) => (
            <div
              key={stat._id || index}
              className="flex flex-col justify-center rounded-xl p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <h4 className="text-xs font-bold text-green-600 uppercase mb-3 tracking-wider">
                {stat.title}
              </h4>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-5xl font-bold text-gray-900 tracking-tight">
                  {stat.value}
                </h3>
                {(stat.title.toLowerCase().includes('rating') ||
                  stat.value.includes('4.')) && (
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CTASection
