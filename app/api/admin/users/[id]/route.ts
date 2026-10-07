import connectDB from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authConfig";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If Google user, revoke their access token (if stored)
    if (user.googleId && user.googleAccessToken) {
      try {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${user.googleAccessToken}`,
          { method: "POST", headers: { "Content-type": "application/x-www-form-urlencoded" } }
        );
      } catch (err) {
        console.warn("⚠️ Failed to revoke Google token:", err);
      }
    }

    // Delete user from DB
    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
