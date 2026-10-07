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
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Eye,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Globe,
  Users,
  Award,
  Send,
  CheckCircle2,
  Star,
  ArrowRight,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ContactMethod {
  _id?: string
  icon: string
  title: string
  description: string
  primary: string
  secondary: string
  action: string
  href: string
  order: number
  status: 'active' | 'inactive'
}

interface FAQ {
  _id?: string
  question: string
  answer: string
  order: number
  status: 'active' | 'inactive'
}

interface ContactInfo {
  _id?: string
  type: 'address' | 'phone' | 'email' | 'hours' | 'other'
  title: string
  content: string
  icon: string
  actionText?: string
  actionHref?: string
  order: number
  status: 'active' | 'inactive'
}

interface ContactUsPageData {
  _id?: string
  heroPillText: string
  heroTitle: string
  heroDescription: string
  statistics: {
    label: string
    value: string
  }[]
  contactSectionTitle: string
  contactSectionDescription: string
  contactMethods: ContactMethod[]
  infoSectionTitle: string
  contactInfo: ContactInfo[]
  formTitle: string
  formDescription: string
  socialProofTitle: string
  socialProofDescription: string
  faqSectionSubtitle: string
  faqTitle: string
  faqDescription: string
  faqs: FAQ[]
  ctaTitle: string
  ctaDescription: string
  ctaButtons: {
    primary: {
      text: string
      href: string
    }
    secondary: {
      text: string
      href: string
    }
  }
}

const iconOptions = [
  'Phone',
  'Mail',
  'MessageCircle',
  'Globe',
  'MapPin',
  'Clock',
  'Award',
  'Users',
  'Shield',
  'Heart',
]

const contactInfoTypes = [
  { value: 'address', label: 'Address' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'hours', label: 'Business Hours' },
  { value: 'other', label: 'Other' },
]

// Icon mapping for dynamic icons
const iconMap: { [key: string]: any } = {
  Phone,
  Mail,
  MessageCircle,
  Globe,
  MapPin,
  Clock,
  Award,
  Users,
  Shield: Award,
  Heart: Award,
}

