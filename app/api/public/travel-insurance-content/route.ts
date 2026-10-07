import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelInsurancePage from '@/models/TravelInsurancePage';

export async function GET() {
  try {
    await connectDB();
    const travelInsurancePage = await TravelInsurancePage.findOne({ status: 'active' });

    if (!travelInsurancePage) {
      return NextResponse.json({ success: false, error: "Travel insurance page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, travelInsurancePage });
  } catch (error) {
    console.error("Error fetching travel insurance content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch travel insurance content" }, { status: 500 });
  }
}
