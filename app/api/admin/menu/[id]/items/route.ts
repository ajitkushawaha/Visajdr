import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Navigation from '@/models/Navigation'
import mongoose from 'mongoose'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { label, href, status } = body

    if (!label || !href) {
      return NextResponse.json(
        { error: 'Label and HREF are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const navigation = await Navigation.findById(id)
    if (!navigation) {
      return NextResponse.json(
        { error: 'Navigation not found' },
        { status: 404 }
      )
    }

    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      label,
      href,
      status: status || 'active',
      isActive: status === 'active',
      icon: 'link',
      order: navigation.items.length,
      target: '_self',
      hasDropdown: false,
      dropdownItems: [],
      children: [],
    }

    navigation.items.push(newItem)
    await navigation.save()

    return NextResponse.json({ success: true, item: newItem })
  } catch (error) {
    console.error('Error adding navigation item:', error)
    return NextResponse.json(
      { error: 'Failed to add navigation item' },
      { status: 500 }
    )
  }
}
