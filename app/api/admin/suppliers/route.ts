import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Supplier from "@/models/Supplier";

// GET - Fetch all suppliers with search and filter
export async function GET(request: NextRequest) {
  try {
    await connectDb();
    
    const { searchParams } = new URL(request.url);
    const searchKey = searchParams.get('searchKey');
    const searchValue = searchParams.get('searchValue');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const status = searchParams.get('status');
    const service = searchParams.get('service');
    const country = searchParams.get('country');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query: any = {};

    // Search functionality
    if (searchKey && searchValue) {
      switch (searchKey) {
        case 'supplier-name':
          query.name = { $regex: searchValue, $options: 'i' };
          break;
        case 'email':
          query.email = { $regex: searchValue, $options: 'i' };
          break;
        case 'mobile':
          query.mobile = { $regex: searchValue, $options: 'i' };
          break;
        case 'service':
          query.service = { $regex: searchValue, $options: 'i' };
          break;
        case 'status':
          query.status = searchValue.toLowerCase();
          break;
      }
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.createdAt.$lte = new Date(toDate + 'T23:59:59.999Z');
      }
    }

    // Additional filters
    if (status) {
      query.status = status;
    }
    if (service) {
      query.service = service;
    }
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [suppliers, totalCount] = await Promise.all([
      Supplier.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        suppliers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("GET suppliers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

// POST - Create new supplier
export async function POST(request: NextRequest) {
  try {
    await connectDb();
    
    const body = await request.json();
    const {
      name,
      email,
      mobile,
      service,
      country,
      city,
      address,
      commission,
      notes,
      contactPerson,
      website,
      rating
    } = body;

    // Validation
    if (!name || !email || !mobile || !service || !country) {
      return NextResponse.json(
        { success: false, error: "Name, email, mobile, service, and country are required" },
        { status: 400 }
      );
    }

    // Check if supplier with same email already exists
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return NextResponse.json(
        { success: false, error: "Supplier with this email already exists" },
        { status: 400 }
      );
    }

    // Create new supplier
    const supplier = new Supplier({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      service,
      country: country.trim(),
      city: city?.trim(),
      address: address?.trim(),
      commission: commission ? parseFloat(commission) : undefined,
      notes: notes?.trim(),
      contactPerson: contactPerson?.trim(),
      website: website?.trim(),
      rating: rating ? parseInt(rating) : 5
    });

    await supplier.save();

    return NextResponse.json({
      success: true,
      message: "Supplier created successfully",
      data: supplier
    }, { status: 201 });

  } catch (error) {
    console.error("POST supplier error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
