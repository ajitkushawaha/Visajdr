// components/admin/VisaForm.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Save,
  FileText,
  Globe,
  Info,
  DollarSign,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  FileCheck,
  Layers,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useRef, useEffect } from 'react'
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrency } from '@/hooks/useCurrency'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface Country {
  name: string
  flag: string
  code: string
  image: string
}

interface VisaFormData {
  country: string
  countryFlag: string
  countryCode: string
  countryImage: string
  visaType: string
  adultPrice: string
  childPrice: string
  processingFee: string
  status: string
  processingTimeDays: string
  processingTimeValue: string
  processingTimeQuote: string
  stayPeriod: string
  validity: string
  eVisa: string
  category: string
  hotListed: string
  restListed: string
  occupancyType: string
  documents: {
    [key: string]: boolean // Dynamic document types from config
  }
  visaDetail: string
  visaDocument: string
  planDisclaimer: string
  inclusions: string
  importantInformation: string

  // Quotation Page Content
  visaSchedule?: {
    processInitiation: string
    processInitiationDays?: number
    applicationReview: string
    applicationReviewDays?: number
    appointmentPicked: string
    appointmentPickedDays?: number
    biometricDay: string
    biometricDayDays?: number
    appliedToEmbassy?: string
    appliedToEmbassyDays?: number
    enableAppointmentStep?: boolean
    enableBiometricStep?: boolean
  }
  documentRequirements?: {
    generalNote?: string
    [key: string]: string | undefined
  }
  operatingSchedule?: {
    visa4Hours?: string
    embassyHours?: string
    publicHolidaysNote?: string
  }
  faq?: Array<{
    question: string
    answer: string
    order: number
  }>

  metaRobots: string
  metaTitle: string
  metaKeyword: string
  metaDescription: string
}

interface DocumentType {
  _id: string
  name: string
  slug: string
  displayName: string
  description?: string
  isRequired: boolean
  isActive: boolean
  order: number
}

interface VisaFormProps {
  formData: VisaFormData
  setFormData: (data: VisaFormData) => void
  handleDocumentChange: (document: string, checked: boolean) => void
  handleSave: () => void
  handleInputChange: (
    field: keyof VisaFormData,
    value: string | Country
  ) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  countries: Country[]
  visaTypes: string[]
  documentTypes?: DocumentType[]
  categories?: any[] // Add this
  processingTimeTypes?: any[] // Add this
  occupancyTypes?: any[] // Add this
  isLoading: boolean
  isUpdate?: boolean
  isLoadingCountries: boolean
  isLoadingVisaTypes?: boolean
  validationErrors?: { [key: string]: string }
}

