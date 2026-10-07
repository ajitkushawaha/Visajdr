import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import Agent from "@/models/Agent";
import AgentCommission from "@/models/AgentCommission";

export async function GET(request: NextRequest) {
  try {
    // Check agent authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get agent info
    const agent = await Agent.findOne({ userId: session.user.id });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const paymentPeriod = searchParams.get("paymentPeriod");
    const search = searchParams.get("search");

    const query: any = { agentId: agent._id };
    
    if (status) query.status = status;
    if (paymentPeriod) query.paymentPeriod = paymentPeriod;
    
    if (search) {
      query.$or = [
        { "applicationId.trackingId": { $regex: search, $options: "i" } },
        { "applicationId.personalInfo.firstName": { $regex: search, $options: "i" } },
        { "applicationId.personalInfo.lastName": { $regex: search, $options: "i" } },
        { "applicationId.personalInfo.email": { $regex: search, $options: "i" } }
      ];
    }

    const commissions = await AgentCommission.find(query)
      .populate({
        path: "applicationId",
        select: "trackingId personalInfo visaDetails",
        populate: {
          path: "visaDetails",
          select: "country visaType"
        }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await AgentCommission.countDocuments(query);

    return NextResponse.json({
      success: true,
      commissions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("Get commissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch commissions" },
      { status: 500 }
    );
  }
}
