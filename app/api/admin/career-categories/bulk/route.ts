import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import { CareerCategory } from '@/models/CareerCategoryDoc';

export async function POST(req: NextRequest) {
  await connectDb();
  const { ids, action, status } = await req.json() as {
    ids: string[];
    action: 'status' | 'delete';
    status?: 'active' | 'inactive';
  };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids required' }, { status: 400 });
  }
  if (action === 'status') {
    if (status !== 'active' && status !== 'inactive') {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }
    await CareerCategory.updateMany({ _id: { $in: ids } }, { $set: { status } });
    return NextResponse.json({ ok: true });
  }
  if (action === 'delete') {
    await CareerCategory.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}

export async function GET(_req: NextRequest) {
  try {
    await connectDb();

    const rows = await CareerCategory.find().lean();

    // If you want to guarantee no nulls/IDs: map to plain objects (lean already helps)
   return NextResponse.json(rows, {
  headers: { 'Cache-Control': 'no-store' },
  status: 200,
});
  } catch (err: any) {
    console.error('GET /api/career-categories error:', err);
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: 'Unable to fetch categories' },
      { status: 500 }
    );
  }
}