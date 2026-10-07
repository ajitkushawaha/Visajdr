import connectDB from './db'
import CompanySettings from '@/models/CompanySettings'

export interface GoogleOAuthConfig {
  clientId: string
  clientSecret: string
  isConfigured: boolean
}

let cachedConfig: GoogleOAuthConfig | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

export async function getGoogleOAuthConfig(): Promise<GoogleOAuthConfig> {
  const now = Date.now()

  // Return cached config if it's still fresh
  if (cachedConfig && now - lastFetchTime < CACHE_DURATION) {
    return cachedConfig
  }

  try {
    await connectDB()
    const settings = await CompanySettings.findOne({})

    // Only use database settings, no environment fallback
    const clientId = settings?.googleApiKey || ''
    const clientSecret = settings?.googleClientSecret || ''

    const config: GoogleOAuthConfig = {
      clientId,
      clientSecret,
      isConfigured: !!(clientId && clientSecret),
    }

    // Cache the config
    cachedConfig = config
    lastFetchTime = now

    return config
  } catch (error) {
    console.error('Error fetching Google OAuth config from database:', error)

    // Return empty config if database error
    const emptyConfig: GoogleOAuthConfig = {
      clientId: '',
      clientSecret: '',
      isConfigured: false,
    }

    return emptyConfig
  }
}

// Function to clear cache when settings are updated
export function clearGoogleOAuthCache() {
  cachedConfig = null
  lastFetchTime = 0
  console.log('Google OAuth cache cleared')
}