export default function VisaForm({
  formData,
  setFormData,
  handleDocumentChange,
  handleSave,
  handleInputChange,
  activeTab,
  setActiveTab,
  countries,
  visaTypes,
  documentTypes = [],
  categories = [],
  processingTimeTypes = [],
  occupancyTypes = [],
  isLoading,
  isUpdate,
  isLoadingCountries,
  isLoadingVisaTypes = false,
  validationErrors = {},
}: VisaFormProps) {
  const { symbol: currencySymbol } = useCurrency()
  const [countrySearchQuery, setCountrySearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const countrySearchInputRef = useRef<HTMLInputElement>(null)
  const isTypingRef = useRef(false)
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [processingFeeEnabled, setProcessingFeeEnabled] = useState(false)

  // Debounce search query to prevent focus loss
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(countrySearchQuery)
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timer)
  }, [countrySearchQuery])

  // Filter countries based on debounced search
  const filteredCountries = countries.filter((country: Country) =>
    country.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  // Handle focus on search input when dropdown opens
  useEffect(() => {
    if (countryDropdownOpen && countrySearchInputRef.current) {
      // Use setTimeout to ensure the input is fully rendered
      const timer = setTimeout(() => {
        if (countrySearchInputRef.current) {
          countrySearchInputRef.current.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [countryDropdownOpen])

  // Fetch processing fee enabled setting
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch('/api/admin/convenience-fees')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setProcessingFeeEnabled(data.data.processingFeeEnabled || false)
          }
        }
      } catch (error) {
        console.error('Failed to fetch processing fee setting:', error)
      }
    }
    fetchSetting()
  }, [])

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'visa-country-images')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.image?.url) {
        handleInputChange('countryImage', data.image.url)
        toast.success('Image uploaded successfully')
        setIsImageDialogOpen(false) // Close modal after successful upload
      } else {
        throw new Error(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Visa Information Form
        </CardTitle>
        <CardDescription>
          {isUpdate
            ? 'Update the visa information and pricing details'
            : 'Fill in all the required information to create a new visa entry'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="country"
                    className="text-sm font-medium flex items-center gap-2 cursor-help"
                  >
                    <Globe className="w-4 h-4 text-blue-500" />
                    Select Visa Country *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Select the destination country for this visa application.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select
              value={formData.country || ''}
              onValueChange={value => {
                // Find the selected country object
                const selectedCountry = countries.find(c => c.name === value)
                if (selectedCountry) {
                  handleInputChange('country', selectedCountry)
                }
                setCountryDropdownOpen(false)
                setCountrySearchQuery('')
              }}
              open={countryDropdownOpen}
              onOpenChange={open => {
                // Prevent closing if user is typing in the search input
                if (!open && isTypingRef.current) {
                  return
                }
                setCountryDropdownOpen(open)
                if (!open) {
                  setCountrySearchQuery('')
                  isTypingRef.current = false
                }
              }}
            >
              <SelectTrigger
                className={validationErrors.country ? 'border-red-500' : ''}
                onClick={() => setCountrySearchQuery('')}
              >
                <SelectValue
                  placeholder={
                    isLoadingCountries
                      ? 'Loading countries...'
                      : 'Select country'
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                <div className="p-2 sticky top-0 bg-white z-10">
                  <Input
                    ref={countrySearchInputRef}
                    placeholder="Search countries..."
                    className="mb-2"
                    value={countrySearchQuery}
                    onChange={e => {
                      isTypingRef.current = true
                      setCountrySearchQuery(e.target.value)
                      // Maintain focus while typing
                      if (countrySearchInputRef.current) {
                        countrySearchInputRef.current.focus()
                      }
                    }}
                    onClick={e => {
                      e.stopPropagation()
                      // Maintain focus on click
                      if (countrySearchInputRef.current) {
                        countrySearchInputRef.current.focus()
                      }
                    }}
                    onKeyDown={e => {
                      // Prevent closing dropdown when typing
                      e.stopPropagation()
                      // Allow Escape to close dropdown
                      if (e.key === 'Escape') {
                        setCountryDropdownOpen(false)
                      }
                    }}
                    onFocus={e => {
                      // Ensure focus doesn't cause errors
                      e.stopPropagation()
                    }}
                    onBlur={e => {
                      // Prevent blur from closing dropdown immediately
                      // Only close if clicking outside
                      e.stopPropagation()
                      // Reset typing flag after a short delay to allow for selection
                      setTimeout(() => {
                        isTypingRef.current = false
                      }, 200)
                    }}
                    tabIndex={0}
                    autoFocus={false}
                  />
                </div>
                {isLoadingCountries ? (
                  <div className="text-center py-4 text-gray-500">
                    Loading countries...
                  </div>
                ) : filteredCountries.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No countries found
                  </div>
                ) : (
                  filteredCountries.map((country: Country, i: number) => (
                    <SelectItem key={i} value={country.name}>
                      <div className="flex items-center gap-2">
                        <img
                          src={country.flag}
                          alt={country.name}
                          className="w-6 h-4 object-cover rounded-sm border border-gray-200"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {validationErrors.country && (
              <p className="text-sm text-red-600">{validationErrors.country}</p>
            )}
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="countryImage"
                    className="text-sm font-medium flex items-center gap-2 cursor-help"
                  >
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    Country Image *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Upload a representative image for the country (Aspect ratio
                    16:9 recommended).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImageDialogOpen(true)}
                className="w-full"
              >
                {formData.countryImage ? (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Change Image
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Select Image
                  </>
                )}
              </Button>
              {formData.countryImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInputChange('countryImage', '')}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {validationErrors.countryImage && (
              <p className="text-sm text-red-600">
                {validationErrors.countryImage}
              </p>
            )}

            {/* Image Selection Modal */}
            <Dialog
              open={isImageDialogOpen}
              onOpenChange={setIsImageDialogOpen}
            >
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Select Country Image</DialogTitle>
                  <DialogDescription>
                    Choose an image by uploading a file or entering a URL
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Toggle between URL and Upload */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={imageInputMode === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageInputMode('url')}
                      className="flex-1"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={
                        imageInputMode === 'upload' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setImageInputMode('upload')}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>

                  {imageInputMode === 'url' ? (
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="imageUrl"
                          className="text-sm font-medium"
                        >
                          Image URL
                        </Label>
                        <Input
                          id="imageUrl"
                          type="url"
                          placeholder="https://example.com/country-image.jpg"
                          value={formData.countryImage}
                          onChange={e =>
                            handleInputChange('countryImage', e.target.value)
                          }
                          className="mt-2"
                        />
                      </div>
                      {formData.countryImage && (
                        <div className="relative">
                          <img
                            src={formData.countryImage}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded border"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Upload Image
                        </Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="countryImageUpload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="w-full mt-2"
                        >
                          {isUploadingImage ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Image File
                            </>
                          )}
                        </Button>
                      </div>
                      {formData.countryImage && (
                        <div className="relative">
                          <img
                            src={formData.countryImage}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded border"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsImageDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (formData.countryImage) {
                        setIsImageDialogOpen(false)
                      } else {
                        toast.error('Please select an image')
                      }
                    }}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="visaType"
                    className="text-sm font-medium flex items-center gap-2 cursor-help"
                  >
                    <Tag className="w-4 h-4 text-green-500" />
                    Select Visa Type *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Choose the type of visa (e.g., Tourist, Business, Transit).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={
                formData.visaType
                  ? formData.visaType.toLowerCase().replace(/\s+/g, '-').trim()
                  : ''
              }
              onValueChange={value => {
                // Normalize the value back to the original format for saving
                // Convert "tourist-visa" back to "Tourist Visa"
                const normalizedValue = value
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
                console.log(
                  'Visa type changed from',
                  formData.visaType,
                  'to',
                  normalizedValue
                )
                handleInputChange('visaType', normalizedValue)
              }}
            >
              <SelectTrigger
                className={validationErrors.visaType ? 'border-red-500' : ''}
              >
                <SelectValue
                  placeholder={formData.visaType || 'Select visa type'}
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingVisaTypes ? (
                  <div className="text-center py-4 text-gray-500">
                    Loading visa types...
                  </div>
                ) : (
                  visaTypes.map(type => (
                    <SelectItem
                      key={type}
                      value={type.toLowerCase().replace(/\s+/g, '-')}
                    >
                      {type}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {validationErrors.visaType && (
              <p className="text-sm text-red-600">
                {validationErrors.visaType}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <Info className="w-4 h-4 text-gray-500" />
                    Visa Status *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Set the current status of this visa offering
                    (Active/Inactive/Draft).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={formData.status}
              onValueChange={value => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
              {/* TODO: Make dynamic from config management */}
            </Select>
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="adultPrice"
                    className="text-sm font-medium flex items-center gap-2 cursor-help"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Adult Price (Per Person) *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Base price for adults. Currency symbol is displayed
                    automatically.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                {currencySymbol}
              </span>
              <Input
                id="adultPrice"
                type="number"
                placeholder={`15000`}
                className={`pl-10 ${validationErrors.adultPrice ? 'border-red-500' : ''}`}
                value={formData.adultPrice}
                onChange={e => handleInputChange('adultPrice', e.target.value)}
              />
            </div>
            {validationErrors.adultPrice && (
              <p className="text-sm text-red-600">
                {validationErrors.adultPrice}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="childPrice"
                    className="text-sm font-medium flex items-center gap-2 cursor-help"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Child Price (Per Person) *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Base price for children. Currency symbol is displayed
                    automatically.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                {currencySymbol}
              </span>
              <Input
                id="childPrice"
                type="number"
                placeholder={`15000`}
                className={`pl-10 ${validationErrors.childPrice ? 'border-red-500' : ''}`}
                value={formData.childPrice}
                onChange={e => handleInputChange('childPrice', e.target.value)}
              />
            </div>
            {validationErrors.childPrice && (
              <p className="text-sm text-red-600">
                {validationErrors.childPrice}
              </p>
            )}
          </div>

          {/* Processing Fee - Only show if feature is enabled */}
          {processingFeeEnabled && (
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label
                      htmlFor="processingFee"
                      className="text-sm font-medium flex items-center gap-2 cursor-help"
                    >
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Processing Fee *
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Additional administrative fee processed per application.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                  {currencySymbol}
                </span>
                <Input
                  id="processingFee"
                  type="number"
                  placeholder={`200`}
                  className={`pl-10 ${validationErrors.processingFee ? 'border-red-500' : ''}`}
                  value={formData.processingFee || '0'}
                  onChange={e =>
                    handleInputChange('processingFee', e.target.value)
                  }
                />
              </div>

              {validationErrors.processingFee && (
                <p className="text-sm text-red-600">
                  {validationErrors.processingFee}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Holiday Time Quote (Optional)
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Optional note about holiday processing delays (e.g.,
                    'Immigration Closed on weekends').
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Input
              placeholder="Immigration Closed"
              value={formData.processingTimeQuote}
              onChange={e =>
                handleInputChange('processingTimeQuote', e.target.value)
              }
            />
          </div>
        </div>

        {/* Status and Processing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Processing Time Unit *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Select whether processing time is measured in Days or as
                    text.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={formData.processingTimeDays}
              onValueChange={value =>
                handleInputChange('processingTimeDays', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {processingTimeTypes.length > 0 ? (
                  processingTimeTypes
                    .map(type => {
                      const slug = (type.slug || '').toLowerCase()
                      const name = (type.name || '').toLowerCase()
                      const value =
                        slug.includes('day') || name.includes('day')
                          ? 'in-days'
                          : slug.includes('schengen') ||
                              name.includes('schengen')
                            ? 'schengen'
                            : ''
                      return value
                        ? { id: type._id, value, label: type.name }
                        : null
                    })
                    .filter(Boolean)
                    .map(opt => (
                      <SelectItem
                        key={(opt as any).id}
                        value={(opt as any).value}
                      >
                        {(opt as any).label
                          ? (opt as any).label
                          : (opt as any).value === 'in-days'
                            ? 'In Days'
                            : 'Schengen'}
                      </SelectItem>
                    ))
                ) : (
                  <>
                    <SelectItem value="in-days">In Days</SelectItem>
                    <SelectItem value="schengen">Schengen</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Processing Time (in-days) *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter the number of days or a Schengen note.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Input
              placeholder="5 Days"
              value={formData.processingTimeValue}
              onChange={e =>
                handleInputChange('processingTimeValue', e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Stay Period *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    How long the traveler is allowed to stay in the country.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Input
              placeholder="30 to 180 Days"
              value={formData.stayPeriod}
              onChange={e => handleInputChange('stayPeriod', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    Validity *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    The period during which the visa is valid for entry after
                    issuance.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Input
              placeholder="Maximum 180 days"
              value={formData.validity}
              onChange={e => handleInputChange('validity', e.target.value)}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <FileCheck className="w-4 h-4 text-teal-500" />
                    E-Visa *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Is this an electronic visa (E-Visa)?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={formData.eVisa}
              onValueChange={value => handleInputChange('eVisa', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <Layers className="w-4 h-4 text-purple-500" />
                    Category *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Visa category classification (Standard, Premium, Express).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={formData.category}
              onValueChange={value => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <SelectItem key={cat._id} value={cat.value || cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          {/* Hot Listed and Occupancy */}
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <Tag className="w-4 h-4 text-pink-500" />
                    Trending Listed *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Highlight this visa as a trending destination.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={formData.hotListed}
              onValueChange={value => handleInputChange('hotListed', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <Tag className="w-4 h-4 text-yellow-500" />
                    Other Countries Listed *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Include this visa under the Other Countries section.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={formData.restListed}
              onValueChange={value => handleInputChange('restListed', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium flex items-center gap-2 cursor-help">
                    <Layers className="w-4 h-4 text-orange-500" />
                    Occupancy Type *
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accommodation occupancy type included (if applicable).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={formData.occupancyType}
              onValueChange={value => handleInputChange('occupancyType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {occupancyTypes.length > 0 ? (
                  occupancyTypes.map(type => (
                    <SelectItem key={type._id} value={type.value || type.slug}>
                      {type.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Documents Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Required Documents
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {documentTypes.length > 0 ? (
              // Filter to show only active document types
              documentTypes
                .filter(docType => docType.isActive !== false) // Show if isActive is true or undefined
                .map(docType => {
                  // Find matching document key in formData.documents (case-insensitive, handle variations)
                  const findDocumentKey = (docSlug: string): string | null => {
                    const docKeys = Object.keys(formData.documents || {})

                    // Try exact match first
                    const exactMatch = docKeys.find(
                      key => key.toLowerCase() === docSlug.toLowerCase()
                    )
                    if (exactMatch) return exactMatch

                    // Try partial match (e.g., "aadharcard" matches "aadharCard")
                    const partialMatch = docKeys.find(
                      key =>
                        key.toLowerCase().includes(docSlug.toLowerCase()) ||
                        docSlug.toLowerCase().includes(key.toLowerCase())
                    )
                    if (partialMatch) return partialMatch

                    // Try normalized match (remove spaces, dashes, etc.)
                    const normalizedSlug = docSlug
                      .toLowerCase()
                      .replace(/[-_\s]/g, '')
                    const normalizedMatch = docKeys.find(
                      key =>
                        key.toLowerCase().replace(/[-_\s]/g, '') ===
                        normalizedSlug
                    )
                    if (normalizedMatch) return normalizedMatch

                    return null
                  }

                  const matchedKey = findDocumentKey(docType.slug)
                  const docValue: any = matchedKey
                    ? formData.documents[matchedKey]
                    : false
                  const isChecked = matchedKey
                    ? docValue === true ||
                      String(docValue) === 'true' ||
                      Number(docValue) === 1
                    : false

                  return (
                    <div
                      key={docType._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={docType.slug}
                        checked={isChecked}
                        onCheckedChange={checked => {
                          // Use matched key if found, otherwise use docType.slug
                          const keyToUse = matchedKey || docType.slug
                          handleDocumentChange(keyToUse, checked as boolean)
                        }}
                      />
                      <Label htmlFor={docType.slug} className="text-sm">
                        {docType.displayName}
                        {docType.isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                    </div>
                  )
                })
            ) : (
              <div className="col-span-full text-sm text-gray-500">
                No document types configured. Please add document types in{' '}
                <a
                  href="/admin/visa/config"
                  className="text-blue-600 hover:underline"
                >
                  Visa Configuration
                </a>
                .
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Content Tabs */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quotation Page Content</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="visa-detail">Visa Detail</TabsTrigger>
              <TabsTrigger value="plan-disclaimer">Disclaimer</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="important-info">Important Info</TabsTrigger>
              <TabsTrigger value="inclusions">What's Included</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="operating">Operating Hours</TabsTrigger>
            </TabsList>

            <TabsContent value="visa-detail" className="mt-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Visa Detail *</Label>
                <Textarea
                  placeholder="Enter detailed visa information..."
                  className="min-h-[200px]"
                  value={formData.visaDetail || ''}
                  onChange={e =>
                    handleInputChange('visaDetail', e.target.value)
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="plan-disclaimer" className="mt-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Plan Disclaimer</Label>
                <Textarea
                  placeholder="Enter plan disclaimer..."
                  className="min-h-[200px]"
                  value={formData.planDisclaimer || ''}
                  onChange={e =>
                    handleInputChange('planDisclaimer', e.target.value)
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Process Initiation
                    </Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">
                        Day Offset:
                      </Label>
                      <Input
                        type="number"
                        className="w-20 h-8"
                        min={0}
                        value={
                          formData.visaSchedule?.processInitiationDays ?? 0
                        }
                        onChange={e => {
                          const newSchedule = {
                            ...formData.visaSchedule,
                            processInitiationDays:
                              parseInt(e.target.value) || 0,
                          }
                          handleInputChange('visaSchedule', newSchedule as any)
                        }}
                      />
                    </div>
                  </div>
                  <Textarea
                    placeholder="Our representative will connect with you, if required."
                    rows={2}
                    value={formData.visaSchedule?.processInitiation || ''}
                    onChange={e => {
                      const newSchedule = {
                        ...formData.visaSchedule,
                        processInitiation: e.target.value,
                      }
                      handleInputChange('visaSchedule', newSchedule as any)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Application Review
                    </Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">
                        Day Offset:
                      </Label>
                      <Input
                        type="number"
                        className="w-20 h-8"
                        min={0}
                        value={
                          formData.visaSchedule?.applicationReviewDays ?? 1
                        }
                        onChange={e => {
                          const newSchedule = {
                            ...formData.visaSchedule,
                            applicationReviewDays:
                              parseInt(e.target.value) || 0,
                          }
                          handleInputChange('visaSchedule', newSchedule as any)
                        }}
                      />
                    </div>
                  </div>
                  <Textarea
                    placeholder="Application review and document verification."
                    rows={2}
                    value={formData.visaSchedule?.applicationReview || ''}
                    onChange={e => {
                      const newSchedule = {
                        ...formData.visaSchedule,
                        applicationReview: e.target.value,
                      }
                      handleInputChange('visaSchedule', newSchedule as any)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Appointment Picked
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="enableAppointmentStep"
                          checked={
                            formData.visaSchedule?.enableAppointmentStep ||
                            false
                          }
                          onCheckedChange={checked => {
                            const newSchedule = {
                              ...formData.visaSchedule,
                              enableAppointmentStep: checked === true,
                            }
                            handleInputChange(
                              'visaSchedule',
                              newSchedule as any
                            )
                          }}
                        />
                        <Label
                          htmlFor="enableAppointmentStep"
                          className="text-xs text-gray-500 cursor-pointer"
                        >
                          Enable Step
                        </Label>
                      </div>
                      {formData.visaSchedule?.enableAppointmentStep && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500">
                            Day Offset:
                          </Label>
                          <Input
                            type="number"
                            className="w-20 h-8"
                            min={-1}
                            placeholder="-1 for TBC"
                            value={
                              formData.visaSchedule?.appointmentPickedDays ?? ''
                            }
                            onChange={e => {
                              const val = e.target.valueAsNumber
                              const newSchedule = {
                                ...formData.visaSchedule,
                                appointmentPickedDays: isNaN(val)
                                  ? undefined
                                  : val,
                              }
                              handleInputChange(
                                'visaSchedule',
                                newSchedule as any
                              )
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {formData.visaSchedule?.enableAppointmentStep && (
                    <Textarea
                      placeholder="Appointment date will be confirmed."
                      rows={2}
                      value={formData.visaSchedule?.appointmentPicked || ''}
                      onChange={e => {
                        const newSchedule = {
                          ...formData.visaSchedule,
                          appointmentPicked: e.target.value,
                        }
                        handleInputChange('visaSchedule', newSchedule as any)
                      }}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Biometric Day</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="enableBiometricStep"
                          checked={
                            formData.visaSchedule?.enableBiometricStep || false
                          }
                          onCheckedChange={checked => {
                            const newSchedule = {
                              ...formData.visaSchedule,
                              enableBiometricStep: checked === true,
                            }
                            handleInputChange(
                              'visaSchedule',
                              newSchedule as any
                            )
                          }}
                        />
                        <Label
                          htmlFor="enableBiometricStep"
                          className="text-xs text-gray-500 cursor-pointer"
                        >
                          Enable Step
                        </Label>
                      </div>
                      {formData.visaSchedule?.enableBiometricStep && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500">
                            Day Offset:
                          </Label>
                          <Input
                            type="number"
                            className="w-20 h-8"
                            min={-1}
                            placeholder="-1 for TBC"
                            value={
                              formData.visaSchedule?.biometricDayDays ?? ''
                            }
                            onChange={e => {
                              const val = e.target.valueAsNumber
                              const newSchedule = {
                                ...formData.visaSchedule,
                                biometricDayDays: isNaN(val) ? undefined : val,
                              }
                              handleInputChange(
                                'visaSchedule',
                                newSchedule as any
                              )
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {formData.visaSchedule?.enableBiometricStep && (
                    <Textarea
                      placeholder="Biometric appointment day."
                      rows={2}
                      value={formData.visaSchedule?.biometricDay || ''}
                      onChange={e => {
                        const newSchedule = {
                          ...formData.visaSchedule,
                          biometricDay: e.target.value,
                        }
                        handleInputChange('visaSchedule', newSchedule as any)
                      }}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Applied to Embassy
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-600">
                          Days Offset
                        </Label>
                        <Input
                          type="number"
                          min={-1}
                          placeholder="0"
                          className="w-24"
                          value={
                            formData.visaSchedule?.appliedToEmbassyDays ?? ''
                          }
                          onChange={e => {
                            const val = e.target.valueAsNumber
                            const newSchedule = {
                              ...formData.visaSchedule,
                              appliedToEmbassyDays: isNaN(val)
                                ? undefined
                                : val,
                            }
                            handleInputChange(
                              'visaSchedule',
                              newSchedule as any
                            )
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Application submitted to embassy."
                    rows={2}
                    value={formData.visaSchedule?.appliedToEmbassy || ''}
                    onChange={e => {
                      const newSchedule = {
                        ...formData.visaSchedule,
                        appliedToEmbassy: e.target.value,
                      }
                      handleInputChange('visaSchedule', newSchedule as any)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Application Status (Final Step)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">
                        Usually automatic based on Processing Time
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <div className="space-y-4">
                {/* Helper function to map document slug to requirement key (for known documents) */}
                {(() => {
                  // Map document slug to document requirement key (for backward compatibility)
                  const mapDocumentSlugToRequirementKey = (
                    slug: string
                  ): string | null => {
                    const mapping: { [key: string]: string } = {
                      passport: 'passportRequirements',
                      photograph: 'photographRequirements',
                      photo: 'photographRequirements',
                      flight: 'flightRequirements',
                      accommodation: 'accommodationRequirements',
                      itinerary: 'itineraryRequirements',
                      insurance: 'insuranceRequirements',
                      funds: 'fundsRequirements',
                      bankStatement: 'fundsRequirements',
                      itr: 'itrRequirements',
                      incomeTax: 'itrRequirements',
                      coverLetter: 'coverLetterRequirements',
                      coverletter: 'coverLetterRequirements',
                      employment: 'employmentRequirements',
                      employmentLetter: 'employmentLetterRequirements',
                      employmentletter: 'employmentLetterRequirements',
                      noc: 'nocRequirements',
                      gst: 'gstRequirements',
                      leave: 'leaveRequirements',
                      biometric: 'biometricRequirements',
                      aadharCard: 'aadharCardRequirements',
                      aadharcard: 'aadharCardRequirements',
                      panCard: 'panCardRequirements',
                      pancard: 'panCardRequirements',
                      birthCertificate: 'birthCertificateRequirements',
                      birthcertificate: 'birthCertificateRequirements',
                      schoolMarksheet: 'schoolMarksheetRequirements',
                      schoolmarksheet: 'schoolMarksheetRequirements',
                    }

                    // Try exact match first (case-insensitive)
                    const normalizedSlug = slug.toLowerCase()
                    const exactMatch = Object.keys(mapping).find(
                      key => key.toLowerCase() === normalizedSlug
                    )
                    if (exactMatch) {
                      return mapping[exactMatch]
                    }

                    // Try partial match (e.g., "passport_copy" -> "passport")
                    for (const [key, value] of Object.entries(mapping)) {
                      if (
                        slug.toLowerCase().includes(key.toLowerCase()) ||
                        key.toLowerCase().includes(slug.toLowerCase())
                      ) {
                        return value
                      }
                    }

                    // For new/custom documents, convert slug to camelCase + "Requirements"
                    // e.g., "aadharcard" -> "aadharCardRequirements"
                    const camelCaseSlug = slug
                      .split(/[-_\s]/)
                      .map((word, index) =>
                        index === 0
                          ? word.charAt(0).toLowerCase() +
                            word.slice(1).toLowerCase()
                          : word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                      )
                      .join('')

                    // Handle special case: if slug is all lowercase and contains "card" or "letter", convert properly
                    // e.g., "aadharcard" -> "aadharCard", "employmentletter" -> "employmentLetter"
                    let finalSlug = camelCaseSlug
                    if (
                      slug.toLowerCase() === slug &&
                      !slug.includes('-') &&
                      !slug.includes('_')
                    ) {
                      // All lowercase, no separators - try to detect word boundaries
                      // "aadharcard" -> "aadharCard", "employmentletter" -> "employmentLetter"
                      const cardMatch = slug.match(
                        /^(.+?)(card|letter|marksheet|certificate)$/i
                      )
                      if (cardMatch) {
                        const [, prefix, suffix] = cardMatch
                        finalSlug =
                          prefix.charAt(0).toLowerCase() +
                          prefix.slice(1) +
                          suffix.charAt(0).toUpperCase() +
                          suffix.slice(1).toLowerCase()
                      }
                    }

                    return `${finalSlug}Requirements`
                  }

                  // Get list of selected documents with their requirement keys
                  const getSelectedDocuments = (): Array<{
                    slug: string
                    displayName: string
                    requirementKey: string
                  }> => {
                    const selected: Array<{
                      slug: string
                      displayName: string
                      requirementKey: string
                    }> = []
                    if (formData.documents) {
                      // Get only documents that are actually selected (true)
                      const selectedSlugs = Object.keys(
                        formData.documents
                      ).filter(slug => {
                        const value: any = formData.documents[slug]
                        return (
                          value === true ||
                          String(value) === 'true' ||
                          Number(value) === 1
                        )
                      })

                      // Debug logging removed for production build
                      // console.log('📋 Selected document slugs:', selectedSlugs)
                      // console.log('📋 All documents in formData:', formData.documents)

                      selectedSlugs.forEach(slug => {
                        // Find document type info from documentTypes prop (case-insensitive match)
                        const docType = documentTypes.find(
                          dt =>
                            dt.slug.toLowerCase() === slug.toLowerCase() ||
                            dt.slug === slug ||
                            slug
                              .toLowerCase()
                              .includes(dt.slug.toLowerCase()) ||
                            dt.slug.toLowerCase().includes(slug.toLowerCase())
                        )

                        const displayName =
                          docType?.displayName ||
                          docType?.name ||
                          slug
                            .split(/[-_]/)
                            .map(
                              word =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(' ')

                        const requirementKey =
                          mapDocumentSlugToRequirementKey(slug)
                        if (requirementKey) {
                          selected.push({ slug, displayName, requirementKey })
                          console.log(
                            `✅ Added: ${slug} -> ${requirementKey} (${displayName})`
                          )
                        } else {
                          console.log(`⚠️ No requirement key for: ${slug}`)
                        }
                      })
                    }

                    // Debug logging removed for production build
                    // console.log(`📋 Total selected documents for requirements tab: ${selected.length}`)
                    return selected
                  }

                  const selectedDocuments = getSelectedDocuments()

                  // Default placeholders for known document types
                  const defaultPlaceholders: { [key: string]: string } = {
                    passportRequirements:
                      'Original passport issued within 10 years, valid for 6 months beyond the last intended date of departure, at least 2 blank visa pages, no alterations in data pages.',
                    photographRequirements:
                      'Three recent colored passport size (35x45mm) photographs with plain white background, no scanned or unclear images.',
                    accommodationRequirements:
                      'Hotel or Cruise voucher, Invitation letter + ID + financials if staying with friend/relative.',
                    flightRequirements:
                      'Confirmed round-trip flight reservations.',
                    itineraryRequirements:
                      'Day-wise itinerary or travel agent letter.',
                    insuranceRequirements:
                      'Minimum 30,000 Euros / 50,000 USD coverage, must cover entire stay in Schengen territory.',
                    fundsRequirements:
                      'Last 6 months bank statement (attested), recent, dated within 1 week.',
                    itrRequirements: 'Last 3 years of returns.',
                    coverLetterRequirements:
                      'A4 paper (employed) or business letterhead (self-employed).',
                    employmentRequirements:
                      'On official letterhead with employment details.',
                    nocRequirements:
                      'From school/college with ID copy (for students).',
                    gstRequirements: 'If self-employed.',
                    leaveRequirements: 'From company with employment ID.',
                    biometricRequirements:
                      'Mandatory for first-time Schengen applicants.',
                  }

                  return (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          General Note
                        </Label>
                        <Textarea
                          placeholder="This document checklist is standard but not exhaustive. The Embassy reserves the right to request additional documents based on specific use cases."
                          rows={2}
                          value={
                            formData.documentRequirements?.generalNote || ''
                          }
                          onChange={e => {
                            const newDocs = {
                              ...formData.documentRequirements,
                              generalNote: e.target.value,
                            }
                            handleInputChange(
                              'documentRequirements',
                              newDocs as any
                            )
                          }}
                        />
                      </div>

                      {selectedDocuments.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> No documents selected in
                            "Required Documents" section. Please select at least
                            one document to add its requirements here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedDocuments.map(
                            ({ slug, displayName, requirementKey }) => {
                              const placeholder =
                                defaultPlaceholders[requirementKey] ||
                                `Enter requirements for ${displayName}...`

                              // Helper function to get value from documentRequirements, trying multiple key formats
                              const getDocumentRequirementValue = (
                                key: string
                              ): string => {
                                const docReqs =
                                  formData.documentRequirements as any
                                if (!docReqs) return ''

                                // Try exact key first
                                if (docReqs[key]) return docReqs[key]

                                // Try lowercase version
                                const lowerKey = key.toLowerCase()
                                if (docReqs[lowerKey]) return docReqs[lowerKey]

                                // Try to find matching key (case-insensitive)
                                const matchingKey = Object.keys(docReqs).find(
                                  k =>
                                    k.toLowerCase() === key.toLowerCase() ||
                                    k.toLowerCase().replace(/[-_\s]/g, '') ===
                                      key.toLowerCase().replace(/[-_\s]/g, '')
                                )
                                if (matchingKey) return docReqs[matchingKey]

                                return ''
                              }

                              // Helper function to get the actual key from database (preserve existing key format)
                              const getActualKey = (key: string): string => {
                                const docReqs =
                                  formData.documentRequirements as any
                                if (!docReqs) return key

                                // Try exact key first
                                if (docReqs[key]) return key

                                // Try lowercase version
                                const lowerKey = key.toLowerCase()
                                if (docReqs[lowerKey]) return lowerKey

                                // Try to find matching key (case-insensitive)
                                const matchingKey = Object.keys(docReqs).find(
                                  k =>
                                    k.toLowerCase() === key.toLowerCase() ||
                                    k.toLowerCase().replace(/[-_\s]/g, '') ===
                                      key.toLowerCase().replace(/[-_\s]/g, '')
                                )
                                if (matchingKey) return matchingKey

                                return key // Use the new key format if not found
                              }

                              const actualKey = getActualKey(requirementKey)
                              const currentValue =
                                getDocumentRequirementValue(requirementKey)

                              return (
                                <div key={requirementKey} className="space-y-2">
                                  <Label className="text-sm font-medium">
                                    {displayName} Requirements
                                  </Label>
                                  <Textarea
                                    placeholder={placeholder}
                                    rows={3}
                                    value={currentValue}
                                    onChange={e => {
                                      const newDocs = {
                                        ...formData.documentRequirements,
                                      }
                                      // Remove old key if it's different from the new key
                                      if (
                                        actualKey !== requirementKey &&
                                        newDocs[
                                          actualKey as keyof typeof newDocs
                                        ]
                                      ) {
                                        delete newDocs[
                                          actualKey as keyof typeof newDocs
                                        ]
                                      }
                                      // Set the new value with the standard key format
                                      newDocs[
                                        requirementKey as keyof typeof newDocs
                                      ] = e.target.value
                                      handleInputChange(
                                        'documentRequirements',
                                        newDocs as any
                                      )
                                    }}
                                  />
                                </div>
                              )
                            }
                          )}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </TabsContent>

            <TabsContent value="important-info" className="mt-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Important Information
                </Label>
                <Textarea
                  placeholder="Enter important information..."
                  className="min-h-[200px]"
                  value={formData.importantInformation || ''}
                  onChange={e =>
                    handleInputChange('importantInformation', e.target.value)
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="inclusions" className="mt-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">What's Included</Label>
                <Textarea
                  placeholder="Enter inclusions..."
                  className="min-h-[200px]"
                  value={formData.inclusions || ''}
                  onChange={e =>
                    handleInputChange('inclusions', e.target.value)
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">
                    Frequently Asked Questions
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFAQ = [
                        ...(formData.faq || []),
                        {
                          question: '',
                          answer: '',
                          order: formData.faq?.length || 0,
                        },
                      ]
                      handleInputChange('faq', newFAQ as any)
                    }}
                  >
                    Add FAQ
                  </Button>
                </div>
                {(formData.faq || []).map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">
                        FAQ #{index + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFAQ =
                            formData.faq?.filter((_, i) => i !== index) || []
                          handleInputChange('faq', newFAQ as any)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Question</Label>
                      <Input
                        placeholder="Enter question..."
                        value={faq.question}
                        onChange={e => {
                          const newFAQ = [...(formData.faq || [])]
                          newFAQ[index] = { ...faq, question: e.target.value }
                          handleInputChange('faq', newFAQ as any)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Answer</Label>
                      <Textarea
                        placeholder="Enter answer..."
                        rows={2}
                        value={faq.answer}
                        onChange={e => {
                          const newFAQ = [...(formData.faq || [])]
                          newFAQ[index] = { ...faq, answer: e.target.value }
                          handleInputChange('faq', newFAQ as any)
                        }}
                      />
                    </div>
                  </div>
                ))}
                {(!formData.faq || formData.faq.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No FAQ items yet. Click "Add FAQ" to add one.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="operating" className="mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visa4 Hours</Label>
                  <Input
                    placeholder="10:00 AM - 7:00 PM (Mon-Sat)"
                    value={formData.operatingSchedule?.visa4Hours || ''}
                    onChange={e => {
                      const newSchedule = {
                        ...formData.operatingSchedule,
                        visa4Hours: e.target.value,
                      }
                      handleInputChange('operatingSchedule', newSchedule as any)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Embassy Hours</Label>
                  <Input
                    placeholder="9:00 AM - 5:00 PM (Mon-Fri)"
                    value={formData.operatingSchedule?.embassyHours || ''}
                    onChange={e => {
                      const newSchedule = {
                        ...formData.operatingSchedule,
                        embassyHours: e.target.value,
                      }
                      handleInputChange('operatingSchedule', newSchedule as any)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Public Holidays Note
                  </Label>
                  <Textarea
                    placeholder="Visa processing timelines may vary..."
                    rows={3}
                    value={formData.operatingSchedule?.publicHolidaysNote || ''}
                    onChange={e => {
                      const newSchedule = {
                        ...formData.operatingSchedule,
                        publicHolidaysNote: e.target.value,
                      }
                      handleInputChange('operatingSchedule', newSchedule as any)
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        {/* SEO Meta Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">SEO Meta Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Meta Robots *</Label>
              <Select
                value={formData.metaRobots}
                onValueChange={value => handleInputChange('metaRobots', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDEX, FOLLOW">INDEX, FOLLOW</SelectItem>
                  <SelectItem value="NOINDEX, NOFOLLOW">
                    NOINDEX, NOFOLLOW
                  </SelectItem>
                  <SelectItem value="INDEX, NOFOLLOW">
                    INDEX, NOFOLLOW
                  </SelectItem>
                  <SelectItem value="NOINDEX, FOLLOW">
                    NOINDEX, FOLLOW
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Meta Title *</Label>
              <Input
                placeholder="China Visa"
                value={formData.metaTitle}
                onChange={e => handleInputChange('metaTitle', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">Meta Keyword *</Label>
              <Textarea
                placeholder="Enter meta keywords..."
                rows={3}
                value={formData.metaKeyword}
                onChange={e => handleInputChange('metaKeyword', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">Meta Description *</Label>
              <Textarea
                placeholder="Enter meta description..."
                rows={4}
                value={formData.metaDescription}
                onChange={e =>
                  handleInputChange('metaDescription', e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                SAVE
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
