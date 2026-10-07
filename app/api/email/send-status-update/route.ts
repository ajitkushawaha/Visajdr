import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import { emailService } from "@/lib/emailService";

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
      customerEmail,
      status,
      serviceType
    } = body;

    // Validate required fields
    if (!bookingId || !customerEmail || !status || !serviceType) {
      return NextResponse.json({
        error: 'Missing required fields: bookingId, customerEmail, status, serviceType'
      }, { status: 400 });
    }

    // Validate service type
    if (!['visa', 'travel-insurance'].includes(serviceType)) {
      return NextResponse.json({
        error: 'Invalid serviceType. Must be "visa" or "travel-insurance"'
      }, { status: 400 });
    }

    // Send status update email
    const emailSent = await emailService.sendStatusUpdate(
      bookingId,
      customerEmail,
      status,
      serviceType
    );

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Status update email sent successfully',
        bookingId
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send status update email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending status update email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
