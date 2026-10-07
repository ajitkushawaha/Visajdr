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

    // Get commission statistics
    const stats = await AgentCommission.aggregate([
      { $match: { agentId: agent._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$commissionAmount" }
        }
      }
    ]);

    // Calculate totals
    const totalCommissions = await AgentCommission.countDocuments({ agentId: agent._id });
    const totalEarnings = await AgentCommission.aggregate([
      { $match: { agentId: agent._id } },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
    ]);

    // Initialize stats object
    const commissionStats = {
      totalCommissions,
      pendingCommissions: 0,
      paidCommissions: 0,
      totalEarnings: totalEarnings[0]?.total || 0,
      pendingEarnings: 0,
      paidEarnings: 0
    };

    // Populate stats from aggregation results
    stats.forEach(stat => {
      switch (stat._id) {
        case 'pending':
          commissionStats.pendingCommissions = stat.count;
          commissionStats.pendingEarnings = stat.totalAmount;
          break;
        case 'paid':
          commissionStats.paidCommissions = stat.count;
          commissionStats.paidEarnings = stat.totalAmount;
          break;
      }
    });

    return NextResponse.json({
      success: true,
      stats: commissionStats
    });

  } catch (error) {
    console.error("Get commission stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch commission stats" },
      { status: 500 }
    );
  }
}
