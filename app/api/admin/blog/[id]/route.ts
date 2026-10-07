import { NextResponse } from 'next/server'
import connectDb from '@/lib/db'
import Blog from '@/models/Blog'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'

type Params = { params: { id: string } }
export async function GET(req: Request, { params }: Params) {
  try {
    await connectDb()
    const resolvedParams = await params
    const blog = await Blog.findById(resolvedParams.id).lean()
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(blog, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await connectDb()
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await req.json()
    const update: any = { ...body }

    // Prevent slug collisions if updating slug/title
    if (body.slug) {
      const exists = await Blog.findOne({
        slug: body.slug,
        _id: { $ne: resolvedParams.id },
      })
      if (exists)
        return NextResponse.json(
          { error: 'Slug already in use' },
          { status: 400 }
        )
    }

    // If moving to published and no publishedAt, set it
    if (body.status === 'published' && !body.publishedAt) {
      update.publishedAt = new Date()
    }

    const blog = await Blog.findByIdAndUpdate(resolvedParams.id, update, {
      new: true,
    })
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(blog, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await connectDb()
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const deleted = await Blog.findByIdAndDelete(resolvedParams.id)
    if (!deleted)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
