import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import Visa from "@/models/Visa";
import connectDb from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const deletedVisa = await Visa.findByIdAndDelete(id);

    if (!deletedVisa) {
      return NextResponse.json({ error: "Visa not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Visa deleted successfully" });
  } catch (error) {
    console.error("Error deleting visa:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
