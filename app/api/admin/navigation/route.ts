import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";

// Mock navigation data - in a real application, you'd have a Navigation model
let navigations = [
  {
    _id: "1",
    name: "Main Navigation",
    type: "main",
    items: [
      {
        _id: "1-1",
        label: "Home",
        href: "/",
        icon: "home",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 1,
        status: "active"
      },
      {
        _id: "1-2",
        label: "Services",
        href: "/services",
        icon: "settings",
        target: "_self",
        hasDropdown: true,
        dropdownItems: [
          {
            _id: "1-2-1",
            label: "Visa Services",
            href: "/visa-services",
            icon: "filetext",
            target: "_self",
            hasDropdown: false,
            dropdownItems: [],
            order: 1,
            status: "active"
          },
          {
            _id: "1-2-2",
            label: "Travel Insurance",
            href: "/travel-insurance",
            icon: "shield",
            target: "_self",
            hasDropdown: false,
            dropdownItems: [],
            order: 2,
            status: "active"
          }
        ],
        order: 2,
        status: "active"
      },
      {
        _id: "1-3",
        label: "About",
        href: "/about-us",
        icon: "user",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 3,
        status: "active"
      },
      {
        _id: "1-4",
        label: "Contact",
        href: "/contact-us",
        icon: "phone",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 4,
        status: "active"
      }
    ],
    status: "active",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    name: "Footer Links",
    type: "footer",
    items: [
      {
        _id: "2-1",
        label: "Privacy Policy",
        href: "/privacy-policy",
        icon: "filetext",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 1,
        status: "active"
      },
      {
        _id: "2-2",
        label: "Terms of Service",
        href: "/terms-of-service",
        icon: "filetext",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 2,
        status: "active"
      },
      {
        _id: "2-3",
        label: "Blog",
        href: "/blog",
        icon: "newspaper",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 3,
        status: "active"
      }
    ],
    status: "active",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    name: "Mobile Menu",
    type: "mobile",
    items: [
      {
        _id: "3-1",
        label: "Home",
        href: "/",
        icon: "home",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 1,
        status: "active"
      },
      {
        _id: "3-2",
        label: "Services",
        href: "/services",
        icon: "settings",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 2,
        status: "active"
      },
      {
        _id: "3-3",
        label: "About",
        href: "/about-us",
        icon: "user",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 3,
        status: "active"
      },
      {
        _id: "3-4",
        label: "Contact",
        href: "/contact-us",
        icon: "phone",
        target: "_self",
        hasDropdown: false,
        dropdownItems: [],
        order: 4,
        status: "active"
      }
    ],
    status: "active",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// GET - Fetch all navigations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';

    let filteredNavigations = navigations;

    // Filter by type
    if (type !== 'all') {
      filteredNavigations = filteredNavigations.filter(nav => nav.type === type);
    }

    // Filter by status
    if (status !== 'all') {
      filteredNavigations = filteredNavigations.filter(nav => nav.status === status);
    }

    return NextResponse.json({
      success: true,
      navigations: filteredNavigations,
      total: filteredNavigations.length
    });

  } catch (error) {
    console.error('Error fetching navigations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigations' },
      { status: 500 }
    );
  }
}

// POST - Create new navigation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type,
      items = [],
      status = 'active'
    } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['main', 'footer', 'mobile'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be main, footer, or mobile' },
        { status: 400 }
      );
    }

    // Create new navigation
    const newNavigation = {
      _id: String(navigations.length + 1),
      name,
      type,
      items,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    navigations.push(newNavigation);

    return NextResponse.json({
      success: true,
      navigation: newNavigation,
      message: 'Navigation created successfully'
    });

  } catch (error) {
    console.error('Error creating navigation:', error);
    return NextResponse.json(
      { error: 'Failed to create navigation' },
      { status: 500 }
    );
  }
}

// PUT - Update navigation
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      _id,
      name,
      type,
      items,
      status
    } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Navigation ID is required' },
        { status: 400 }
      );
    }

    // Find navigation
    const navigationIndex = navigations.findIndex(nav => nav._id === _id);
    
    if (navigationIndex === -1) {
      return NextResponse.json(
        { error: 'Navigation not found' },
        { status: 404 }
      );
    }

    // Update navigation
    navigations[navigationIndex] = {
      ...navigations[navigationIndex],
      name: name || navigations[navigationIndex].name,
      type: type || navigations[navigationIndex].type,
      items: items || navigations[navigationIndex].items,
      status: status || navigations[navigationIndex].status,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      navigation: navigations[navigationIndex],
      message: 'Navigation updated successfully'
    });

  } catch (error) {
    console.error('Error updating navigation:', error);
    return NextResponse.json(
      { error: 'Failed to update navigation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete navigation
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const navigationId = searchParams.get('id');

    if (!navigationId) {
      return NextResponse.json(
        { error: 'Navigation ID is required' },
        { status: 400 }
      );
    }

    // Find and remove navigation
    const navigationIndex = navigations.findIndex(nav => nav._id === navigationId);
    
    if (navigationIndex === -1) {
      return NextResponse.json(
        { error: 'Navigation not found' },
        { status: 404 }
      );
    }

    const deletedNavigation = navigations.splice(navigationIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Navigation deleted successfully',
      navigation: deletedNavigation
    });

  } catch (error) {
    console.error('Error deleting navigation:', error);
    return NextResponse.json(
      { error: 'Failed to delete navigation' },
      { status: 500 }
    );
  }
}
