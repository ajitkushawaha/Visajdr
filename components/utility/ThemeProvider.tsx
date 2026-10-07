'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Visa4 Theme Context
import { createContext, useContext, ReactNode } from 'react'
import { theme, ThemeColors } from '@/lib/theme'

interface ThemeContextType {
  colors: ThemeColors
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const EuroWorldThemeProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [isDark, setIsDark] = React.useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const value = {
    colors: theme.colors,
    isDark,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a EuroWorldThemeProvider')
  }
  return context
}

// Theme-aware component wrapper
export const ThemedComponent = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'light' | 'dark' | 'default'
  className?: string
  [key: string]: any
}) => {
  const { colors, isDark } = useTheme()

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-primary text-white'
      case 'secondary':
        return 'bg-brand-secondary text-white'
      case 'accent':
        return 'bg-brand-accent text-white'
      case 'light':
        return 'bg-theme-light-green text-gray-900'
      case 'dark':
        return 'bg-brand-dark text-white'
      default:
        return 'bg-white text-gray-900'
    }
  }

  return (
    <div className={`${getVariantClasses()} ${className}`} {...props}>
      {children}
    </div>
  )
}
