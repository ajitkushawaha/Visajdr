import connectDB from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import { NextResponse } from 'next/server'
import Visa from '@/models/Visa'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const visa = await Visa.findById(resolvedParams.id)
    if (!visa) {
      return NextResponse.json({ error: 'Visa not found' }, { status: 404 })
    }

    return NextResponse.json(visa)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
