'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Eye, X, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface HeroSectionData {
  _id?: string
  title: string
  description?: string
  highlightedText?: string
  highlightedTextColor?: string
  backgroundImage?: string
  mainImage?: string
  mainImageAlt?: string
  bottomLabel?: string
  floatingCountries: Array<{
    country: string
    flag: string
    position: string
  }>
  searchPlaceholder?: string
  status: 'active' | 'inactive'
  order: number
}

export default function HeroSectionEditor() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newFloatingCountry, setNewFloatingCountry] = useState({
    country: '',
    flag: '',
    position: 'top-left',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    { name: string; code: string; flag: string }[]
  >([])

  const [formData, setFormData] = useState<HeroSectionData>({
    title: 'Get',
    description: 'With 99.3% Approval Rate',
    highlightedText: 'Visa Online',
    highlightedTextColor: 'text-red-500',
    backgroundImage: '/visa/Vector.png',
    mainImage: '/visa/Rectangle.png',
    mainImageAlt: 'Hero Image',
    bottomLabel: 'Get Appointment Picked Within 72 Hours',
    floatingCountries: [],
    searchPlaceholder: 'Search for your destination...',
    status: 'active',
    order: 0,
  })

  useEffect(() => {
    fetchHeroSection()
  }, [])
  const searchCountry = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }
    try {
      const response = await fetch('/data/countries.json')
      if (response.ok) {
        const data = await response.json()

        // Convert country code to emoji flag
        const getFlagEmoji = (countryCode: string) => {
          if (!countryCode || countryCode.length !== 2) return '🏳️'
          const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0))
          return String.fromCodePoint(...codePoints)
        }

        const filtered = data
          .filter((c: any) =>
            c.name.toLowerCase().includes(query.toLowerCase())
          )
          .map((c: any) => ({
            name: c.name,
            code: c.code,
            flag: getFlagEmoji(c.code),
          }))

        setSearchResults(filtered)
      }
    } catch (error) {
      console.error('Error searching countries:', error)
    }
  }

  const fetchHeroSection = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/home/hero')
      if (response.ok) {
        const data = await response.json()
        if (data.heroSection) {
          setFormData(data.heroSection)
        }
      }
    } catch (error) {
      console.error('Error fetching hero section:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof HeroSectionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddFloatingCountry = () => {
    if ((formData.floatingCountries || []).length >= 6) {
      toast.error('You can only add up to 6 floating countries')
      return
    }
    if (newFloatingCountry.country.trim() && newFloatingCountry.flag.trim()) {
      handleInputChange('floatingCountries', [
        ...(formData.floatingCountries || []),
        newFloatingCountry,
      ])
      setNewFloatingCountry({ country: '', flag: '', position: 'top-left' })
    }
  }

  const handleRemoveFloatingCountry = (index: number) => {
    handleInputChange(
      'floatingCountries',
      (formData.floatingCountries || []).filter((_, i) => i !== index)
    )
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please fill in the title')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/home/hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Hero section saved successfully!')
        // Refresh the data to show the latest saved values
        await fetchHeroSection()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save hero section')
      }
    } catch (error) {
      console.error('Error saving hero section:', error)
      toast.error('Error saving hero section. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-200">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-200">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/admin/content/home">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-900 bg-white hover:bg-gray-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home CMS
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                ✏️ Edit Hero Section
              </h1>
              <p className="text-gray-600 mt-2">
                Manage the main hero banner content and settings
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open('/', '_blank')}
                className="text-gray-900 bg-white hover:bg-gray-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Form Section - Smaller Cards Below */}
        <div className="grid grid-cols-1 gap-4">
          {/* Left Column - Form */}
          <div className="space-y-4">
            {/* Hero Text Content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Hero Text Content</CardTitle>
                <CardDescription className="text-sm">
                  Customize the main heading and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Prefix Text</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Get"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highlightedText">Suffix Text</Label>
                    <Input
                      id="highlightedText"
                      value={formData.highlightedText || ''}
                      onChange={e =>
                        handleInputChange('highlightedText', e.target.value)
                      }
                      placeholder="e.g. Visa Online"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Subheading / Description</Label>
                  <Input
                    id="description"
                    value={formData.description || ''}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="e.g. With 99.3% Approval Rate"
                  />
                  <p className="text-xs text-gray-500">
                    This text appears below the main heading.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Floating Country Labels */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Swaping Country Names
                </CardTitle>
                <CardDescription className="text-sm">
                  Get France Visa Online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="country-dropdown-container">
                    <Label htmlFor="countrySelect">Select Country</Label>
                    <div className="relative mt-1">
                      <Input
                        placeholder="Search Country"
                        value={searchQuery}
                        onChange={e => {
                          setSearchQuery(e.target.value)
                          searchCountry(e.target.value)
                        }}
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>

                    {/* Searchable Dropdown */}
                    <div>
                      {searchResults.length > 0 && (
                        <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white">
                          {searchResults.map((c, i) => (
                            <div
                              key={i}
                              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                              onClick={() => {
                                setNewFloatingCountry(prev => ({
                                  ...prev,
                                  country: c.name,
                                  flag: c.flag,
                                }))
                                setSearchQuery(c.name)
                                setSearchResults([])
                              }}
                            >
                              <span className="text-lg">{c.flag}</span>
                              <span className="font-medium">{c.name}</span>
                              <span className="text-xs text-gray-500">
                                ({c.code})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {newFloatingCountry.country && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {newFloatingCountry.flag}
                          </span>
                          <span className="font-medium">
                            {newFloatingCountry.country}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAddFloatingCountry}
                  size="sm"
                  disabled={(formData.floatingCountries || []).length >= 6}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {formData.floatingCountries?.length >= 6
                    ? 'Limit Reached (6/6)'
                    : 'Add Country'}
                </Button>

                <div className="space-y-2">
                  {(formData.floatingCountries || []).map((country, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{country.flag}</span>
                        <span className="font-medium">{country.country}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFloatingCountry(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
