import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { CareerCategory } from '@/models/CareerCategoryDoc'
import { createCategorySchema, listQuerySchema } from '@/lib/validation'
import { slugify } from '@/lib/slug'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const parse = listQuerySchema.safeParse({
    key: searchParams.get('key') || undefined,
    value: searchParams.get('value') || undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '10',
    sort: searchParams.get('sort') || 'createdAt',
    dir: searchParams.get('dir') || 'desc',
  })
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 })
  }
  const { key, value, from, to, page, limit, sort, dir } = parse.data

  const query: any = {}
  if (key && value) {
    if (key === 'status') query.status = value
    else query[key] = { $regex: value, $options: 'i' }
  }
  if (from || to) {
    query.createdAt = {}
    if (from) query.createdAt.$gte = new Date(from)
    if (to) query.createdAt.$lte = new Date(to)
  }

  const skip = (page - 1) * limit
  const total = await CareerCategory.countDocuments(query)
  const rows = await CareerCategory.find(query)
    .select('_id name slug status createdAt updatedAt')
    .sort({ [sort]: dir === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  // Ensure status has a default value and dates are properly formatted
  const formattedRows = rows.map((row: any) => ({
    ...row,
    status: row.status || 'active',
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || row.createdAt || new Date(),
  }))

  return NextResponse.json({
    rows: formattedRows,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const parse = createCategorySchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.flatten() },
        { status: 400 }
      )
    }
    const { name, status } = parse.data
    const slug = slugify(name)

    // Optional: if you want hard duplicate block without suffixing
    // check first and throw conflict
    const exists = await CareerCategory.findOne({ $or: [{ name }, { slug }] })
    if (exists) {
      return NextResponse.json(
        {
          code: 'DUPLICATE',
          message: 'Category with the same name/slug already exists.',
        },
        { status: 409 }
      )
    }

    const doc = await CareerCategory.create({ name, slug, status })
    return NextResponse.json(doc, { status: 201 })
  } catch (err: any) {
    if (err?.code === 11000) {
      // Mongo duplicate key error
      const fields = Object.keys(err.keyPattern || {})
      return NextResponse.json(
        {
          code: 'DUPLICATE',
          message: `Duplicate ${fields.join(', ')}. A category with this value already exists.`,
          fields,
        },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: 'Unexpected error' },
      { status: 500 }
    )
  }
}
