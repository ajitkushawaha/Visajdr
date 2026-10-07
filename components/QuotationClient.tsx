'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Calendar, Clock, User } from 'lucide-react'
import AccordionItem from '@/components/ui/AccordionItem'
import { slugify } from '@/utils/slugify'
import { useSession } from 'next-auth/react'
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryOptimize'

// Function to generate beautiful gradients for different countries
function getCountryGradient(countryName: string) {
  const gradients: { [key: string]: { from: string; to: string } } = {
    Dubai: { from: '#FF6B6B', to: '#4ECDC4' },
    UAE: { from: '#667eea', to: '#764ba2' },
    Singapore: { from: '#f093fb', to: '#f5576c' },
    Thailand: { from: '#4facfe', to: '#00f2fe' },
    Malaysia: { from: '#43e97b', to: '#38f9d7' },
    Indonesia: { from: '#fa709a', to: '#fee140' },
    Japan: { from: '#a8edea', to: '#fed6e3' },
    'South Korea': { from: '#ff9a9e', to: '#fecfef' },
    China: { from: '#ffecd2', to: '#fcb69f' },
    'Hong Kong': { from: '#a18cd1', to: '#fbc2eb' },
    Philippines: { from: '#ffecd2', to: '#fcb69f' },
    Vietnam: { from: '#ff9a9e', to: '#fad0c4' },
    Cambodia: { from: '#a8edea', to: '#fed6e3' },
    Laos: { from: '#d299c2', to: '#fef9d7' },
    Myanmar: { from: '#89f7fe', to: '#66a6ff' },
    'Sri Lanka': { from: '#fdbb2d', to: '#22c1c3' },
    Maldives: { from: '#ff9a9e', to: '#fecfef' },
    Nepal: { from: '#a8edea', to: '#fed6e3' },
    Bhutan: { from: '#ffecd2', to: '#fcb69f' },
    Bangladesh: { from: '#667eea', to: '#764ba2' },
    Pakistan: { from: '#f093fb', to: '#f5576c' },
    Afghanistan: { from: '#4facfe', to: '#00f2fe' },
    Iran: { from: '#43e97b', to: '#38f9d7' },
    Iraq: { from: '#fa709a', to: '#fee140' },
    Turkey: { from: '#a8edea', to: '#fed6e3' },
    Russia: { from: '#ff9a9e', to: '#fad0c4' },
    Kazakhstan: { from: '#d299c2', to: '#fef9d7' },
    Uzbekistan: { from: '#89f7fe', to: '#66a6ff' },
    Kyrgyzstan: { from: '#fdbb2d', to: '#22c1c3' },
    Tajikistan: { from: '#ff9a9e', to: '#fecfef' },
    Turkmenistan: { from: '#a8edea', to: '#fed6e3' },
    Mongolia: { from: '#ffecd2', to: '#fcb69f' },
    'North Korea': { from: '#667eea', to: '#764ba2' },
    Taiwan: { from: '#f093fb', to: '#f5576c' },
    Macau: { from: '#4facfe', to: '#00f2fe' },
    Brunei: { from: '#43e97b', to: '#38f9d7' },
    'East Timor': { from: '#fa709a', to: '#fee140' },
    'Papua New Guinea': { from: '#a8edea', to: '#fed6e3' },
    Fiji: { from: '#ff9a9e', to: '#fad0c4' },
    Samoa: { from: '#d299c2', to: '#fef9d7' },
    Tonga: { from: '#89f7fe', to: '#66a6ff' },
    Vanuatu: { from: '#fdbb2d', to: '#22c1c3' },
    'Solomon Islands': { from: '#ff9a9e', to: '#fecfef' },
    Palau: { from: '#a8edea', to: '#fed6e3' },
    'Marshall Islands': { from: '#ffecd2', to: '#fcb69f' },
    Micronesia: { from: '#667eea', to: '#764ba2' },
    Kiribati: { from: '#f093fb', to: '#f5576c' },
    Nauru: { from: '#4facfe', to: '#00f2fe' },
    Tuvalu: { from: '#43e97b', to: '#38f9d7' },
  }

  // Try to find exact match first
  if (gradients[countryName]) {
    return gradients[countryName]
  }

  // Try to find partial match
  const partialMatch = Object.keys(gradients).find(
    key =>
      countryName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(countryName.toLowerCase())
  )

  if (partialMatch) {
    return gradients[partialMatch]
  }

  // Default gradient for unknown countries
  return { from: '#667eea', to: '#764ba2' }
}

type Props = {
  country?: string
  readableCountry: string
  visaInfo: {
    type?: string
    stay?: string
    validity?: string
    entry?: string
    price?: string
    appointmentTime?: string
    documents?: string
    detail?: string
    category?: string
  }
  countryImage?: string
  countryCode?: string
}

