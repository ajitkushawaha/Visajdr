'use client'

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FaqItem {
  question: string
  answer: string
}

interface ServiceFaqsProps {
  faqs?: {
    title?: string
    subtitle?: string
    items: FaqItem[]
  }
}

export default function ServiceFaqs({ faqs }: ServiceFaqsProps) {
  if (!faqs || !faqs.items || faqs.items.length === 0) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xl md:text-3xl font-bold text-[#0f172a] mb-4">
            {faqs.title || 'Frequently Asked Questions'}
          </h2>
          {faqs.subtitle && <p className="text-[#64748b]">{faqs.subtitle}</p>}
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.items.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-slate-100 rounded-2xl px-6 bg-slate-50/30"
            >
              <AccordionTrigger className="text-left font-bold text-[#0f172a] hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#64748b] leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
