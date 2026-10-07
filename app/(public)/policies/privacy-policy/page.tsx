import {
  fetchSEOData,
  generateMetadata as generateSEOMetadata,
} from '@/components/seo/ServerSEO'
import { Badge } from '@/components/ui/badge'
import { Calendar, Mail, Phone, MapPin } from 'lucide-react'
import { formatUserDate } from '@/lib/dateUtils'
import connectDB from '@/lib/db'
import PrivacyPolicyPageModel from '@/models/PrivacyPolicyPage'

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/privacy-policy')
  return generateSEOMetadata(seoData)
}

export default async function PrivacyPolicyPage() {
  // Fetch content directly from database (server-side)
  let pageData: any = null
  try {
    const db = await connectDB()
    if (!db) {
      throw new Error('Database connection failed')
    }

    const privacyPolicyPage = await PrivacyPolicyPageModel.findOne({
      status: 'active',
    }).lean()
    if (privacyPolicyPage) {
      // Convert to plain object to remove any Mongoose-specific properties
      pageData = JSON.parse(JSON.stringify(privacyPolicyPage))
    }
  } catch (error) {
    // Silently fail and use fallback
  }

  // Fallback data if CMS is not available
  const fallbackData = {
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your personal information',
    lastUpdated: new Date(),
    effectiveDate: new Date(),
    introduction:
      'At Visa4 Technology Private Limited, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our visa processing services.',
    sections: [
      {
        title: 'Information We Collect',
        content:
          'We collect information you provide directly to us, such as when you create an account, apply for a visa, or contact us for support. This may include:\n\n• Personal identification information (name, email address, phone number)\n• Passport and travel document information\n• Payment and billing information\n• Communication preferences\n• Any other information you choose to provide',
        status: 'active',
      },
      {
        title: 'How We Use Your Information',
        content:
          'We use the information we collect to:\n\n• Process your visa applications\n• Provide customer support and respond to your inquiries\n• Send you important updates about your applications\n• Improve our services and develop new features\n• Comply with legal obligations and regulatory requirements\n• Prevent fraud and ensure the security of our services',
        status: 'active',
      },
    ],
    contactEmail: 'privacy@euroworld.com',
    contactPhone: '+91-98765-43210',
    contactAddress:
      'F-14 1st Floor Alfran Plaza, Near Don Bosco, MG Road, Panjim, Goa - 403001, India',
    dpoEmail: 'dpo@euroworld.com',
    noteText:
      'This Privacy Policy is effective as of the date listed above and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.',
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
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Last Updated: {formatUserDate(content.lastUpdated)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Effective: {formatUserDate(content.effectiveDate)}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">Legal</Badge>
        </div>

        <div className="prose prose-lg max-w-none text-gray-800">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-800 font-medium">
              <strong>Last Updated:</strong>{' '}
              {formatUserDate(content.lastUpdated)} |
              <strong> Effective Date:</strong>{' '}
              {formatUserDate(content.effectiveDate)}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-lg leading-relaxed">{content.introduction}</p>
          </div>

          {content.sections
            .filter((section: any) => section.status === 'active')
            .map((section: any, index: number) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {section.content}
                </div>
              </div>
            ))}

          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Contact Information
            </h2>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <strong>Email:</strong> {content.contactEmail}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <strong>Phone:</strong> {content.contactPhone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <strong>Address:</strong> {content.contactAddress}
              </p>
              {content.dpoEmail && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <strong>DPO Email:</strong> {content.dpoEmail}
                </p>
              )}
            </div>
          </div>

          {content.noteText && (
            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-800">{content.noteText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
