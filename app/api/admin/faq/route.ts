import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import connectDb from '@/lib/db';
import FAQ from '@/models/FAQ';

// GET - Fetch all FAQs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDb();
    
    const faqs = await FAQ.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      faqs
    });
    
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDb();
    
    const data = await request.json();
    const { question, answer, category, order, status } = data;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faq = new FAQ({
      question,
      answer,
      category: category || 'General',
      order: order || 0,
      status: status || 'active'
    });

    await faq.save();
    
    return NextResponse.json({
      success: true,
      faq,
      message: 'FAQ created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}
