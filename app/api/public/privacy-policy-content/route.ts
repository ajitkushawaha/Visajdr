import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PrivacyPolicyPage from '@/models/PrivacyPolicyPage';

export async function GET() {
  try {
    await connectDB();
    const privacyPolicyPage = await PrivacyPolicyPage.findOne({ status: 'active' });

    if (!privacyPolicyPage) {
      return NextResponse.json({ success: false, error: "Privacy policy page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, privacyPolicyPage });
  } catch (error) {
    console.error("Error fetching privacy policy content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch privacy policy content" }, { status: 500 });
  }
}
