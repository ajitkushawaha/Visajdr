/**
 * Utility functions to optimize Cloudinary image URLs
 * Adds transformations for format, quality, and responsive sizing
 */

/**
 * Optimizes a Cloudinary URL with transformations for better performance
 * @param url - The Cloudinary URL
 * @param width - Desired width (optional, for responsive images)
 * @param height - Desired height (optional, for responsive images)
 * @param quality - Quality level: 'auto', 'auto:good', 'auto:best', or number 1-100
 * @param format - Image format: 'auto', 'webp', 'avif', 'jpg', 'png'
 * @returns Optimized Cloudinary URL
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | 'auto:good' | 'auto:best' | number
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  const { width, height, quality = 'auto:good', format = 'auto' } = options

  // Parse the Cloudinary URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{public_id}.{format}
  const urlParts = url.split('/upload/')
  if (urlParts.length !== 2) {
    return url
  }

  const baseUrl = urlParts[0] + '/upload/'
  const restOfUrl = urlParts[1]

  // Build transformations array
  const transformations: string[] = []

  // Add width/height if provided
  if (width) {
    transformations.push(`w_${width}`)
  }
  if (height) {
    transformations.push(`h_${height}`)
  }

  // Add quality
  if (
    quality === 'auto' ||
    quality === 'auto:good' ||
    quality === 'auto:best'
  ) {
    transformations.push(`q_${quality}`)
  } else if (typeof quality === 'number') {
    transformations.push(`q_${quality}`)
  }

  // Add format
  if (format === 'auto') {
    transformations.push('f_auto')
  } else {
    transformations.push(`f_${format}`)
  }

  // Add crop mode for better optimization
  if (width || height) {
    transformations.push('c_limit') // Limit crop to maintain aspect ratio
  }

  // Combine transformations
  const transformationString = transformations.join(',')
  return `${baseUrl}${transformationString}/${restOfUrl}`
}

/**
 * Gets responsive image sizes for Cloudinary
 * @param baseWidth - Base width of the image
 * @returns Array of responsive widths
 */
export function getResponsiveSizes(baseWidth: number): number[] {
  return [
    Math.round(baseWidth * 0.5), // Mobile
    Math.round(baseWidth * 0.75), // Tablet
    baseWidth, // Desktop
    Math.round(baseWidth * 1.5), // Retina
  ]
}
