import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AboutUsPage from '@/models/AboutUsPage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const aboutUsPage = await AboutUsPage.findOne({ status: 'active' });

    if (!aboutUsPage) {
      return NextResponse.json({ success: false, error: "About us page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, aboutUsPage });
  } catch (error) {
    console.error("Error fetching about us content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch about us content" }, { status: 500 });
  }
}
