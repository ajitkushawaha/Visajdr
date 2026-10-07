'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
}

interface ContactFormProps {
  title?: string
  description?: string
}

export default function ContactForm({ title, description }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        setIsSubmitted(true)
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
      } else {
        toast.error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16"></div>

      <div className="relative z-10">
        <div className="mb-10">
          <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Send className="h-8 w-8 text-brand-secondary" />
            {title || 'Send a Message'}
          </h3>
          <p className="text-gray-500 text-lg">
            {description || 'We typically respond within 24 hours.'}
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Message Sent!
            </h3>
            <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
              Our experts have received your inquiry and will reach out to you
              shortly.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="rounded-xl px-8 border-gray-200 hover:bg-gray-50 text-gray-600 font-bold"
            >
              Send Another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-bold text-gray-700 ml-1"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  required
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all text-base"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-bold text-gray-700 ml-1"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  required
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-bold text-gray-700 ml-1"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  required
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all text-base"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-bold text-gray-700 ml-1"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 00000 00000"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  required
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="subject"
                className="text-sm font-bold text-gray-700 ml-1"
              >
                How can we help?
              </Label>
              <Select
                value={formData.subject}
                onValueChange={value => handleInputChange('subject', value)}
              >
                <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all text-base">
                  <SelectValue placeholder="Select an inquiry type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  <SelectItem value="visa-inquiry">Visa Inquiry</SelectItem>
                  <SelectItem value="application-status">
                    Application Status
                  </SelectItem>
                  <SelectItem value="document-help">Document Help</SelectItem>
                  <SelectItem value="technical-support">
                    Technical Support
                  </SelectItem>
                  <SelectItem value="business-inquiry">
                    Business Inquiry
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-sm font-bold text-gray-700 ml-1"
              >
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your requirements..."
                rows={5}
                value={formData.message}
                onChange={e => handleInputChange('message', e.target.value)}
                required
                className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all resize-none text-base p-4"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#07034f] hover:bg-[#07034f]/90 text-white font-bold h-16 rounded-2xl text-lg shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending your request...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  Send Message
                  <Send className="h-5 w-5 rotate-12" />
                </div>
              )}
            </Button>

            <p className="text-center text-xs text-gray-400 mt-4">
              By clicking send, you agree to our{' '}
              <a
                href="/terms-of-service"
                className="underline hover:text-brand-primary"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy-policy"
                className="underline hover:text-brand-primary"
              >
                Privacy Policy
              </a>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
