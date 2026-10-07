import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCountryName = (name: string): string => {
  if (!name) return name

  const trimmedName = name.trim()
  if (!trimmedName) return name

  // Handle special cases for country names
  const specialCases: { [key: string]: string } = {
    usa: 'United States',
    us: 'United States',
    uk: 'United Kingdom',
    uae: 'UAE',
    'u.s.a': 'United States',
    'u.s.': 'United States',
  }

  const lowerName = trimmedName.toLowerCase()
  if (specialCases[lowerName]) {
    return specialCases[lowerName]
  }

  // Convert to Title Case (capitalize first letter of each word)
  // Handle common country name patterns
  return trimmedName
    .split(/\s+/)
    .map((word, index) => {
      if (word.length === 0) return word

      // Always capitalize first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }

      // Handle common prepositions/articles - keep lowercase
      const lowerWord = word.toLowerCase()
      const lowercaseWords = ['and', 'of', 'the', 'de', 'la', 'el', 'le', 'les']
      if (lowercaseWords.includes(lowerWord)) {
        return lowerWord
      }

      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}
