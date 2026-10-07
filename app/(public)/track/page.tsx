import { fetchSEOData, generateMetadata as generateSEOMetadata } from "@/components/seo/ServerSEO"
import TrackApplicationClient from "@/components/track/TrackApplicationClient"

// Generate metadata for SEO
export async function generateMetadata() {
  const seoData = await fetchSEOData('/track')
  return generateSEOMetadata(seoData)
}

export default function TrackPage() {
  return <TrackApplicationClient />
}