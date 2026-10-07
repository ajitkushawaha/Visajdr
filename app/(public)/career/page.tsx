// app/career/page.tsx

import React from 'react'
// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Users,
  Heart,
  Zap,
  Shield,
  Briefcase,
  GraduationCap,
  Coffee,
  Laptop,
  TrendingUp,
  Award,
  Target,
} from 'lucide-react'
import Link from 'next/link'
import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/career')
  return generateSEOMetadata(seoData)
}

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description:
      'Comprehensive health insurance, wellness programs, and mental health support for you and your family.',
  },
  {
    icon: Laptop,
    title: 'Flexible Work',
    description:
      'Hybrid work options, flexible hours, and modern equipment to help you work efficiently.',
  },
  {
    icon: GraduationCap,
    title: 'Learning & Development',
    description:
      'Continuous learning opportunities, skill development programs, and conference attendance support.',
  },
  {
    icon: Coffee,
    title: 'Work-Life Balance',
    description:
      'Generous PTO, team outings, recreational activities, and a supportive work environment.',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description:
      'Clear career progression paths, mentorship programs, and leadership development opportunities.',
  },
  {
    icon: Award,
    title: 'Recognition & Rewards',
    description:
      'Performance bonuses, employee recognition programs, and competitive compensation packages.',
  },
]

export const revalidate = 0

