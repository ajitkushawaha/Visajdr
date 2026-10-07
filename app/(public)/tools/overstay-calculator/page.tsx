import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import connectDB from '@/lib/db'
import OverstayCalculatorConfig from '@/models/OverstayCalculatorConfig'
import OverstayCalculator from '@/components/tools/OverstayCalculator'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ country?: string }>
}

// Helper function to recursively convert all _id fields to strings
function convertIds(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map(item => convertIds(item))
  }

  const newObj: { [key: string]: any } = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (key === '_id' && value && typeof value.toString === 'function') {
        newObj[key] = value.toString()
      } else if (value instanceof Date) {
        newObj[key] = value.toISOString()
      } else if (value && typeof value === 'object') {
        newObj[key] = convertIds(value)
      } else {
        newObj[key] = value
      }
    }
  }
  return newObj
}

async function getConfigs(country?: string) {
  await connectDB()

  const query: any = { isActive: true }
  if (country) {
    query.country = new RegExp(`^${country}$`, 'i')
  }

  const configs = await OverstayCalculatorConfig.find(query)
    .select('-createdAt -updatedAt -__v')
    .lean()

  // Convert all MongoDB objects to plain objects with string IDs
  return convertIds(configs)
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { country } = await searchParams
  const configs = await getConfigs(country)
  const config = configs.length > 0 ? configs[0] : null

  if (config?.metaTitle) {
    return {
      title: config.metaTitle,
      description:
        config.metaDescription ||
        `Calculate ${config.country} visa overstay fines instantly`,
      keywords: config.metaKeywords,
    }
  }

  const countryName = country || 'Visa'
  return {
    title: `${countryName} Tourist Visa Overstay Calculator | Check Fines Instantly`,
    description: `Calculate your ${countryName} tourist visa overstay fines instantly. Check grace period, overstay days, and estimated fines.`,
    keywords: `${countryName} visa overstay calculator, visa fine calculator, overstay fine, visa regularization`,
  }
}

export default async function OverstayCalculatorPage({ searchParams }: Props) {
  const { country } = await searchParams
  const configs = await getConfigs(country)

  if (configs.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-theme-light-green py-12 px-4 sm:px-6 lg:px-8">
      <OverstayCalculator configs={configs as any} defaultCountry={country} />
    </div>
  )
}