export default function ContactUsAdminPage() {
  const [formData, setFormData] = useState<ContactUsPageData>({
    heroPillText: '',
    heroTitle: '',
    heroDescription: '',
    statistics: [],
    floatingCountries: [],
    contactSectionTitle: '',
    contactSectionDescription: '',
    contactMethods: [],
    infoSectionTitle: '',
    contactInfo: [],
    formTitle: '',
    formDescription: '',
    socialProofTitle: '',
    socialProofDescription: '',
    faqSectionSubtitle: '',
    faqTitle: '',
    faqDescription: '',
    faqs: [],
    ctaTitle: '',
    ctaDescription: '',
    ctaButtons: {
      primary: { text: '', href: '' },
      secondary: { text: '', href: '' },
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/pages/contact-us')
      const data = await response.json()

      if (data.success) {
        setFormData(data.contactUsPage)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch contact us data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/pages/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Contact us page updated successfully',
        })
        setFormData(data.contactUsPage)
      } else {
        throw new Error(data.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      toast({
        title: 'Error',
        description: 'Failed to save contact us page',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Contact Methods
  const addContactMethod = () => {
    const newMethod: ContactMethod = {
      icon: 'Phone',
      title: '',
      description: '',
      primary: '',
      secondary: '',
      action: '',
      href: '',
      order: formData.contactMethods.length,
      status: 'active',
    }
    setFormData(prev => ({
      ...prev,
      contactMethods: [...prev.contactMethods, newMethod],
    }))
  }

  const updateContactMethod = (
    index: number,
    field: keyof ContactMethod,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.map((method, i) =>
        i === index ? { ...method, [field]: value } : method
      ),
    }))
  }

  const removeContactMethod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.filter((_, i) => i !== index),
    }))
  }

  // Contact Info
  const addContactInfo = () => {
    const newInfo: ContactInfo = {
      type: 'address',
      title: '',
      content: '',
      icon: 'MapPin',
      order: formData.contactInfo.length,
      status: 'active',
    }
    setFormData(prev => ({
      ...prev,
      contactInfo: [...prev.contactInfo, newInfo],
    }))
  }

  const updateContactInfo = (
    index: number,
    field: keyof ContactInfo,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: prev.contactInfo.map((info, i) =>
        i === index ? { ...info, [field]: value } : info
      ),
    }))
  }

  const removeContactInfo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: prev.contactInfo.filter((_, i) => i !== index),
    }))
  }

  // FAQ
  const addFAQ = () => {
    const newFAQ: FAQ = {
      question: '',
      answer: '',
      order: formData.faqs.length,
      status: 'active',
    }
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFAQ],
    }))
  }

  const updateFAQ = (
    index: number,
    field: keyof FAQ,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      ),
    }))
  }

  const removeFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contact Us Page Management</h1>
          <p className="text-muted-foreground">
            Manage the content and structure of your contact us page
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            className="text-gray-900 bg-white hover:bg-gray-200"
          >
            <a href="/contact-us" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            See how your Contact Us page will look.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] bg-gray-100 p-4 rounded-md">
          <div className="w-full h-full bg-white rounded-lg shadow-md overflow-y-auto max-h-[800px]">
            {/* Hero Section - Redesigned for premium feel */}
            <section className="relative overflow-hidden bg-[#07034f] py-16">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/20 blur-[60px] animate-pulse"></div>
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-brand-accent/20 blur-[50px] animate-pulse [animation-delay:2s]"></div>
              </div>

              <div className="relative z-10 w-full px-4">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-medium mb-4">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-brand-secondary"></span>
                    {formData.heroPillText || 'Get in Touch with Experts'}
                  </div>
                  <h1 className="text-2xl font-extrabold text-white mb-4 tracking-tight">
                    {formData.heroTitle}
                  </h1>
                  <p className="text-sm text-white/80 max-w-2xl mx-auto mb-8">
                    {formData.heroDescription}
                  </p>

                  {/* Redesigned Trust Indicators */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10 backdrop-blur-sm bg-white/5 rounded-xl px-4">
                    {(formData.statistics || []).map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xl font-bold text-white mb-0.5">
                          {stat.value}
                        </div>
                        <div className="text-[8px] text-white/60 font-medium uppercase tracking-wider">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                    {!formData.statistics?.length && (
                      <div className="col-span-3 text-white/40 text-[10px] italic">
                        No statistics added
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="relative -mt-8 z-20 w-full px-4 pb-12 bg-[#F8F9FA]">
              {/* Contact Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 pt-4">
                {(formData.contactMethods || [])
                  .filter(method => method.status === 'active')
                  .map((method, index) => {
                    const IconComponent = iconMap[method.icon] || Phone
                    return (
                      <div
                        key={index}
                        className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100/50 flex flex-col items-center text-center"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-4">
                          <IconComponent className="h-5 w-5 text-brand-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">
                          {method.title}
                        </h3>
                        <p className="text-[10px] text-gray-500 mb-4 h-8 overflow-hidden">
                          {method.description}
                        </p>
                        <div className="mt-auto">
                          <p className="font-bold text-xs text-brand-secondary mb-3">
                            {method.primary}
                          </p>
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary">
                            {method.action}
                            <ArrowRight className="h-2 w-2" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Main Content: Info & Form Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {formData.infoSectionTitle || 'Contact Details'}
                    </h2>
                    <div className="space-y-6">
                      {(formData.contactInfo || [])
                        .filter(info => info.status === 'active')
                        .map((info, index) => {
                          const IconComponent = iconMap[info.icon] || MapPin
                          return (
                            <div key={index} className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-primary/5 flex items-center justify-center">
                                <IconComponent className="h-4 w-4 text-brand-primary" />
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">
                                  {info.title}
                                </h4>
                                <p className="text-[10px] text-gray-600 whitespace-pre-line leading-relaxed">
                                  {info.content}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  {/* Social Proof Card Preview */}
                  <div className="bg-gradient-to-br from-brand-secondary to-brand-accent p-6 rounded-[2rem] text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Award className="w-16 h-16 rotate-12" />
                    </div>
                    <div className="relative z-10">
                      <Star className="h-5 w-5 text-white mb-2 fill-white" />
                      <h3 className="text-sm font-bold mb-1">
                        {formData.socialProofTitle || 'Award Winning Service'}
                      </h3>
                      <p className="text-[10px] text-white/80 leading-relaxed mb-4">
                        {formData.socialProofDescription ||
                          'Recognized for excellence across India.'}
                      </p>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border border-white bg-gray-200"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Form Preview */}
                <div className="lg:col-span-7">
                  <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {formData.formTitle || 'Send a Message'}
                      </h3>
                      <p className="text-gray-500 text-[10px]">
                        {formData.formDescription || 'Typically 24h response.'}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-8 bg-gray-50 rounded-lg"></div>
                        <div className="h-8 bg-gray-50 rounded-lg"></div>
                      </div>
                      <div className="h-8 bg-gray-50 rounded-lg"></div>
                      <div className="h-16 bg-gray-50 rounded-lg"></div>
                      <div className="h-10 bg-brand-primary rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16">
                <div className="text-center mb-10">
                  <span className="text-brand-secondary font-bold uppercase tracking-[0.2em] text-[8px] mb-2 block">
                    {formData.faqSectionSubtitle || 'Common Questions'}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {formData.faqTitle}
                  </h2>
                  <p className="text-gray-500 max-w-2xl mx-auto text-sm">
                    {formData.faqDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.faqs || [])
                    .filter(faq => faq.status === 'active')
                    .map((faq, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-2xl border border-gray-100"
                      >
                        <h3 className="text-xs font-bold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-[10px] text-gray-600 italic">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* CTA Preview */}
              <div className="mt-16 bg-[#07034f] rounded-[2rem] p-10 text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3">
                    {formData.ctaTitle}
                  </h3>
                  <p className="text-white/70 text-xs mb-6 max-w-md mx-auto">
                    {formData.ctaDescription}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <div className="px-4 py-2 bg-brand-secondary rounded-lg text-[10px] font-bold">
                      {formData.ctaButtons.primary.text}
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-lg text-[10px] font-bold border border-white/10">
                      {formData.ctaButtons.secondary.text}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="methods">Contact Methods</TabsTrigger>
          <TabsTrigger value="info">Contact Info</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Main heading and description for the contact us page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="heroPillText">Hero Pill Text</Label>
                <Input
                  id="heroPillText"
                  placeholder="Get in Touch with Experts"
                  value={formData.heroPillText}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      heroPillText: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={formData.heroTitle}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      heroTitle: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="heroDescription">Hero Description</Label>
                <Textarea
                  id="heroDescription"
                  value={formData.heroDescription}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      heroDescription: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Trust Statistics</CardTitle>
                  <CardDescription>
                    Key metrics shown in the hero section
                  </CardDescription>
                </div>
                <Button
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      statistics: [
                        ...prev.statistics,
                        { label: '', value: '' },
                      ],
                    }))
                  }
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Statistic
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.statistics.map((stat, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-end border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <Label>Value (e.g. 50K+)</Label>
                    <Input
                      value={stat.value}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          statistics: prev.statistics.map((s, i) =>
                            i === index ? { ...s, value: e.target.value } : s
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Label (e.g. Happy Customers)</Label>
                    <Input
                      value={stat.label}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          statistics: prev.statistics.map((s, i) =>
                            i === index ? { ...s, label: e.target.value } : s
                          ),
                        }))
                      }
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        statistics: prev.statistics.filter(
                          (_, i) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.statistics.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No statistics added. Click "Add Statistic" to begin.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Methods Section</CardTitle>
              <CardDescription>
                Main heading and intro for the contact methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactSectionTitle">Section Title</Label>
                <Input
                  id="contactSectionTitle"
                  value={formData.contactSectionTitle}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      contactSectionTitle: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="contactSectionDescription">
                  Section Description
                </Label>
                <Textarea
                  id="contactSectionDescription"
                  value={formData.contactSectionDescription}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      contactSectionDescription: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact Cards</CardTitle>
              <CardDescription>
                Manage the individual contact cards (Call, Email, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Contact Methods</h3>
                <Button onClick={addContactMethod} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>

              {formData.contactMethods.map((method, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        Contact Method {index + 1}
                      </CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeContactMethod(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Icon (Lucide name)</Label>
                        <Select
                          value={method.icon}
                          onValueChange={value =>
                            updateContactMethod(index, 'icon', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(icon => (
                              <SelectItem key={icon} value={icon}>
                                {icon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={method.title}
                          onChange={e =>
                            updateContactMethod(index, 'title', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={method.description}
                        onChange={e =>
                          updateContactMethod(
                            index,
                            'description',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Text</Label>
                        <Input
                          value={method.primary}
                          onChange={e =>
                            updateContactMethod(
                              index,
                              'primary',
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Secondary Text</Label>
                        <Input
                          value={method.secondary}
                          onChange={e =>
                            updateContactMethod(
                              index,
                              'secondary',
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Action Text</Label>
                        <Input
                          value={method.action}
                          onChange={e =>
                            updateContactMethod(index, 'action', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Action Link (href)</Label>
                        <Input
                          value={method.href}
                          onChange={e =>
                            updateContactMethod(index, 'href', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Settings</CardTitle>
              <CardDescription>
                Titles for the contact details and form sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="infoSectionTitle">Contact Info Title</Label>
                  <Input
                    id="infoSectionTitle"
                    value={formData.infoSectionTitle}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        infoSectionTitle: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formTitle">Form Title</Label>
                  <Input
                    id="formTitle"
                    value={formData.formTitle}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        formTitle: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="formDescription">Form Description</Label>
                <Input
                  id="formDescription"
                  value={formData.formDescription}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      formDescription: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Proof / Award Card</CardTitle>
              <CardDescription>
                Manage the highlighted service award card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="socialProofTitle">Award Title</Label>
                <Input
                  id="socialProofTitle"
                  value={formData.socialProofTitle}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      socialProofTitle: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="socialProofDescription">
                  Award Description
                </Label>
                <Textarea
                  id="socialProofDescription"
                  value={formData.socialProofDescription}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      socialProofDescription: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information Cards</CardTitle>
              <CardDescription>
                The small detail cards like Address and Business Hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <Button onClick={addContactInfo} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Info
                </Button>
              </div>

              {formData.contactInfo.map((info, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        Contact Info {index + 1}
                      </CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeContactInfo(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={info.type}
                          onValueChange={value =>
                            updateContactInfo(index, 'type', value as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contactInfoTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Icon (Lucide name)</Label>
                        <Select
                          value={info.icon}
                          onValueChange={value =>
                            updateContactInfo(index, 'icon', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(icon => (
                              <SelectItem key={icon} value={icon}>
                                {icon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={info.title}
                        onChange={e =>
                          updateContactInfo(index, 'title', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={info.content}
                        onChange={e =>
                          updateContactInfo(index, 'content', e.target.value)
                        }
                        placeholder="Use \n for line breaks"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Action Text (optional)</Label>
                        <Input
                          value={info.actionText || ''}
                          onChange={e =>
                            updateContactInfo(
                              index,
                              'actionText',
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Action Link (optional)</Label>
                        <Input
                          value={info.actionHref || ''}
                          onChange={e =>
                            updateContactInfo(
                              index,
                              'actionHref',
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
              <CardDescription>
                Manage the frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="faqSectionSubtitle">FAQ Section Subtitle</Label>
                <Input
                  id="faqSectionSubtitle"
                  placeholder="Common Questions"
                  value={formData.faqSectionSubtitle}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      faqSectionSubtitle: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="faqTitle">FAQ Section Title</Label>
                <Input
                  id="faqTitle"
                  value={formData.faqTitle}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, faqTitle: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="faqDescription">FAQ Section Description</Label>
                <Textarea
                  id="faqDescription"
                  value={formData.faqDescription}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      faqDescription: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">FAQ Items</h3>
                  <Button onClick={addFAQ} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>

                {formData.faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">
                          FAQ {index + 1}
                        </CardTitle>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFAQ(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Question</Label>
                        <Input
                          value={faq.question}
                          onChange={e =>
                            updateFAQ(index, 'question', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Answer</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={e =>
                            updateFAQ(index, 'answer', e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Section</CardTitle>
              <CardDescription>
                Manage the CTA section at the bottom of the page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ctaTitle">CTA Title</Label>
                <Input
                  id="ctaTitle"
                  value={formData.ctaTitle}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, ctaTitle: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="ctaDescription">CTA Description</Label>
                <Textarea
                  id="ctaDescription"
                  value={formData.ctaDescription}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      ctaDescription: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Primary Button</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Button Text</Label>
                      <Input
                        value={formData.ctaButtons.primary.text}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            ctaButtons: {
                              ...prev.ctaButtons,
                              primary: {
                                ...prev.ctaButtons.primary,
                                text: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Button Link</Label>
                      <Input
                        value={formData.ctaButtons.primary.href}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            ctaButtons: {
                              ...prev.ctaButtons,
                              primary: {
                                ...prev.ctaButtons.primary,
                                href: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Secondary Button
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Button Text</Label>
                      <Input
                        value={formData.ctaButtons.secondary.text}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            ctaButtons: {
                              ...prev.ctaButtons,
                              secondary: {
                                ...prev.ctaButtons.secondary,
                                text: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Button Link</Label>
                      <Input
                        value={formData.ctaButtons.secondary.href}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            ctaButtons: {
                              ...prev.ctaButtons,
                              secondary: {
                                ...prev.ctaButtons.secondary,
                                href: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
