import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import TermsOfServicePage from '@/models/TermsOfServicePage'

export async function GET() {
  try {
    await connectDB()
    
    let termsOfServicePage = await TermsOfServicePage.findOne()

    if (!termsOfServicePage) {
      // Return default terms of service data
      return NextResponse.json({
        success: true,
        data: {
          title: "Terms of Service",
          subtitle: "Terms and conditions for using our visa processing services",
          lastUpdated: new Date(),
          effectiveDate: new Date(),
          introduction: "Welcome to Visa4 Technology Private Limited. These Terms of Service ('Terms') govern your use of our visa processing services and website. By using our services, you agree to be bound by these Terms. Please read them carefully.",
          sections: [
            {
              title: "Acceptance of Terms",
              content: "By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
              order: 0,
              status: "active"
            },
            {
              title: "Description of Service",
              content: "Visa4 Technology Private Limited provides visa processing services, travel insurance, and related travel assistance services. We act as an intermediary between you and various government authorities to facilitate visa applications.",
              order: 1,
              status: "active"
            },
            {
              title: "User Responsibilities and Obligations",
              content: "As a user of our services, you agree to:\n\n• Provide accurate and complete information\n• Maintain the confidentiality of your account credentials\n• Comply with all applicable laws and regulations\n• Not use our services for any unlawful or prohibited purpose\n• Not attempt to gain unauthorized access to our systems\n• Not interfere with or disrupt our services",
              order: 2,
              status: "active"
            },
            {
              title: "Service Limitations and Disclaimers",
              content: "While we strive to provide accurate and up-to-date information, we cannot guarantee:\n\n• The accuracy of visa requirements or processing times\n• The approval of your visa application\n• The availability of our services at all times\n• The performance of third-party services or government systems\n\nOur services are provided 'as is' without warranties of any kind.",
              order: 3,
              status: "active"
            },
            {
              title: "Payment Terms and Refund Policy",
              content: "Payment for our services is due at the time of application submission. Refunds are subject to our refund policy and may vary based on the stage of processing and applicable government fees.",
              order: 4,
              status: "active"
            },
            {
              title: "Privacy and Data Protection",
              content: "We are committed to protecting your privacy and personal information. Please review our Privacy Policy for detailed information about how we collect, use, and protect your data.",
              order: 5,
              status: "active"
            },
            {
              title: "Limitation of Liability",
              content: "To the maximum extent permitted by law, Visa4 Technology Private Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services.",
              order: 6,
              status: "active"
            },
            {
              title: "Modifications to Terms",
              content: "We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the modified Terms.",
              order: 7,
              status: "active"
            },
            {
              title: "Contact Information",
              content: "If you have any questions about these Terms, please contact us at:\n\nEmail: legal@euroworld.com\nPhone: +91-98765-43210\nAddress: F-14 1st Floor Alfran Plaza, Near Don Bosco, MG Road, Panjim, Goa - 403001, India",
              order: 8,
              status: "active"
            }
          ],
          contactEmail: "legal@euroworld.com",
          contactPhone: "+91-98765-43210",
          contactAddress: "F-14 1st Floor Alfran Plaza, Near Don Bosco, MG Road, Panjim, Goa - 403001, India"
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: termsOfServicePage
    })
  } catch (error) {
    console.error('Error fetching terms of service content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch terms of service content' },
      { status: 500 }
    )
  }
}