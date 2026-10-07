import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TermsOfServicePage from '@/models/TermsOfServicePage'

export async function GET() {
  try {
    await connectDB()
    let termsOfServicePage = await TermsOfServicePage.findOne()

    if (!termsOfServicePage) {
      // Create default data if no page exists
      termsOfServicePage = await TermsOfServicePage.create({
        // Page Meta
        title: 'Terms of Service',
        subtitle: 'Terms and conditions for using our visa processing services',
        lastUpdated: new Date(),
        effectiveDate: new Date(),

        // Introduction
        introduction:
          "Welcome to Visa4 Technology Private Limited. These Terms of Service ('Terms') govern your use of our visa processing services and website. By using our services, you agree to be bound by these Terms. Please read them carefully.",

        // Terms Sections
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
              'Payment Terms:\n• All fees must be paid in advance before processing begins\n• Payment methods include credit cards, debit cards, and bank transfers\n• Prices are subject to change with prior notice\n\nRefund Policy:\n• Processing fees are non-refundable once processing has begun\n• Government fees are non-refundable as they are paid to authorities\n• Refunds may be considered in cases of service failure on our part\n• Refund requests must be submitted within 30 days of service completion',
            order: 4,
            status: 'active',
          },
          {
            title: 'Privacy and Data Protection',
            content:
              'Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices regarding the collection and use of your personal information.',
            order: 5,
            status: 'active',
          },
          {
            title: 'Intellectual Property Rights',
            content:
              'All content, trademarks, and intellectual property on our website and in our services are owned by Visa4 Technology Private Limited or our licensors. You may not:\n\n• Copy, modify, or distribute our content without permission\n• Use our trademarks or logos without authorization\n• Reverse engineer or attempt to extract source code\n• Create derivative works based on our services',
            order: 6,
            status: 'active',
          },
          {
            title: 'Limitation of Liability',
            content:
              'To the maximum extent permitted by law, Visa4 Technology Private Limited shall not be liable for:\n\n• Any indirect, incidental, or consequential damages\n• Loss of profits, data, or business opportunities\n• Delays or failures in visa processing\n• Actions or decisions of government authorities\n• Third-party service interruptions or failures',
            order: 7,
            status: 'active',
          },
          {
            title: 'Indemnification',
            content:
              'You agree to indemnify and hold harmless Visa4 Technology Private Limited from any claims, damages, or expenses arising from:\n\n• Your use of our services\n• Your violation of these Terms\n• Your violation of any applicable laws\n• Any content you submit or transmit through our services',
            order: 8,
            status: 'active',
          },
          {
            title: 'Termination',
            content:
              'We may terminate or suspend your access to our services immediately, without prior notice, for any reason, including if you breach these Terms. Upon termination:\n\n• Your right to use our services will cease immediately\n• We may delete your account and data\n• You remain liable for all charges incurred before termination',
            order: 9,
            status: 'active',
          },
          {
            title: 'Dispute Resolution',
            content:
              'Any disputes arising from these Terms or your use of our services will be resolved through:\n\n1. Good faith negotiations between the parties\n2. Mediation if negotiations fail\n3. Binding arbitration if mediation is unsuccessful\n4. Jurisdiction: Courts of Goa, India',
            order: 10,
            status: 'active',
          },
          {
            title: 'Governing Law',
            content:
              'These Terms shall be governed by and construed in accordance with the laws of India. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts of Goa, India.',
            order: 11,
            status: 'active',
          },
          {
            title: 'Changes to Terms',
            content:
              "We reserve the right to modify these Terms at any time. We will notify users of any material changes by:\n\n• Posting the updated Terms on our website\n• Sending email notifications to registered users\n• Updating the 'Last Updated' date\n\nContinued use of our services after changes constitutes acceptance of the new Terms.",
            order: 12,
            status: 'active',
          },
          {
            title: 'Severability',
            content:
              'If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will remain in full force and effect. We will replace any invalid provision with a valid one that most closely reflects the original intent.',
            order: 13,
            status: 'active',
          },
        ],

        // Contact Information
        contactEmail: 'legal@euroworld.com',
        contactPhone: '+91-98765-43210',
        contactAddress:
          'F-14 1st Floor Alfran Plaza, Near Don Bosco, MG Road, Panjim, Goa - 403001, India',
        legalDepartmentEmail: 'legal@euroworld.com',

        // Additional Info
        noteText:
          'These Terms of Service are effective as of the date listed above and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.',

        status: 'active',
        order: 0,
      })
    }

    return NextResponse.json({ success: true, termsOfServicePage })
  } catch (error) {
    console.error('Error fetching terms of service page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch terms of service page' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { _id, ...updateData } = body

    let termsOfServicePage
    if (_id) {
      termsOfServicePage = await TermsOfServicePage.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true }
      )
    } else {
      termsOfServicePage = await TermsOfServicePage.create(updateData)
    }

    if (!termsOfServicePage) {
      return NextResponse.json(
        { success: false, error: 'Terms of service page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, termsOfServicePage })
  } catch (error) {
    console.error('Error saving terms of service page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save terms of service page' },
      { status: 500 }
    )
  }
}
