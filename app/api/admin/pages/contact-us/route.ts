import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import ContactUsPage from '@/models/ContactUsPage'

export async function GET() {
  try {
    await connectDB()
    let contactUsPage = await ContactUsPage.findOne()

    if (!contactUsPage) {
      // Create default data if no page exists
      contactUsPage = await ContactUsPage.create({
        // Hero Section
        heroPillText: 'Get in Touch with Experts',
        heroTitle: 'Contact Us',
        heroDescription:
          "Get in touch with our visa experts. We're here to help you with your visa application process.",
        statistics: [
          { label: 'Happy Customers', value: '50K+' },
          { label: 'Success Rate', value: '98.5%' },
          { label: 'Expert Support', value: '24/7' },
        ],

        // Contact Methods Section
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
            order: 0,
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
            order: 1,
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
            order: 2,
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
            order: 3,
            status: 'active',
          },
        ],

        // Contact Information Section
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
            order: 0,
            status: 'active',
          },
          {
            type: 'hours',
            title: 'Business Hours',
            content:
              'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
            icon: 'Clock',
            order: 1,
            status: 'active',
          },
          {
            type: 'other',
            title: 'Why Choose Us',
            content:
              '50,000+ Happy Customers\n98.5% Success Rate\n24/7 Support',
            icon: 'Award',
            order: 2,
            status: 'active',
          },
        ],

        // Form Section
        formTitle: 'Send a Message',
        formDescription: 'We typically respond within 24 hours.',

        // Social Proof Section
        socialProofTitle: 'Award Winning Service',
        socialProofDescription:
          'Recognized for excellence in visa consultancy and customer satisfaction across India.',

        // FAQ Section
        faqSectionSubtitle: 'Common Questions',
        faqTitle: 'Frequently Asked Questions',
        faqDescription:
          "Find answers to common questions about our visa processing services. Can't find what you're looking for? Contact us directly!",
        faqs: [
          {
            question: 'How long does visa processing take?',
            answer:
              'Processing times vary by country and visa type. Tourist visas typically take 5-15 business days, while business and student visas may take longer. We provide estimated timelines for each destination.',
            order: 0,
            status: 'active',
          },
          {
            question: 'What documents do I need?',
            answer:
              'Required documents vary by destination and visa type. Common requirements include passport, photographs, application forms, and supporting documents. We provide a complete checklist for each application.',
            order: 1,
            status: 'active',
          },
          {
            question: 'Can I track my application?',
            answer:
              'Yes! You can track your application status 24/7 using your application ID on our tracking page. We also send SMS and email updates at each stage of processing.',
            order: 2,
            status: 'active',
          },
          {
            question: 'What if my visa is rejected?',
            answer:
              'In case of rejection, we provide detailed feedback and guidance for reapplication. Our experts analyze the reasons and help improve your chances of approval in the next attempt.',
            order: 3,
            status: 'active',
          },
          {
            question: 'Do you provide travel insurance?',
            answer:
              'Yes! We offer comprehensive travel insurance plans starting from ₹149. Our insurance covers medical emergencies, trip cancellations, and other travel-related risks.',
            order: 4,
            status: 'active',
          },
          {
            question: 'What are your business hours?',
            answer:
              'Our main office is open Monday-Friday 9:00 AM - 6:00 PM, Saturday 10:00 AM - 4:00 PM. However, our online support and WhatsApp assistance are available 24/7.',
            order: 5,
            status: 'active',
          },
        ],

        // CTA Section
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

        status: 'active',
        order: 0,
      })
    }

    return NextResponse.json({ success: true, contactUsPage })
  } catch (error) {
    console.error('Error fetching contact us page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact us page' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { _id, ...updateData } = body

    let contactUsPage
    if (_id) {
      contactUsPage = await ContactUsPage.findByIdAndUpdate(_id, updateData, {
        new: true,
        runValidators: true,
      })
    } else {
      contactUsPage = await ContactUsPage.create(updateData)
    }

    if (!contactUsPage) {
      return NextResponse.json(
        { success: false, error: 'Contact us page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, contactUsPage })
  } catch (error) {
    console.error('Error saving contact us page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save contact us page' },
      { status: 500 }
    )
  }
}
