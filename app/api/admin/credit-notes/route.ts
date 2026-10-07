import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import VisaApplication from "@/models/VisaApplication";
import TravelInsuranceApplication from "@/models/TravelInsuranceApplication";

// Mock credit notes data - in a real application, you'd have a CreditNote model
const mockCreditNotes = [
  {
    _id: "1",
    creditNoteNumber: "CN-2024-001",
    originalTransactionId: "TXN-001",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    serviceType: "visa",
    originalAmount: 5000,
    refundAmount: 5000,
    reason: "Customer cancelled visa application before processing",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    creditNoteNumber: "CN-2024-002",
    originalTransactionId: "TXN-002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    serviceType: "travel-insurance",
    originalAmount: 2500,
    refundAmount: 2500,
    reason: "Duplicate payment processed",
    status: "approved",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    creditNoteNumber: "CN-2024-003",
    originalTransactionId: "TXN-003",
    customerName: "Mike Johnson",
    customerEmail: "mike.johnson@example.com",
    serviceType: "visa",
    originalAmount: 7500,
    refundAmount: 7500,
    reason: "Service not provided as promised",
    status: "processed",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: "admin@example.com",
  },
  {
    _id: "4",
    creditNoteNumber: "CN-2024-004",
    originalTransactionId: "TXN-004",
    customerName: "Sarah Wilson",
    customerEmail: "sarah.wilson@example.com",
    serviceType: "travel-insurance",
    originalAmount: 3000,
    refundAmount: 1500,
    reason: "Partial refund due to policy cancellation",
    status: "rejected",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Filter credit notes by status
    let filteredNotes = mockCreditNotes;
    if (status !== 'all') {
      filteredNotes = mockCreditNotes.filter(note => note.status === status);
    }

    return NextResponse.json({
      success: true,
      creditNotes: filteredNotes,
      total: filteredNotes.length
    });

  } catch (error) {
    console.error('Failed to fetch credit notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      originalTransactionId,
      customerName,
      customerEmail,
      serviceType,
      originalAmount,
      refundAmount,
      reason
    } = body;

    // Validate required fields
    if (!originalTransactionId || !customerName || !customerEmail || !serviceType || !originalAmount || !refundAmount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate credit note number
    const creditNoteNumber = `CN-${new Date().getFullYear()}-${String(mockCreditNotes.length + 1).padStart(3, '0')}`;

    // Create new credit note
    const newCreditNote = {
      _id: String(mockCreditNotes.length + 1),
      creditNoteNumber,
      originalTransactionId,
      customerName,
      customerEmail,
      serviceType,
      originalAmount: parseFloat(originalAmount),
      refundAmount: parseFloat(refundAmount),
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // In a real application, you would save this to the database
    mockCreditNotes.push(newCreditNote);

    return NextResponse.json({
      success: true,
      creditNote: newCreditNote,
      message: 'Credit note created successfully'
    });

  } catch (error) {
    console.error('Failed to create credit note:', error);
    return NextResponse.json(
      { error: 'Failed to create credit note' },
      { status: 500 }
    );
  }
}
