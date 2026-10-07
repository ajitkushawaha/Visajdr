import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import { emailService } from "@/lib/emailService";

interface BookingData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  serviceType: 'visa' | 'travel-insurance';
  serviceDetails: any;
  totalAmount: number;
  bookingDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated (admin or user)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      bookingId,
      customerName,
      customerEmail,
      serviceType,
      serviceDetails,
      totalAmount,
      bookingDate,
      status = 'confirmed'
    }: BookingData = body;

    // Validate required fields
    if (!bookingId || !customerName || !customerEmail || !serviceType || !totalAmount) {
      return NextResponse.json({
        error: 'Missing required fields: bookingId, customerName, customerEmail, serviceType, totalAmount'
      }, { status: 400 });
    }

    // Validate service type
    if (!['visa', 'travel-insurance'].includes(serviceType)) {
      return NextResponse.json({
        error: 'Invalid serviceType. Must be "visa" or "travel-insurance"'
      }, { status: 400 });
    }

    // Prepare booking data
    const bookingData: BookingData = {
      bookingId,
      customerName,
      customerEmail,
      serviceType,
      serviceDetails: serviceDetails || {},
      totalAmount,
      bookingDate: bookingDate || new Date().toISOString(),
      status
    };

    // Send email
    const emailSent = await emailService.sendBookingConfirmation(bookingData);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Booking confirmation email sent successfully',
        bookingId
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send booking confirmation email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
