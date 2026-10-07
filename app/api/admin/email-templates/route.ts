import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import EmailTemplate from '@/models/EmailTemplate'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    const query: any = {}
    if (type) {
      query.type = type
    }
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }

    const templates = await EmailTemplate.find(query)
      .sort({ type: 1, name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      templates,
      total: templates.length,
    })
  } catch (error: any) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name || !type || !subject || !htmlBody || !textBody) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: name, type, subject, htmlBody, textBody',
        },
        { status: 400 }
      )
    }

    // Check if template with same name and type already exists
    const existing = await EmailTemplate.findOne({ name, type })
    if (existing) {
      return NextResponse.json(
        { error: 'Template with this name and type already exists' },
        { status: 400 }
      )
    }

    const template = new EmailTemplate({
      name,
      type,
      subject,
      htmlBody,
      textBody,
      isActive: isActive !== undefined ? isActive : true,
      variables: variables || [],
      description: description || '',
    })

    await template.save()

    return NextResponse.json({
      success: true,
      template,
      message: 'Email template created successfully',
    })
  } catch (error: any) {
    console.error('Error creating email template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create email template' },
      { status: 500 }
    )
  }
}
