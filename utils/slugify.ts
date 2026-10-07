// utils/slugify.ts
export function slugify(text: string): string {
  if (!text) return ''

  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with hyphens
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      // Remove special characters except hyphens
      .replace(/[^\w\-]+/g, '')
      // Replace multiple hyphens with single hyphen
      .replace(/\-\-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  )
}

// Example: "Student Visas" → "student-visas"
// Example: "Work & Business Visas" → "work-business-visas"
