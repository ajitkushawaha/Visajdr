"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, MapPin, Shield, Info } from "lucide-react"

export default function TravelInsuranceForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    country: "",
    startDate: "",
    endDate: "",
    residence: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.country || !formData.startDate || !formData.endDate || !formData.residence) {
      alert("Please fill in all required fields")
      return
    }

    // Validate dates
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      alert("Start date cannot be in the past")
      return
    }

    if (endDate <= startDate) {
      alert("End date must be after start date")
      return
    }

    // Navigate to select plan page with form data
    const params = new URLSearchParams({
      country: formData.country,
      startDate: formData.startDate,
      endDate: formData.endDate,
      residence: formData.residence,
    })

    router.push(`/travel-insurance/select-plan?${params.toString()}`)
  }

  return (
    <Card className="w-full max-w-md bg-white shadow-2xl">
      <CardHeader className="pb-4">
        <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">
          <Shield className="w-4 h-4 mr-2" />
          99% Claim Settlement Ratio
        </Badge>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Travel Insurance</h2>
          <p className="text-gray-600 text-xs md:text-sm mt-1">You can select multiple countries</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          {/* Country Field */}
          <div className="space-y-2">
            <label htmlFor="country" className="text-xs md:text-sm font-medium text-gray-700">Country*</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="country"
                name="country"
                placeholder="Search Country"
                required
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Travel Dates Field */}
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-xs md:text-sm font-medium text-gray-700">Start Date*</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="text-xs md:text-sm font-medium text-gray-700">End Date*</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Residence Field */}
          <div className="space-y-2">
            <label htmlFor="residence" className="text-xs md:text-sm font-medium text-gray-700">Residence*</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="residence"
                name="residence"
                placeholder="Search State"
                required
                value={formData.residence}
                onChange={(e) => handleInputChange("residence", e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Info Text */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              As per IRDAI guideline we need to know your state to issue travel insurance.
            </p>
          </div>

          {/* View Plans Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-brand-secondary hover:bg-brand-accent text-white font-semibold text-base"
          >
            View Plans
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
