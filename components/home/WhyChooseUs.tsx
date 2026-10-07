'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  User,
  FileText,
  Calendar,
  Building2,
  Settings,
  Shield,
  Clock,
  CheckCircle,
  Star,
  Heart,
} from 'lucide-react'

interface WhyChooseUsFeature {
  title: string
  description: string
  icon: string
  backgroundColor?: string
  textColor?: string
  iconColor?: string
  status: 'active' | 'inactive'
  order: number
}

interface WhyChooseUsSection {
  title: string
  subtitle?: string
  description: string
  backgroundImage?: string
  features: WhyChooseUsFeature[]
}

// Icon mapping
const iconMap = {
  User,
  FileText,
  Calendar,
  Building2,
  Settings,
  Shield,
  Clock,
  CheckCircle,
  Star,
  Heart,
}

interface WhyChooseUSProps {
  initialData?: WhyChooseUsSection | null
}

function WhyChooseUS({ initialData }: WhyChooseUSProps = {}) {
  const defaultContent: WhyChooseUsSection = {
    title: 'Why are we famous?',
    subtitle: '',
    description:
      'At the Visa4, you can get help in solving a single issue or get a turnkey visa. Cooperation between the client and the visa consultant in India is possible both in person and remotely.',
    backgroundImage: '/visa/bg2.png',
    features: [],
  }

  // Initialize with server-side data if provided
  const [sectionContent, setSectionContent] = useState<WhyChooseUsSection>(
    initialData || defaultContent
  )

  useEffect(() => {
    // Only fetch if no server-side data provided
    if (initialData) {
      setSectionContent(initialData)
      return
    }

    fetchWhyChooseUsContent()
  }, [initialData])

  const fetchWhyChooseUsContent = async () => {
    try {
      const response = await fetch('/api/public/why-choose-us-content')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.whyChooseUsSection) {
          setSectionContent(data.whyChooseUsSection)
        }
      } else {
        console.warn('Failed to fetch why choose us content:', response.status)
      }
    } catch (err) {
      console.error('Error fetching why choose us content:', err)
    }
  }

  const renderIcon = (
    iconName: string,
    className: string,
    style?: React.CSSProperties
  ) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || User
    return (
      <IconComponent className={className} style={style} strokeWidth={1.5} />
    )
  }

  // Group features into rows of 3
  const firstRowFeatures = sectionContent.features.slice(0, 2)
  const secondRowFeatures = sectionContent.features.slice(2, 5)

  return (
    <section className="py-10 px-10 max-[600px]:px-0 min-h-screen">
      <div
        className="w-full h-full flex items-center justify-center rounded-xl bg-gray-100"
        style={{
          backgroundImage: `url('${sectionContent.backgroundImage || '/visa/bg2.png'}')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
        }}
      >
        <div className="w-4/5 py-20">
          {/* Services Grid */}
          <div className="space-y-8">
            {/* First Row - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Header Card */}
              <div className="rounded-3xl p-2 max-[600px]:p-0">
                <div className="text-[16px] flex items-center gap-2 font-medium text-gray-500 tracking-widest">
                  {sectionContent.title}{' '}
                  <Image
                    src="/visa/OBJECTS.png"
                    className="w-10 h-2"
                    alt="image"
                    width={40}
                    height={8}
                    quality={85}
                    sizes="40px"
                  />
                </div>

                {sectionContent.subtitle && (
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 py-6 leading-tight">
                    {sectionContent.subtitle}
                  </h1>
                )}
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  {sectionContent.description}
                </p>
              </div>

              {/* Feature Cards - First Row */}
              {firstRowFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-10 border border-gray-100 hover:bg-brand-primary hover:text-white transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-20 h-20 hover:bg-brand-primary rounded-full flex items-center justify-center mb-8 border transition-all duration-300  group-hover:border-white/20">
                    <div className="text-gray-600 group-hover:text-white transition-colors duration-300">
                      {renderIcon(feature.icon, 'w-9 h-9', {
                        color: 'currentColor',
                      })}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-900 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-xs md:text-sm text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Second Row - 3 Cards */}
            {secondRowFeatures.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {secondRowFeatures.map((feature, index) => (
                  <div
                    key={index + 2}
                    className="bg-white rounded-3xl p-10 border border-gray-100 hover:bg-brand-primary hover:text-white transition-all duration-300 cursor-pointer group"
                  >
                    <div className=" bg-white w-20 h-20 rounded-full flex items-center justify-center mb-8 border transition-all duration-300 group-hover:bg-brand-primary group-hover:border-white/20">
                      <div className="text-gray-600 group-hover:text-white transition-colors duration-300">
                        {renderIcon(feature.icon, 'w-9 h-9', {
                          color: 'currentColor',
                        })}
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-900 group-hover:text-white transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-xs md:text-sm text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUS
