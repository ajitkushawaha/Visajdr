import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import VisaApplication from "@/models/VisaApplication";
import Agent from "@/models/Agent";

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
    const country = searchParams.get("country");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const query: any = { agentId: agent._id };
    
    if (status) query.status = status;
    if (country) query["visaDetails.country"] = { $regex: country, $options: "i" };
    
    if (search) {
      query.$or = [
        { "personalInfo.firstName": { $regex: search, $options: "i" } },
        { "personalInfo.lastName": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } },
        { trackingId: { $regex: search, $options: "i" } }
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const applications = await VisaApplication.find(query)
      .populate("visaId", "country visaType")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await VisaApplication.countDocuments(query);

    // Get status counts for dashboard
    const statusCounts = await VisaApplication.aggregate([
      { $match: { agentId: agent._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusSummary = statusCounts.reduce((acc: any, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return NextResponse.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusSummary
    });

  } catch (error) {
    console.error("Get agent applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
