import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import VisaCoupon from "@/models/VisaCoupon";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const schema = z.object({
      code: z.string().trim().min(1, { message: "Coupon code is required" }),
      country: z.string().trim().optional(),
      visaType: z.string().trim().optional(),
      amount: z.coerce.number().positive({ message: "Amount must be positive" }).optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { code, country, visaType, amount } = parsed.data;

    // Validate required fields
    if (!code) {
      return NextResponse.json({
        error: 'Coupon code is required'
      }, { status: 400 });
    }

    // Find the coupon
    const coupon = await VisaCoupon.findOne({ 
      code: code.toUpperCase(),
      status: 'active'
    });

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid coupon code'
      });
    }

    const now = new Date();

    // Check if coupon is expired
    if (now > coupon.endDate) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon has expired'
      });
    }

    // Check if coupon has started
    if (now < coupon.startDate) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon is not yet active'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon usage limit exceeded'
      });
    }

    // Check minimum amount requirement
    if (coupon.minAmount && amount && amount < coupon.minAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum amount required: ₹${coupon.minAmount}`
      });
    }

    // Check country restrictions
    if (coupon.applicableCountries.length > 0 && country) {
      const countryLower = country.toLowerCase();
      if (!coupon.applicableCountries.includes(countryLower)) {
        return NextResponse.json({
          valid: false,
          error: 'Coupon not applicable for this country'
        });
      }
    }

    // Check visa type restrictions
    if (coupon.applicableVisas.length > 0 && visaType) {
      if (!coupon.applicableVisas.includes(visaType)) {
        return NextResponse.json({
          valid: false,
          error: 'Coupon not applicable for this visa type'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (amount) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (amount * coupon.discountValue) / 100;
        
        // Apply maximum discount limit if set
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        // Fixed amount discount
        discountAmount = coupon.discountValue;
      }
    }

    const finalAmount = amount ? Math.max(0, amount - discountAmount) : 0;

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        maxDiscount: coupon.maxDiscount,
        minAmount: coupon.minAmount
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
