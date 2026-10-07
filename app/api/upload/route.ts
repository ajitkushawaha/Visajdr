import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { mkdir } from 'fs/promises'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + '-' + file.name.replaceAll(' ', '_')

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignore if exists
    }

    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({
      success: true,
      file: {
        url: `/uploads/${filename}`,
        publicId: filename,
        originalName: file.name,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