export default async function CareersPage() {
  // Fetch CMS content
  let pageData = null
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/public/career-content`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
    if (response.ok) {
      const data = await response.json()
      pageData = data.data
    }
  } catch (error) {
    console.error('Error fetching career content:', error)
  }

  // Fetch job positions
  let openPositions = []
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/public/career`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (res.ok) {
      openPositions = await res.json()
    } else {
      console.error('Failed to fetch career data:', res.status)
    }
  } catch (error) {
    console.error('Error fetching career data:', error)
    openPositions = []
  }

  // Use CMS data or fallback to default
  const content = pageData || {
    heroTitle: 'Join Our Mission to Simplify Global Travel',
    heroSubtitle:
      "Be part of a dynamic team that's revolutionizing visa processing and making international travel accessible to everyone. Grow your career while making a meaningful impact on travelers worldwide.",
    heroPrimaryButtonText: 'View Open Positions',
    heroPrimaryButtonLink: '#open-positions',
    heroSecondaryButtonText: 'Apply Now',
    heroSecondaryButtonLink: '/career/apply',
    companyStats: [
      { number: '200+', label: 'Team Members' },
      { number: '60+', label: 'Countries Served' },
      { number: '98%', label: 'Employee Satisfaction' },
      { number: '5+', label: 'Office Locations' },
    ],
    openPositionsTitle: 'Open Positions',
    openPositionsSubtitle:
      "Discover exciting opportunities to grow your career with us. We're always looking for talented individuals who share our passion for excellence.",
    benefitsTitle: 'Why Work With Us?',
    benefitsSubtitle:
      'We offer comprehensive benefits and a supportive work environment that helps you thrive both personally and professionally.',
    benefits: [
      {
        icon: 'Heart',
        title: 'Health & Wellness',
        description:
          'Comprehensive health insurance, wellness programs, and mental health support for you and your family.',
      },
      {
        icon: 'Laptop',
        title: 'Flexible Work',
        description:
          'Hybrid work options, flexible hours, and modern equipment to help you work efficiently.',
      },
      {
        icon: 'GraduationCap',
        title: 'Learning & Development',
        description:
          'Continuous learning opportunities, skill development programs, and conference attendance support.',
      },
      {
        icon: 'Coffee',
        title: 'Work-Life Balance',
        description:
          'Generous PTO, team outings, recreational activities, and a supportive work environment.',
      },
      {
        icon: 'TrendingUp',
        title: 'Career Growth',
        description:
          'Clear career progression paths, mentorship programs, and leadership development opportunities.',
      },
      {
        icon: 'Award',
        title: 'Recognition & Rewards',
        description:
          'Performance bonuses, employee recognition programs, and competitive compensation packages.',
      },
    ],
    valuesTitle: 'Our Values',
    valuesSubtitle:
      'These core values guide everything we do and shape our company culture.',
    companyValues: [
      {
        icon: 'Target',
        title: 'Customer First',
        description:
          'We prioritize customer satisfaction and success in everything we do.',
      },
      {
        icon: 'Users',
        title: 'Team Collaboration',
        description:
          'We believe in the power of teamwork and collective achievement.',
      },
      {
        icon: 'Zap',
        title: 'Innovation',
        description:
          'We continuously innovate to improve our services and processes.',
      },
      {
        icon: 'Shield',
        title: 'Integrity',
        description:
          'We maintain the highest standards of honesty and transparency.',
      },
    ],
    applicationProcessTitle: 'Our Hiring Process',
    applicationProcessSubtitle:
      "We've designed a straightforward and transparent hiring process to help you succeed.",
    applicationSteps: [
      {
        number: '1',
        title: 'Apply Online',
        description: 'Submit your application through our careers portal',
      },
      {
        number: '2',
        title: 'Initial Screening',
        description:
          'HR team reviews your profile and conducts initial screening',
      },
      {
        number: '3',
        title: 'Technical Interview',
        description: 'Meet with the hiring manager and team members',
      },
      {
        number: '4',
        title: 'Final Decision',
        description: 'Receive offer and join our amazing team',
      },
    ],
    ctaTitle: 'Ready to Start Your Journey?',
    ctaSubtitle:
      'Join our team and help us revolutionize the visa processing industry while building your dream career.',
    ctaPrimaryButtonText: 'Browse All Positions',
    ctaSecondaryButtonText: 'Apply Now',
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center bg-brand-primary px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white text-balance">
                {content.heroTitle}
              </h1>
              <p className="text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
                {content.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link href={content.heroPrimaryButtonLink}>
                <Button
                  size="lg"
                  className="bg-white text-brand-primary hover:bg-white/90 font-semibold px-6 py-3 rounded-lg"
                >
                  {content.heroPrimaryButtonText}
                </Button>
              </Link>
              <Link href={content.heroSecondaryButtonLink}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent border px-6 py-3 rounded-lg"
                >
                  {content.heroSecondaryButtonText}
                </Button>
              </Link>
            </div>

            {/* Company Stats */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
              {content.companyStats.map(
                (stat: { number: string; label: string }, index: number) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold">{stat.number}</p>
                    <p className="text-sm text-white/80">{stat.label}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section
        id="open-positions"
        className="max-w-5xl mx-auto  py-16 px-4 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {content.openPositionsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {content.openPositionsSubtitle}
            </p>
          </div>

          {Array.isArray(openPositions) && openPositions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {openPositions.map((position, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-brand-accent/10 text-brand-accent"
                        >
                          {position.categories}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-brand-accent/30 text-brand-accent"
                        >
                          {position.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {position.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {position.experience}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {position.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm text-gray-900">
                      Requirements:
                    </h4>
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {position.requirements}
                    </div>
                  </div>

                  <Link href="/career/apply" className="block">
                    <Button className="w-full bg-brand-accent hover:bg-brand-primary text-white font-semibold">
                      Apply Now →
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No open positions at the moment
              </h3>
              <p className="text-gray-500">
                Check back soon for new opportunities
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Don't see a position that matches your skills? We're always
              interested in hearing from talented individuals.
            </p>
            <Link href="/career/apply">
              <Button
                variant="outline"
                size="lg"
                className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
              >
                Send Us Your Resume
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {content.benefitsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {content.benefitsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.benefits.map(
              (
                benefit: { icon: string; title: string; description: string },
                index: number
              ) =>
                (() => {
                  const IconComponent =
                    benefits.find(b => b.title === benefit.title)?.icon || Heart
                  return (
                    <div
                      key={index}
                      className="p-6 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200"
                    >
                      <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6 text-brand-accent" />
                      </div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  )
                })()
            )}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {content.valuesTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {content.valuesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.companyValues.map(
              (
                value: { icon: string; title: string; description: string },
                index: number
              ) => (
                <div
                  key={index}
                  className="flex gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-brand-accent transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {value.title}
                    </h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {content.applicationProcessTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {content.applicationProcessSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {content.applicationSteps.map(
              (
                step: { number: string; title: string; description: string },
                index: number
              ) => (
                <div key={index} className="relative">
                  <div className="p-6 text-center h-full bg-white rounded-lg border border-gray-200 hover:border-brand-accent transition-colors">
                    <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-semibold mb-2 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-brand-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight text-balance">
            {content.ctaTitle}
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            {content.ctaSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#open-positions">
              <Button
                size="lg"
                className="bg-white text-brand-primary hover:bg-white/90 font-semibold px-6 py-3 rounded-lg"
              >
                {content.ctaPrimaryButtonText}
              </Button>
            </Link>
            <Link href="/career/apply">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 bg-transparent border px-6 py-3 rounded-lg"
              >
                {content.ctaSecondaryButtonText}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
