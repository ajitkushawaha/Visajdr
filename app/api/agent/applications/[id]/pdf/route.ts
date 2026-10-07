import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authConfig'
import connectDB from '@/lib/db'
import VisaApplication from '@/models/VisaApplication'
import Agent from '@/models/Agent'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check agent authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Await params
    const { id } = await params

    // Get agent info
    const agent = await Agent.findOne({ userId: session.user.id })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const application = await VisaApplication.findById(id)
      .populate('visaId', 'country visaType')
      .populate('userId', 'name email')
      .populate(
        'agentId',
        'agentId personalDetails.fullName personalDetails.email'
      )

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const assignedAgentId = (application as any).agentId?._id
      ? (application as any).agentId._id.toString()
      : (application as any).agentId?.toString()
    if (assignedAgentId !== agent._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { width, height } = page.getSize()

    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let yPosition = height - 50

    // Helper function to add text
    const addText = (
      text: string,
      x: number,
      y: number,
      fontSize: number = 12,
      isBold: boolean = false
    ) => {
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0),
      })
    }

    // Helper function to add line
    const addLine = (y: number) => {
      page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      })
    }

    // Title
    addText('VISA APPLICATION REPORT', width / 2 - 100, yPosition, 18, true)
    yPosition -= 40

    // Application Info
    addText('Application Information', 50, yPosition, 14, true)
    yPosition -= 30

    addText(`Tracking ID: ${application.trackingId}`, 50, yPosition)
    yPosition -= 20
    addText(
      `Status: ${application.status.replace('_', ' ').toUpperCase()}`,
      50,
      yPosition
    )
    yPosition -= 20
    addText(
      `Created: ${new Date(application.createdAt).toLocaleDateString()}`,
      50,
      yPosition
    )
    yPosition -= 30

    addLine(yPosition)
    yPosition -= 20

    // Personal Information
    addText('Personal Information', 50, yPosition, 14, true)
    yPosition -= 30

    addText(
      `Name: ${application.personalInfo.firstName} ${application.personalInfo.lastName}`,
      50,
      yPosition
    )
    yPosition -= 20
    addText(`Email: ${application.personalInfo.email}`, 50, yPosition)
    yPosition -= 20
    addText(`Phone: ${application.personalInfo.phone}`, 50, yPosition)
    yPosition -= 20
    addText(
      `Nationality: ${application.personalInfo.nationality}`,
      50,
      yPosition
    )
    if (application.personalInfo.purpose) {
      yPosition -= 20
      addText(`Purpose: ${application.personalInfo.purpose}`, 50, yPosition)
    }
    yPosition -= 30

    addLine(yPosition)
    yPosition -= 20

    // Visa Details
    addText('Visa Details', 50, yPosition, 14, true)
    yPosition -= 30

    addText(`Destination: ${application.visaDetails.country}`, 50, yPosition)
    yPosition -= 20
    addText(`Visa Type: ${application.visaDetails.visaType}`, 50, yPosition)
    yPosition -= 20
    addText(
      `Processing Time: ${application.visaDetails.processingTime}`,
      50,
      yPosition
    )
    yPosition -= 20
    addText(`Stay Period: ${application.visaDetails.stayPeriod}`, 50, yPosition)
    yPosition -= 20
    addText(`Validity: ${application.visaDetails.validity}`, 50, yPosition)
    yPosition -= 20
    addText(
      `Price: Rs. ${application.visaDetails.price.toLocaleString()}`,
      50,
      yPosition
    )
    yPosition -= 20
    addText(
      `Total Amount: Rs. ${application.totalAmount.toLocaleString()}`,
      50,
      yPosition
    )
    yPosition -= 30

    addLine(yPosition)
    yPosition -= 20

    // Status History
    if (application.statusHistory && application.statusHistory.length > 0) {
      addText('Status History', 50, yPosition, 14, true)
      yPosition -= 30

      application.statusHistory.forEach((entry, index) => {
        if (yPosition < 100) {
          // Add new page if needed
          const newPage = pdfDoc.addPage([595.28, 841.89])
          yPosition = newPage.getSize().height - 50
        }

        addText(
          `${index + 1}. ${entry.status.replace('_', ' ').toUpperCase()}`,
          70,
          yPosition,
          12,
          true
        )
        yPosition -= 15
        addText(
          `   Changed by: ${entry.changedByName} (${entry.changedByRole})`,
          70,
          yPosition
        )
        yPosition -= 15
        addText(
          `   Date: ${new Date(entry.timestamp).toLocaleString()}`,
          70,
          yPosition
        )
        if (entry.notes) {
          yPosition -= 15
          addText(`   Notes: ${entry.notes}`, 70, yPosition)
        }
        if (entry.reason) {
          yPosition -= 15
          addText(`   Reason: ${entry.reason}`, 70, yPosition)
        }
        yPosition -= 20
      })
    }

    // Footer
    yPosition = 50
    addText(`Generated on: ${new Date().toLocaleString()}`, 50, yPosition)
    addText(
      `By: ${agent.personalDetails.fullName} (${agent.agentId})`,
      50,
      yPosition - 15
    )

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="application-${application.trackingId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Generate PDF error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
