import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import JobApplication from '@/models/JobApplication';
import JobDoc from '@/models/JobDoc';

export async function POST(req: Request) {
  await connectDb();
  const body = await req.json();
  
  try {
    const application = new JobApplication(body);
    await application.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}

export async function GET() {
  await connectDb();
  try {
    // Only fetch active jobs for public display
    const jobs = await JobDoc.find({ status: 'active' }).sort({ createdAt: -1 });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}