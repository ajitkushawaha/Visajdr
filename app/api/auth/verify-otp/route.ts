import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, mobile, identifier, otp, type, purpose } = await request.json();
    console.log('Received OTP verification request:', { email, mobile, identifier, otp, type, purpose });
    if (!otp || !type || !purpose) {
      return NextResponse.json(
        { error: "OTP, type, and purpose are required" },
        { status: 400 }
      );
    }

    // Use identifier if provided, otherwise fall back to email/mobile
    const targetIdentifier = identifier || (type === "email" ? email : mobile);
    
    if (!targetIdentifier) {
      return NextResponse.json(
        { error: `${type === "email" ? "Email" : "Mobile number"} is required for ${type} OTP verification` },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the OTP record
    const query = {
      identifier: targetIdentifier,
      otp,
      type,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    };
    
    console.log('Looking for OTP with query:', query);
    
    const otpRecord = await OTP.findOne(query);
    
    console.log('Found OTP record:', otpRecord);

    if (!otpRecord) {
      // Let's also check what OTPs exist for this identifier
      const existingOTPs = await OTP.find({ identifier: targetIdentifier, type, purpose }).sort({ createdAt: -1 }).limit(3);
      console.log('Existing OTPs for this identifier:', existingOTPs);
      
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new OTP" },
        { status: 429 }
      );
    }

    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Handle different purposes
    if (purpose === "registration") {
      // For registration, return success - user will complete registration
      return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        verified: true
      });
    }

    if (purpose === "login") {
      // For login, find user and return user data
      const userQuery = type === "email" 
        ? { email: targetIdentifier }
        : { mobile: targetIdentifier };
      
      const user = await User.findOne(userQuery);

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Update verification status
      if (type === "email") {
        user.isEmailVerified = true;
      } else {
        user.isMobileVerified = true;
      }
      await user.save();

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          avatar: user.avatar
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

