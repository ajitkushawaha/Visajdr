import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Job from '@/models/JobDoc'

// Get Job by ID
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params

  try {
    await connectDB()
    const job = await Job.findById(resolvedParams.id)
    if (!job)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json(job)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Update Job
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const resolvedParams = await params
    const body = await req.json()
    const job = await Job.findByIdAndUpdate(resolvedParams.id, body, {
      new: true,
    })
    if (!job)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json(job)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Delete Job
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const resolvedParams = await params
    const job = await Job.findByIdAndDelete(resolvedParams.id)
    if (!job)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Job deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
