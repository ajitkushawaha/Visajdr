/**
 * Adds unique IDs to headings in HTML content for Table of Contents functionality
 */
export function addHeadingIds(htmlContent: string): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: use regex to add IDs to headings
    return htmlContent.replace(
      /<(h[1-6])([^>]*?)>(.*?)<\/h[1-6]>/gi,
      (match, tag, attributes, content) => {
        // Check if ID already exists
        if (attributes.includes('id=')) {
          return match
        }
        
        // Create a slug from the heading content
        const text = content.replace(/<[^>]*>/g, '') // Remove HTML tags
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim()
        
        // Use slug if available, otherwise use a random ID
        const id = slug ? `heading-${slug}` : `heading-${Math.random().toString(36).substr(2, 9)}`
        
        return `<${tag}${attributes} id="${id}">${content}</${tag}>`
      }
    )
  }

  // Client-side: use DOMParser
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

  headings.forEach((heading, index) => {
    if (!heading.id) {
      // Create a slug from the heading text
      const text = heading.textContent || ''
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()

      // Use slug if available, otherwise use index
      const id = slug ? `heading-${slug}` : `heading-${index}`
      heading.id = id
    }
  })

  return doc.documentElement.outerHTML
}
