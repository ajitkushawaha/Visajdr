'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface TrustVisaAgentSectionData {
  title: string
  content: string
  highlightedTexts?: Array<{
    text: string
    color: string
  }>
  imageUrl?: string
  imageAlt?: string
}

interface TrustVisaAgentSectionProps {
  initialData?: TrustVisaAgentSectionData | null
}

const TrustVisaAgentSection = ({
  initialData,
}: TrustVisaAgentSectionProps = {}) => {
  const defaultData: TrustVisaAgentSectionData = {
    title: 'How to choose the best visa agent in India whom you can trust?',
    content: `Before you start your online visa application, it's important to know the basic requirements that can make the process faster and smoother. Preparing in advance not only saves time but also improves your chances of approval when you apply for visa online.

Most countries require a valid passport with at least six months' validity and enough blank pages for visa stamps. You should also keep recent passport-sized photos that meet embassy guidelines. Depending on your purpose of travel, you may need financial proof such as bank statements, travel insurance, or supporting documents like admission letters for students or business invitations for professionals.

To get help from real professionals and save yourself from incompetent specialists, you need to take a responsible approach to choosing a visa agent in India.

Study the average cost in this area in advance, and then find out which services are included in the final price and whether you need all of them. A responsible agency does not throw around unfounded promises, so if the advertisement states 100% visa approval, then think twice about the reliability of such specialists. Very often, this promise means that the company will reimburse all the client's expenses if it is not possible to obtain entry permission.

Consultation first, payment later! Conscientious visa consultancy services, like Visa4, first conduct a personal conversation with the client, find out the nuances of his situation and only then announce the likelihood of obtaining an entry permit.

Of course, today every person can get a visa independently. But if you need to minimize the likelihood of a visa refusal, if you need to reduce the time to collect all the documents, then find the best visa agent in India in advance who has been working in this segment for many years and knows all the intricacies of tourist visa, student visa, and business visa.`,
    highlightedTexts: [
      { text: 'apply for visa online', color: 'text-blue-600' },
      { text: 'valid passport', color: 'text-green-600' },
      { text: 'financial proof', color: 'text-purple-600' },
      { text: '100% visa approval', color: 'text-red-600' },
    ],
    imageUrl: '/visa/rocket.png',
    imageAlt: 'Rocket Illustration',
  }

  // Initialize with server-side data if provided
  const [sectionData, setSectionData] = useState<TrustVisaAgentSectionData>(
    initialData || defaultData
  )

  useEffect(() => {
    // Only fetch if no server-side data provided
    if (initialData) {
      setSectionData(initialData)
      return
    }

    fetchTrustVisaAgentContent()
  }, [initialData])

  const fetchTrustVisaAgentContent = async () => {
    try {
      const response = await fetch('/api/public/trust-visa-agent-content')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.trustVisaAgentSection) {
          setSectionData(data.trustVisaAgentSection)
        }
      } else {
        console.warn(
          'Failed to fetch trust visa agent content:',
          response.status
        )
      }
    } catch (err) {
      console.error('Error fetching trust visa agent content:', err)
    }
  }

  const renderContentWithHighlights = (
    content: string,
    highlights: Array<{ text: string; color: string }>
  ) => {
    let processedContent = content.replace(/\n/g, '<br>')

    highlights.forEach(highlight => {
      if (highlight.text.trim()) {
        const regex = new RegExp(
          `(${highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
          'gi'
        )
        processedContent = processedContent.replace(
          regex,
          `<span class="${highlight.color} font-semibold">$1</span>`
        )
      }
    })

    return processedContent
  }

  return (
    <section className=" bg-white px-20 max-[600px]:px-8 pb-3 md:px-10">
      <div
        className={`w-4/5 max-[600px]:w-full mx-auto grid md:grid-cols-2 gap-12 items-center`}
      >
        {/* Left Text Content */}
        <div className={``}>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {sectionData.title}
          </h2>

          <div className="text-gray-700 text-[8px] md:text-base ">
            <div
              className="whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: renderContentWithHighlights(
                  sectionData.content,
                  sectionData.highlightedTexts || []
                ),
              }}
            />
          </div>
        </div>

        {/* Right Image Card */}
        <div className={`relative`}>
          <div className="relative w-full max-w-md mx-auto">
            <Image
              src={sectionData.imageUrl || '/visa/rocket.png'}
              alt={sectionData.imageAlt || 'Rocket Illustration'}
              width={500}
              height={500}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustVisaAgentSection
