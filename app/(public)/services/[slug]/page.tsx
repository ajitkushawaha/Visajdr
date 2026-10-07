import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import connectDB from '@/lib/db'
import ServiceDetail from '@/models/ServiceDetail'
import ServicesPage from '@/models/ServicesPage'
import { slugify } from '@/utils/slugify'
import PremiumServiceDetail from '@/components/services/PremiumServiceDetail'
import JsonLd from '@/components/seo/JsonLd'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

const touristVisaData = {
  title: 'Tourist Visa',
  slug: 'tourist-visas',
  hero: {
    title: 'Apply Tourist Visa Online in India – with Visa 4',
    subtitle: 'Make Your Travel Dreams Come True with Visa 4',
    primaryButtonText: 'Apply For a Tourist France Visa',
    primaryButtonLink: '/apply',
  },
  description:
    'Travelling abroad should be exciting, not stressful. At Visa 4, we specialize in Tourist Visa Services in India, providing hassle-free visa assistance for Indian travelers. Whether you want a India tourist visa, e tourist visa India, or need help with your Indian tourist visa online application, our expert team is here to guide you every step of the way. As a trusted Online Tourist Visa Consultant India, Visa 4 ensures your application is complete, accurate, and has the highest chance of approval. We help with Indian tourist visa online, tourist visa for USA from India, and tourist visa for Turkey from India, making your visa journey smooth and stress-free.',
  requirements: {
    title: 'Documents Required for Tourist Visa',
    items: [
      { title: 'Valid passport', description: 'Minimum 6 months validity' },
      { title: 'Passport-sized photographs', description: '' },
      { title: 'Travel itinerary and flight bookings', description: '' },
      {
        title: 'Proof of financial stability',
        description: 'Bank statements, pay slips',
      },
      { title: 'Accommodation proof', description: '' },
      {
        title: 'Indian tourist visa online application',
        description: 'Completed',
      },
    ],
  },
  process: {
    title: 'Step-by-Step Tourist Visa Process',
    steps: [
      {
        title: 'Free Consultation',
        description:
          'Discuss your travel plans with our Online Tourist Visa Consultant India team.',
      },
      {
        title: 'Document Review',
        description:
          'We verify your documents for Indian tourist visa online application.',
      },
      {
        title: 'Application Preparation',
        description:
          'Forms, cover letters, and embassy submissions are handled by our visa application experts.',
      },
      {
        title: 'Submission & Appointment Scheduling',
        description: 'We manage all steps of e tourist visa India submission.',
      },
      {
        title: 'Tracking & Updates',
        description:
          'Stay informed with real-time updates for your India tourist visa.',
      },
      {
        title: 'Visa Approval',
        description:
          'Receive your approved tourist visa smoothly with Visa 4 guidance.',
      },
    ],
  },
  applicationPacket: [
    { src: 'application-packet.png', label: 'Application Packet' },
    { src: 'cover-letter.png', label: 'Cover Letter' },
    { src: 'flights.png', label: 'Flight Reservations' },
    { src: 'hotels.png', label: 'Hotel Reservations' },
    { src: 'itinerary.png', label: 'Day-to-Day Itinerary' },
    { src: 'travel-insurance.png', label: 'Travel Insurance' },
    { src: 'sponsorship-letter.png', label: 'Sponsorship Letter' },
    { src: 'invitation.png', label: 'Invitation Letter' },
    { src: 'noc.png', label: 'No Objection Certificate' },
  ],
  faqs: {
    title: 'FAQs – Tourist Visa Services in India',
    items: [
      {
        question: 'How Can I Apply For An India Tourist Visa?',
        answer:
          'You can apply with a Visa 4 through our Indian tourist visa online services. Our team handles the entire process from document verification to embassy submission.',
      },
      {
        question: 'What Is An E Tourist Visa India?',
        answer:
          'An e-tourist visa India is an online visa allowing travelers to enter India for tourism. Visa 4 assists with your Indian tourist visa online application to make this process smooth.',
      },
      {
        question: 'How Do I Apply For A Tourist Visa For USA from India?',
        answer:
          'Our Online Tourist Visa Consultant India guides you through forms, document verification, and embassy submission for your tourist visa for USA from India.',
      },
      {
        question: 'Can I Apply For A Tourist Visa For Turkey From India?',
        answer:
          'Yes! Visa 4 provides expert assistance for a tourist visa for Turkey from India, ensuring all requirements are met efficiently.',
      },
      {
        question: 'How Long Does It Take To Get A Tourist Visa?',
        answer:
          'Processing depends on the country. Our Tourist Visa Services in India focus on fast and reliable processing for all destinations.',
      },
    ],
  },
  seo: {
    title:
      'Apply Tourist Visa Online in India | Fast & Easy Visa Services – Visa 4',
    description:
      'Start your travel journey today with Visa 4. Apply for an India tourist visa, USA tourist visa, Turkey tourist visa & more. Expert guidance with 99% accuracy. Click to Apply Now!',
  },
}

