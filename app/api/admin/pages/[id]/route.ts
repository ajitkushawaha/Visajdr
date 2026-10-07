import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import Page from "@/models/Page";
import connectDB from "@/lib/db";

// GET - Fetch single page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const page = await Page.findById(resolvedParams.id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update page
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const updateData = await request.json();

    // Check for duplicate slug if slug is being updated
    if (updateData.slug) {
      const existingPage = await Page.findOne({
        slug: updateData.slug,
        _id: { $ne: resolvedParams.id }
      });
      if (existingPage) {
        return NextResponse.json({ error: "Page with this slug already exists" }, { status: 409 });
      }
    }

    const updatedPage = await Page.findByIdAndUpdate(
      resolvedParams.id,
      {
        ...updateData,
        publishedAt: updateData.status === 'active' ? new Date() : null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Page updated successfully",
      page: updatedPage
    });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const deletedPage = await Page.findByIdAndDelete(resolvedParams.id);

    if (!deletedPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Page deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
