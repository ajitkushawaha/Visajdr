import JobApplication from '@/models/JobApplication'
import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'
const BodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  city: z.string().min(2),
  jobTitle: z.string().min(2),
  jobCategory: z.string().min(2),
  noticePeriod: z.string().min(1),
  experience: z.string().min(1),
  currentCompany: z.string().optional().default(''),
  currentCTC: z.string().optional().default(''),
  expectedCTC: z.string().optional().default(''),
  resumeUrl: z.string().url().optional().default(''),
  position: z.string().optional().default('Full-time'),
})

const ALLOWED_KEYS = new Set([
  'jobTitle',
  'jobCategory',
  'name',
  'email',
  'phone',
  'city',
  'noticePeriod',
  'experience',
  'currentCompany',
  'currentCTC',
  'expectedCTC',
  'position',
  'status',
])

const ALLOWED_SORT = new Set([
  'appliedAt',
  'jobTitle',
  'jobCategory',
  'name',
  'city',
  'experience',
  'currentCTC',
])

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const sp = req.nextUrl.searchParams
    const key = sp.get('key') || ''
    const value = (sp.get('value') || '').trim()
    const from = sp.get('from')
    const to = sp.get('to')
    const page = Math.max(1, Number(sp.get('page') || 1))
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit') || 10)))
    const sortField = sp.get('sort') || 'appliedAt'
    const dir = (sp.get('dir') === 'asc' ? 1 : -1) as 1 | -1

    const query: any = {}

    if (key && value && ALLOWED_KEYS.has(key)) {
      query[key] = { $regex: value, $options: 'i' }
    }

    if (from || to) {
      const range: any = {}
      if (from) range.$gte = new Date(from)
      if (to) range.$lte = new Date(to)
      query.appliedAt = range
    }

    const sort: Record<string, 1 | -1> = {}
    sort[ALLOWED_SORT.has(sortField) ? sortField : 'appliedAt'] = dir

    const skip = (page - 1) * limit

    const [rows, total] = await Promise.all([
      JobApplication.find(query).sort(sort).skip(skip).limit(limit).lean(),
      JobApplication.countDocuments(query),
    ])

    return NextResponse.json(
      {
        rows,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    console.error('GET /api/jobs error:', e)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const parse = BodySchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.flatten() },
        { status: 400 }
      )
    }
    const doc = await JobApplication.create({
      ...parse.data,
      status: 'Pending',
      appliedAt: new Date(),
    })
    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 })
  } catch (e) {
    console.error('apply error:', e)
    return NextResponse.json(
      { ok: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
