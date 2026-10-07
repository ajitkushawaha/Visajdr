import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'

// Mock visa queries data - in a real application, you'd have a VisaQuery model
const mockVisaQueries = [
  {
    _id: '1',
    trackingId: 'VQ-2024-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+91 98765 43210',
    country: 'USA',
    visaType: 'Tourist',
    subject: 'Visa Processing Time',
    message:
      'I applied for a tourist visa to USA last week. Can you please tell me the expected processing time? I have a trip planned for next month.',
    priority: 'medium',
    status: 'new',
    tags: ['processing-time', 'tourist-visa'],
    source: 'website',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    trackingId: 'VQ-2024-002',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah.wilson@example.com',
    customerPhone: '+91 87654 32109',
    country: 'UK',
    visaType: 'Student',
    subject: 'Document Requirements',
    message:
      'I need to apply for a student visa to UK. What documents are required? I have my admission letter from the university.',
    priority: 'high',
    status: 'in-progress',
    assignedTo: {
      _id: 'admin1',
      name: 'Admin User',
      email: 'admin@example.com',
    },
    tags: ['document-requirements', 'student-visa'],
    source: 'phone',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    trackingId: 'VQ-2024-003',
    customerName: 'Mike Johnson',
    customerEmail: 'mike.johnson@example.com',
    customerPhone: '+91 76543 21098',
    country: 'Canada',
    visaType: 'Business',
    subject: 'Urgent Processing Request',
    message:
      'I need urgent processing for my business visa to Canada. My meeting is scheduled for next week. Can you expedite the process?',
    priority: 'urgent',
    status: 'resolved',
    response:
      'We have expedited your business visa application. It will be processed within 2-3 business days. You will receive updates via email.',
    responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['urgent', 'business-visa', 'expedite'],
    source: 'email',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    trackingId: 'VQ-2024-004',
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@example.com',
    customerPhone: '+91 65432 10987',
    country: 'Australia',
    visaType: 'Work',
    subject: 'Visa Rejection Appeal',
    message:
      'My work visa application was rejected. Can you help me understand the reasons and guide me on the appeal process?',
    priority: 'high',
    status: 'in-progress',
    assignedTo: {
      _id: 'admin2',
      name: 'Support Agent',
      email: 'support@example.com',
    },
    tags: ['rejection', 'appeal', 'work-visa'],
    source: 'website',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    trackingId: 'VQ-2024-005',
    customerName: 'David Brown',
    customerEmail: 'david.brown@example.com',
    customerPhone: '+91 54321 09876',
    country: 'Germany',
    visaType: 'Tourist',
    subject: 'Visa Fee Payment Issue',
    message:
      "I'm having trouble with the visa fee payment. The payment is not going through. Can you help me resolve this?",
    priority: 'medium',
    status: 'resolved',
    response:
      'The payment issue has been resolved. Please try making the payment again. If you still face issues, please contact our support team.',
    responseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['payment', 'technical-issue'],
    source: 'phone',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '6',
    trackingId: 'VQ-2024-006',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.anderson@example.com',
    customerPhone: '+91 43210 98765',
    country: 'Japan',
    visaType: 'Business',
    subject: 'Multiple Entry Visa',
    message:
      'I need a multiple entry business visa to Japan. What are the requirements and processing time for this type of visa?',
    priority: 'low',
    status: 'new',
    tags: ['multiple-entry', 'business-visa'],
    source: 'website',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '10', 10), 1),
      100
    )
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const status = searchParams.get('status') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const country = searchParams.get('country') || 'all'

    // Filter queries
    let filteredQueries = mockVisaQueries

    if (search) {
      filteredQueries = filteredQueries.filter(query =>
        [
          query.customerName,
          query.customerEmail,
          query.customerPhone,
          query.country,
          query.visaType,
          query.subject,
          query.message,
          query.trackingId || '',
        ].some(value => value.toLowerCase().includes(search))
      )
    }

    if (status !== 'all') {
      filteredQueries = filteredQueries.filter(query => query.status === status)
    }

    if (priority !== 'all') {
      filteredQueries = filteredQueries.filter(
        query => query.priority === priority
      )
    }

    if (country !== 'all') {
      filteredQueries = filteredQueries.filter(
        query => query.country.toLowerCase() === country.toLowerCase()
      )
    }

    const total = filteredQueries.length
    const totalPages = Math.max(Math.ceil(total / limit), 1)
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * limit
    const paginatedQueries = filteredQueries.slice(start, start + limit)

    return NextResponse.json({
      success: true,
      queries: paginatedQueries,
      total,
      countries: [...new Set(mockVisaQueries.map(query => query.country))],
      stats: {
        total: mockVisaQueries.length,
        new: mockVisaQueries.filter(query => query.status === 'new').length,
        inProgress: mockVisaQueries.filter(
          query => query.status === 'in-progress'
        ).length,
        resolved: mockVisaQueries.filter(query => query.status === 'resolved')
          .length,
        urgent: mockVisaQueries.filter(query => query.priority === 'urgent')
          .length,
      },
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
    })
  } catch (error) {
    console.error('Failed to fetch visa queries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visa queries' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { queryId, updates } = body

    if (!queryId) {
      return NextResponse.json(
        { error: 'Query ID is required' },
        { status: 400 }
      )
    }

    // Find the query
    const queryIndex = mockVisaQueries.findIndex(query => query._id === queryId)

    if (queryIndex === -1) {
      return NextResponse.json(
        { error: 'Visa query not found' },
        { status: 404 }
      )
    }

    // Update the query
    const updatedQuery = {
      ...mockVisaQueries[queryIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      ...(updates.response && {
        responseDate: new Date().toISOString(),
      }),
    }

    // In a real application, you would update this in the database
    mockVisaQueries[queryIndex] = updatedQuery

    return NextResponse.json({
      success: true,
      query: updatedQuery,
      message: 'Visa query updated successfully',
    })
  } catch (error) {
    console.error('Failed to update visa query:', error)
    return NextResponse.json(
      { error: 'Failed to update visa query' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Query ID is required' },
        { status: 400 }
      )
    }

    // Find the query
    const queryIndex = mockVisaQueries.findIndex(query => query._id === id)

    if (queryIndex === -1) {
      return NextResponse.json(
        { error: 'Visa query not found' },
        { status: 404 }
      )
    }

    // Remove the query
    mockVisaQueries.splice(queryIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Visa query deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete visa query:', error)
    return NextResponse.json(
      { error: 'Failed to delete visa query' },
      { status: 500 }
    )
  }
}
