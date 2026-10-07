import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import Agent from "@/models/Agent";
import VisaApplication from "@/models/VisaApplication";

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

    // Get applications assigned to this agent
    const applications = await VisaApplication.find({ agentId: agent._id }).lean();

    // Group by user to get unique clients
    const clientMap = new Map();
    let totalRevenue = 0;

    applications.forEach(app => {
      const userId = app.userId.toString();
      if (!clientMap.has(userId)) {
        clientMap.set(userId, {
          userId,
          lastApplicationDate: app.createdAt
        });
      }
      totalRevenue += app.totalAmount || 0;
    });

    const totalClients = clientMap.size;
    const activeClients = Array.from(clientMap.values()).filter(client => 
      new Date(client.lastApplicationDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length;

    const stats = {
      totalClients,
      activeClients,
      totalApplications: applications.length,
      totalRevenue
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Get client stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client stats" },
      { status: 500 }
    );
  }
}
