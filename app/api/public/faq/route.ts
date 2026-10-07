import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import FAQ from '@/models/FAQ';

// GET - Fetch all active FAQs for public display
export async function GET() {
  try {
    await connectDb();
    
    const faqs = await FAQ.find({ status: 'active' })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      faqs
    });
    
  } catch (error) {
    console.error('Error fetching public FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
