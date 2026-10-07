import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaCoupon from '@/models/VisaCoupon'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    // First, check and update all expired coupons (regardless of current status filter)
    const now = new Date()
    const expiredCoupons = await VisaCoupon.find({
      status: 'active',
      endDate: { $lt: now },
    })

    if (expiredCoupons.length > 0) {
      const expiredIds = expiredCoupons.map(c => c._id)
      await VisaCoupon.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: 'expired' } }
      )
      console.log(`✅ Updated ${expiredCoupons.length} expired coupons`)
    }

    // Now fetch coupons with status filter
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    // Build query
    let query: any = {}
    if (status !== 'all') {
      query.status = status
    }

    // Fetch coupons from database
    const coupons = await VisaCoupon.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      coupons,
      total: coupons.length,
    })
  } catch (error) {
    console.error('Failed to fetch visa coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visa coupons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      applicableVisas,
      applicableCountries,
      startDate,
      endDate,
      usageLimit,
      status,
    } = body

    // Validate required fields
    if (
      !code ||
      !name ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: code, name, discountType, discountValue, startDate, endDate',
        },
        { status: 400 }
      )
    }

    // Validate discount value
    if (discountValue <= 0) {
      return NextResponse.json(
        { error: 'Discount value must be greater than 0' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check if coupon code already exists
    const existingCoupon = await VisaCoupon.findOne({
      code: code.toUpperCase(),
    })

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 409 }
      )
    }

    // Create new coupon
    const newCoupon = new VisaCoupon({
      code: code.toUpperCase(),
      name,
      description: description || '',
      discountType,
      discountValue: parseFloat(discountValue),
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      applicableVisas: applicableVisas || [],
      applicableCountries: applicableCountries || [],
      startDate: start,
      endDate: end,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      usedCount: 0,
      status: status || 'active',
    })

    await newCoupon.save()

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      coupon: newCoupon,
    })
  } catch (error) {
    console.error('Failed to create visa coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create visa coupon' },
      { status: 500 }
    )
  }
}
