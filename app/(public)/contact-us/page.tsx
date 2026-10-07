import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Globe,
  Users,
  Award,
  Send,
  CheckCircle2,
  Star,
  ArrowRight,
} from 'lucide-react'
import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import ContactForm from '@/components/contact/ContactForm'
import connectDB from '@/lib/db'
import ContactUsPage from '@/models/ContactUsPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Icon mapping for dynamic icons
const iconMap: { [key: string]: any } = {
  Phone,
  Mail,
  MessageCircle,
  Globe,
  MapPin,
  Clock,
  Award,
  Users,
}

export async function generateMetadata() {
  const seoData = await fetchSEOData('/contact-us')
  return generateSEOMetadata(seoData)
}

export default async function ContactPage() {
  // Fetch content directly from database (server-side)
  let pageData: any = null
  try {
    const db = await connectDB()
    if (!db) {
      throw new Error('Database connection failed')
    }

    const contactUsPage = await ContactUsPage.findOne({
      status: 'active',
    }).lean()
    if (contactUsPage) {
      // Convert to plain object to remove any Mongoose-specific properties
      pageData = JSON.parse(JSON.stringify(contactUsPage))
    }
  } catch (error) {
    // Silently fail and use fallback
  }

  // Fallback data if CMS is not available
  const fallbackData = {
    heroPillText: 'Get in Touch with Experts',
    heroTitle: 'Contact Us',
    heroDescription:
      "Get in touch with our visa experts. We're here to help you with your visa application process.",
    statistics: [
      { label: 'Happy Customers', value: '50K+' },
      { label: 'Success Rate', value: '98.5%' },
      { label: 'Expert Support', value: '24/7' },
    ],
    contactSectionTitle: 'Get in Touch',
    contactSectionDescription:
      "Choose your preferred way to reach us. We're here to help with all your visa needs.",
    contactMethods: [
      {
        icon: 'Phone',
        title: 'Call Us',
        description: 'Speak directly with our visa experts',
        primary: '+91-98765-43210',
        secondary: '+91-11-4567-8900',
        action: 'Call Now',
        href: 'tel:+919876543210',
        status: 'active',
      },
      {
        icon: 'Mail',
        title: 'Email Us',
        description: 'Send us your queries via email',
        primary: 'info@euroworld.com',
        secondary: 'support@euroworld.com',
        action: 'Send Email',
        href: 'mailto:info@euroworld.com',
        status: 'active',
      },
      {
        icon: 'MessageCircle',
        title: 'WhatsApp',
        description: 'Chat with us on WhatsApp',
        primary: '+91-98765-43210',
        secondary: 'Available 24/7',
        action: 'Chat Now',
        href: 'https://wa.me/919876543210',
        status: 'active',
      },
      {
        icon: 'Globe',
        title: 'Visit Us',
        description: 'Come meet us at our office',
        primary: 'New Delhi Office',
        secondary: 'Connaught Place',
        action: 'Get Directions',
        href: 'https://maps.google.com',
        status: 'active',
      },
    ],
    infoSectionTitle: 'Contact Details',
    contactInfo: [
      {
        type: 'address',
        title: 'Office Address',
        content:
          'F-14 1st Floor Alfran Plaza\nNear Don Bosco, MG Road\nPanjim, Goa - 403001\nIndia',
        icon: 'MapPin',
        actionText: 'Get Directions',
        actionHref: 'https://maps.google.com',
        status: 'active',
      },
      {
        type: 'hours',
        title: 'Business Hours',
        content:
          'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
        icon: 'Clock',
        status: 'active',
      },
      {
        type: 'other',
        title: 'Why Choose Us',
        content: '50,000+ Happy Customers\n98.5% Success Rate\n24/7 Support',
        icon: 'Award',
        status: 'active',
      },
    ],
    formTitle: 'Send a Message',
    formDescription: 'We typically respond within 24 hours.',
    socialProofTitle: 'Award Winning Service',
    socialProofDescription:
      'Recognized for excellence in visa consultancy and customer satisfaction across India.',
    faqSectionSubtitle: 'Common Questions',
    faqTitle: 'Frequently Asked Questions',
    faqDescription:
      "Find answers to common questions about our visa processing services. Can't find what you're looking for? Contact us directly!",
    faqs: [
      {
        question: 'How long does visa processing take?',
        answer:
          'Processing times vary by country and visa type. Tourist visas typically take 5-15 business days, while business and student visas may take longer. We provide estimated timelines for each destination.',
        status: 'active',
      },
      {
        question: 'What documents do I need?',
        answer:
          'Required documents vary by destination and visa type. Common requirements include passport, photographs, application forms, and supporting documents. We provide a complete checklist for each application.',
        status: 'active',
      },
      {
        question: 'Can I track my application?',
        answer:
          'Yes! You can track your application status 24/7 using your application ID on our tracking page. We also send SMS and email updates at each stage of processing.',
        status: 'active',
      },
      {
        question: 'What if my visa is rejected?',
        answer:
          'In case of rejection, we provide detailed feedback and guidance for reapplication. Our experts analyze the reasons and help improve your chances of approval in the next attempt.',
        status: 'active',
      },
      {
        question: 'Do you provide travel insurance?',
        answer:
          'Yes! We offer comprehensive travel insurance plans starting from ₹149. Our insurance covers medical emergencies, trip cancellations, and other travel-related risks.',
        status: 'active',
      },
      {
        question: 'What are your business hours?',
        answer:
          'Our main office is open Monday-Friday 9:00 AM - 6:00 PM, Saturday 10:00 AM - 4:00 PM. However, our online support and WhatsApp assistance are available 24/7.',
        status: 'active',
      },
    ],
    ctaTitle: 'Still have questions?',
    ctaDescription:
      "Don't hesitate to reach out to us directly for any additional assistance.",
    ctaButtons: {
      primary: {
        text: 'Call Us Now',
        href: 'tel:+919876543210',
      },
      secondary: {
        text: 'WhatsApp Us',
        href: 'https://wa.me/919876543210',
      },
    },
  }

  const content = pageData || fallbackData

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero Section - Redesigned for premium feel */}
      <section className="relative overflow-hidden bg-brand-primary py-24 sm:py-32 lg:py-40">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/20 blur-[120px] animate-pulse"></div>
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-brand-accent/20 blur-[100px] animate-pulse [animation-delay:2s]"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse [animation-delay:4s]"></div>
        </div>

        {/* Decorative Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6 animate-bounce">
              <span className="flex h-2 w-2 rounded-full bg-brand-secondary"></span>
              {content.heroPillText || 'Get in Touch with Experts'}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]">
              {content.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-12">
              {content.heroDescription}
            </p>

            {/* Redesigned Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 sm:gap-12 py-8 border-y border-white/10 backdrop-blur-sm bg-white/5 rounded-2xl px-6 md:px-12">
              {(
                content.statistics || [
                  { label: 'Happy Customers', value: '50K+' },
                  { label: 'Success Rate', value: '98.5%' },
                  { label: 'Expert Support', value: '24/7' },
                ]
              ).map((stat: any, i: number) => (
                <div
                  key={i}
                  className={`text-center group ${i === 1 ? 'border-x border-white/10' : ''}`}
                >
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/60 font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative -mt-16 z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Contact Methods Grid - Redesigned Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {content.contactMethods
            .filter((method: any) => method.status === 'active')
            .map((method: any, index: number) => {
              const IconComponent = iconMap[method.icon] || Phone
              return (
                <div
                  key={index}
                  className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100/50 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary transition-colors duration-500">
                    <IconComponent className="h-8 w-8 text-brand-primary group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    {method.description}
                  </p>
                  <div className="mt-auto">
                    <p className="font-bold text-lg text-brand-secondary mb-1">
                      {method.primary}
                    </p>
                    <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest">
                      {method.secondary}
                    </p>
                    <a
                      href={method.href}
                      className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                    >
                      {method.action}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Main Content: Info & Form */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {content.infoSectionTitle || 'Contact Details'}
              </h2>
              <div className="space-y-10">
                {content.contactInfo
                  .filter((info: any) => info.status === 'active')
                  .map((info: any, index: number) => {
                    const IconComponent = iconMap[info.icon] || MapPin
                    return (
                      <div key={index} className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-brand-primary" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide text-sm">
                            {info.title}
                          </h4>
                          <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                            {info.content}
                          </p>
                          {info.actionText && (
                            <a
                              href={info.actionHref}
                              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-secondary hover:underline"
                            >
                              {info.actionText}{' '}
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Social Proof/Awards Card */}
            <div className="bg-gradient-to-br from-brand-secondary to-brand-accent p-8 rounded-[2.5rem] text-white shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Award className="w-32 h-32 rotate-12" />
              </div>
              <div className="relative z-10">
                <Star className="h-8 w-8 text-white mb-4 fill-white" />
                <h3 className="text-2xl font-bold mb-2">
                  {content.socialProofTitle || 'Award Winning Service'}
                </h3>
                <p className="text-white/80 leading-relaxed mb-6">
                  {content.socialProofDescription ||
                    'Recognized for excellence in visa consultancy and customer satisfaction across India.'}
                </p>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600"
                    >
                      U{i}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-primary flex items-center justify-center text-[10px] font-bold">
                    +100
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative">
                <ContactForm
                  title={content.formTitle}
                  description={content.formDescription}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section - Redesigned */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <span className="text-brand-secondary font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
              {content.faqSectionSubtitle || 'Common Questions'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              {content.faqTitle}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              {content.faqDescription}
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.faqs
              .filter((faq: any) => faq.status === 'active')
              .map((faq: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-brand-primary/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary/10 flex items-center justify-center mt-1">
                      <span className="text-brand-secondary font-bold text-xs">
                        ?
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Final CTA */}
          <div className="mt-24 relative overflow-hidden rounded-[3rem] bg-brand-primary p-12 md:p-20 text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {content.ctaTitle}
              </h3>
              <p className="text-white/70 text-lg mb-12">
                {content.ctaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href={content.ctaButtons.primary.href}
                  className="px-10 py-5 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Phone className="h-5 w-5" />
                  {content.ctaButtons.primary.text}
                </a>
                <a
                  href={content.ctaButtons.secondary.href}
                  className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                  <MessageCircle className="h-5 w-5" />
                  {content.ctaButtons.secondary.text}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
