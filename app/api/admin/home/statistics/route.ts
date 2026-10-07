import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";

// Mock statistics data
let statistics = [
  {
    _id: "1",
    title: "Happy Customers",
    value: 10000,
    suffix: "+",
    icon: "👥",
    color: "#3B82F6",
    status: "active",
    order: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    title: "Visa Applications",
    value: 5000,
    suffix: "+",
    icon: "📋",
    color: "#10B981",
    status: "active",
    order: 2,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    title: "Success Rate",
    value: 98,
    suffix: "%",
    icon: "✅",
    color: "#F59E0B",
    status: "active",
    order: 3,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "4",
    title: "Countries Covered",
    value: 25,
    suffix: "+",
    icon: "🌍",
    color: "#8B5CF6",
    status: "active",
    order: 4,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "5",
    title: "Years Experience",
    value: 10,
    suffix: "+",
    icon: "⭐",
    color: "#EF4444",
    status: "active",
    order: 5,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "6",
    title: "Processing Time",
    value: 7,
    suffix: " days",
    icon: "⏱️",
    color: "#06B6D4",
    status: "active",
    order: 6,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// GET - Fetch all statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let filteredStatistics = statistics;

    if (status !== 'all') {
      filteredStatistics = statistics.filter(stat => stat.status === status);
    }

    // Sort by order
    filteredStatistics.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      success: true,
      statistics: filteredStatistics,
      total: filteredStatistics.length
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// POST - Create new statistic
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      value,
      suffix = "",
      icon = "📊",
      color = "#3B82F6",
      status = 'active',
      order
    } = body;

    // Validate required fields
    if (!title || value === undefined) {
      return NextResponse.json(
        { error: 'Title and value are required' },
        { status: 400 }
      );
    }

    // Validate value is a number
    if (typeof value !== 'number' || value < 0) {
      return NextResponse.json(
        { error: 'Value must be a positive number' },
        { status: 400 }
      );
    }

    // Create new statistic
    const newStatistic = {
      _id: String(statistics.length + 1),
      title,
      value,
      suffix,
      icon,
      color,
      status,
      order: order || statistics.length + 1,
      createdAt: new Date().toISOString(),
    };

    statistics.push(newStatistic);

    return NextResponse.json({
      success: true,
      statistic: newStatistic,
      message: 'Statistic created successfully'
    });

  } catch (error) {
    console.error('Error creating statistic:', error);
    return NextResponse.json(
      { error: 'Failed to create statistic' },
      { status: 500 }
    );
  }
}

// PUT - Update statistic
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      _id,
      title,
      value,
      suffix,
      icon,
      color,
      status,
      order
    } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Statistic ID is required' },
        { status: 400 }
      );
    }

    // Find statistic
    const statisticIndex = statistics.findIndex(s => s._id === _id);
    
    if (statisticIndex === -1) {
      return NextResponse.json(
        { error: 'Statistic not found' },
        { status: 404 }
      );
    }

    // Update statistic
    statistics[statisticIndex] = {
      ...statistics[statisticIndex],
      title: title || statistics[statisticIndex].title,
      value: value !== undefined ? value : statistics[statisticIndex].value,
      suffix: suffix !== undefined ? suffix : statistics[statisticIndex].suffix,
      icon: icon || statistics[statisticIndex].icon,
      color: color || statistics[statisticIndex].color,
      status: status || statistics[statisticIndex].status,
      order: order !== undefined ? order : statistics[statisticIndex].order,
    };

    return NextResponse.json({
      success: true,
      statistic: statistics[statisticIndex],
      message: 'Statistic updated successfully'
    });

  } catch (error) {
    console.error('Error updating statistic:', error);
    return NextResponse.json(
      { error: 'Failed to update statistic' },
      { status: 500 }
    );
  }
}

// DELETE - Delete statistic
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statisticId = searchParams.get('id');

    if (!statisticId) {
      return NextResponse.json(
        { error: 'Statistic ID is required' },
        { status: 400 }
      );
    }

    // Find and remove statistic
    const statisticIndex = statistics.findIndex(s => s._id === statisticId);
    
    if (statisticIndex === -1) {
      return NextResponse.json(
        { error: 'Statistic not found' },
        { status: 404 }
      );
    }

    const deletedStatistic = statistics.splice(statisticIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Statistic deleted successfully',
      statistic: deletedStatistic
    });

  } catch (error) {
    console.error('Error deleting statistic:', error);
    return NextResponse.json(
      { error: 'Failed to delete statistic' },
      { status: 500 }
    );
  }
}
