import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CompanySettings from "@/models/CompanySettings";

export async function GET() {
  try {
    await connectDB();
    const settings = await CompanySettings.findOne({});
    
    // Only check database settings, no environment fallback
    const hasClientId = !!(settings?.googleApiKey);
    const hasClientSecret = !!(settings?.googleClientSecret);
    const isGoogleEnabled = hasClientId && hasClientSecret;
    
    return NextResponse.json({ 
      enabled: isGoogleEnabled,
      hasClientId,
      hasClientSecret,
      message: isGoogleEnabled 
        ? "Google OAuth is properly configured" 
        : "Google OAuth is not configured. Please configure it in Admin Panel."
    });
  } catch (error) {
    console.error("Error checking Google OAuth status:", error);
    return NextResponse.json({ 
      enabled: false,
      hasClientId: false,
      hasClientSecret: false,
      message: "Error checking Google OAuth configuration"
    });
  }
}