async function getServiceBySlug(slug: string) {
  if (slug === 'tourist-visas') {
    return touristVisaData
  }

  try {
    await connectDB()

    // First, try to find a ServiceDetail with this slug
    const serviceDetail = await ServiceDetail.findOne({
      slug,
      status: 'published',
    }).lean()

    if (serviceDetail) {
      return serviceDetail
    }

    // If not found, check ServicesPage for a matching service
    const servicesPage = (await ServicesPage.findOne().lean()) as any
    if (servicesPage?.services) {
      const matchingService = servicesPage.services.find((service: any) => {
        const serviceSlug = service.slug || slugify(service.title || '')
        return serviceSlug === slug
      })

      if (matchingService) {
        // Return a basic service object based on the ServicesPage service
        return {
          _id: null,
          title: matchingService.title,
          slug: slug,
          hero: {
            title: matchingService.title,
            subtitle: matchingService.description,
            image: '',
            imageAlt: '',
            primaryButtonText: 'Book Free Consultation',
            primaryButtonLink: '/apply',
            secondaryButtonText: 'Contact Us',
            secondaryButtonLink: '/contact-us',
          },
          description: matchingService.description,
          benefits: {
            title: 'Benefits',
            subtitle: 'Why choose this service?',
            items: [],
          },
          requirements: {
            title: 'Requirements',
            subtitle: 'What you need to get started',
            items: [],
          },
          process: {
            title: 'Our Process',
            subtitle: 'How we help you',
            steps: [],
          },
          faqs: {
            title: 'Frequently Asked Questions',
            subtitle: 'Common questions about this service',
            items: [],
          },
          cta: {
            title: 'Ready to Get Started?',
            subtitle: 'Contact us today to begin your journey',
            primaryButtonText: 'Book Free Consultation',
            primaryButtonLink: '/apply',
            secondaryButtonText: 'Contact Us',
            secondaryButtonLink: '/contact-us',
          },
          seo: {
            title: '',
            description: '',
            keywords: [],
          },
          status: 'published',
          _serviceIcon: matchingService.icon, // Store icon for fallback display
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = (await getServiceBySlug(slug)) as any

  if (!service) {
    return {
      title: 'Service Not Found',
    }
  }

  const seoTitle = service.seo?.title || service.title
  const seoDescription =
    service.seo?.description ||
    service.description ||
    service.hero?.subtitle ||
    ''
  const keywords = service.seo?.keywords || []

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: service.hero?.image ? [{ url: service.hero.image }] : undefined,
      type: 'website',
    },
    alternates: {
      canonical: `/services/${service.slug}`,
    },
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const service = (await getServiceBySlug(slug)) as any

  if (!service) {
    notFound()
  }

  // Convert Mongoose document to plain object to avoid serialization errors
  const serializedService = JSON.parse(JSON.stringify(service))

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.visa4.com'

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serializedService.title,
    description:
      serializedService.description || serializedService.hero?.subtitle,
    provider: {
      '@type': 'Organization',
      name: 'Visa4',
      url: baseUrl,
    },
    areaServed: 'India',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Visa Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: serializedService.title,
          },
        },
      ],
    },
  }

  // Breadcrumb Schema Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${baseUrl}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: serializedService.title,
        item: `${baseUrl}/services/${serializedService.slug}`,
      },
    ],
  }

  // FAQ Schema if available
  const faqJsonLd =
    serializedService.faqs?.items?.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: serializedService.faqs.items.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null

  return (
    <>
      <JsonLd data={jsonLd} id="service-schema" />
      <JsonLd data={breadcrumbJsonLd} id="breadcrumb-schema" />
      {faqJsonLd && <JsonLd data={faqJsonLd} id="faq-schema" />}
      <PremiumServiceDetail service={serializedService} />
    </>
  )
}