export default function QuotationClient({
  readableCountry,
  visaInfo,
  countryImage,
  countryCode,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [activeSection, setActiveSection] = useState('planDetails')
  const params = useParams()
  const slug = params?.country as string
  let [country, countryId] = slug ? slug.split('-') : [undefined, undefined]
  const sidebarItems = [
    { id: 'planDetails', label: 'Plan Details' },
    { id: 'planDisclaimer', label: 'Plan Disclaimer' },
    { id: 'visaSchedule', label: 'Visa Schedule' },
    { id: 'documentsRequired', label: 'Documents Required' },
    { id: 'importantInformation', label: 'Important Information' },
    { id: 'faq', label: 'FAQ' },
  ]

  useEffect(() => {
    const sections = document.querySelectorAll('section')
    const observer = new IntersectionObserver(
      entries => {
        for (let entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0.1 }
    )
    sections.forEach(section => observer.observe(section))
    return () => sections.forEach(section => observer.unobserve(section))
  }, [])

  return (
    <div className="min-h-screen bg-theme-light-green py-24">
      <div className="flex w-4/5 max-[600px]:w-[90%]  mx-auto">
        {/* Sidebar */}
        <aside className="w-1/4 sticky top-24 bg-white shadow-sm h-screen rounded-lg max-[600px]:hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-brand-primary">
              {readableCountry} Visa Application
            </h1>
            <p className="text-gray-600 mt-1">Your Plan Summary is Here</p>
          </div>
          <nav className="p-6">
            <ul className="space-y-1">
              {sidebarItems.map(item => (
                <li className="py-3" key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`mb-6 w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <main className="w-3/4 max-[600px]:w-full p-2">
          <div className="p-6 border-b block sm:hidden">
            <h1 className="text-2xl font-bold text-brand-primary">
              {readableCountry} Visa Application
            </h1>
            <p className="text-gray-600 mt-1">Your Plan Summary is Here</p>
          </div>

          {/* Banner */}
          <section
            id="planDetails"
            className="relative h-48 overflow-hidden rounded-lg"
          >
            {countryImage ? (
              <>
                <Image
                  src={(() => {
                    const imgUrl = countryImage
                    if (imgUrl.includes('cloudinary.com')) {
                      return optimizeCloudinaryUrl(imgUrl, {
                        width: 1200,
                        height: 400,
                        quality: 'auto:good',
                        format: 'auto',
                      })
                    }
                    return imgUrl
                  })()}
                  alt={`${readableCountry} landmark`}
                  className="w-full h-full object-cover"
                  width={1200}
                  height={400}
                  sizes="100vw"
                  quality={85}
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, 
                    ${getCountryGradient(readableCountry).from} 0%, 
                    ${getCountryGradient(readableCountry).to} 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center text-white">
                  <h2 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">
                    {readableCountry}
                  </h2>
                  <p className="text-lg md:text-xl opacity-90 drop-shadow-md">
                    Visa Application
                  </p>
                  {countryCode && (
                    <div className="mt-3 text-sm opacity-75">
                      {countryCode.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
          {/* Appointment Highlight */}
          <div className="bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-secondary/20 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-brand-secondary" />
            </div>
            <span className="text-brand-primary text-sm">
              Get your visa appointment date picked within 3 working days or get
              a full refund.
            </span>
          </div>

          {/* Plan Summary */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-sm text-brand-primary font-medium">
                Get your appointment in {visaInfo.appointmentTime || 'N/A'}
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600">
                {visaInfo.type?.toUpperCase() || 'N/A'}
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600">
                {visaInfo.category?.toUpperCase() || 'N/A'}{' '}
              </button>
              <div className="ml-auto flex items-center gap-2">
                <User className="w-4 h-4 text-brand-primary" />
                <span className="font-bold text-xl text-brand-primary">
                  {visaInfo.price || 'N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 max-[600px]:grid-cols-1 gap-6 text-center">
              <div className="bg-gray-50 rounded-lg p-4 max-[600px]:flex max-[600px]:items-center max-[600px]:justify-between">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Visa Type
                </div>
                <div className="font-semibold text-gray-900 capitalize">
                  {visaInfo.type || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-[600px]:flex max-[600px]:items-center max-[600px]:justify-between">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Stay
                </div>
                <div className="font-semibold text-gray-900">
                  {visaInfo.stay || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-[600px]:flex max-[600px]:items-center max-[600px]:justify-between">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Validity
                </div>
                <div className="font-semibold text-gray-900">
                  {visaInfo.validity || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-[600px]:flex max-[600px]:items-center max-[600px]:justify-between">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Entry Type
                </div>
                <div className="font-semibold text-gray-900 capitalize">
                  {visaInfo.entry || 'N/A'}
                </div>
              </div>
            </div>
          </section>
          {/* Plan Disclaimer */}
          <section id="planDisclaimer" className="mb-8">
            <h2 className="text-xl font-semibold text-brand-primary mb-4">
              Plan Disclaimer
            </h2>
            <div className="bg-white rounded-lg border p-6">
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>
                  The processing time will start from the time of submission of
                  the application
                </li>
                <li>
                  Visa fee of 90 EUR to be submitted by the applicant at the
                  time of biometrics.
                </li>
                <li>Business Days: Monday to Friday</li>
                <li>Prices are subject to change without notice</li>
                <li>
                  Appointment dates depend on availability and may vary by
                  location.
                </li>
              </ol>
            </div>
          </section>
          {/* Visa Schedule & Timings */}
          <section
            id="visaSchedule"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Visa Schedule */}
            <div>
              <h2 className="text-xl font-semibold text-brand-primary mb-4">
                Visa Schedule
              </h2>
              <div className="bg-white rounded-lg border p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-brand-secondary rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-brand-secondary">
                          01 Aug, 2025
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Process initiation
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Our representative will connect with you, if required.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-brand-secondary rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-brand-secondary">
                          04 Aug, 2025
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Application review
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-brand-secondary rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-brand-secondary">
                          07 Aug, 2025
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Appointment picked
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-brand-secondary">
                          To be Confirmed
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Day of biometric
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="text-brand-primary text-sm font-medium mt-4 hover:underline">
                  View More
                </button>
              </div>
            </div>

            {/* Timings & Holidays */}
            <div>
              <h2 className="text-xl font-semibold text-brand-primary mb-4">
                Timings & Holidays
              </h2>
              <div className="bg-white rounded-lg border p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">
                      Operating Schedule
                    </h3>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">Visa4:</span> 10.00 A.M-7.00
                      P.M (Mon-Sat)
                    </p>
                    <p>
                      <span className="font-medium">Embassy:</span> 9.00
                      A.M-5.00 P.M (Mon-Fri)
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">
                      Public Holidays
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    Visa processing timelines may vary as per public holidays
                    observed in both India and your intended destination
                    country.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Accordion Sections */}
          <AccordionItem id="documentsRequired" title="Documents Required">
            {`This document checklist is standard but not exhaustive. The Embassy reserves the right to request additional documents based on specific use cases.
           
                       📌 Passport
                       - Original passport issued within 10 years
                       - Valid for 6 months beyond the last intended date of departure from France
                       - At least 2 blank visa pages
                       - No alterations in data pages
                       
                       📌 Photograph
                       - Three recent colored passport size (35x45mm) photographs
                       - Plain white background
                       - No scanned or unclear images
                       
                       📌 Accommodation
                       - Hotel or Cruise voucher
                       - Invitation letter + ID + financials if staying with friend/relative
                       
                       📌 Flight Ticket
                       - Confirmed round-trip flight reservations
                       
                       📌 Itinerary
                       - Day-wise itinerary or travel agent letter
                       
                       📌 Travel Insurance
                       - Minimum 30,000 Euros / 50,000 USD coverage
                       - Must cover entire stay in Schengen territory
                       
                       📌 Funds
                       - Last 6 months bank statement (attested)
                       - Recent, dated within 1 week
                       
                       📌 ITR
                       - Last 3 years of returns
                       
                       📌 Cover Letter
                       - A4 paper (employed) or business letterhead (self-employed)
                       
                       📌 Employment Letter
                       - On official letterhead with employment details
                       
                       📌 NOC
                       - From school/college with ID copy (for students)
                       
                       📌 GST Copy
                       - If self-employed
                       
                       📌 Leave Letter
                       - From company with employment ID
                       
                       📌 Biometric
                       - Mandatory for first-time Schengen applicants`}
          </AccordionItem>

          <AccordionItem
            id="importantInformation"
            title="Important Information"
          >
            {`- Application must be submitted at least 15 working days before travel.
                         - Visa fee is non-refundable.
                         - Submitting all documents does not guarantee visa approval.`}
          </AccordionItem>

          <AccordionItem id="faq" title="FAQ's">
            {`Q: How long does visa processing take?
                        A: Usually 15 working days.
                        
                        Q: Can I submit documents via email?
                        A: No, physical submission is mandatory.
                        
                        Q: What if I don’t have all documents?
                        A: Incomplete applications may lead to rejection.`}
          </AccordionItem>

          {/* Buttons */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={() => {
                const purpose = searchParams.get('purpose') || ''
                const returnTo = `/apply?step=1&country=${slugify(readableCountry)}-${countryId}${purpose ? `&purpose=${encodeURIComponent(purpose)}` : ''}`
                if (!session) {
                  localStorage.setItem('postLoginRedirect', returnTo)
                  router.push(
                    `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
                  )
                } else {
                  router.push(returnTo)
                }
              }}
              className="px-4 py-2 bg-brand-secondary text-white rounded hover:bg-brand-accent"
            >
              Continue
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
