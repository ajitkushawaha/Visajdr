import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import Page from "@/models/Page";
import connectDB from "@/lib/db";

// PATCH - Bulk update page statuses
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageIds, status } = await request.json();

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json({ error: "Page IDs are required" }, { status: 400 });
    }

    if (!status || !["active", "inactive", "draft"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
    }

    // Update all pages with the new status
    const updateData: any = { status };
    
    // If setting to active, also set publishedAt
    if (status === 'active') {
      updateData.publishedAt = new Date();
    }

    const result = await Page.updateMany(
      { _id: { $in: pageIds } },
      updateData
    );

    return NextResponse.json({ 
      message: `Successfully updated ${result.modifiedCount} pages`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error bulk updating pages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Bulk delete pages
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageIds } = await request.json();

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json({ error: "Page IDs are required" }, { status: 400 });
    }

    const result = await Page.deleteMany({ _id: { $in: pageIds } });

    return NextResponse.json({ 
      message: `Successfully deleted ${result.deletedCount} pages`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error bulk deleting pages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
