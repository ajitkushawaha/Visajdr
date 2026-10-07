import { Suspense } from 'react'
import VisaSelectionWizard from '@/components/visa/VisaSelectionWizard'
import connectDb from '@/lib/db'
import Visa from '@/models/Visa'
import mongoose from 'mongoose'

// Prevent static generation for this dynamic page
export const dynamic = 'force-dynamic'

async function getData(country: string | undefined) {
  try {
    await connectDb()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection failed')
    }

    // Fetch visa types from the visatypes collection
    const visaTypesRaw = await db
      .collection('visatypes')
      .find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .toArray()

    const visaTypes = visaTypesRaw.map(item => ({
      id: item._id.toString(),
      name: item.name,
      slug: item.slug,
      displayName: item.displayName,
      description: item.description,
      image: item.image || null,
      icon: item.icon || null,
      order: item.order,
    }))

    let countryVisas: any[] = []

    if (country) {
      // Build query - filter by country
      // Case-insensitive country matching
      const query = {
        status: 'active',
        country: new RegExp(`^${country}$`, 'i'),
      }

      const visasRaw = await Visa.find(query).sort({ createdAt: -1 }).lean()

      countryVisas = visasRaw.map((visa: any) => ({
        id: visa._id.toString(),
        country: visa.country,
        flag: visa.countryFlag || '',
        countryFlag: visa.countryFlag || '',
        countryCode: visa.countryCode || '',
        countryImage: visa.countryImage || '',
        visaType: visa.visaType || '',
        adultPrice: visa.adultPrice || 0,
        processingTimeValue: visa.processingTimeValue || '',
        processingTimeDays: visa.processingTimeDays || 0,
        stayPeriod: visa.stayPeriod || '',
        validity: visa.validity || '',
        occupancyType: visa.occupancyType || '',
        purpose: visa.visaType || '',
        hotListed: visa.hotListed || 'false',
        visaSchedule: visa.visaSchedule || null,
        operatingSchedule: visa.operatingSchedule || null,
      }))
    }

    return { visaTypes, countryVisas }
  } catch (error) {
    console.error('Error fetching data for select-plan:', error)
    return { visaTypes: [], countryVisas: [] }
  }
}

export default async function SelectPlanPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const country =
    typeof searchParams.country === 'string' ? searchParams.country : undefined
  const purpose =
    typeof searchParams.purpose === 'string' ? searchParams.purpose : undefined

  // Fetch data server-side
  const { visaTypes, countryVisas } = await getData(country)

  if (country) {
    return (
      <div className="min-h-screen bg-theme-light-green py-24 px-4 md:px-8">
        <div className="w-4/5 max-[600px]:w-[100%] mx-auto border rounded-2xl p-6 shadow-sm bg-white">
          <VisaSelectionWizard
            country={country}
            initialVisaTypeConfigs={visaTypes}
            initialCountryVisas={countryVisas}
          />
        </div>
      </div>
    )
  }

  // If no country, show error
  return (
    <div className="min-h-screen bg-theme-light-green py-24 px-4 md:px-8">
      <div className="w-4/5 max-[600px]:w-[100%] mx-auto border rounded-2xl p-6 shadow-sm bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-primary mb-4">
            Country Required
          </h1>
          <p className="text-gray-600">
            Please select a country first to view visa options.
          </p>
        </div>
      </div>
    </div>
  )
}
