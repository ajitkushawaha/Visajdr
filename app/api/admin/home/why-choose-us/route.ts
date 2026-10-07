import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import WhyChooseUsSection from '@/models/WhyChooseUsSection'

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

// GET - Fetch Why Choose Us section
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    // Find the active why choose us section
    const whyChooseUsSection = await WhyChooseUsSection.findOne({
      status: 'active',
    })

    if (!whyChooseUsSection) {
      // Return default data if no section found
      return NextResponse.json({
        success: true,
        whyChooseUsSection: {
          title: 'WHY CHOOSE US',
          subtitle: 'Why are we famous?',
          description:
            'At the Visa4, you can get help in solving a single issue or get a turnkey visa. Cooperation between the client and the visa consultant in India is possible both in person and remotely.',
          backgroundImage: '/visa/bg2.png',
          features: [
            {
              title: 'Expert Consultation',
              description:
                'Consultation on choosing the best place to submit documents',
              icon: 'User',
              backgroundColor: '',
              textColor: '',
              iconColor: '',
              status: 'active',
              order: 1,
            },
            {
              title: 'Document Preparation',
              description:
                'Preparation of all necessary documents for obtaining a permit',
              icon: 'FileText',
              backgroundColor: '',
              textColor: '',
              iconColor: '',
              status: 'active',
              order: 2,
            },
            {
              title: 'Appointment Scheduling',
              description: 'Finding a suitable time and making an appointment',
              icon: 'Calendar',
              backgroundColor: '',
              textColor: '',
              iconColor: '',
              status: 'active',
              order: 3,
            },
            {
              title: 'Travel Planning Support',
              description: 'Complete Airline ticket reservations, hotel search',
              icon: 'Building2',
              backgroundColor: '#1a1b5c',
              textColor: 'white',
              iconColor: 'white',
              status: 'active',
              order: 4,
            },
            {
              title: 'Permit Finalization',
              description: 'completing the entry permit process',
              icon: 'Settings',
              backgroundColor: '',
              textColor: '',
              iconColor: '',
              status: 'active',
              order: 5,
            },
          ],
          status: 'active',
          order: 0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      whyChooseUsSection,
    })
  } catch (error) {
    console.error('Error fetching why choose us section:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or Update Why Choose Us section
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    const data = await request.json()

    // Find existing active section or create new one
    let whyChooseUsSection = await WhyChooseUsSection.findOne({
      status: 'active',
    })

    if (whyChooseUsSection) {
      // Update existing section
      whyChooseUsSection.title = data.title
      whyChooseUsSection.subtitle = data.subtitle
      whyChooseUsSection.description = data.description
      whyChooseUsSection.backgroundImage = data.backgroundImage
      whyChooseUsSection.features = data.features
      whyChooseUsSection.status = data.status
      whyChooseUsSection.order = data.order

      await whyChooseUsSection.save()
    } else {
      // Create new section
      whyChooseUsSection = new WhyChooseUsSection({
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        backgroundImage: data.backgroundImage,
        features: data.features,
        status: data.status || 'active',
        order: data.order || 0,
      })

      await whyChooseUsSection.save()
    }

    return NextResponse.json({
      success: true,
      message: 'Why Choose Us section updated successfully',
      whyChooseUsSection,
    })
  } catch (error) {
    console.error('Error updating why choose us section:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
