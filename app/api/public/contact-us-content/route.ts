import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactUsPage from '@/models/ContactUsPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const contactUsPage = await ContactUsPage.findOne({ status: 'active' });

    if (!contactUsPage) {
      return NextResponse.json({ success: false, error: "Contact us page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, contactUsPage });
  } catch (error) {
    console.error("Error fetching contact us content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch contact us content" }, { status: 500 });
  }
}
