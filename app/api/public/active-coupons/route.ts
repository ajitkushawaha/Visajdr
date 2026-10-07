import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import VisaCoupon from "@/models/VisaCoupon";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const visaType = searchParams.get('visaType');
    const amount = searchParams.get('amount');

    const now = new Date();

    // Build query for active coupons
    let query: any = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    // Check usage limits
    query.$or = [
      { usageLimit: { $exists: false } },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
    ];

    // Find all active coupons first
    const allCoupons = await VisaCoupon.find(query).sort({ discountValue: -1 }).lean();

    // Filter coupons based on country, visa type, and amount
    const applicableCoupons = allCoupons.filter(coupon => {
      // Check country restrictions
      if (coupon.applicableCountries.length > 0 && country) {
        const countryLower = country.toLowerCase();
        if (!coupon.applicableCountries.includes(countryLower)) {
          return false;
        }
      }

      // Check visa type restrictions
      if (coupon.applicableVisas.length > 0 && visaType) {
        if (!coupon.applicableVisas.includes(visaType)) {
          return false;
        }
      }

      // Check minimum amount requirement
      if (coupon.minAmount && amount) {
        const amountNum = parseFloat(amount);
        if (amountNum < coupon.minAmount) {
          return false;
        }
      }

      return true;
    });

    // Calculate discount amounts for each coupon
    const couponsWithDiscounts = applicableCoupons.map(coupon => {
      let discountAmount = 0;
      let finalAmount = 0;

      if (amount) {
        const amountNum = parseFloat(amount);
        
        if (coupon.discountType === 'percentage') {
          discountAmount = (amountNum * coupon.discountValue) / 100;
          
          // Apply maximum discount limit if set
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          // Fixed amount discount
          discountAmount = coupon.discountValue;
        }

        finalAmount = Math.max(0, amountNum - discountAmount);
      }

      return {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        maxDiscount: coupon.maxDiscount,
        minAmount: coupon.minAmount,
        applicableVisas: coupon.applicableVisas,
        applicableCountries: coupon.applicableCountries,
        endDate: coupon.endDate,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount
      };
    });

    return NextResponse.json({
      success: true,
      coupons: couponsWithDiscounts,
      total: couponsWithDiscounts.length
    });

  } catch (error) {
    console.error('Error fetching active coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active coupons' },
      { status: 500 }
    );
  }
}
