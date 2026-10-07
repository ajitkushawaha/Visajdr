import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import EmailTemplate from '@/models/EmailTemplate'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const template = await EmailTemplate.findById(params.id).lean()

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error: any) {
    console.error('Error fetching email template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email template' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const {
      name,
      type,
      subject,
      htmlBody,
      textBody,
      isActive,
      variables,
      description,
    } = body

    const template = await EmailTemplate.findById(params.id)

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Update fields
    if (name !== undefined) template.name = name
    if (type !== undefined) template.type = type
    if (subject !== undefined) template.subject = subject
    if (htmlBody !== undefined) template.htmlBody = htmlBody
    if (textBody !== undefined) template.textBody = textBody
    if (isActive !== undefined) template.isActive = isActive
    if (variables !== undefined) template.variables = variables
    if (description !== undefined) template.description = description

    await template.save()

    return NextResponse.json({
      success: true,
      template,
      message: 'Email template updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating email template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update email template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const template = await EmailTemplate.findByIdAndDelete(params.id)

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email template deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting email template:', error)
    return NextResponse.json(
      { error: 'Failed to delete email template' },
      { status: 500 }
    )
  }
}
