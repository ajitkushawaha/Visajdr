import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";

// GET - Fetch notifications for a specific user or all notifications
export async function GET(request: NextRequest) {
  try {
    await connectDb();
    
    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get('recipient');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isRead = searchParams.get('isRead');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    let query: any = {};

    if (recipient) {
      query.recipient = recipient;
    }
    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }
    if (isRead !== null && isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [notifications, totalCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('recipient', 'name email role')
        .lean(),
      Notification.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("GET notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    await connectDb();
    
    const body = await request.json();
    const {
      recipient,
      type,
      title,
      message,
      priority = 'medium',
      relatedId,
      relatedType,
      scheduledFor,
      metadata
    } = body;

    // Validation
    if (!recipient || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: "Recipient, type, title, and message are required" },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const user = await User.findById(recipient);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Recipient user not found" },
        { status: 400 }
      );
    }

    // Create new notification
    const notification = new Notification({
      recipient,
      type,
      title: title.trim(),
      message: message.trim(),
      priority,
      relatedId,
      relatedType,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      metadata: metadata || {}
    });

    await notification.save();

    // Populate recipient info for response
    await notification.populate('recipient', 'name email role');

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
      data: notification
    }, { status: 201 });

  } catch (error) {
    console.error("POST notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
