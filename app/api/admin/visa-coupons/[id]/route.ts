import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import VisaCoupon from "@/models/VisaCoupon";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Find the coupon
    const coupon = await VisaCoupon.findById(id);
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Visa coupon not found' },
        { status: 404 }
      );
    }

    // Check if code is being changed and if it already exists
    if (body.code && body.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await VisaCoupon.findOne({ 
        code: body.code.toUpperCase(),
        _id: { $ne: id }
      });

      if (existingCoupon) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 409 }
        );
      }
    }

    // Validate dates if provided
    if (body.startDate && body.endDate) {
      const start = new Date(body.startDate);
      const end = new Date(body.endDate);
      if (start >= end) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Update coupon
    const updateData: any = { ...body };
    
    if (body.code) {
      updateData.code = body.code.toUpperCase();
    }
    
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate);
    }
    
    if (body.endDate) {
      updateData.endDate = new Date(body.endDate);
    }

    const updatedCoupon = await VisaCoupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon: updatedCoupon
    });

  } catch (error) {
    console.error('Failed to update visa coupon:', error);
    return NextResponse.json(
      { error: 'Failed to update visa coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    // Find the coupon
    const coupon = await VisaCoupon.findById(id);
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Visa coupon not found' },
        { status: 404 }
      );
    }

    // Delete the coupon
    await VisaCoupon.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete visa coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete visa coupon' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    // Find the coupon
    const coupon = await VisaCoupon.findById(id);
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Visa coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon
    });

  } catch (error) {
    console.error('Failed to fetch visa coupon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa coupon' },
      { status: 500 }
    );
  }
}