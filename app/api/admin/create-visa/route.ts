import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import Visa from '@/models/Visa'
import connectDb from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await connectDb()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const visaData = await request.json()
    if (!visaData.country || !visaData.visaType || !visaData.adultPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for duplicate: country + visaType + occupancyType + category must be unique
    const duplicate = await Visa.findOne({
      country: { $regex: `^${visaData.country}$`, $options: 'i' },
      visaType: { $regex: `^${visaData.visaType}$`, $options: 'i' },
      occupancyType: {
        $regex: `^${visaData.occupancyType || 'single'}$`,
        $options: 'i',
      },
      category: {
        $regex: `^${visaData.category || 'standard'}$`,
        $options: 'i',
      },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          error: `Visa with this country (${visaData.country}), type (${visaData.visaType}), occupancy (${visaData.occupancyType || 'single'}), and category (${visaData.category || 'standard'}) already exists`,
        },
        { status: 409 }
      )
    }

    const newVisa = new Visa({
      ...visaData,
      country: visaData.country.toLowerCase(),
      visaType: visaData.visaType.toLowerCase(),
      hotListed:
        String(visaData.hotListed).toLowerCase() === 'true' ? 'true' : 'false',
      restListed:
        String(visaData.restListed).toLowerCase() === 'true' ? 'true' : 'false',
      createdBy: session.user.name || session.user.email,
    })

    await newVisa.save()

    return NextResponse.json(
      { message: 'Visa created successfully', visa: newVisa },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating visa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectDb()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const visas = await Visa.find().sort({ createdAt: -1 })
    return NextResponse.json({ visas, total: visas.length })
  } catch (error) {
    console.error('Error fetching visas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
