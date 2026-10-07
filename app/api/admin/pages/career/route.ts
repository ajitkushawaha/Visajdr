import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import CareerPage from '@/models/CareerPage'

export async function GET() {
  try {
    await connectDB()

    let careerPage = await CareerPage.findOne()

    if (!careerPage) {
      // Create default career page data
      careerPage = new CareerPage({
        heroTitle: 'Join Our Mission to Simplify Global Travel',
        heroSubtitle:
          "Be part of a dynamic team that's revolutionizing visa processing and making international travel accessible to everyone. Grow your career while making a meaningful impact on travelers worldwide.",
        heroPrimaryButtonText: 'View Open Positions',
        heroPrimaryButtonLink: '#open-positions',
        heroSecondaryButtonText: 'Apply Now',
        heroSecondaryButtonLink: '/career/apply',
        companyStats: [
          { number: '200+', label: 'Team Members' },
          { number: '60+', label: 'Countries Served' },
          { number: '98%', label: 'Employee Satisfaction' },
          { number: '5+', label: 'Office Locations' },
        ],
        openPositionsTitle: 'Open Positions',
        openPositionsSubtitle:
          "Discover exciting opportunities to grow your career with us. We're always looking for talented individuals who share our passion for excellence.",
        openPositionsDescription:
          'At Visa4, every role matters. From visa consultants to support staff, our team helps travelers reach their dreams. Grow your skills, collaborate with passionate people, and make a real impact.',
        openPositions: [
          {
            title: 'Senior Visa Consultant',
            department: 'Operations',
            location: 'New Delhi, India',
            type: 'Full-time',
            description:
              'Lead visa consultation services, guide clients through complex immigration processes, and maintain high success rates.',
          },
          {
            title: 'Customer Support Specialist',
            department: 'Support',
            location: 'Mumbai, India',
            type: 'Full-time',
            description:
              'Provide exceptional customer service, resolve client queries, and ensure smooth visa application processes.',
          },
        ],
        benefitsTitle: 'Why Work With Us?',
        benefitsSubtitle:
          'We offer comprehensive benefits and a supportive work environment that helps you thrive both personally and professionally.',
        benefits: [
          {
            icon: 'Heart',
            title: 'Health & Wellness',
            description:
              'Comprehensive health insurance, wellness programs, and mental health support for you and your family.',
          },
          {
            icon: 'Laptop',
            title: 'Flexible Work',
            description:
              'Hybrid work options, flexible hours, and modern equipment to help you work efficiently.',
          },
          {
            icon: 'GraduationCap',
            title: 'Learning & Development',
            description:
              'Continuous learning opportunities, skill development programs, and conference attendance support.',
          },
          {
            icon: 'Coffee',
            title: 'Work-Life Balance',
            description:
              'Generous PTO, team outings, recreational activities, and a supportive work environment.',
          },
          {
            icon: 'TrendingUp',
            title: 'Career Growth',
            description:
              'Clear career progression paths, mentorship programs, and leadership development opportunities.',
          },
          {
            icon: 'Award',
            title: 'Recognition & Rewards',
            description:
              'Performance bonuses, employee recognition programs, and competitive compensation packages.',
          },
        ],
        valuesTitle: 'Our Values',
        valuesSubtitle:
          'These core values guide everything we do and shape our company culture.',
        companyValues: [
          {
            icon: 'Target',
            title: 'Customer First',
            description:
              'We prioritize customer satisfaction and success in everything we do.',
          },
          {
            icon: 'Users',
            title: 'Team Collaboration',
            description:
              'We believe in the power of teamwork and collective achievement.',
          },
          {
            icon: 'Zap',
            title: 'Innovation',
            description:
              'We continuously innovate to improve our services and processes.',
          },
          {
            icon: 'Shield',
            title: 'Integrity',
            description:
              'We maintain the highest standards of honesty and transparency.',
          },
        ],
        cultureTitle: 'Our Culture',
        cultureSubtitle:
          'We foster an inclusive, collaborative environment where everyone can contribute and grow.',
        cultureDescription:
          'At Visa4, we believe that great companies are built by great people. Our culture is built on trust, collaboration, and a shared commitment to excellence. We celebrate diversity, encourage innovation, and provide opportunities for continuous learning and growth.',
        cultureFeatures: [
          'Inclusive and diverse workplace',
          'Collaborative team environment',
          'Continuous learning opportunities',
          'Flexible work arrangements',
          'Regular team building activities',
          'Open communication channels',
        ],
        applicationProcessTitle: 'How to Apply',
        applicationProcessSubtitle:
          'Our application process is designed to be transparent and efficient.',
        applicationSteps: [
          {
            number: '1',
            title: 'Browse Open Positions',
            description:
              'Explore our current job openings and find the role that matches your skills and interests.',
          },
          {
            number: '2',
            title: 'Submit Your Application',
            description:
              'Complete our online application form and upload your resume and cover letter.',
          },
          {
            number: '3',
            title: 'Initial Screening',
            description:
              'Our HR team will review your application and may conduct a brief phone screening.',
          },
          {
            number: '4',
            title: 'Interview Process',
            description:
              'Selected candidates will be invited for interviews with the hiring manager and team members.',
          },
          {
            number: '5',
            title: 'Final Decision',
            description:
              "We'll notify you of our decision and discuss next steps if you're selected.",
          },
        ],
        ctaTitle: 'Ready to Join Our Team?',
        ctaSubtitle:
          "Take the next step in your career journey with us. We're excited to learn about your skills and how you can contribute to our mission.",
        ctaPrimaryButtonText: 'View All Positions',
        ctaSecondaryButtonText: 'Contact HR',
        seoTitle: 'Career Opportunities - Join Our Team | Visa4',
        seoDescription:
          'Explore exciting career opportunities at Visa4. Join our dynamic team and help revolutionize visa processing and global travel. Apply now!',
        seoKeywords: [
          'careers',
          'jobs',
          'employment',
          'hiring',
          'team',
          'work',
          'opportunities',
        ],
      })

      await careerPage.save()
    }

    return NextResponse.json({
      success: true,
      data: careerPage,
    })
  } catch (error) {
    console.error('Error fetching career page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch career page' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()

    let careerPage = await CareerPage.findOne()

    if (careerPage) {
      // Update existing
      Object.assign(careerPage, data)
      await careerPage.save()
    } else {
      // Create new
      careerPage = new CareerPage(data)
      await careerPage.save()
    }

    return NextResponse.json({
      success: true,
      message: 'Career page updated successfully',
      data: careerPage,
    })
  } catch (error) {
    console.error('Error updating career page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update career page' },
      { status: 500 }
    )
  }
}
