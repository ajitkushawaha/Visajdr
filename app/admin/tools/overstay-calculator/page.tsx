'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

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
  _id?: string
  country: string
  countryCode?: string
  isActive: boolean
  visaTypes: VisaTypeConfig[]
  whatsappLink?: string
  regularizationOptions?: RegularizationOption[]
  disclaimer?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

export default function OverstayCalculatorConfigPage() {
  const [configs, setConfigs] = useState<OverstayCalculatorConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(
    new Set()
  )

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/overstay-calculator')
      const data = await response.json()

      if (data.success) {
        setConfigs(data.data || [])
      } else {
        toast.error(data.error || 'Failed to fetch configurations')
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
      toast.error('Failed to fetch configurations')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (index: number) => {
    if (!configs[index]) return

    try {
      setSaving(true)
      const config = configs[index]

      // Validate required fields
      if (!config.country) {
        toast.error('Country name is required')
        return
      }

      if (!config.visaTypes || config.visaTypes.length === 0) {
        toast.error('At least one visa type is required')
        return
      }

      const response = await fetch('/api/admin/overstay-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Configuration saved successfully!')
        const updatedConfigs = [...configs]
        updatedConfigs[index] = data.data
        setConfigs(updatedConfigs)
      } else {
        toast.error(data.error || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (index: number) => {
    if (!configs[index] || !configs[index].country) return

    if (
      !confirm(
        `Are you sure you want to delete configuration for ${configs[index].country}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/overstay-calculator?country=${encodeURIComponent(configs[index].country)}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Configuration deleted successfully!')
        const updatedConfigs = configs.filter((_, i) => i !== index)
        setConfigs(updatedConfigs)
        const newExpanded = new Set(expandedCountries)
        newExpanded.delete(index)
        setExpandedCountries(newExpanded)
      } else {
        toast.error(data.error || 'Failed to delete configuration')
      }
    } catch (error) {
      console.error('Error deleting config:', error)
      toast.error('Failed to delete configuration')
    }
  }

  const addCountry = () => {
    const newIndex = configs.length
    setConfigs([
      ...configs,
      {
        country: '',
        countryCode: '',
        isActive: true,
        visaTypes: [],
        whatsappLink: '',
        regularizationOptions: [],
        disclaimer: '',
      },
    ])
    setExpandedCountries(new Set([...expandedCountries, newIndex]))
  }

  const updateCountry = (index: number, field: string, value: any) => {
    const updatedConfigs = [...configs]
    updatedConfigs[index] = { ...updatedConfigs[index], [field]: value }
    setConfigs(updatedConfigs)
  }

  const addVisaType = (countryIndex: number) => {
    const updatedConfigs = [...configs]
    if (!updatedConfigs[countryIndex].visaTypes) {
      updatedConfigs[countryIndex].visaTypes = []
    }
    updatedConfigs[countryIndex].visaTypes.push({
      name: '',
      validityOptions: [],
      gracePeriodDays: 10,
      finePerDay: 100,
      fineCurrency: 'AED',
      isActive: true,
    })
    setConfigs(updatedConfigs)
  }

  const updateVisaType = (
    countryIndex: number,
    visaIndex: number,
    field: string,
    value: any
  ) => {
    const updatedConfigs = [...configs]
    updatedConfigs[countryIndex].visaTypes[visaIndex] = {
      ...updatedConfigs[countryIndex].visaTypes[visaIndex],
      [field]: value,
    }
    setConfigs(updatedConfigs)
  }

  const removeVisaType = (countryIndex: number, visaIndex: number) => {
    const updatedConfigs = [...configs]
    updatedConfigs[countryIndex].visaTypes = updatedConfigs[
      countryIndex
    ].visaTypes.filter((_, i) => i !== visaIndex)
    setConfigs(updatedConfigs)
  }

  const addValidityOption = (
    countryIndex: number,
    visaIndex: number,
    days: number
  ) => {
    const updatedConfigs = [...configs]
    const visaType = updatedConfigs[countryIndex].visaTypes[visaIndex]
    if (!visaType.validityOptions.includes(days)) {
      visaType.validityOptions.push(days)
      visaType.validityOptions.sort((a, b) => a - b)
    }
    setConfigs(updatedConfigs)
  }

  const removeValidityOption = (
    countryIndex: number,
    visaIndex: number,
    days: number
  ) => {
    const updatedConfigs = [...configs]
    updatedConfigs[countryIndex].visaTypes[visaIndex].validityOptions =
      updatedConfigs[countryIndex].visaTypes[visaIndex].validityOptions.filter(
        d => d !== days
      )
    setConfigs(updatedConfigs)
  }

  const addAdditionalCharge = (countryIndex: number, visaIndex: number) => {
    const updatedConfigs = [...configs]
    const visaType = updatedConfigs[countryIndex].visaTypes[visaIndex]
    if (!visaType.additionalCharges) {
      visaType.additionalCharges = []
    }
    visaType.additionalCharges.push({
      name: '',
      amount: 0,
      currency: visaType.fineCurrency || 'AED',
      description: '',
    })
    setConfigs(updatedConfigs)
  }

  const updateAdditionalCharge = (
    countryIndex: number,
    visaIndex: number,
    chargeIndex: number,
    field: string,
    value: any
  ) => {
    const updatedConfigs = [...configs]
    const charges =
      updatedConfigs[countryIndex].visaTypes[visaIndex].additionalCharges || []
    charges[chargeIndex] = { ...charges[chargeIndex], [field]: value }
    updatedConfigs[countryIndex].visaTypes[visaIndex].additionalCharges =
      charges
    setConfigs(updatedConfigs)
  }

  const removeAdditionalCharge = (
    countryIndex: number,
    visaIndex: number,
    chargeIndex: number
  ) => {
    const updatedConfigs = [...configs]
    const charges =
      updatedConfigs[countryIndex].visaTypes[visaIndex].additionalCharges || []
    updatedConfigs[countryIndex].visaTypes[visaIndex].additionalCharges =
      charges.filter((_, i) => i !== chargeIndex)
    setConfigs(updatedConfigs)
  }

  const addRegularizationOption = (countryIndex: number) => {
    const updatedConfigs = [...configs]
    if (!updatedConfigs[countryIndex].regularizationOptions) {
      updatedConfigs[countryIndex].regularizationOptions = []
    }
    updatedConfigs[countryIndex].regularizationOptions!.push({
      title: '',
      description: '',
      link: '',
    })
    setConfigs(updatedConfigs)
  }

  const updateRegularizationOption = (
    countryIndex: number,
    optionIndex: number,
    field: string,
    value: any
  ) => {
    const updatedConfigs = [...configs]
    const options = updatedConfigs[countryIndex].regularizationOptions || []
    options[optionIndex] = { ...options[optionIndex], [field]: value }
    updatedConfigs[countryIndex].regularizationOptions = options
    setConfigs(updatedConfigs)
  }

  const removeRegularizationOption = (
    countryIndex: number,
    optionIndex: number
  ) => {
    const updatedConfigs = [...configs]
    const options = updatedConfigs[countryIndex].regularizationOptions || []
    updatedConfigs[countryIndex].regularizationOptions = options.filter(
      (_, i) => i !== optionIndex
    )
    setConfigs(updatedConfigs)
  }

  const toggleCountryExpanded = (index: number) => {
    const newExpanded = new Set(expandedCountries)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCountries(newExpanded)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configurations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Overstay Calculator Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Manage country-wise overstay calculator settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={addCountry} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
        </div>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No configurations added yet.</p>
          <Button
            onClick={addCountry}
            variant="outline"
            className="text-gray-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Country
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {configs.map((config, countryIndex) => {
            const isExpanded = expandedCountries.has(countryIndex)
            return (
              <Card
                key={countryIndex}
                className="border border-gray-200 hover:border-gray-300 transition-colors"
              >
                {/* Compact View */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {config.country || 'New Country'}
                          </h3>
                          {config.isActive ? (
                            <Badge variant="default" className="bg-green-500">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {config.visaTypes && config.visaTypes.length > 0 && (
                            <Badge variant="outline">
                              {config.visaTypes.length} Visa Type
                              {config.visaTypes.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        {config.countryCode && (
                          <p className="text-sm text-gray-600">
                            Code: {config.countryCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCountryExpanded(countryIndex)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(countryIndex)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded View */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList>
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="visa-types">Visa Types</TabsTrigger>
                        <TabsTrigger value="options">
                          Options & Links
                        </TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                      </TabsList>

                      {/* Basic Info Tab */}
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Country Name *</Label>
                            <Input
                              value={config.country}
                              onChange={e =>
                                updateCountry(
                                  countryIndex,
                                  'country',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., UAE, Saudi Arabia"
                            />
                          </div>
                          <div>
                            <Label>Country Code</Label>
                            <Input
                              value={config.countryCode || ''}
                              onChange={e =>
                                updateCountry(
                                  countryIndex,
                                  'countryCode',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., AE, SA"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`active-${countryIndex}`}
                            checked={config.isActive}
                            onChange={e =>
                              updateCountry(
                                countryIndex,
                                'isActive',
                                e.target.checked
                              )
                            }
                            className="rounded"
                          />
                          <Label
                            htmlFor={`active-${countryIndex}`}
                            className="cursor-pointer"
                          >
                            Active
                          </Label>
                        </div>
                      </TabsContent>

                      {/* Visa Types Tab */}
                      <TabsContent value="visa-types" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">Visa Types</h4>
                          <Button
                            onClick={() => addVisaType(countryIndex)}
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Visa Type
                          </Button>
                        </div>

                        {config.visaTypes && config.visaTypes.length > 0 ? (
                          <div className="space-y-4">
                            {config.visaTypes.map((visaType, visaIndex) => (
                              <Card key={visaIndex} className="p-4">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium">
                                      Visa Type {visaIndex + 1}
                                    </h5>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        removeVisaType(countryIndex, visaIndex)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Visa Type Name *</Label>
                                      <Input
                                        value={visaType.name}
                                        onChange={e =>
                                          updateVisaType(
                                            countryIndex,
                                            visaIndex,
                                            'name',
                                            e.target.value
                                          )
                                        }
                                        placeholder="e.g., Tourist Visa"
                                      />
                                    </div>
                                    <div>
                                      <Label>Grace Period (Days) *</Label>
                                      <Input
                                        type="number"
                                        value={visaType.gracePeriodDays}
                                        onChange={e =>
                                          updateVisaType(
                                            countryIndex,
                                            visaIndex,
                                            'gracePeriodDays',
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Fine Per Day *</Label>
                                      <Input
                                        type="number"
                                        value={visaType.finePerDay}
                                        onChange={e =>
                                          updateVisaType(
                                            countryIndex,
                                            visaIndex,
                                            'finePerDay',
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Currency *</Label>
                                      <Input
                                        value={visaType.fineCurrency}
                                        onChange={e =>
                                          updateVisaType(
                                            countryIndex,
                                            visaIndex,
                                            'fineCurrency',
                                            e.target.value
                                          )
                                        }
                                        placeholder="AED, USD, etc."
                                      />
                                    </div>
                                    <div>
                                      <Label>Max Fine Cap (Optional)</Label>
                                      <Input
                                        type="number"
                                        value={visaType.maxFineCap || ''}
                                        onChange={e =>
                                          updateVisaType(
                                            countryIndex,
                                            visaIndex,
                                            'maxFineCap',
                                            e.target.value
                                              ? parseFloat(e.target.value)
                                              : undefined
                                          )
                                        }
                                        placeholder="Leave empty for no cap"
                                      />
                                    </div>
                                    <div>
                                      <Label>Active</Label>
                                      <div className="flex items-center gap-2 mt-2">
                                        <input
                                          type="checkbox"
                                          checked={visaType.isActive}
                                          onChange={e =>
                                            updateVisaType(
                                              countryIndex,
                                              visaIndex,
                                              'isActive',
                                              e.target.checked
                                            )
                                          }
                                          className="rounded"
                                        />
                                        <Label className="text-sm">
                                          Active
                                        </Label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Validity Options */}
                                  <div>
                                    <Label>Validity Options (Days) *</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {[14, 30, 60, 90, 180, 365].map(days => (
                                        <div
                                          key={days}
                                          className="flex items-center gap-2"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={visaType.validityOptions.includes(
                                              days
                                            )}
                                            onChange={e => {
                                              if (e.target.checked) {
                                                addValidityOption(
                                                  countryIndex,
                                                  visaIndex,
                                                  days
                                                )
                                              } else {
                                                removeValidityOption(
                                                  countryIndex,
                                                  visaIndex,
                                                  days
                                                )
                                              }
                                            }}
                                            className="rounded"
                                          />
                                          <Label className="text-sm">
                                            {days} Days
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                    <Input
                                      type="text"
                                      placeholder="Or enter custom days (comma-separated)"
                                      className="mt-2"
                                      onBlur={e => {
                                        const customDays = e.target.value
                                          .split(',')
                                          .map(d => parseInt(d.trim()))
                                          .filter(d => !isNaN(d) && d > 0)
                                        customDays.forEach(days => {
                                          if (
                                            !visaType.validityOptions.includes(
                                              days
                                            )
                                          ) {
                                            addValidityOption(
                                              countryIndex,
                                              visaIndex,
                                              days
                                            )
                                          }
                                        })
                                        e.target.value = ''
                                      }}
                                    />
                                  </div>

                                  {/* Additional Charges */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <Label>Additional Charges</Label>
                                      <Button
                                        onClick={() =>
                                          addAdditionalCharge(
                                            countryIndex,
                                            visaIndex
                                          )
                                        }
                                        size="sm"
                                        variant="outline"
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Charge
                                      </Button>
                                    </div>
                                    {visaType.additionalCharges &&
                                      visaType.additionalCharges.length > 0 && (
                                        <div className="space-y-2">
                                          {visaType.additionalCharges.map(
                                            (charge, chargeIndex) => (
                                              <div
                                                key={chargeIndex}
                                                className="flex items-center gap-2 p-2 bg-white rounded border"
                                              >
                                                <Input
                                                  placeholder="Charge name"
                                                  value={charge.name}
                                                  onChange={e =>
                                                    updateAdditionalCharge(
                                                      countryIndex,
                                                      visaIndex,
                                                      chargeIndex,
                                                      'name',
                                                      e.target.value
                                                    )
                                                  }
                                                  className="flex-1"
                                                />
                                                <Input
                                                  type="number"
                                                  placeholder="Amount"
                                                  value={charge.amount}
                                                  onChange={e =>
                                                    updateAdditionalCharge(
                                                      countryIndex,
                                                      visaIndex,
                                                      chargeIndex,
                                                      'amount',
                                                      parseFloat(
                                                        e.target.value
                                                      ) || 0
                                                    )
                                                  }
                                                  className="w-24"
                                                />
                                                <Input
                                                  placeholder="Currency"
                                                  value={charge.currency}
                                                  onChange={e =>
                                                    updateAdditionalCharge(
                                                      countryIndex,
                                                      visaIndex,
                                                      chargeIndex,
                                                      'currency',
                                                      e.target.value
                                                    )
                                                  }
                                                  className="w-20"
                                                />
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    removeAdditionalCharge(
                                                      countryIndex,
                                                      visaIndex,
                                                      chargeIndex
                                                    )
                                                  }
                                                >
                                                  <X className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            No visa types added. Click "Add Visa Type" to get
                            started.
                          </p>
                        )}
                      </TabsContent>

                      {/* Options & Links Tab */}
                      <TabsContent value="options" className="space-y-4">
                        <div>
                          <Label>WhatsApp Link</Label>
                          <Input
                            value={config.whatsappLink || ''}
                            onChange={e =>
                              updateCountry(
                                countryIndex,
                                'whatsappLink',
                                e.target.value
                              )
                            }
                            placeholder="https://wa.me/1234567890"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Regularization Options</Label>
                            <Button
                              onClick={() =>
                                addRegularizationOption(countryIndex)
                              }
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                          {config.regularizationOptions &&
                            config.regularizationOptions.length > 0 && (
                              <div className="space-y-2">
                                {config.regularizationOptions.map(
                                  (option, optionIndex) => (
                                    <Card key={optionIndex} className="p-3">
                                      <div className="space-y-2">
                                        <Input
                                          placeholder="Title"
                                          value={option.title}
                                          onChange={e =>
                                            updateRegularizationOption(
                                              countryIndex,
                                              optionIndex,
                                              'title',
                                              e.target.value
                                            )
                                          }
                                        />
                                        <Textarea
                                          placeholder="Description"
                                          value={option.description}
                                          onChange={e =>
                                            updateRegularizationOption(
                                              countryIndex,
                                              optionIndex,
                                              'description',
                                              e.target.value
                                            )
                                          }
                                          rows={2}
                                        />
                                        <div className="flex items-center gap-2">
                                          <Input
                                            placeholder="Link URL"
                                            value={option.link}
                                            onChange={e =>
                                              updateRegularizationOption(
                                                countryIndex,
                                                optionIndex,
                                                'link',
                                                e.target.value
                                              )
                                            }
                                            className="flex-1"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              removeRegularizationOption(
                                                countryIndex,
                                                optionIndex
                                              )
                                            }
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </Card>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        <div>
                          <Label>Disclaimer</Label>
                          <Textarea
                            value={config.disclaimer || ''}
                            onChange={e =>
                              updateCountry(
                                countryIndex,
                                'disclaimer',
                                e.target.value
                              )
                            }
                            placeholder="Legal disclaimer text..."
                            rows={4}
                          />
                        </div>
                      </TabsContent>

                      {/* SEO Tab */}
                      <TabsContent value="seo" className="space-y-4">
                        <div>
                          <Label>Meta Title</Label>
                          <Input
                            value={config.metaTitle || ''}
                            onChange={e =>
                              updateCountry(
                                countryIndex,
                                'metaTitle',
                                e.target.value
                              )
                            }
                            placeholder="SEO meta title"
                          />
                        </div>
                        <div>
                          <Label>Meta Description</Label>
                          <Textarea
                            value={config.metaDescription || ''}
                            onChange={e =>
                              updateCountry(
                                countryIndex,
                                'metaDescription',
                                e.target.value
                              )
                            }
                            placeholder="SEO meta description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Meta Keywords</Label>
                          <Input
                            value={config.metaKeywords || ''}
                            onChange={e =>
                              updateCountry(
                                countryIndex,
                                'metaKeywords',
                                e.target.value
                              )
                            }
                            placeholder="keyword1, keyword2, keyword3"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        onClick={() => handleSave(countryIndex)}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Save className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Configuration
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
