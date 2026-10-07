import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import Page from "@/models/Page";
import connectDB from "@/lib/db";

// PATCH - Reorder pages
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageOrders } = await request.json();
    
    if (!Array.isArray(pageOrders)) {
      return NextResponse.json({ error: "Invalid page orders data" }, { status: 400 });
    }

    // Update each page's order
    const updatePromises = pageOrders.map(({ id, order }) => 
      Page.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: "Pages reordered successfully"
    });
  } catch (error) {
    console.error("Error reordering pages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
