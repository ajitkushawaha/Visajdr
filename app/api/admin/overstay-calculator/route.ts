import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import OverstayCalculatorConfig from '@/models/OverstayCalculatorConfig'

// GET - Fetch all overstay calculator configurations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const configs = await OverstayCalculatorConfig.find({})
      .sort({ country: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: configs,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch overstay calculator configurations' },
      { status: 500 }
    )
  }
}

// POST - Create or update overstay calculator configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    // Validate required fields
    if (!body.country) {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      )
    }

    // Find existing config by country
    let config = await OverstayCalculatorConfig.findOne({
      country: body.country,
    })

    if (config) {
      // Update existing config
      Object.assign(config, body)
      await config.save()
    } else {
      // Create new config
      config = new OverstayCalculatorConfig(body)
      await config.save()
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Overstay calculator configuration saved successfully',
    })
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A configuration for this country already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save overstay calculator configuration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete overstay calculator configuration
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')

    if (!country) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      )
    }

    const deleted = await OverstayCalculatorConfig.findOneAndDelete({ country })

    if (!deleted) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Overstay calculator configuration deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete overstay calculator configuration' },
      { status: 500 }
    )
  }
}
