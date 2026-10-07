import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import ApplicationComment from "@/models/ApplicationComment";
import VisaApplication from "@/models/VisaApplication";
import User from "@/models/User";
import Agent from "@/models/Agent";
import { uploadImage } from "@/lib/cloudinary";
import { emailService } from "@/lib/emailService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Await params
    const { id } = await params;

    // Verify application exists
    const application = await VisaApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check access permissions
    const isAdmin = session.user.role === "admin";
    const isAgent = session.user.role === "agent";
    const isOwner = application.userId.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      // Check if agent is assigned to this application
      if (isAgent) {
        const agent = await Agent.findOne({ userId: session.user.id });
        if (!agent || application.agentId?.toString() !== agent._id.toString()) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Get comments
    const query: any = { applicationId: id };
    
    // Filter internal comments for non-admin users
    if (!isAdmin) {
      query.isInternal = false;
    }

    const comments = await ApplicationComment.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      comments
    });

  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Await params
    const { id } = await params;

    // Verify application exists
    const application = await VisaApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check access permissions
    const isAdmin = session.user.role === "admin";
    const isAgent = session.user.role === "agent";
    const isOwner = application.userId.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      // Check if agent is assigned to this application
      if (isAgent) {
        const agent = await Agent.findOne({ userId: session.user.id });
        if (!agent || application.agentId?.toString() !== agent._id.toString()) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const formData = await request.formData();
    const message = formData.get("message") as string;
    const isInternal = formData.get("isInternal") === "true";
    const file = formData.get("file") as File;

    if (!message) {
      return NextResponse.json({ 
        error: "Message is required" 
      }, { status: 400 });
    }

    // Get user info
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle file upload if provided
    let attachments: any[] = [];
    if (file) {
      const uploadResult = await uploadImage(file, 'comment-attachments');
      const fileUrl = typeof uploadResult === 'string' ? uploadResult : uploadResult.url;
      
      attachments.push({
        url: fileUrl,
        name: file.name
      });
    }

    // Create comment
    const comment = new ApplicationComment({
      applicationId: id,
      userId: session.user.id,
      userRole: session.user.role as 'user' | 'admin' | 'agent',
      userName: user.name || 'Unknown User',
      message: message,
      isInternal: isInternal && isAdmin, // Only admins can create internal comments
      attachments: attachments
    });

    await comment.save();

    // Send email notification to relevant parties
    try {
      const recipients = new Set<string>();
      
      // Add application owner
      recipients.add(application.personalInfo.email);
      
      // Add admin emails (you might want to get this from a settings table)
      if (session.user.role !== 'admin') {
        // Add admin notification
        const adminUsers = await User.find({ role: 'admin' });
        adminUsers.forEach(admin => recipients.add(admin.email));
      }

      // Add assigned agent if exists
      if (application.agentId) {
        const agent = await Agent.findById(application.agentId).populate('userId', 'email');
        if (agent) {
          recipients.add(agent.userId.email);
        }
      }

      // Send notification to all recipients except the commenter
      for (const email of recipients) {
        if (email !== user.email) {
          await emailService.sendCommentNotification(
            email,
            application.trackingId,
            user.name || 'Unknown User',
            message,
            application.personalInfo.firstName + ' ' + application.personalInfo.lastName
          );
        }
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      comment
    });

  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
