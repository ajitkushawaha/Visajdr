import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  GraduationCap,
  Briefcase,
  Plane,
  TrendingUp,
  Home,
  Users,
  CheckCircle2,
  Star,
  BookOpen,
} from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/utils/slugify'
import connectDB from '@/lib/db'
import ServicesPageModel from '@/models/ServicesPage'
import ServiceDetail from '@/models/ServiceDetail'
import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import FAQSection from '@/components/services/FAQSection'

// Enable ISR (Incremental Static Regeneration) - revalidate every hour
export const revalidate = 0

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/services')
  return generateSEOMetadata(seoData)
}

// Icon mapping for dynamic icons
const iconMap: { [key: string]: any } = {
  GraduationCap,
  Briefcase,
  Plane,
  TrendingUp,
  Home,
  Users,
  BookOpen,
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection({ content }: { content: any }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary via-brand-primary/100 to-brand-primary/95 px-4 sm:px-6 lg:px-8 py-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/20 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-brand-accent/20 blur-[100px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse [animation-delay:4s]"></div>
      </div>
      {/* Decorative Grid Pattern for visible dots */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        {/* Left side - Image placeholder */}
        <div className="flex justify-center">
          <div className="w-full max-w-md h-96 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <img
              src={content.heroImage || '/world-map.jpg'}
              alt={content.heroImageAlt || 'Global travelers and immigration'}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* Right side - Content */}
        <div className="text-white space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-balance">
              {content.heroTitle ||
                'Trusted Visa Consultancy Services for Study, Work & Immigration'}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
              {content.heroSubtitle ||
                'Get expert guidance for student visas, work permits, PR, and business immigration with 100% support.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Button
              asChild
              size="lg"
              className="bg-brand-accent hover:bg-brand-primary text-white font-semibold text-sm sm:text-base"
            >
              <Link href={content.heroPrimaryButtonLink || '/apply'}>
                {content.heroPrimaryButtonText || 'Book Free Consultation'}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 bg-transparent text-sm sm:text-base"
            >
              <Link href={content.heroSecondaryButtonLink || '/contact-us'}>
                {content.heroSecondaryButtonText || 'Apply Now'}
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-6 sm:pt-8 grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            {content.heroStats?.map((stat: any, index: number) => (
              <div key={index}>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {stat.number}
                </p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            )) || (
              <>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                    50K+
                  </p>
                  <p className="text-white/80">Successful Cases</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">8+</p>
                  <p className="text-white/80">Years Experience</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                    98.5%
                  </p>
                  <p className="text-white/80">Success Rate</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// DEFINITION BOX
// ============================================================================
function DefinitionBox({ content }: { content: any }) {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 lg:p-12 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">
            {content.definitionTitle || 'What is a Visa Consultancy Service?'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {content.definitionContent ||
              'A visa consultancy service helps individuals and businesses with expert guidance for obtaining study, work, tourist, business, and immigration visas. Consultants provide eligibility checks, document preparation, application filing, and visa interview support. Our team of certified immigration consultants ensures a smooth and transparent process, maximizing your chances of visa approval while minimizing stress and delays.'}
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// WHY CHOOSE US
// ============================================================================
function WhyChooseUs({ content }: { content: any }) {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
            {content.whyChooseUsTitle ||
              'Why Choose Our Visa Consultancy Services?'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            {content.whyChooseUsSubtitle ||
              'Registered consultancy with proven track record and client satisfaction'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {content.whyChooseUsItems?.map((usp: any, index: number) => (
            <div
              key={index}
              className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 hover:border-brand-accent transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-brand-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                  {usp.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {usp.description}
                </p>
              </div>
            </div>
          )) || (
            <>
              <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 hover:border-brand-accent transition-colors shadow-sm">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-brand-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                    Experienced Consultants
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Certified professionals with 15+ years in immigration law
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 hover:border-brand-accent transition-colors shadow-sm">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-brand-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                    High Success Rate
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    98.5% visa approval rate across all visa categories
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 hover:border-brand-accent transition-colors shadow-sm">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-brand-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                    End-to-End Assistance
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Complete support from application to post-landing
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 hover:border-brand-accent transition-colors shadow-sm">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-brand-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                    Personalized Guidance
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Customized solutions tailored to your unique situation
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// SERVICES GRID
// ============================================================================
function ServicesGrid({ content }: { content: any }) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            {content.servicesTitle || 'Types of Visa Services We Offer'}
          </h2>
          <p className="text-lg text-gray-600">
            {content.servicesSubtitle ||
              'Complete visa solutions for every immigration need'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.services?.map((service: any, index: number) => {
            const Icon = iconMap[service.icon] || GraduationCap
            // Generate slug from title or use custom slug if provided
            const serviceSlug = service.slug || slugify(service.title)
            return (
              <Link key={index} href={`/services/${serviceSlug}`}>
                <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200 hover:border-brand-accent cursor-pointer h-full">
                  <Icon className="w-12 h-12 text-brand-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              </Link>
            )
          }) || (
            <>
              <Link href="/services/student-visas">
                <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200 hover:border-brand-accent cursor-pointer h-full">
                  <GraduationCap className="w-12 h-12 text-brand-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Student Visas
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Admission guidance, application support, SOP drafting, and
                    visa filing for universities worldwide.
                  </p>
                </Card>
              </Link>
              <Link href="/services/work-visas">
                <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200 hover:border-brand-accent cursor-pointer h-full">
                  <Briefcase className="w-12 h-12 text-brand-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Work Visas
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Work permits, skilled worker visas, and corporate visa
                    support for international employment.
                  </p>
                </Card>
              </Link>
              <Link href="/services/tourist-visit-visas">
                <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200 hover:border-brand-accent cursor-pointer h-full">
                  <Plane className="w-12 h-12 text-brand-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Tourist & Visit Visas
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Short-term travel assistance for leisure, family visits, and
                    business trips.
                  </p>
                </Card>
              </Link>
              <Link href="/services/business-investor-visas">
                <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200 hover:border-brand-accent cursor-pointer h-full">
                  <TrendingUp className="w-12 h-12 text-brand-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Business & Investor Visas
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Support for entrepreneurs and investors exploring business
                    opportunities abroad.
                  </p>
                </Card>
              </Link>
              <Link href="/services/permanent-residency">
                <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200 hover:border-brand-accent cursor-pointer h-full">
                  <Home className="w-12 h-12 text-brand-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Permanent Residency
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Immigration support for Canada, Australia, UK, and other PR
                    destinations.
                  </p>
                </Card>
              </Link>
              <Link href="/services/family-sponsorship">
                <Card className="p-8 hover:shadow-lg transition-shadow border-gray-200 hover:border-brand-accent cursor-pointer h-full">
                  <Users className="w-12 h-12 text-brand-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Family Sponsorship
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Complete guidance for family reunification and dependent
                    visa applications.
                  </p>
                </Card>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// PROCESS STEPS
// ============================================================================
function ProcessSteps({ content }: { content: any }) {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            {content.processTitle || 'Our Simple & Transparent Process'}
          </h2>
          <p className="text-lg text-gray-600">
            {content.processSubtitle || 'Five easy steps to your visa approval'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {content.processSteps?.map((step: any, index: number) => (
            <div key={index} className="relative">
              <Card className="p-6 text-center h-full border-gray-200 hover:border-brand-accent transition-colors">
                <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </Card>
              {index < (content.processSteps?.length || 5) - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-brand-accent/40 transform -translate-y-1/2" />
              )}
            </div>
          )) || (
            <>
              <div className="relative">
                <Card className="p-6 text-center h-full border-gray-200 hover:border-brand-accent transition-colors">
                  <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Free Consultation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Initial assessment of your visa requirements and eligibility
                  </p>
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-brand-accent/40 transform -translate-y-1/2" />
              </div>
              <div className="relative">
                <Card className="p-6 text-center h-full border-gray-200 hover:border-brand-accent transition-colors">
                  <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Eligibility Check
                  </h3>
                  <p className="text-sm text-gray-600">
                    Comprehensive evaluation of your qualifications and
                    documents
                  </p>
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-brand-accent/40 transform -translate-y-1/2" />
              </div>
              <div className="relative">
                <Card className="p-6 text-center h-full border-gray-200 hover:border-brand-accent transition-colors">
                  <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Documentation & Application
                  </h3>
                  <p className="text-sm text-gray-600">
                    Preparation and filing of all required documents
                  </p>
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-brand-accent/40 transform -translate-y-1/2" />
              </div>
              <div className="relative">
                <Card className="p-6 text-center h-full border-gray-200 hover:border-brand-accent transition-colors">
                  <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    4
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Submission & Tracking
                  </h3>
                  <p className="text-sm text-gray-600">
                    Application submission with real-time status updates
                  </p>
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-brand-accent/40 transform -translate-y-1/2" />
              </div>
              <div className="relative">
                <Card className="p-6 text-center h-full border-gray-200 hover:border-brand-accent transition-colors">
                  <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    5
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Visa Approval & Support
                  </h3>
                  <p className="text-sm text-gray-600">
                    Post-approval guidance and landing assistance
                  </p>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// USE CASES
// ============================================================================
function UseCases({ content }: { content: any }) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            {content.useCasesTitle || 'Who Needs a Visa Consultant?'}
          </h2>
          <p className="text-lg text-gray-600">
            {content.useCasesSubtitle ||
              'We serve diverse clients with unique immigration goals'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.useCases?.map((useCase: any, index: number) => {
            const Icon = iconMap[useCase.icon] || BookOpen
            return (
              <Card
                key={index}
                className="p-8 border-gray-200 hover:border-brand-accent transition-colors"
              >
                <Icon className="w-10 h-10 text-brand-accent mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {useCase.description}
                </p>
              </Card>
            )
          }) || (
            <>
              <Card className="p-8 border-gray-200 hover:border-brand-accent transition-colors">
                <BookOpen className="w-10 h-10 text-brand-accent mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Students Planning to Study Abroad
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get admitted to top universities and secure your student visa
                  with expert guidance.
                </p>
              </Card>
              <Card className="p-8 border-gray-200 hover:border-brand-accent transition-colors">
                <Briefcase className="w-10 h-10 text-brand-accent mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Professionals Seeking Overseas Jobs
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Navigate work visa requirements and land your dream
                  international career.
                </p>
              </Card>
              <Card className="p-8 border-gray-200 hover:border-brand-accent transition-colors">
                <Users className="w-10 h-10 text-brand-accent mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Families Applying for Immigration
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Reunite with loved ones through family sponsorship and
                  immigration programs.
                </p>
              </Card>
              <Card className="p-8 border-gray-200 hover:border-brand-accent transition-colors">
                <Home className="w-10 h-10 text-brand-accent mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Entrepreneurs & Investors
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore business opportunities and establish your venture in
                  new countries.
                </p>
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// TESTIMONIALS
// ============================================================================
function Testimonials({ content }: { content: any }) {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            {content.testimonialsTitle || 'Success Stories & Testimonials'}
          </h2>
          <p className="text-lg text-gray-600">
            {content.testimonialsSubtitle ||
              'Real stories from our satisfied clients'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.testimonials?.map((testimonial: any, index: number) => (
            <Card key={index} className="p-8 border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-brand-accent text-brand-accent"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">
                  Visa to {testimonial.destination}
                </p>
              </div>
            </Card>
          )) || (
            <>
              <Card className="p-8 border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-brand-accent text-brand-accent"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "The team made my student visa process incredibly smooth. I
                  got approved in just 3 months!"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">Priya Sharma</p>
                  <p className="text-sm text-gray-500">Visa to Canada</p>
                </div>
              </Card>
              <Card className="p-8 border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-brand-accent text-brand-accent"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "Excellent service for my PR application. Their expertise and
                  support were invaluable."
                </p>
                <div>
                  <p className="font-semibold text-gray-900">Rajesh Kumar</p>
                  <p className="text-sm text-gray-500">Visa to Australia</p>
                </div>
              </Card>
              <Card className="p-8 border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-brand-accent text-brand-accent"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "Professional, responsive, and results-driven. Highly
                  recommend for any visa needs."
                </p>
                <div>
                  <p className="font-semibold text-gray-900">Ananya Patel</p>
                  <p className="text-sm text-gray-500">Visa to USA</p>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// DIFFERENTIATOR SECTION
// ============================================================================
function DifferentiatorSection({ content }: { content: any }) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            {content.differentiatorTitle ||
              'Why Our Visa Consultants Are Different'}
          </h2>
          <p className="text-lg text-gray-600">
            {content.differentiatorSubtitle ||
              'Excellence in every aspect of immigration consulting'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.differentiatorItems?.map((item: string, index: number) => (
            <div key={index} className="flex gap-4 items-start p-4">
              <CheckCircle2 className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
              <p className="text-gray-600 text-lg">{item}</p>
            </div>
          )) || (
            <>
              <div className="flex gap-4 items-start p-4">
                <CheckCircle2 className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
                <p className="text-gray-600 text-lg">
                  Personalized support tailored to your unique situation
                </p>
              </div>
              <div className="flex gap-4 items-start p-4">
                <CheckCircle2 className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
                <p className="text-gray-600 text-lg">
                  Latest immigration updates and policy changes
                </p>
              </div>
              <div className="flex gap-4 items-start p-4">
                <CheckCircle2 className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
                <p className="text-gray-600 text-lg">
                  Affordable consultation packages for all budgets
                </p>
              </div>
              <div className="flex gap-4 items-start p-4">
                <CheckCircle2 className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
                <p className="text-gray-600 text-lg">
                  High visa approval rate across all categories
                </p>
              </div>
              <div className="flex gap-4 items-start p-4">
                <CheckCircle2 className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
                <p className="text-gray-600 text-lg">
                  Transparent communication throughout the process
                </p>
              </div>
              <div className="flex gap-4 items-start p-4">
                <CheckCircle2 className="w-6 h-6 text-brand-accent flex-shrink-0 mt-1" />
                <p className="text-gray-600 text-lg">
                  Post-landing support and settlement assistance
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// COUNTRY SERVICES
// ============================================================================
function CountryServices({ content }: { content: any }) {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            {content.countryServicesTitle || 'Country-Specific Visa Services'}
          </h2>
          <p className="text-lg text-gray-600">
            {content.countryServicesSubtitle ||
              'Expert guidance for top immigration destinations'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.countryServices?.map((country: any, index: number) => (
            <Card
              key={index}
              className="p-8 text-center border-gray-200 hover:border-brand-accent hover:shadow-lg transition-all cursor-pointer"
            >
              <h3 className="text-2xl font-bold text-brand-accent mb-2">
                {country.name}
              </h3>
              <p className="text-gray-600">{country.service}</p>
            </Card>
          )) || (
            <>
              <Card className="p-8 text-center border-gray-200 hover:border-brand-accent hover:shadow-lg transition-all cursor-pointer">
                <h3 className="text-2xl font-bold text-brand-accent mb-2">
                  Canada
                </h3>
                <p className="text-gray-600">Student Visa</p>
              </Card>
              <Card className="p-8 text-center border-gray-200 hover:border-brand-accent hover:shadow-lg transition-all cursor-pointer">
                <h3 className="text-2xl font-bold text-brand-accent mb-2">
                  Australia
                </h3>
                <p className="text-gray-600">PR Visa</p>
              </Card>
              <Card className="p-8 text-center border-gray-200 hover:border-brand-accent hover:shadow-lg transition-all cursor-pointer">
                <h3 className="text-2xl font-bold text-brand-accent mb-2">
                  USA
                </h3>
                <p className="text-gray-600">Work Visa</p>
              </Card>
              <Card className="p-8 text-center border-gray-200 hover:border-brand-accent hover:shadow-lg transition-all cursor-pointer">
                <h3 className="text-2xl font-bold text-brand-accent mb-2">
                  UK
                </h3>
                <p className="text-gray-600">Student Visa</p>
              </Card>
              <Card className="p-8 text-center border-gray-200 hover:border-brand-accent hover:shadow-lg transition-all cursor-pointer">
                <h3 className="text-2xl font-bold text-brand-accent mb-2">
                  Dubai
                </h3>
                <p className="text-gray-600">Work Visa</p>
              </Card>
              <Card className="p-8 text-center border-gray-200 hover:border-brand-accent hover:shadow-lg transition-all cursor-pointer">
                <h3 className="text-2xl font-bold text-brand-accent mb-2">
                  New Zealand
                </h3>
                <p className="text-gray-600">PR Visa</p>
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// CTA SECTION
// ============================================================================
function CTASection({ content }: { content: any }) {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full py-8 sm:py-10 mx-auto text-center bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-primary/80 border-2 rounded-2xl sm:rounded-3xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight text-balance px-4">
          {content.ctaTitle || 'Ready to Start Your Journey Abroad?'}
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed px-4">
          {content.ctaSubtitle ||
            'Let our expert consultants guide you through every step of your visa application process.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Button
            asChild
            size="lg"
            className="bg-brand-accent hover:bg-brand-primary text-white font-semibold text-sm sm:text-base"
          >
            <Link href={content.ctaPrimaryButtonLink || '/apply'}>
              {content.ctaPrimaryButtonText || 'Book Free Consultation'}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 bg-transparent text-sm sm:text-base"
          >
            <Link href={content.ctaSecondaryButtonLink || '/contact-us'}>
              {content.ctaSecondaryButtonText || 'Contact Us'}
            </Link>
          </Button>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 text-white px-4">
          {content.ctaStats?.map((stat: any, index: number) => (
            <div key={index}>
              <p className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {stat.number}
              </p>
              <p className="text-sm sm:text-base text-white/80">{stat.label}</p>
            </div>
          )) || (
            <>
              <div>
                <p className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                  24/7
                </p>
                <p className="text-sm sm:text-base text-white/80">
                  Customer Support
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                  100%
                </p>
                <p className="text-sm sm:text-base text-white/80">
                  Transparent Process
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">∞</p>
                <p className="text-sm sm:text-base text-white/80">
                  Lifetime Assistance
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default async function ServicesPage() {
  // Fetch content directly from database (server-side)
  let content: any = null
  try {
    // Ensure database connection
    const db = await connectDB()
    if (!db) {
      throw new Error('Database connection failed')
    }

    // Check if model is available
    if (!ServicesPageModel) {
      throw new Error('ServicesPage model not available')
    }

    const servicesPage = await ServicesPageModel.findOne({
      status: 'published',
    })
      .lean()
      .exec()
    if (servicesPage) {
      content = JSON.parse(JSON.stringify(servicesPage))
    }

    // Fetch ONLY available (published) visa services
    const publishedServices = await ServiceDetail.find({ status: 'published' })
      .select('title slug description hero')
      .lean()
      .exec()

    if (publishedServices && publishedServices.length > 0) {
      if (!content) content = {}
      // Map ServiceDetail fields to match expected services grid structure
      content.services = publishedServices.map((s: any) => {
        const title = s.title.toLowerCase()
        let icon = 'Plane' // Default

        if (title.includes('student') || title.includes('study'))
          icon = 'GraduationCap'
        else if (title.includes('work') || title.includes('employment'))
          icon = 'Briefcase'
        else if (title.includes('business') || title.includes('investor'))
          icon = 'TrendingUp'
        else if (
          title.includes('pr') ||
          title.includes('residency') ||
          title.includes('settlement')
        )
          icon = 'Home'
        else if (title.includes('family') || title.includes('dependent'))
          icon = 'Users'
        else if (title.includes('tourist') || title.includes('visit'))
          icon = 'Plane'

        return {
          title: s.title,
          slug: s.slug,
          description: s.hero?.subtitle || s.description,
          icon,
        }
      })
    }
  } catch (error) {
    // Fallback handled below
  }

  // Fallback data if CMS is not available
  const fallbackData = {
    heroTitle:
      'Trusted Visa Consultancy Services for Study, Work & Immigration',
    heroSubtitle:
      'Get expert guidance for student visas, work permits, PR, and business immigration with 100% support.',
    heroImage: '/world-map.jpg',
    heroImageAlt: 'Global travelers and immigration',
    heroPrimaryButtonText: 'Book Free Consultation',
    heroPrimaryButtonLink: '/apply',
    heroSecondaryButtonText: 'Apply Now',
    heroSecondaryButtonLink: '/contact-us',
    heroStats: [
      { number: '50K+', label: 'Successful Cases' },
      { number: '8+', label: 'Years Experience' },
      { number: '98.5%', label: 'Success Rate' },
    ],
    definitionTitle: 'What is a Visa Consultancy Service?',
    definitionContent:
      'A visa consultancy service helps individuals and businesses with expert guidance for obtaining study, work, tourist, business, and immigration visas. Consultants provide eligibility checks, document preparation, application filing, and visa interview support. Our team of certified immigration consultants ensures a smooth and transparent process, maximizing your chances of visa approval while minimizing stress and delays.',
    whyChooseUsTitle: 'Why Choose Our Visa Consultancy Services?',
    whyChooseUsSubtitle:
      'Registered consultancy with proven track record and client satisfaction',
    whyChooseUsItems: [
      {
        title: 'Experienced Consultants',
        description:
          'Certified professionals with 15+ years in immigration law',
      },
      {
        title: 'High Success Rate',
        description: '98.5% visa approval rate across all visa categories',
      },
      {
        title: 'End-to-End Assistance',
        description: 'Complete support from application to post-landing',
      },
      {
        title: 'Personalized Guidance',
        description: 'Customized solutions tailored to your unique situation',
      },
    ],
    servicesTitle: 'Types of Visa Services We Offer',
    servicesSubtitle: 'Comprehensive visa solutions for every immigration need',
    services: [
      {
        icon: 'GraduationCap',
        title: 'Student Visas',
        description:
          'Admission guidance, application support, SOP drafting, and visa filing for universities worldwide.',
      },
      {
        icon: 'Briefcase',
        title: 'Work Visas',
        description:
          'Work permits, skilled worker visas, and corporate visa support for international employment.',
      },
      {
        icon: 'Plane',
        title: 'Tourist & Visit Visas',
        description:
          'Short-term travel assistance for leisure, family visits, and business trips.',
      },
      {
        icon: 'TrendingUp',
        title: 'Business & Investor Visas',
        description:
          'Support for entrepreneurs and investors exploring business opportunities abroad.',
      },
      {
        icon: 'Home',
        title: 'Permanent Residency',
        description:
          'Immigration support for Canada, Australia, UK, and other PR destinations.',
      },
      {
        icon: 'Users',
        title: 'Family Sponsorship',
        description:
          'Complete guidance for family reunification and dependent visa applications.',
      },
    ],
    processTitle: 'Our Simple & Transparent Process',
    processSubtitle: 'Five easy steps to your visa approval',
    processSteps: [
      {
        number: '1',
        title: 'Free Consultation',
        description:
          'Initial assessment of your visa requirements and eligibility',
      },
      {
        number: '2',
        title: 'Eligibility Check',
        description:
          'Comprehensive evaluation of your qualifications and documents',
      },
      {
        number: '3',
        title: 'Documentation & Application',
        description: 'Preparation and filing of all required documents',
      },
      {
        number: '4',
        title: 'Submission & Tracking',
        description: 'Application submission with real-time status updates',
      },
      {
        number: '5',
        title: 'Visa Approval & Support',
        description: 'Post-approval guidance and landing assistance',
      },
    ],
    useCasesTitle: 'Who Needs a Visa Consultant?',
    useCasesSubtitle: 'We serve diverse clients with unique immigration goals',
    useCases: [
      {
        icon: 'BookOpen',
        title: 'Students Planning to Study Abroad',
        description:
          'Get admitted to top universities and secure your student visa with expert guidance.',
      },
      {
        icon: 'Briefcase',
        title: 'Professionals Seeking Overseas Jobs',
        description:
          'Navigate work visa requirements and land your dream international career.',
      },
      {
        icon: 'Users',
        title: 'Families Applying for Immigration',
        description:
          'Reunite with loved ones through family sponsorship and immigration programs.',
      },
      {
        icon: 'Home',
        title: 'Entrepreneurs & Investors',
        description:
          'Explore business opportunities and establish your venture in new countries.',
      },
    ],
    testimonialsTitle: 'Success Stories & Testimonials',
    testimonialsSubtitle: 'Real stories from our satisfied clients',
    testimonials: [
      {
        name: 'Priya Sharma',
        destination: 'Canada',
        text: 'The team made my student visa process incredibly smooth. I got approved in just 3 months!',
        rating: 5,
      },
      {
        name: 'Rajesh Kumar',
        destination: 'Australia',
        text: 'Excellent service for my PR application. Their expertise and support were invaluable.',
        rating: 5,
      },
      {
        name: 'Ananya Patel',
        destination: 'USA',
        text: 'Professional, responsive, and results-driven. Highly recommend for any visa needs.',
        rating: 5,
      },
    ],
    differentiatorTitle: 'Why Our Visa Consultants Are Different',
    differentiatorSubtitle:
      'Excellence in every aspect of immigration consulting',
    differentiatorItems: [
      'Personalized support tailored to your unique situation',
      'Latest immigration updates and policy changes',
      'Affordable consultation packages for all budgets',
      'High visa approval rate across all categories',
      'Transparent communication throughout the process',
      'Post-landing support and settlement assistance',
    ],
    countryServicesTitle: 'Country-Specific Visa Services',
    countryServicesSubtitle: 'Expert guidance for top immigration destinations',
    countryServices: [
      { name: 'Canada', service: 'Student Visa' },
      { name: 'Australia', service: 'PR Visa' },
      { name: 'USA', service: 'Work Visa' },
      { name: 'UK', service: 'Student Visa' },
      { name: 'Dubai', service: 'Work Visa' },
      { name: 'New Zealand', service: 'PR Visa' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Find answers to common visa consultancy questions',
    faqs: [
      {
        question: 'What documents are required for a student visa?',
        answer:
          'Required documents typically include passport, academic transcripts, proof of financial support, admission letter, and language test scores. Our consultants will provide a complete checklist based on your destination country.',
      },
      {
        question: 'How long does it take to process a work visa?',
        answer:
          'Processing times vary by country and visa type, typically ranging from 2-6 months. We provide realistic timelines and keep you updated throughout the process.',
      },
      {
        question: 'Do you provide post-landing support?',
        answer:
          'Yes! We offer comprehensive post-landing support including accommodation guidance, job search assistance, and settlement services.',
      },
      {
        question: 'Can you help with visa rejection cases?',
        answer:
          'Absolutely. We specialize in visa rejection appeals and reapplications, analyzing the reasons for rejection and strengthening your case.',
      },
      {
        question: 'What is your consultation fee?',
        answer:
          'Our consultation fees are transparent and affordable, starting from a free initial consultation. Detailed pricing depends on the visa type and complexity of your case.',
      },
    ],
    ctaTitle: 'Ready to Start Your Journey Abroad?',
    ctaSubtitle:
      'Let our expert consultants guide you through every step of your visa application process.',
    ctaPrimaryButtonText: 'Book Free Consultation',
    ctaPrimaryButtonLink: '/apply',
    ctaSecondaryButtonText: 'Contact Us',
    ctaSecondaryButtonLink: '/contact-us',
    ctaStats: [
      { number: '24/7', label: 'Customer Support' },
      { number: '100%', label: 'Transparent Process' },
      { number: '∞', label: 'Lifetime Assistance' },
    ],
  }

  const pageContent: any = content || fallbackData

  return (
    <div className="min-h-screen bg-white">
      <HeroSection content={pageContent} />
      <DefinitionBox content={pageContent} />
      <WhyChooseUs content={pageContent} />
      <ServicesGrid content={pageContent} />
      <ProcessSteps content={pageContent} />
      <UseCases content={pageContent} />
      <Testimonials content={pageContent} />
      <DifferentiatorSection content={pageContent} />
      {/* <CountryServices content={pageContent} /> */}
      <FAQSection content={pageContent} />
      <CTASection content={pageContent} />
    </div>
  )
}
