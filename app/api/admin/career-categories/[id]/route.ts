import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import { CareerCategory } from '@/models/CareerCategoryDoc';
import { updateCategorySchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const resolvedParams = await params;
  const body = await req.json();
  const parse = updateCategorySchema.safeParse({ ...body, id: resolvedParams.id });
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }
  const { name, status } = parse.data;
  const base = slugify(name);
  let finalSlug = base;
  let i = 1;
  // prevent slug collision with other docs
  while (await CareerCategory.findOne({ slug: finalSlug, _id: { $ne: resolvedParams.id } })) {
    finalSlug = `${base}-${i++}`;
  }
  const updated = await CareerCategory.findByIdAndUpdate(
    resolvedParams.id,
    { name, status, slug: finalSlug },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const resolvedParams = await params;
  const deleted = await CareerCategory.findByIdAndDelete(resolvedParams.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
