import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import PrivacyPolicyPage from '@/models/PrivacyPolicyPage'

export async function GET() {
  try {
    await connectDB()
    let privacyPolicyPage = await PrivacyPolicyPage.findOne()

    if (!privacyPolicyPage) {
      // Create default data if no page exists
      privacyPolicyPage = await PrivacyPolicyPage.create({
        // Page Meta
        title: 'Privacy Policy',
        subtitle: 'How we collect, use, and protect your personal information',
        lastUpdated: new Date(),
        effectiveDate: new Date(),

        // Introduction
        introduction:
          'At Visa4 Technology Private Limited, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our visa processing services.',

        // Policy Sections
        sections: [
          {
            title: 'Information We Collect',
            content:
              'We collect information you provide directly to us, such as when you create an account, apply for a visa, or contact us for support. This may include:\n\n• Personal identification information (name, email address, phone number)\n• Passport and travel document information\n• Payment and billing information\n• Communication preferences\n• Any other information you choose to provide',
            order: 0,
            status: 'active',
          },
          {
            title: 'How We Use Your Information',
            content:
              'We use the information we collect to:\n\n• Process your visa applications\n• Provide customer support and respond to your inquiries\n• Send you important updates about your applications\n• Improve our services and develop new features\n• Comply with legal obligations and regulatory requirements\n• Prevent fraud and ensure the security of our services',
            order: 1,
            status: 'active',
          },
          {
            title: 'Information Sharing and Disclosure',
            content:
              'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:\n\n• With government authorities as required for visa processing\n• With trusted service providers who assist us in operating our business\n• When required by law or to protect our rights and interests\n• With your explicit consent',
            order: 2,
            status: 'active',
          },
          {
            title: 'Data Security',
            content:
              'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:\n\n• Encryption of sensitive data\n• Secure data transmission protocols\n• Regular security assessments and updates\n• Access controls and authentication measures\n• Staff training on data protection practices',
            order: 3,
            status: 'active',
          },
          {
            title: 'Your Rights',
            content:
              'You have the right to:\n\n• Access your personal information\n• Correct inaccurate or incomplete information\n• Request deletion of your personal information\n• Object to processing of your information\n• Data portability\n• Withdraw consent at any time\n\nTo exercise these rights, please contact us using the information provided below.',
            order: 4,
            status: 'active',
          },
          {
            title: 'Cookies and Tracking Technologies',
            content:
              'We use cookies and similar technologies to enhance your experience on our website. These technologies help us:\n\n• Remember your preferences and settings\n• Analyze website traffic and usage patterns\n• Provide personalized content and recommendations\n• Improve website functionality and performance\n\nYou can control cookie settings through your browser preferences.',
            order: 5,
            status: 'active',
          },
          {
            title: 'Data Retention',
            content:
              'We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Visa application data may be retained for extended periods as required by government regulations.',
            order: 6,
            status: 'active',
          },
          {
            title: 'International Data Transfers',
            content:
              'Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers are conducted in accordance with applicable data protection laws and that appropriate safeguards are in place to protect your information.',
            order: 7,
            status: 'active',
          },
          {
            title: "Children's Privacy",
            content:
              'Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.',
            order: 8,
            status: 'active',
          },
          {
            title: 'Changes to This Policy',
            content:
              "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and updating the 'Last Updated' date. We encourage you to review this policy periodically.",
            order: 9,
            status: 'active',
          },
        ],

        // Contact Information
        contactEmail: 'privacy@euroworld.com',
        contactPhone: '+91-98765-43210',
        contactAddress:
          'F-14 1st Floor Alfran Plaza, Near Don Bosco, MG Road, Panjim, Goa - 403001, India',
        dpoEmail: 'dpo@euroworld.com',

        // Additional Info
        noteText:
          'This Privacy Policy is effective as of the date listed above and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.',

        status: 'active',
        order: 0,
      })
    }

    return NextResponse.json({ success: true, privacyPolicyPage })
  } catch (error) {
    console.error('Error fetching privacy policy page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch privacy policy page' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { _id, ...updateData } = body

    let privacyPolicyPage
    if (_id) {
      privacyPolicyPage = await PrivacyPolicyPage.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true }
      )
    } else {
      privacyPolicyPage = await PrivacyPolicyPage.create(updateData)
    }

    if (!privacyPolicyPage) {
      return NextResponse.json(
        { success: false, error: 'Privacy policy page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, privacyPolicyPage })
  } catch (error) {
    console.error('Error saving privacy policy page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save privacy policy page' },
      { status: 500 }
    )
  }
}
