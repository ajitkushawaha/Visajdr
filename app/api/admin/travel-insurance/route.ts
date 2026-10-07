import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import connectDB from '@/lib/db';
import TravelInsuranceApplication from '@/models/TravelInsuranceApplication';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Get applications with pagination
    const applications = await TravelInsuranceApplication.find(query)
      .populate('userId', 'name email')
      .populate('insuranceId', 'country planType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await TravelInsuranceApplication.countDocuments(query);

    // Get status summary
    const statusSummary = await TravelInsuranceApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusSummaryObj = statusSummary.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusSummary: statusSummaryObj
    });

  } catch (error) {
    console.error('Error fetching travel insurance applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    const application = await TravelInsuranceApplication.findById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application
    application.status = status;
    if (notes) {
      application.notes = notes;
    }

    // Set policy dates if approved
    if (status === 'approved') {
      application.policyStartDate = application.tripDetails.startDate;
      application.policyEndDate = application.tripDetails.endDate;
      application.policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }

    await application.save();

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    console.error('Error updating travel insurance application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
