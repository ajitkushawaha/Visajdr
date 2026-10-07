import { NextResponse } from 'next/server'
import connectDb from '@/lib/db'
import SelectPlanPage from '@/models/SelectPlanPage'

// GET - Fetch select-plan page content (public)
export async function GET() {
  try {
    await connectDb()

    const selectPlanPage = await SelectPlanPage.findOne({ status: 'active' })

    if (!selectPlanPage) {
      // Return default content if no CMS content exists
      return NextResponse.json({
        success: true,
        selectPlanPage: {
          trustSection: {
            mainText: 'Visa4 has brought joy to over 1,50,000 happy travellers!',
            features: [
              {
                text: '100% Secure Processing',
                order: 0,
                status: 'active',
              },
              {
                text: '24/7 Customer Support',
                order: 1,
                status: 'active',
              },
              {
                text: 'Money Back Guarantee',
                order: 2,
                status: 'active',
              },
            ],
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      selectPlanPage,
    })
  } catch (error) {
    console.error('Error fetching select-plan page content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch select-plan page content' },
      { status: 500 }
    )
  }
}

