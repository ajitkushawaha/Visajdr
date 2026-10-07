import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Notification from "@/models/Notification";

// GET - Fetch single notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    const notification = await Notification.findById(id)
      .populate('recipient', 'name email role');
    
    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error("GET notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notification" },
      { status: 500 }
    );
  }
}

// PUT - Update notification (mark as read, update content)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await request.json();

    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      {
        ...body,
        title: body.title?.trim(),
        message: body.message?.trim()
      },
      { new: true, runValidators: true }
    ).populate('recipient', 'name email role');

    return NextResponse.json({
      success: true,
      message: "Notification updated successfully",
      data: updatedNotification
    });

  } catch (error) {
    console.error("PUT notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    await Notification.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully"
    });

  } catch (error) {
    console.error("DELETE notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
