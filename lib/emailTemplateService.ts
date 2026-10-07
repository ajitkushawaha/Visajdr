import connectDB from './db'
import EmailTemplate, { IEmailTemplate } from '@/models/EmailTemplate'

interface TemplateVariables {
  [key: string]: string | number | undefined | null
}

/**
 * Replace variables in template string with actual values
 * Example: "Hello {{name}}" with {name: "John"} becomes "Hello John"
 */
function replaceVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, String(value || ''))
  }
  return result
}

/**
 * Get email template from database by type
 * Returns null if not found or not active
 */
export async function getEmailTemplate(
  type: IEmailTemplate['type'],
  fallbackToDefault: boolean = true
): Promise<IEmailTemplate | null> {
  try {
    await connectDB()
    const template = await EmailTemplate.findOne({
      type,
      isActive: true,
    })

    if (template) {
      return template.toObject() as IEmailTemplate
    }

    return null
  } catch (error) {
    console.error(`Error fetching email template for type ${type}:`, error)
    return null
  }
}

/**
 * Render email template with variables
 */
export async function renderEmailTemplate(
  type: IEmailTemplate['type'],
  variables: TemplateVariables,
  fallbackTemplate?: {
    subject: string
    html: string
    text: string
  }
): Promise<{ subject: string; html: string; text: string }> {
  // Default variables available to all templates
  const defaultVariables: TemplateVariables = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://visa4.com',
    companyName: 'Visa4 Visa Services',
    supportEmail: 'support@euroworld.com',
    currentYear: new Date().getFullYear(),
    ...variables, // Allow overriding defaults
  }

  // Try to get template from database
  const dbTemplate = await getEmailTemplate(type, true)

  if (dbTemplate) {
    // Use database template
    return {
      subject: replaceVariables(dbTemplate.subject, defaultVariables),
      html: replaceVariables(dbTemplate.htmlBody, defaultVariables),
      text: replaceVariables(dbTemplate.textBody, defaultVariables),
    }
  }

  // Fallback to hardcoded template if provided
  if (fallbackTemplate) {
    return {
      subject: replaceVariables(fallbackTemplate.subject, defaultVariables),
      html: replaceVariables(fallbackTemplate.html, defaultVariables),
      text: replaceVariables(fallbackTemplate.text, defaultVariables),
    }
  }

  // Last resort: return empty template
  console.warn(
    `No email template found for type ${type} and no fallback provided`
  )
  return {
    subject: 'Email Notification',
    html: '<p>Email notification</p>',
    text: 'Email notification',
  }
}

/**
 * Get all available email template types with their variables
 */
export async function getTemplateVariables(): Promise<
  Record<string, string[]>
> {
  try {
    await connectDB()
    const templates = await EmailTemplate.find({ isActive: true }).lean()
    const result: Record<string, string[]> = {}

    for (const template of templates) {
      result[template.type] = template.variables || []
    }

    return result
  } catch (error) {
    console.error('Error fetching template variables:', error)
    return {}
  }
}
