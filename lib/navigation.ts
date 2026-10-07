import connectDB from './db'
import Navigation from '@/models/Navigation'

export async function getNavigationData(type: string = 'main') {
  try {
    await connectDB()

    const navigations = await Navigation.find({
      status: 'active',
      type: type,
    }).sort({ createdAt: 1 })

    if (navigations && navigations.length > 0) {
      return JSON.parse(JSON.stringify(navigations[0].items || []))
    }
    return []
  } catch (error) {
    console.error(`Error fetching navigation data for type ${type}:`, error)
    return []
  }
}
