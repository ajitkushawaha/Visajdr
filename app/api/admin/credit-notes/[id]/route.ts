import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, notes } = body;

    // Find the credit note
    const creditNoteIndex = mockCreditNotes.findIndex(note => note._id === id);
    
    if (creditNoteIndex === -1) {
      return NextResponse.json(
        { error: 'Credit note not found' },
        { status: 404 }
      );
    }

    // Update the credit note
    const updatedCreditNote = {
      ...mockCreditNotes[creditNoteIndex],
      status,
      ...(status === 'processed' && {
        processedAt: new Date().toISOString(),
        processedBy: session.user.email
      }),
      ...(notes && { notes })
    };

    // In a real application, you would update this in the database
    mockCreditNotes[creditNoteIndex] = updatedCreditNote;

    return NextResponse.json({
      success: true,
      creditNote: updatedCreditNote,
      message: 'Credit note status updated successfully'
    });

  } catch (error) {
    console.error('Failed to update credit note:', error);
    return NextResponse.json(
      { error: 'Failed to update credit note' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = params;

    // Find the credit note
    const creditNote = mockCreditNotes.find(note => note._id === id);
    
    if (!creditNote) {
      return NextResponse.json(
        { error: 'Credit note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      creditNote
    });

  } catch (error) {
    console.error('Failed to fetch credit note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit note' },
      { status: 500 }
    );
  }
}
