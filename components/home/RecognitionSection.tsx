import React from 'react'

interface Partner {
  _id?: string
  img: string
  alt: string
  text: string
  order: number
  status: 'active' | 'inactive'
}

interface RecognitionSectionProps {
  initialData?: {
    title: string
    partners: Partner[]
  } | null
}

const RecognitionSection = ({ initialData }: RecognitionSectionProps) => {
  // Use server-provided data or fallback to defaults (useful during development/loading)
  const title =
    initialData?.title || 'Recognized by global travel and data partners'

  // If we have initialData with partners, use them (filtering for active ones just in case backend didn't)
  // Otherwise fall back to hardcoded defaults
  const partners = initialData?.partners
    ?.filter(p => p.status === 'active')
    .sort((a, b) => a.order - b.order) || [
    {
      img: '/india.png',
      alt: 'Ministry of Tourism, India',
      text: 'Officially recognised by the Ministry of Tourism, India.',
    },
    {
      img: '/south.png',
      alt: 'Department: Home Affairs Republic of South Africa',
      text: 'Authorised partner for smooth, compliant South Africa visa processing.',
    },
    {
      img: '/aico.png',
      alt: 'AICPA SOC',
      text: 'Your data stays private and secure with global SOC 2 standards.',
    },
  ]

  // If initialData was explicitly null (e.g. inactive section), we might want to return null
  // But usually we just render with defaults or empty if no partners
  if (
    initialData &&
    (!initialData.partners || initialData.partners.length === 0)
  ) {
    // Optional: Render nothing if explicitly empty from CMS
    // return null
  }

  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#2D2D2D] mb-12">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-8 flex flex-col items-start gap-8 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full flex items-center justify-start min-h-[60px]">
                <img
                  src={partner.img}
                  alt={partner.alt}
                  className="w-auto h-auto max-h-[80px] object-contain object-left"
                />
              </div>
              <p className="text-[#2D2D2D] text-[15px] font-semibold leading-relaxed">
                {partner.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecognitionSection
