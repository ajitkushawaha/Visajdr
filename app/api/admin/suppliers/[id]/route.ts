import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Supplier from "@/models/Supplier";

// GET - Fetch single supplier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: supplier
    });

  } catch (error) {
    console.error("GET supplier error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

// PUT - Update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await request.json();

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (body.email && body.email !== supplier.email) {
      const existingSupplier = await Supplier.findOne({ 
        email: body.email,
        _id: { $ne: id }
      });
      if (existingSupplier) {
        return NextResponse.json(
          { success: false, error: "Supplier with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Update supplier
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      {
        ...body,
        email: body.email?.trim().toLowerCase(),
        name: body.name?.trim(),
        mobile: body.mobile?.trim(),
        country: body.country?.trim(),
        city: body.city?.trim(),
        address: body.address?.trim(),
        notes: body.notes?.trim(),
        contactPerson: body.contactPerson?.trim(),
        website: body.website?.trim(),
        commission: body.commission ? parseFloat(body.commission) : undefined,
        rating: body.rating ? parseInt(body.rating) : undefined
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Supplier updated successfully",
      data: updatedSupplier
    });

  } catch (error) {
    console.error("PUT supplier error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

// DELETE - Delete supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    await Supplier.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Supplier deleted successfully"
    });

  } catch (error) {
    console.error("DELETE supplier error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
