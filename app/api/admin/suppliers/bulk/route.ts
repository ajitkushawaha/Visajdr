import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Supplier from "@/models/Supplier";

// POST - Bulk operations (change status, delete multiple)
export async function POST(request: NextRequest) {
  try {
    await connectDb();
    
    const body = await request.json();
    const { action, supplierIds, status } = body;

    if (!action || !supplierIds || !Array.isArray(supplierIds)) {
      return NextResponse.json(
        { success: false, error: "Action and supplier IDs are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'change-status':
        if (!status || !['active', 'inactive'].includes(status)) {
          return NextResponse.json(
            { success: false, error: "Valid status (active/inactive) is required" },
            { status: 400 }
          );
        }

        result = await Supplier.updateMany(
          { _id: { $in: supplierIds } },
          { status, updatedAt: new Date() }
        );

        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} suppliers status updated to ${status}`,
          data: { modifiedCount: result.modifiedCount }
        });

      case 'delete':
        result = await Supplier.deleteMany({ _id: { $in: supplierIds } });

        return NextResponse.json({
          success: true,
          message: `${result.deletedCount} suppliers deleted successfully`,
          data: { deletedCount: result.deletedCount }
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action. Supported actions: change-status, delete" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
