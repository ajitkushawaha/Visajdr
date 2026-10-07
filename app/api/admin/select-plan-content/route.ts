import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDb from '@/lib/db'
import SelectPlanPage from '@/models/SelectPlanPage'

// GET - Fetch select-plan page content
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDb()

    let selectPlanPage = await SelectPlanPage.findOne({ status: 'active' })

    // If no content exists, create default content
    if (!selectPlanPage) {
      selectPlanPage = await SelectPlanPage.create({
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

// POST - Create or update select-plan page content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDb()

    const data = await request.json()

    // Find existing active content or create new
    let selectPlanPage = await SelectPlanPage.findOne({ status: 'active' })

    if (selectPlanPage) {
      // Update existing
      selectPlanPage = await SelectPlanPage.findByIdAndUpdate(
        selectPlanPage._id,
        { $set: data },
        { new: true }
      )
    } else {
      // Create new
      selectPlanPage = new SelectPlanPage(data)
      await selectPlanPage.save()
    }

    return NextResponse.json({
      success: true,
      selectPlanPage,
      message: 'Select-plan page content updated successfully',
    })
  } catch (error) {
    console.error('Error saving select-plan page content:', error)
    return NextResponse.json(
      { error: 'Failed to save select-plan page content' },
      { status: 500 }
    )
  }
}
