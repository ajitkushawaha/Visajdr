import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import Agent from "@/models/Agent";
import VisaApplication from "@/models/VisaApplication";
import User from "@/models/User";

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
    const search = searchParams.get("search");
    const nationality = searchParams.get("nationality");
    const status = searchParams.get("status");

    // Get applications assigned to this agent
    const applicationsQuery: any = { agentId: agent._id };
    
    if (search) {
      applicationsQuery.$or = [
        { "personalInfo.firstName": { $regex: search, $options: "i" } },
        { "personalInfo.lastName": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } }
      ];
    }

    if (nationality) {
      applicationsQuery["personalInfo.nationality"] = { $regex: nationality, $options: "i" };
    }

    const applications = await VisaApplication.find(applicationsQuery)
      .populate("visaId", "country visaType")
      .sort({ createdAt: -1 })
      .lean();

    // Group applications by user
    const clientMap = new Map();
    
    applications.forEach(app => {
      const userId = app.userId.toString();
      if (!clientMap.has(userId)) {
        clientMap.set(userId, {
          _id: userId,
          personalInfo: app.personalInfo,
          totalApplications: 0,
          approvedApplications: 0,
          pendingApplications: 0,
          rejectedApplications: 0,
          totalSpent: 0,
          lastApplicationDate: app.createdAt,
          applications: []
        });
      }

      const client = clientMap.get(userId);
      client.totalApplications++;
      client.totalSpent += app.totalAmount || 0;
      client.lastApplicationDate = new Date(Math.max(new Date(client.lastApplicationDate).getTime(), new Date(app.createdAt).getTime()));

      // Count by status
      switch (app.status) {
        case 'approved':
          client.approvedApplications++;
          break;
        case 'pending':
        case 'under_review':
          client.pendingApplications++;
          break;
        case 'rejected':
          client.rejectedApplications++;
          break;
      }

      client.applications.push({
        _id: app._id,
        trackingId: app.trackingId,
        status: app.status,
        visaDetails: {
          country: app.visaDetails.country,
          visaType: app.visaDetails.visaType
        },
        createdAt: app.createdAt
      });
    });

    // Convert to array and sort
    let clients = Array.from(clientMap.values());
    
    // Apply status filter
    if (status === 'active') {
      clients = clients.filter(client => client.totalApplications > 0 && new Date(client.lastApplicationDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    } else if (status === 'inactive') {
      clients = clients.filter(client => client.totalApplications === 0 || new Date(client.lastApplicationDate) <= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    }

    // Sort by last application date
    clients.sort((a, b) => new Date(b.lastApplicationDate).getTime() - new Date(a.lastApplicationDate).getTime());

    // Pagination
    const total = clients.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = clients.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      clients: paginatedClients,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
