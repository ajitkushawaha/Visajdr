/**
 * Date formatting utilities for consistent date display across the application
 */

export type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'custom'

export interface DateFormatOptions {
  format?: DateFormat
  locale?: string
  timeZone?: string
  includeTime?: boolean
}

/**
 * Standard date formatting function
 * @param date - Date string, Date object, or timestamp
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | number,
  options: DateFormatOptions = {}
): string {
  const {
    format = 'medium',
    locale = 'en-IN', // Default to Indian format (DD/MM/YYYY)
    timeZone = 'Asia/Kolkata',
    includeTime = false,
  } = options

  const dateObj = new Date(date)

  if (isNaN(dateObj.getTime())) {
    // Return empty string or a fallback instead of "Invalid Date" for better UX
    return ''
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone,
  }

  switch (format) {
    case 'short':
      formatOptions.day = '2-digit'
      formatOptions.month = '2-digit'
      formatOptions.year = 'numeric'
      break
    case 'medium':
      formatOptions.day = '2-digit'
      formatOptions.month = 'short'
      formatOptions.year = 'numeric'
      break
    case 'long':
      formatOptions.day = '2-digit'
      formatOptions.month = 'long'
      formatOptions.year = 'numeric'
      break
    case 'full':
      formatOptions.weekday = 'long'
      formatOptions.day = '2-digit'
      formatOptions.month = 'long'
      formatOptions.year = 'numeric'
      break
    case 'custom':
      // For custom formatting, use the provided options
      break
  }

  if (includeTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
    formatOptions.hour12 = true
  }

  return dateObj.toLocaleDateString(locale, formatOptions)
}

/**
 * Format date for display in admin panels (consistent format)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatAdminDate(date: string | Date | number): string {
  return formatDate(date, { format: 'short', locale: 'en-IN' })
}

/**
 * Format date for display in user-facing content
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string (DD MMM YYYY)
 */
export function formatUserDate(date: string | Date | number): string {
  return formatDate(date, { format: 'medium', locale: 'en-IN' })
}

/**
 * Format date with time for detailed views
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string with time (DD MMM YYYY, HH:MM AM/PM)
 */
export function formatDateTime(date: string | Date | number): string {
  return formatDate(date, {
    format: 'medium',
    locale: 'en-IN',
    includeTime: true,
  })
}

/**
 * Format date for API responses (ISO format)
 * @param date - Date string, Date object, or timestamp
 * @returns ISO date string
 */
export function formatApiDate(date: string | Date | number): string {
  const dateObj = new Date(date)
  return dateObj.toISOString().split('T')[0] // YYYY-MM-DD format
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param date - Date string, Date object, or timestamp
 * @returns Date string in YYYY-MM-DD format
 */
export function formatInputDate(date: string | Date | number): string {
  const dateObj = new Date(date)
  return dateObj.toISOString().split('T')[0]
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 * @param date - Date string, Date object, or timestamp
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date | number): string {
  const dateObj = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}

/**
 * Check if a date is today
 * @param date - Date string, Date object, or timestamp
 * @returns True if the date is today
 */
export function isToday(date: string | Date | number): boolean {
  const dateObj = new Date(date)
  const today = new Date()

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is in the past
 * @param date - Date string, Date object, or timestamp
 * @returns True if the date is in the past
 */
export function isPast(date: string | Date | number): boolean {
  const dateObj = new Date(date)
  const now = new Date()
  return dateObj < now
}

/**
 * Check if a date is in the future
 * @param date - Date string, Date object, or timestamp
 * @returns True if the date is in the future
 */
export function isFuture(date: string | Date | number): boolean {
  const dateObj = new Date(date)
  const now = new Date()
  return dateObj > now
}
