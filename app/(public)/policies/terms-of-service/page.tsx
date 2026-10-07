import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import { Badge } from '@/components/ui/badge'
import { Calendar, Mail, Phone, MapPin } from 'lucide-react'
import { formatUserDate } from '@/lib/dateUtils'
import connectDB from '@/lib/db'
import TermsOfServicePage from '@/models/TermsOfServicePage'

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/terms-of-service')
  return generateSEOMetadata(seoData)
}

export default async function TermsOfServicePage() {
  // Fetch content directly from database (server-side)
  let pageData: any = null
  try {
    const db = await connectDB()
    if (!db) {
      throw new Error('Database connection failed')
    }

    const termsOfServicePage = await TermsOfServicePage.findOne({
      status: 'active',
    }).lean()
    if (termsOfServicePage) {
      // Convert to plain object to remove any Mongoose-specific properties
      pageData = JSON.parse(JSON.stringify(termsOfServicePage))
    }
  } catch (error) {
    // Silently fail and use fallback
  }

  // Fallback data if CMS is not available
  const fallbackData = {
    title: 'Terms of Service',
    subtitle: 'Terms and conditions for using our visa processing services',
    lastUpdated: new Date(),
    effectiveDate: new Date(),
    introduction:
      "Welcome to Visa4 Technology Private Limited. These Terms of Service ('Terms') govern your use of our visa processing services and website. By using our services, you agree to be bound by these Terms. Please read them carefully.",
    sections: [
      {
        title: 'Acceptance of Terms',
        content:
          'By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
        order: 0,
        status: 'active',
      },
      {
        title: 'Description of Service',
        content:
          'Visa4 Technology Private Limited provides visa processing services, travel insurance, and related travel assistance services. We act as an intermediary between you and various government authorities to facilitate visa applications.',
        order: 1,
        status: 'active',
      },
      {
        title: 'User Responsibilities and Obligations',
        content:
          'As a user of our services, you agree to:\n\n• Provide accurate and complete information\n• Maintain the confidentiality of your account credentials\n• Comply with all applicable laws and regulations\n• Not use our services for any unlawful or prohibited purpose\n• Not attempt to gain unauthorized access to our systems\n• Not interfere with or disrupt our services',
        order: 2,
        status: 'active',
      },
      {
        title: 'Service Limitations and Disclaimers',
        content:
          "While we strive to provide accurate and up-to-date information, we cannot guarantee:\n\n• The accuracy of visa requirements or processing times\n• The approval of your visa application\n• The availability of our services at all times\n• The performance of third-party services or government systems\n\nOur services are provided 'as is' without warranties of any kind.",
        order: 3,
        status: 'active',
      },
      {
        title: 'Payment Terms and Refund Policy',
        content:
          'Payment for our services is due at the time of application submission. Refunds are subject to our refund policy and may vary based on the stage of processing and applicable government fees.',
        order: 4,
        status: 'active',
      },
      {
        title: 'Privacy and Data Protection',
        content:
          'We are committed to protecting your privacy and personal information. Please review our Privacy Policy for detailed information about how we collect, use, and protect your data.',
        order: 5,
        status: 'active',
      },
      {
        title: 'Limitation of Liability',
        content:
          'To the maximum extent permitted by law, Visa4 Technology Private Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services.',
        order: 6,
        status: 'active',
      },
      {
        title: 'Modifications to Terms',
        content:
          'We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the modified Terms.',
        order: 7,
        status: 'active',
      },
      {
        title: 'Contact Information',
        content:
          'If you have any questions about these Terms, please contact us at:\n\nEmail: legal@euroworld.com\nPhone: +91-98765-43210\nAddress: F-14 1st Floor Alfran Plaza, Near Don Bosco, MG Road, Panjim, Goa - 403001, India',
        order: 8,
        status: 'active',
      },
    ],
    contactEmail: 'legal@euroworld.com',
    contactPhone: '+91-98765-43210',
    contactAddress:
      'F-14 1st Floor Alfran Plaza, Near Don Bosco, MG Road, Panjim, Goa - 403001, India',
  }

  const content = pageData || fallbackData

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          {content.title}
        </h1>
        <p className="text-xl text-gray-600 mb-6">{content.subtitle}</p>

        <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Admin
          </span>
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
            Last Updated: {formatUserDate(content.lastUpdated)}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Legal
          </span>
        </div>

        <div className="prose prose-lg max-w-none text-gray-800">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-800 font-medium">
              <strong>Last Updated:</strong>{' '}
              {formatUserDate(content.lastUpdated)} |
              <strong> Effective Date:</strong>{' '}
              {formatUserDate(content.effectiveDate)}
            </p>
            <p className="text-red-700 text-sm mt-2">
              Please read these terms carefully before using our services. By
              using our services, you agree to be bound by these terms.
            </p>
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">
            {content.introduction}
          </p>

          {content.sections
            ?.filter((section: any) => section.status === 'active')
            .sort((a: any, b: any) => a.order - b.order)
            .map((section: any, index: number) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {index + 1}. {section.title}
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            )) || (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Acceptance of Terms
                </h2>
                <div className="text-gray-700 leading-relaxed">
                  By accessing and using our services, you accept and agree to
                  be bound by the terms and provision of this agreement. If you
                  do not agree to abide by the above, please do not use this
                  service.
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Description of Service
                </h2>
                <div className="text-gray-700 leading-relaxed">
                  Visa4 Technology Private Limited provides visa processing
                  services, travel insurance, and related travel assistance
                  services. We act as an intermediary between you and various
                  government authorities to facilitate visa applications.
                </div>
              </div>
            </>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{content.contactEmail}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{content.contactPhone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {content.contactAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
            <p className="text-yellow-800">
              <strong>Important:</strong> These terms constitute a legally
              binding agreement. Please read them carefully and contact us if
              you have any questions before using our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
