import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import AboutUsPage from '@/models/AboutUsPage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    let aboutUsPage = await AboutUsPage.findOne()

    if (!aboutUsPage) {
      // Create default data if no page exists
      aboutUsPage = await AboutUsPage.create({
        // Hero Section
        heroTitle: 'About Us',
        heroSubtitle:
          'Visa4 Technology Private Limited - Revolutionizing visa processing experience for travelers worldwide',

        // Company Info
        companyName: 'Visa4 Technology Private Limited',
        companyDescription:
          'Visa4 Technology Private Limited was established with the vision of revolutionizing the visa processing experience for travelers worldwide. By offering fast and reliable online services, we strive to eliminate the common hassles associated with visa applications.',

        // Problem & Solution
        problemTitle: 'The Challenge',
        problemDescription:
          'Travelers often struggle with travel planning and make mistakes that cause visa rejections. At Visa4, we not only help but also assist you in compiling your documents and prepping for your visa interview from the comfort of your home.',
        solutionTitle: 'Our Solution',
        solutionDescription:
          'We believe in providing a comprehensive travel experience. Our services go beyond visa processing to include travel insurance, OTB (OK to Board), and travel recommendations. This ensures our customers have everything they need for an international trip in one place.',

        // Comprehensive Solutions Card
        comprehensiveTitle: 'Comprehensive Solutions',
        comprehensiveDescription:
          'Everything you need for international travel in one place',

        // B2B Platform
        b2bTitle: 'B2B Platform',
        b2bDescription:
          'For travel agents and corporate clients, we offer a dedicated B2B platform. This provides access to visas and travel insurance at competitive rates. Our platform includes lead management and invoice management tools, streamlining the process for our agents and corporate partners.',

        // Testimonials
        testimonialsTitle: 'What Our Clients Say',
        testimonialsDescription:
          'Our clients have praised our doorstep visa assistance, making the process simple and convenient for families and individuals alike. Our goal is to maximize the success rate of visa applications with the help of our skilled personnel who provide end-to-end guidance and support. We ensure a hassle-free experience, reducing uncertainties and setting the stage for a great trip.',

        // Google Reviews
        showGoogleReviews: false,
        googleReviewsTitle: 'What Our Clients Say',
        googleReviewsDescription: 'Real reviews from our satisfied customers',

        // Services
        servicesTitle: 'Our Services',
        services: [
          { name: 'Doorstep visa assistance', status: 'active', order: 0 },
          { name: 'Document compilation support', status: 'active', order: 1 },
          { name: 'Visa interview preparation', status: 'active', order: 2 },
          { name: 'Travel insurance services', status: 'active', order: 3 },
          { name: 'OTB (OK to Board) assistance', status: 'active', order: 4 },
          { name: 'Travel recommendations', status: 'active', order: 5 },
          { name: 'B2B platform for agents', status: 'active', order: 6 },
          { name: 'Lead management tools', status: 'active', order: 7 },
          { name: 'Invoice management system', status: 'active', order: 8 },
          {
            name: 'End-to-end guidance and support',
            status: 'active',
            order: 9,
          },
          { name: '24/7 customer support', status: 'active', order: 10 },
          {
            name: 'Real-time application tracking',
            status: 'active',
            order: 11,
          },
        ],

        // Destinations
        destinationsTitle: 'Global Reach',
        destinationsDescription:
          'Apply for your tourist, business, or transit visa to top international destinations like Dubai, the UK, the USA, Singapore, Russia, Europe, Thailand, and over 60+ countries with reliability, trust, and precision.',

        // Technology
        technologyTitle: 'Our Technology',
        technologyDescription:
          'Visa4 is an aggregator and provides an automated technology platform for processing of VISA applications. VISA is processed with our verified and registered VISA Agents in a cost effective manner with quality and time assurance.',

        // Team
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

        // Stats
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

        // Milestones
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

        // CTA
        ctaTitle: 'Ready to Start Your Journey?',
        ctaDescription:
          'For booking your next visa or any inquiries, please reach out to us at info@euroworld.com',
        ctaEmail: 'info@euroworld.com',

        status: 'active',
        order: 0,
      })
    }

    // Ensure comprehensive fields exist with defaults if missing (for existing records)
    if (aboutUsPage) {
      let needsSave = false
      if (!aboutUsPage.comprehensiveTitle) {
        aboutUsPage.comprehensiveTitle = 'Comprehensive Solutions'
        needsSave = true
      }
      if (!aboutUsPage.comprehensiveDescription) {
        aboutUsPage.comprehensiveDescription =
          'Everything you need for international travel in one place'
        needsSave = true
      }
      // Only save if we made changes
      if (needsSave) {
        await aboutUsPage.save()
      }
    }

    return NextResponse.json({ success: true, aboutUsPage })
  } catch (error) {
    console.error('Error fetching about us page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about us page' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { _id, ...updateData } = body

    // Log to verify comprehensive fields are in the payload
    console.log('POST request received with comprehensive fields:', {
      comprehensiveTitle: updateData.comprehensiveTitle,
      comprehensiveDescription: updateData.comprehensiveDescription,
      hasComprehensiveTitle: 'comprehensiveTitle' in updateData,
      hasComprehensiveDescription: 'comprehensiveDescription' in updateData,
    })

    // Explicitly ensure comprehensive fields are included
    if (!updateData.comprehensiveTitle) {
      updateData.comprehensiveTitle = 'Comprehensive Solutions'
    }
    if (!updateData.comprehensiveDescription) {
      updateData.comprehensiveDescription =
        'Everything you need for international travel in one place'
    }

    let aboutUsPage
    if (_id) {
      aboutUsPage = await AboutUsPage.findByIdAndUpdate(_id, updateData, {
        new: true,
        runValidators: true,
      })
    } else {
      aboutUsPage = await AboutUsPage.create(updateData)
    }

    if (!aboutUsPage) {
      return NextResponse.json(
        { success: false, error: 'About us page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, aboutUsPage })
  } catch (error: any) {
    console.error('Error saving about us page:', error)

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save about us page',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
