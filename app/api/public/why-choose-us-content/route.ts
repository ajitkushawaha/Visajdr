import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WhyChooseUsSection from "@/models/WhyChooseUsSection";

export async function GET() {
  try {
    await connectDB();
    
    // Find the active why choose us section
    const whyChooseUsSection = await WhyChooseUsSection.findOne({ status: 'active' });
    
    if (!whyChooseUsSection) {
      // Return default data if no section found
      return NextResponse.json({
        success: true,
        whyChooseUsSection: {
          title: "WHY CHOOSE US",
          subtitle: "Why are we famous?",
          description: "At the Visa4, you can get help in solving a single issue or get a turnkey visa. Cooperation between the client and the visa consultant in India is possible both in person and remotely.",
          backgroundImage: "/visa/bg2.png",
          features: [
            {
              title: "Expert Consultation",
              description: "Consultation on choosing the best place to submit documents",
              icon: "User",
              backgroundColor: "",
              textColor: "",
              iconColor: "",
              status: "active",
              order: 1
            },
            {
              title: "Document Preparation",
              description: "Preparation of all necessary documents for obtaining a permit",
              icon: "FileText",
              backgroundColor: "",
              textColor: "",
              iconColor: "",
              status: "active",
              order: 2
            },
            {
              title: "Appointment Scheduling",
              description: "Finding a suitable time and making an appointment",
              icon: "Calendar",
              backgroundColor: "",
              textColor: "",
              iconColor: "",
              status: "active",
              order: 3
            },
            {
              title: "Travel Planning Support",
              description: "Complete Airline ticket reservations, hotel search",
              icon: "Building2",
              backgroundColor: "#1a1b5c",
              textColor: "white",
              iconColor: "white",
              status: "active",
              order: 4
            },
            {
              title: "Permit Finalization",
              description: "completing the entry permit process",
              icon: "Settings",
              backgroundColor: "",
              textColor: "",
              iconColor: "",
              status: "active",
              order: 5
            }
          ]
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      whyChooseUsSection
    });
  } catch (error) {
    console.error("Error fetching why choose us content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
