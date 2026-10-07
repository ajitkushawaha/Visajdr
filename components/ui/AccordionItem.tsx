// components/AccordionItem.js
'use client'
import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface AccordionItemProps {
  title: React.ReactNode
  id?: string
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
}

export default function AccordionItem({
  title,
  id,
  children,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  const isControlled = isOpen !== undefined
  const showContent = isControlled ? isOpen : internalIsOpen

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle()
    } else {
      setInternalIsOpen(!internalIsOpen)
    }
  }

  return (
    <section id={id} className="bg-white rounded-lg border mb-2">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {showContent ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {showContent && (
        <div className="px-6 pb-4 text-gray-700 whitespace-pre-wrap">
          {children}
        </div>
      )}
    </section>
  )
}
