import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'

// Mock menu lists data - replace with actual database model
const mockMenuLists = [
  {
    _id: '1',
    name: 'Main Navigation',
    description: 'Primary navigation menu for the website header - Home, About, Services, Contact',
    location: 'header',
    isActive: true,
    items: [
      {
        _id: '1-1',
        title: 'Home',
        url: '/',
        icon: 'home',
        order: 1,
        isActive: true,
        target: '_self'
      },
      {
        _id: '1-2',
        title: 'About',
        url: '/about',
        icon: 'users',
        order: 2,
        isActive: true,
        target: '_self'
      },
      {
        _id: '1-3',
        title: 'Services',
        url: '/services',
        icon: 'settings',
        order: 3,
        isActive: true,
        target: '_self'
      },
      {
        _id: '1-4',
        title: 'Contact',
        url: '/contact',
        icon: 'link',
        order: 4,
        isActive: true,
        target: '_self'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Footer Links',
    description: 'Footer navigation links - Legal pages, social media, support links',
    location: 'footer',
    isActive: true,
    items: [
      {
        _id: '2-1',
        title: 'Privacy Policy',
        url: '/privacy-policy',
        icon: 'file',
        order: 1,
        isActive: true,
        target: '_self'
      },
      {
        _id: '2-2',
        title: 'Terms of Service',
        url: '/terms-of-service',
        icon: 'file',
        order: 2,
        isActive: true,
        target: '_self'
      },
      {
        _id: '2-3',
        title: 'Refund Policy',
        url: '/refund-policy',
        icon: 'file',
        order: 3,
        isActive: true,
        target: '_self'
      },
      {
        _id: '2-4',
        title: 'Support Center',
        url: '/support',
        icon: 'link',
        order: 4,
        isActive: true,
        target: '_self'
      },
      {
        _id: '2-5',
        title: 'Facebook',
        url: 'https://facebook.com/euroworld',
        icon: 'link',
        order: 5,
        isActive: true,
        target: '_blank'
      },
      {
        _id: '2-6',
        title: 'Instagram',
        url: 'https://instagram.com/euroworld',
        icon: 'link',
        order: 6,
        isActive: true,
        target: '_blank'
      },
      {
        _id: '2-7',
        title: 'LinkedIn',
        url: 'https://linkedin.com/company/euroworld',
        icon: 'link',
        order: 7,
        isActive: true,
        target: '_blank'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Services Dropdown',
    description: 'Services dropdown menu - Visa Types → Specific visa categories',
    location: 'header',
    isActive: true,
    items: [
      {
        _id: '3-1',
        title: 'Visa Services',
        url: '/services/visa',
        icon: 'file',
        order: 1,
        isActive: true,
        target: '_self'
      },
      {
        _id: '3-2',
        title: 'Tourist Visa',
        url: '/services/visa/tourist',
        icon: 'link',
        order: 2,
        isActive: true,
        target: '_self'
      },
      {
        _id: '3-3',
        title: 'Business Visa',
        url: '/services/visa/business',
        icon: 'link',
        order: 3,
        isActive: true,
        target: '_self'
      },
      {
        _id: '3-4',
        title: 'Student Visa',
        url: '/services/visa/student',
        icon: 'link',
        order: 4,
        isActive: true,
        target: '_self'
      },
      {
        _id: '3-5',
        title: 'Work Visa',
        url: '/services/visa/work',
        icon: 'link',
        order: 5,
        isActive: true,
        target: '_self'
      },
      {
        _id: '3-6',
        title: 'Travel Insurance',
        url: '/services/insurance',
        icon: 'file',
        order: 6,
        isActive: true,
        target: '_self'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'Mobile Menu',
    description: 'Mobile-specific navigation menu - Optimized for mobile devices',
    location: 'mobile',
    isActive: true,
    items: [
      {
        _id: '4-1',
        title: 'Home',
        url: '/',
        icon: 'home',
        order: 1,
        isActive: true,
        target: '_self'
      },
      {
        _id: '4-2',
        title: 'About',
        url: '/about',
        icon: 'users',
        order: 2,
        isActive: true,
        target: '_self'
      },
      {
        _id: '4-3',
        title: 'Services',
        url: '/services',
        icon: 'settings',
        order: 3,
        isActive: true,
        target: '_self'
      },
      {
        _id: '4-4',
        title: 'Contact',
        url: '/contact',
        icon: 'link',
        order: 4,
        isActive: true,
        target: '_self'
      },
      {
        _id: '4-5',
        title: 'Get Quote',
        url: '/contact/quote',
        icon: 'link',
        order: 5,
        isActive: true,
        target: '_self'
      },
      {
        _id: '4-6',
        title: 'Book Consultation',
        url: '/contact/consultation',
        icon: 'link',
        order: 6,
        isActive: true,
        target: '_self'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '5',
    name: 'Sidebar Menu',
    description: 'Sidebar navigation for blog and resources',
    location: 'sidebar',
    isActive: true,
    items: [
      {
        _id: '5-1',
        title: 'Blog',
        url: '/blog',
        icon: 'file',
        order: 1,
        isActive: true,
        target: '_self'
      },
      {
        _id: '5-2',
        title: 'Visa Guide',
        url: '/blog/visa-guide',
        icon: 'link',
        order: 2,
        isActive: true,
        target: '_self'
      },
      {
        _id: '5-3',
        title: 'Travel Tips',
        url: '/blog/travel-tips',
        icon: 'link',
        order: 3,
        isActive: true,
        target: '_self'
      },
      {
        _id: '5-4',
        title: 'Country Guides',
        url: '/blog/country-guides',
        icon: 'link',
        order: 4,
        isActive: true,
        target: '_self'
      },
      {
        _id: '5-5',
        title: 'FAQ',
        url: '/faq',
        icon: 'link',
        order: 5,
        isActive: true,
        target: '_self'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectDB()

    // Return mock data for now
    return NextResponse.json({
      success: true,
      menuLists: mockMenuLists
    })

  } catch (error) {
    console.error('Error fetching menu lists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    await connectDB()

    // Mock creation - replace with actual database operation
    const newMenuList = {
      _id: Date.now().toString(),
      ...body,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      menuList: newMenuList
    })

  } catch (error) {
    console.error('Error creating menu list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
