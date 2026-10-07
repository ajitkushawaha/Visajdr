import { Button } from '@/components/ui/button'
import Image from 'next/image'

import {
  Users,
  Target,
  Award,
  Zap,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Globe,
  Shield,
  Heart,
} from 'lucide-react'
import Link from 'next/link'
import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import connectDB from '@/lib/db'
import AboutUsPage from '@/models/AboutUsPage'
import { fetchHomePageData } from '@/lib/homePageData'
import WhyChooseUS from '@/components/home/WhyChooseUs'
import BrandCollaborationSection from '@/components/home/BrandCollaborationSection'
import TrustVisaAgentSection from '@/components/home/TrustVisaAgentSection'
import RecentBlogs from '@/components/home/RecentBlogsSection'
import CTASection from '@/components/home/CTASection'
import ScrollingServices from '@/components/home/ScrollingServices'

// Icon mapping for dynamic icons
const iconMap: { [key: string]: any } = {
  Users,
  Target,
  Award,
  Zap,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Globe,
  Shield,
  Heart,
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/about-us')
  return generateSEOMetadata(seoData)
}

export default async function AboutPage() {
  // Fetch home page data for shared components
  const homePageData = await fetchHomePageData()

  // Fetch content from CMS directly from database (better for server-side)
  let pageData = null
  try {
    // Ensure database connection
    const db = await connectDB()
    if (!db) {
      throw new Error('Database connection failed')
    }

    const aboutUsPage = await AboutUsPage.findOne({ status: 'active' }).lean()
    if (aboutUsPage) {
      // Convert to plain object to remove any Mongoose-specific properties
      // This ensures nested objects and arrays are also plain objects
      pageData = JSON.parse(JSON.stringify(aboutUsPage))
    }
  } catch (error) {
    // Silently fail and use fallback - don't log to avoid noise in production
    // Database connection errors are handled gracefully with fallback data
  }

  // Fallback data if CMS is not available
  const fallbackData: any = {
    heroTitle: 'About Us',
    heroSubtitle:
      'Visa4 Technology Private Limited - Revolutionizing visa processing experience for travelers worldwide',
    companyName: 'Visa4 Technology Private Limited',
    companyDescription:
      'Visa4 Technology Private Limited was established with the vision of revolutionizing the visa processing experience for travelers worldwide. By offering fast and reliable online services, we strive to eliminate the common hassles associated with visa applications.',
    problemTitle: 'The Challenge',
    problemDescription:
      'Travelers often struggle with travel planning and make mistakes that cause visa rejections. At Visa4, we not only help but also assist you in compiling your documents and prepping for your visa interview from the comfort of your home.',
    solutionTitle: 'Our Solution',
    solutionDescription:
      'We believe in providing a comprehensive travel experience. Our services go beyond visa processing to include travel insurance, OTB (OK to Board), and travel recommendations. This ensures our customers have everything they need for an international trip in one place.',
    comprehensiveTitle: 'Comprehensive Solutions',
    comprehensiveDescription:
      'Everything you need for international travel in one place',
    b2bTitle: 'B2B Platform',
    b2bDescription:
      'For travel agents and corporate clients, we offer a dedicated B2B platform. This provides access to visas and travel insurance at competitive rates. Our platform includes lead management and invoice management tools, streamlining the process for our agents and corporate partners.',
    testimonialsTitle: 'What Our Clients Say',
    testimonialsDescription:
      'Our clients have praised our doorstep visa assistance, making the process simple and convenient for families and individuals alike. Our goal is to maximize the success rate of visa applications with the help of our skilled personnel who provide end-to-end guidance and support. We ensure a hassle-free experience, reducing uncertainties and setting the stage for a great trip.',
    servicesTitle: 'Our Services',
    services: [
      { name: 'Doorstep visa assistance', status: 'active', order: 0 },
      { name: 'Document compilation support', status: 'active', order: 1 },
      { name: 'Visa interview preparation', status: 'active', order: 2 },
      { name: 'Travel insurance services', status: 'active', order: 3 },
      { name: 'OTB (OK to Board) assistance', status: 'active', order: 4 },
      { name: 'Travel recommendations', status: 'active', order: 5 },
      { name: '24/7 customer support', status: 'active', order: 6 },
      { name: 'Real-time application tracking', status: 'active', order: 7 },
    ],
    destinationsTitle: 'Global Reach',
    destinationsDescription:
      'Apply for your tourist, business, or transit visa to top international destinations like Dubai, the UK, the USA, Singapore, Russia, Europe, Thailand, and over 60+ countries with reliability, trust, and precision.',
    technologyTitle: 'Our Technology',
    technologyDescription:
      'Visa4 is an aggregator and provides an automated technology platform for processing of VISA applications. VISA is processed with our verified and registered VISA Agents in a cost effective manner with quality and time assurance.',
    teamTitle: 'Meet Our Leadership Team',
    teamDescription:
      'Our experienced leadership team brings together decades of expertise in travel, technology, and customer service.',
    teamMembers: [
      {
        name: 'Rajesh Kumar',
        position: 'Founder & CEO',
        experience: '15+ years in travel industry',
        description:
          'Visionary leader with extensive experience in visa processing and travel technology.',
        status: 'active',
        order: 0,
      },
      {
        name: 'Priya Sharma',
        position: 'CTO',
        experience: '12+ years in tech',
        description:
          'Technology expert driving innovation in visa processing automation.',
        status: 'active',
        order: 1,
      },
      {
        name: 'Amit Patel',
        position: 'Head of Operations',
        experience: '10+ years in operations',
        description:
          'Operations specialist ensuring smooth visa processing workflows.',
        status: 'active',
        order: 2,
      },
    ],
    stats: [
      {
        icon: 'Users',
        label: 'Happy Customers',
        value: '50,000+',
        status: 'active',
        order: 0,
      },
      {
        icon: 'Target',
        label: 'Visa Applications',
        value: '100,000+',
        status: 'active',
        order: 1,
      },
      {
        icon: 'Award',
        label: 'Success Rate',
        value: '98.5%',
        status: 'active',
        order: 2,
      },
      {
        icon: 'Zap',
        label: 'Countries Covered',
        value: '60+',
        status: 'active',
        order: 3,
      },
      {
        icon: 'Globe',
        label: 'Years of Experience',
        value: '8+',
        status: 'active',
        order: 4,
      },
      {
        icon: 'Shield',
        label: 'Team Members',
        value: '200+',
        status: 'active',
        order: 5,
      },
    ],
    milestonesTitle: 'Our Journey',
    milestonesDescription:
      "From a small startup to a leading visa processing company, here's our growth story.",
    milestones: [
      {
        year: '2016',
        title: 'Company Founded',
        description: 'Started with a vision to simplify visa processing',
        status: 'active',
        order: 0,
      },
      {
        year: '2018',
        title: 'First 1000 Applications',
        description: 'Reached our first major milestone',
        status: 'active',
        order: 1,
      },
      {
        year: '2020',
        title: 'Digital Transformation',
        description: 'Launched our online platform',
        status: 'active',
        order: 2,
      },
      {
        year: '2022',
        title: '50,000+ Customers',
        description: 'Served over 50,000 satisfied customers',
        status: 'active',
        order: 3,
      },
      {
        year: '2024',
        title: 'AI Integration',
        description: 'Introduced AI-powered visa assistance',
        status: 'active',
        order: 4,
      },
    ],
    ctaTitle: 'Ready to Start Your Journey?',
    ctaDescription:
      'For booking your next visa or any inquiries, please reach out to us at info@euroworld.com',
    ctaEmail: 'info@euroworld.com',
  }

  const content: any = pageData || ''
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero Section */}
      <section className="relative bg-brand-primary py-24 lg:py-44 overflow-hidden ">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/20 blur-[120px] animate-pulse"></div>
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-brand-accent/20 blur-[100px] animate-pulse [animation-delay:2s]"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse [animation-delay:4s]"></div>
        </div>
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
              {content.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/80  text-center mb-10 max-w-4xl ">
              {content.heroSubtitle}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-primary border-2 border-white hover:text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/">Start Your Journey</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-primary px-8 py-6 text-lg rounded-full transition-all duration-300"
            >
              <Link href="/contact-us">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
      <ScrollingServices />
      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {content.stats
              .filter((stat: any) => stat.status === 'active')
              .map((stat: any, index: number) => {
                const IconComponent = iconMap[stat.icon] || Users
                return (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-3xl text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 mx-auto mb-4 bg-brand-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-accent transition-all duration-300">
                      <IconComponent className="h-7 w-7 text-brand-accent group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="text-brand-accent font-semibold tracking-wider uppercase text-sm mb-3 block">
              Our Story
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-gray-900">
              {content.companyName}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {content.companyDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Challenge Card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
              <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-brand-accent" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {content.problemTitle}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {content.problemDescription}
              </p>
            </div>

            {/* Solution Card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
              <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {content.solutionTitle}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {content.solutionDescription}
              </p>
            </div>

            {/* Comprehensive Card */}
            <div className="bg-brand-primary p-8 sm:p-10 rounded-3xl shadow-xl h-full text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent/20 rounded-tr-full -ml-12 -mb-12 transition-transform group-hover:scale-110 duration-500" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {content?.comprehensiveTitle || 'Comprehensive Solutions'}
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {content?.comprehensiveDescription ||
                    'Everything you need for international travel in one place'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <WhyChooseUS initialData={homePageData.whyChooseUs} />

      {/* B2B Platform */}
      <section className="py-20 bg-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/visa/world-map.png"
            alt="World Map"
            fill
            className="object-cover object-center"
            quality={60}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
            {content.b2bTitle}
          </h3>
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-4xl mx-auto">
            {content.b2bDescription}
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-secondary font-semibold tracking-wider uppercase text-sm mb-3 block">
              What We Offer
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-brand-primary">
              {content.servicesTitle}
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive visa and travel services designed to make your
              journey seamless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.services
              .filter((service: any) => service.status === 'active')
              .map((service: any, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-brand-secondary group hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-secondary transition-colors duration-300">
                      <CheckCircle className="h-6 w-6 text-brand-secondary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-lg font-medium text-gray-900 group-hover:text-brand-primary transition-colors duration-300">
                      {service.name}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Trust visa agent section */}
      <TrustVisaAgentSection initialData={homePageData.trustVisaAgent} />

      {/* Destinations */}
      <section className="py-20 bg-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-dark opacity-90" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
            {content.destinationsTitle}
          </h3>
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto">
            {content.destinationsDescription}
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className=" bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* <span className="text-brand-secondary font-semibold tracking-wider uppercase text-sm mb-3 block">
              Our Leadership
            </span> */}
            <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-brand-primary">
              {content.teamTitle}
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {content.teamDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.teamMembers
              .filter((member: any) => member.status === 'active')
              .map((member: any, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:border-brand-primary group hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-secondary to-brand-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-brand-secondary/10 to-brand-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 p-1 border-2 border-transparent group-hover:border-brand-secondary">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-brand-primary">
                        {member.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-brand-primary transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-brand-secondary font-semibold mb-3">
                    {member.position}
                  </p>
                  <p className="text-sm text-gray-500 mb-4 bg-gray-50 inline-block px-3 py-1 rounded-full">
                    {member.experience}
                  </p>
                  {member.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {member.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      <RecentBlogs blogs={homePageData.recentBlogs} />

      {/* Brand Collaboration */}
      {/* <BrandCollaborationSection
        initialData={homePageData.brandCollaboration}
      /> */}
      {/* Technology Platform */}
      <section className="pt-20 pb-4 bg-white">
        <div className="max-w-7xl">
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary  p-8 sm:p-12 lg:p-16 text-center text-white  relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl" />

            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-bold mb-6">
                {content.technologyTitle}
              </h3>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-4xl mx-auto">
                {content.technologyDescription}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      {/* <CTASection initialData={homePageData.ctaSection} /> */}
    </div>
  )
}
