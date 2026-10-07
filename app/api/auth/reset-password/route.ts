import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

export async function POST(req: Request) {
  await connectDB();
  const { token, newPassword } = await req.json();

  const resetDoc = await PasswordResetToken.findOne({ token });
  console.log("Reset token document:", resetDoc);
  if (!resetDoc || resetDoc.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.findByIdAndUpdate(resetDoc.userId, { password: hashedPassword });
  await PasswordResetToken.deleteOne({ token });

  return NextResponse.json({ message: "Password reset successfully" });
}
