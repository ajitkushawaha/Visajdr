"use client"

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from HTML content
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    const items: TOCItem[] = Array.from(headings).map((heading, index) => {
      const id = heading.id || `heading-${index}`
      const text = heading.textContent || ''
      const level = parseInt(heading.tagName.charAt(1))
      
      // Add ID to the heading if it doesn't have one
      if (!heading.id) {
        heading.id = id
      }
      
      return { id, text, level }
    })
    
    setTocItems(items)
  }, [content])

  useEffect(() => {
    const handleScroll = () => {
      const headings = tocItems.map(item => {
        const element = document.getElementById(item.id)
        return {
          id: item.id,
          element,
          top: element ? element.getBoundingClientRect().top : Infinity
        }
      })

      // Find the heading that's currently in view
      const visibleHeadings = headings.filter(h => h.top >= 0 && h.top <= 200)
      
      if (visibleHeadings.length > 0) {
        // Get the first visible heading
        const currentHeading = visibleHeadings.reduce((prev, current) => 
          prev.top < current.top ? prev : current
        )
        setActiveId(currentHeading.id)
      } else {
        // If no heading is in view, find the last heading that has passed
        const passedHeadings = headings.filter(h => h.top < 0)
        if (passedHeadings.length > 0) {
          const lastPassed = passedHeadings.reduce((prev, current) => 
            prev.top > current.top ? prev : current
          )
          setActiveId(lastPassed.id)
        }
      }
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll)
    
    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [tocItems])

  if (tocItems.length === 0) {
    return null
  }

  return (
    <div className="sticky top-8">
      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Contents</h3>
        <nav className="space-y-1">
          {tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block text-xs py-1 transition-colors leading-tight rounded px-2 ${
                activeId === item.id 
                  ? 'bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              } ${
                item.level === 1 ? 'font-medium text-xs' : 
                item.level === 2 ? 'ml-1' : 
                item.level >= 3 ? 'ml-2' : ''
              }`}
            >
              {item.text.length > 20 ? `${item.text.substring(0, 20)}...` : item.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
