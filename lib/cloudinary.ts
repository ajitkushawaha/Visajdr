import { v2 as cloudinary } from 'cloudinary'
import connectDB from './db'
import CompanySettings from '@/models/CompanySettings'

// Configure Cloudinary with database settings
const configCloudinary = async () => {
  try {
    await connectDB()
    const settings = await CompanySettings.findOne()

    if (!settings) {
      throw new Error('Company settings not found')
    }

    const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } =
      settings

    if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
      throw new Error('Missing Cloudinary credentials in database')
    }

    cloudinary.config({
      cloud_name: cloudinaryCloudName,
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiSecret,
    })
  } catch (error) {
    console.error('Failed to configure Cloudinary:', error)
    throw error
  }
}

// Initialize Cloudinary configuration
configCloudinary()

export default cloudinary

// Helper function to upload image to Cloudinary
export const uploadImage = async (
  file: File,
  folder: string = 'visa-applications'
) => {
  try {
    // Ensure Cloudinary is configured with latest database settings
    await configCloudinary()

    // Convert File to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'auto',
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
    })

    console.log('Upload successful:', result.secure_url)

    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.name,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
  }
}
