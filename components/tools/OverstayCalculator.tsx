'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CalendarDays,
  Hourglass,
  AlertCircle,
  AlertTriangle,
  MessageCircle,
  ChevronRight,
  Calculator,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AdditionalCharge {
  name: string
  amount: number
  currency: string
  description?: string
}

interface RegularizationOption {
  title: string
  description: string
  link: string
}

interface VisaTypeConfig {
  name: string
  validityOptions: number[]
  gracePeriodDays: number
  finePerDay: number
  fineCurrency: string
  maxFineCap?: number
  additionalCharges?: AdditionalCharge[]
  isActive: boolean
}

interface OverstayCalculatorConfig {
  country: string
  countryCode?: string
  visaTypes: VisaTypeConfig[]
  whatsappLink?: string
  regularizationOptions?: RegularizationOption[]
  disclaimer?: string
}

interface OverstayCalculatorProps {
  configs: OverstayCalculatorConfig[]
  defaultCountry?: string
}

export default function OverstayCalculator({
  configs,
  defaultCountry,
}: OverstayCalculatorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(
    defaultCountry || (configs.length > 0 ? configs[0].country : '')
  )
  const [selectedVisaType, setSelectedVisaType] = useState<string>('')
  const [selectedValidity, setSelectedValidity] = useState<string>('')
  const [entryDate, setEntryDate] = useState<string>('')
  const [results, setResults] = useState<any>(null)

  const currentConfig = configs.find(c => c.country === selectedCountry)
  const availableVisaTypes =
    currentConfig?.visaTypes.filter(vt => vt.isActive) || []
  const currentVisaType = availableVisaTypes.find(
    vt => vt.name === selectedVisaType
  )

  useEffect(() => {
    if (selectedCountry && availableVisaTypes.length > 0 && !selectedVisaType) {
      setSelectedVisaType(availableVisaTypes[0].name)
    }
  }, [selectedCountry, availableVisaTypes, selectedVisaType])

  useEffect(() => {
    if (
      currentVisaType &&
      currentVisaType.validityOptions.length > 0 &&
      !selectedValidity
    ) {
      setSelectedValidity(currentVisaType.validityOptions[0].toString())
    }
  }, [currentVisaType, selectedValidity])

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const calculateFines = () => {
    if (!entryDate || !currentVisaType || !selectedValidity) {
      return
    }

    const entry = new Date(entryDate)
    if (isNaN(entry.getTime())) {
      alert('Please enter a valid entry date')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    entry.setHours(0, 0, 0, 0)

    if (entry > today) {
      alert('Entry date cannot be in the future')
      return
    }

    const validityDays = parseInt(selectedValidity)

    // Calculate visa expiry date
    const visaExpiry = new Date(entry)
    visaExpiry.setDate(visaExpiry.getDate() + validityDays)

    // Calculate grace period end date
    const gracePeriodEnd = new Date(visaExpiry)
    gracePeriodEnd.setDate(
      gracePeriodEnd.getDate() + currentVisaType.gracePeriodDays
    )

    // Calculate overstay days
    const overstayDays = Math.max(
      0,
      Math.floor(
        (today.getTime() - gracePeriodEnd.getTime()) / (1000 * 60 * 60 * 24)
      )
    )

    // Calculate fine
    let fine = overstayDays * currentVisaType.finePerDay
    if (currentVisaType.maxFineCap && fine > currentVisaType.maxFineCap) {
      fine = currentVisaType.maxFineCap
    }

    // Add additional charges
    let totalAdditionalCharges = 0
    const additionalChargesList: Array<{
      name: string
      amount: number
      currency: string
    }> = []
    if (currentVisaType.additionalCharges) {
      currentVisaType.additionalCharges.forEach(charge => {
        totalAdditionalCharges += charge.amount
        additionalChargesList.push({
          name: charge.name,
          amount: charge.amount,
          currency: charge.currency,
        })
      })
    }

    const totalFine = fine + totalAdditionalCharges

    setResults({
      visaExpiry,
      gracePeriodEnd,
      overstayDays,
      fine,
      totalFine,
      additionalCharges: additionalChargesList,
      currency: currentVisaType.fineCurrency,
    })
  }

  const generateWhatsAppMessage = (): string => {
    if (!results || !currentVisaType) return ''

    const message = `Hello! I need help with visa regularization.

📋 Details:
• Country: ${selectedCountry}
• Visa Type: ${selectedVisaType}
• Entry Date: ${formatDate(new Date(entryDate))}
• Validity: ${selectedValidity} Days
• Overstay Days: ${results.overstayDays} Days
• Estimated Fine: ${results.currency} ${results.totalFine.toLocaleString()}

Please help me with the regularization process.`

    return encodeURIComponent(message)
  }

  const getWhatsAppLink = (): string => {
    if (!currentConfig?.whatsappLink) return '#'
    const baseLink = currentConfig.whatsappLink
    const phoneMatch = baseLink.match(/(?:wa\.me\/|tel:)([0-9+]+)/)
    if (phoneMatch && phoneMatch[1]) {
      const phoneNumber = phoneMatch[1].replace(/^\+/, '')
      const message = generateWhatsAppMessage()
      return `https://wa.me/${phoneNumber}?text=${message}`
    }
    return baseLink
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 md:px-6 bg-theme-light-green">
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-brand-primary " />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-primary tracking-tight">
          Visa Overstay Calculator
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Instantly calculate your visa overstay fines and get expert
          regularization advice.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-1">
        {/* Calculator Card */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden ring-1 ring-slate-900/5">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">
                1
              </span>
              Enter Visa Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Target Country
                </Label>
                <Select
                  value={selectedCountry}
                  onValueChange={value => {
                    setSelectedCountry(value)
                    setSelectedVisaType('')
                    setResults(null)
                  }}
                >
                  <SelectTrigger className="h-12 border-slate-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {configs.map(config => (
                      <SelectItem key={config.country} value={config.country}>
                        {config.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visa Type */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Visa Type
                </Label>
                <Select
                  value={selectedVisaType}
                  onValueChange={value => {
                    setSelectedVisaType(value)
                    setResults(null)
                  }}
                  disabled={!availableVisaTypes.length}
                >
                  <SelectTrigger className="h-12 border-slate-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400">
                    <SelectValue placeholder="Select Visa Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVisaTypes.map(vt => (
                      <SelectItem key={vt.name} value={vt.name}>
                        {vt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visa Validity */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Visa Validity
                </Label>
                <Select
                  value={selectedValidity}
                  onValueChange={value => {
                    setSelectedValidity(value)
                    setResults(null)
                  }}
                  disabled={!currentVisaType}
                >
                  <SelectTrigger className="h-12 border-slate-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400">
                    <SelectValue placeholder="Select Validity" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentVisaType?.validityOptions.map(days => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} Days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Entry Date */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Entry Date
                </Label>
                <Input
                  type="date"
                  value={entryDate}
                  onChange={e => {
                    setEntryDate(e.target.value)
                    setResults(null)
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="h-12 border-slate-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 block"
                />
              </div>
            </div>

            <div className="mt-8">
              <Button
                onClick={calculateFines}
                className="w-full h-12 bg-brand-primary hover:bg-brand-primany/80 text-white font-bold text-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
              >
                Calculate My Fines
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="border-0 shadow-xl bg-white overflow-hidden ring-1 ring-slate-900/5">
              <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-sm">
                    2
                  </span>
                  Calculation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Main Stat - Fine */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-center border border-slate-100">
                  <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-xs">
                    Estimated Total Fine
                  </p>
                  <div className="text-4xl md:text-5xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
                    <span className="text-2xl text-slate-400 font-normal">
                      {results.currency}
                    </span>
                    {results.totalFine.toLocaleString()}
                  </div>
                  {results.overstayDays > 0 ? (
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                      <AlertTriangle className="w-4 h-4 mr-1.5" />
                      Overstaying by {results.overstayDays} days
                    </div>
                  ) : (
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      No Overstay
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-3 shadow-sm">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">
                        Visa Last Date
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {formatDate(results.visaExpiry)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-3 shadow-sm">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                      <Hourglass className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">
                        Grace Period Ends
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {formatDate(results.gracePeriodEnd)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {currentConfig?.whatsappLink && (
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block transform transition-transform hover:scale-[1.02]"
                    >
                      <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-14 text-lg shadow-lg shadow-green-500/20 rounded-xl">
                        <MessageCircle className="w-6 h-6 mr-2" />
                        Regularise Visa via WhatsApp
                      </Button>
                    </a>
                  )}

                  {/* Links List */}
                  {currentConfig?.regularizationOptions &&
                    currentConfig.regularizationOptions.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">
                          Other Options
                        </p>
                        {currentConfig.regularizationOptions.map(
                          (option, index) => (
                            <Link
                              key={index}
                              href={option.link}
                              className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all group"
                            >
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                  {option.title}
                                </h4>
                                <p className="text-sm text-slate-500 mt-1">
                                  {option.description}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                            </Link>
                          )
                        )}
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {currentConfig?.disclaimer && (
        <div className="mt-12 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-500 text-center max-w-2xl mx-auto">
          <p>
            <span className="font-bold text-slate-700">Disclaimer:</span>{' '}
            {currentConfig.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}
