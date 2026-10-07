import connectDB from '@/lib/db'
import CompanySettings from '@/models/CompanySettings'

export async function fetchCompanySettingsForScripts() {
  let googleAnalyticsHead = ''
  let googleAnalyticsBody = ''
  let googleSiteVerification = ''

  try {
    await connectDB()
    const settings = await CompanySettings.findOne().lean()

    if (settings) {
      googleAnalyticsHead = settings.googleAnalyticsHead || ''
      googleAnalyticsBody = settings.googleAnalyticsBody || ''
      googleSiteVerification = settings.googleSiteVerification || ''
    }
  } catch (error) {
    console.error('Error fetching company settings for scripts:', error)
  }

  return {
    googleAnalyticsHead,
    googleAnalyticsBody,
    googleSiteVerification,
  }
}

export async function getCompanySettings() {
  try {
    await connectDB()
    const settings = await CompanySettings.findOne().lean()
    if (settings) {
      return JSON.parse(JSON.stringify(settings))
    }
  } catch (error) {
    console.error('Error fetching company settings:', error)
  }
  return null
}
