import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CareerCategory } from '@/models/CareerCategoryDoc';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all categories for public display (you can change this back to active only if needed)
    const categories = await CareerCategory.find({})
      .select('name slug description')
      .sort({ name: 1 })
      .lean();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching career categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
