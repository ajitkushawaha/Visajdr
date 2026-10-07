'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  content?: {
    faqTitle?: string
    faqSubtitle?: string
    faqs?: FAQ[]
  }
}

export default function FAQSection({ content }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = content?.faqs || [
    {
      question: 'What documents are required for a student visa?',
      answer:
        'Required documents typically include passport, academic transcripts, proof of financial support, admission letter, and language test scores. Our consultants will provide a complete checklist based on your destination country.',
    },
    {
      question: 'How long does it take to process a work visa?',
      answer:
        'Processing times vary by country and visa type, typically ranging from 2-6 months. We provide realistic timelines and keep you updated throughout the process.',
    },
    {
      question: 'Do you provide post-landing support?',
      answer:
        'Yes! We offer comprehensive post-landing support including accommodation guidance, job search assistance, and settlement services.',
    },
    {
      question: 'Can you help with visa rejection cases?',
      answer:
        'Absolutely. We specialize in visa rejection appeals and reapplications, analyzing the reasons for rejection and strengthening your case.',
    },
    {
      question: 'What is your consultation fee?',
      answer:
        'Our consultation fees are transparent and affordable, starting from a free initial consultation. Detailed pricing depends on the visa type and complexity of your case.',
    },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            {content?.faqTitle || 'Frequently Asked Questions'}
          </h2>
          <p className="text-lg text-gray-600">
            {content?.faqSubtitle ||
              'Find answers to common visa consultancy questions'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4 capitalize">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-brand-accent flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
