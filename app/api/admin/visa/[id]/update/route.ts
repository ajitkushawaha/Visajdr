import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import Visa from '@/models/Visa'
import connectDb from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    const updateData = await request.json()

    // Basic validation
    if (!updateData.country || !updateData.visaType || !updateData.adultPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const allowedProcessingDays = ['in-days', 'schengen']
    if (updateData.processingTimeDays) {
      const raw = String(updateData.processingTimeDays).toLowerCase()
      const normalized = raw.includes('day')
        ? 'in-days'
        : raw.includes('schengen')
          ? 'schengen'
          : raw
      if (!allowedProcessingDays.includes(normalized)) {
        if (normalized === 'other') {
          delete updateData.processingTimeDays
        } else {
          return NextResponse.json(
            {
              error: 'Invalid processingTimeDays',
              allowed: allowedProcessingDays,
            },
            { status: 400 }
          )
        }
      } else {
        updateData.processingTimeDays = normalized
      }
    }

    // Optional: Check for duplicates excluding current ID
    const duplicate = await Visa.findOne({
      _id: { $ne: id },
      country: { $regex: `^${updateData.country}$`, $options: 'i' },
      visaType: { $regex: `^${updateData.visaType}$`, $options: 'i' },
    })

    if (duplicate) {
      return NextResponse.json(
        { error: 'Visa with this country and type already exists' },
        { status: 409 }
      )
    }

    // Ensure quotation content fields are preserved
    const updatePayload: any = {
      ...updateData,
      country: updateData.country.toLowerCase(),
      visaType: updateData.visaType.toLowerCase(),
      updatedBy: session.user.name || session.user.email,
      updatedAt: new Date(),
    }
    if (typeof updateData.restListed !== 'undefined') {
      updatePayload.restListed =
        String(updateData.restListed).toLowerCase() === 'true'
          ? 'true'
          : 'false'
    }
    if (typeof updateData.hotListed !== 'undefined') {
      updatePayload.hotListed =
        String(updateData.hotListed).toLowerCase() === 'true' ? 'true' : 'false'
    }

    // Ensure quotation content fields are included if they exist in updateData
    if (updateData.visaSchedule) {
      updatePayload.visaSchedule = updateData.visaSchedule
    }
    if (updateData.documentRequirements) {
      updatePayload.documentRequirements = updateData.documentRequirements
    }
    if (updateData.operatingSchedule) {
      updatePayload.operatingSchedule = updateData.operatingSchedule
    }
    if (updateData.faq !== undefined) {
      updatePayload.faq = updateData.faq
    }

    console.log('💾 Updating visa with quotation fields:', {
      hasVisaSchedule: !!updatePayload.visaSchedule,
      hasDocumentRequirements: !!updatePayload.documentRequirements,
      documentRequirementsKeys: updatePayload.documentRequirements
        ? Object.keys(updatePayload.documentRequirements)
        : [],
      hasOperatingSchedule: !!updatePayload.operatingSchedule,
      hasFaq: !!updatePayload.faq,
      faqCount: updatePayload.faq?.length || 0,
    })

    const updatedVisa = await Visa.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    })

    if (!updatedVisa) {
      return NextResponse.json({ error: 'Visa not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Visa updated successfully',
      visa: updatedVisa,
    })
  } catch (error) {
    console.error('Error updating visa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const resolvedParams = await params
    const visa = await Visa.findById(resolvedParams.id)
    if (!visa) {
      return NextResponse.json({ error: 'Visa not found' }, { status: 404 })
    }
    return NextResponse.json(visa)
  } catch (error) {
    console.error('Error fetching visa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
