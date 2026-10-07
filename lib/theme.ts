/**
 * Visa4 Theme Configuration
 * Centralized theme colors and utilities for consistent design across all pages
 */

export const theme = {
  colors: {
    // Primary Brand Colors
    brand: {
      primary: '#1A237E',
      secondary: '#1A237E',
      accent: '#FBC02D',
      dark: '#12174F',
      light: '#2A3ABF',
    },

    // Theme-specific colors
    theme: {
      light: {
        green: '#F1F5EB', // Light Green - Section backgrounds
        purple: '#F8F7FA', // Light Purple - CTA backgrounds
      },
      success: '#14532d', // Green - Success states
      info: '#1A237E',
    },

    // Neutral colors
    neutral: {
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F5F5F5',
        100: '#F5F5F5',
        200: '#E0E0E0',
        300: '#BDBDBD',
        400: '#9E9E9E',
        500: '#757575',
        600: '#616161',
        700: '#424242',
        800: '#2E2E2E',
        900: '#212121',
      },
    },
  },

  // Common color combinations
  combinations: {
    primary: {
      bg: 'bg-brand-primary',
      text: 'text-white',
      hover: 'hover:bg-brand-secondary',
    },
    secondary: {
      bg: 'bg-brand-secondary',
      text: 'text-white',
      hover: 'hover:bg-brand-accent',
    },
    accent: {
      bg: 'bg-brand-accent',
      text: 'text-white',
      hover: 'hover:bg-brand-primary',
    },
    dark: {
      bg: 'bg-brand-dark',
      text: 'text-white',
      hover: 'hover:bg-brand-primary',
    },
    light: {
      bg: 'bg-theme-light-green',
      text: 'text-gray-900',
      hover: 'hover:bg-theme-light-purple',
    },
  },

  // Common component styles
  components: {
    button: {
      primary:
        'bg-brand-primary text-white hover:bg-brand-dark transition-colors',
      secondary:
        'bg-brand-primary text-white hover:bg-brand-dark transition-colors',
      accent:
        'bg-brand-accent text-white hover:bg-brand-primary transition-colors',
      outline:
        'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors',
    },
    card: {
      default: 'bg-white border border-gray-200 shadow-sm',
      primary: 'bg-brand-primary text-white',
      secondary: 'bg-brand-secondary text-white',
      accent: 'bg-brand-accent text-white',
    },
    section: {
      default: 'bg-white',
      light: 'bg-theme-light-green',
      primary: 'bg-brand-primary text-white',
      secondary: 'bg-brand-secondary text-white',
    },
  },
} as const

// Type definitions for better TypeScript support
export type ThemeColors = typeof theme.colors
export type BrandColors = typeof theme.colors.brand
export type ThemeCombinations = typeof theme.combinations
export type ComponentStyles = typeof theme.components

// Utility functions
export const getBrandColor = (color: keyof BrandColors): string => {
  return theme.colors.brand[color]
}

export const getThemeColor = (color: string): string => {
  const themeColors = theme.colors.theme as any
  return themeColors[color] || color
}

// Common CSS classes for easy usage
export const themeClasses = {
  // Backgrounds
  bgPrimary: 'bg-brand-primary',
  bgSecondary: 'bg-brand-secondary',
  bgAccent: 'bg-brand-accent',
  bgDark: 'bg-brand-dark',
  bgLight: 'bg-theme-light-green',
  bgLightPurple: 'bg-theme-light-purple',

  // Text colors
  textPrimary: 'text-brand-primary',
  textSecondary: 'text-brand-secondary',
  textAccent: 'text-brand-accent',
  textWhite: 'text-white',
  textDark: 'text-gray-900',

  // Borders
  borderPrimary: 'border-brand-primary',
  borderSecondary: 'border-brand-secondary',
  borderAccent: 'border-brand-accent',

  // Hover states
  hoverPrimary: 'hover:bg-brand-primary hover:text-white',
  hoverSecondary: 'hover:bg-brand-secondary hover:text-white',
  hoverAccent: 'hover:bg-brand-accent hover:text-white',
} as const
