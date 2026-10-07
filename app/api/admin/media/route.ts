import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";

// Mock media files data - in a real application, you'd have a Media model
const mockMediaFiles = [
  {
    id: "1",
    filename: "hero-banner.jpg",
    url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/hero-banner.jpg",
    publicId: "hero-banner",
    type: "image",
    size: 245760,
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2", 
    filename: "service-icon.svg",
    url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/service-icon.svg",
    publicId: "service-icon",
    type: "image",
    size: 15360,
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    filename: "testimonial-bg.png", 
    url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/testimonial-bg.png",
    publicId: "testimonial-bg",
    type: "image",
    size: 512000,
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    filename: "company-logo.png",
    url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/company-logo.png", 
    publicId: "company-logo",
    type: "image",
    size: 128000,
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// GET - Fetch all media files
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';

    let filteredFiles = mockMediaFiles;

    // Filter by type
    if (type !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.type === type);
    }

    // Filter by search term
    if (search) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      files: filteredFiles,
      total: filteredFiles.length
    });

  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
}

// POST - Upload new media file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "admin-media";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Upload to Cloudinary
    const result = await uploadImage(file, folder);

    // Create new media file entry
    const newFile = {
      id: String(mockMediaFiles.length + 1),
      filename: file.name,
      url: result.url,
      publicId: result.publicId,
      type: "image",
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    // In a real application, you would save this to the database
    mockMediaFiles.push(newFile);

    return NextResponse.json({
      success: true,
      file: newFile,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// DELETE - Delete media file
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Find and remove file from mock data
    const fileIndex = mockMediaFiles.findIndex(file => file._id === fileId);
    
    if (fileIndex === -1) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const deletedFile = mockMediaFiles.splice(fileIndex, 1)[0];

    // In a real application, you would also delete from Cloudinary
    // await cloudinary.uploader.destroy(deletedFile.publicId);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      file: deletedFile
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
