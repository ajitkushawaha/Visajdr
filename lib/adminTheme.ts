/**
 * Visa4 Admin Panel Theme Configuration
 * Professional, modern theme specifically designed for admin interfaces
 */

export const adminTheme = {
  // Admin-specific color palette
  colors: {
    // Primary admin colors (based on brand)
    primary: {
      50: '#f0f4ff', // Very light blue
      100: '#e0e7ff', // Light blue
      200: '#c7d2fe', // Lighter blue
      300: '#a5b4fc', // Light blue
      400: '#818cf8', // Medium light blue
      500: '#6366f1', // Medium blue
      600: '#4f46e5', // Brand primary
      700: '#4338ca', // Dark blue
      800: '#3730a3', // Darker blue
      900: '#312e81', // Very dark blue
    },

    // Secondary colors (red accent)
    secondary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Brand secondary
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Success colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },

    // Warning colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },

    // Neutral grays for admin
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: '#0f172a',
      sidebar: '#1e293b',
      sidebarHover: '#334155',
    },
  },

  // Component-specific styles
  components: {
    sidebar: {
      background: 'bg-brand-primary',
      backgroundHover: 'hover:bg-brand-dark',
      backgroundActive: 'bg-brand-dark',
      text: 'text-white',
      textHover: 'hover:text-white',
      textActive: 'text-white',
      border: 'border-brand-dark',
      borderActive: 'border-brand-secondary',
    },

    header: {
      background: 'bg-white',
      border: 'border-slate-200',
      shadow: 'shadow-sm',
    },

    card: {
      background: 'bg-white',
      border: 'border-slate-200',
      shadow: 'shadow-sm',
      shadowHover: 'hover:shadow-md',
      rounded: 'rounded-lg',
    },

    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
    },

    input: {
      background: 'bg-white',
      border: 'border-slate-300',
      borderFocus: 'focus:border-blue-500 focus:ring-blue-500',
      text: 'text-slate-900',
      placeholder: 'placeholder-slate-400',
    },

    table: {
      header: 'bg-slate-50 text-slate-700 font-medium',
      row: 'border-b border-slate-200',
      rowHover: 'hover:bg-slate-50',
      cell: 'text-slate-900',
    },

    badge: {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      neutral: 'bg-slate-100 text-slate-800',
    },
  },

  // Layout configurations
  layout: {
    sidebar: {
      width: 'w-64',
      widthCollapsed: 'w-16',
      transition: 'transition-all duration-300',
    },
    header: {
      height: 'h-16',
    },
    content: {
      padding: 'p-6',
      background: 'bg-slate-50',
    },
  },

  // Spacing and sizing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },

  // Typography
  typography: {
    heading: {
      h1: 'text-3xl font-bold text-slate-900',
      h2: 'text-2xl font-semibold text-slate-900',
      h3: 'text-xl font-semibold text-slate-900',
      h4: 'text-lg font-medium text-slate-900',
    },
    body: {
      large: 'text-lg text-slate-700',
      base: 'text-base text-slate-700',
      small: 'text-sm text-slate-600',
      xs: 'text-xs text-slate-500',
    },
  },
} as const

// Utility functions for theme usage
export const getAdminTheme = () => adminTheme

export const getAdminColor = (colorPath: string) => {
  const keys = colorPath.split('.')
  let value: any = adminTheme.colors

  for (const key of keys) {
    value = value?.[key]
  }

  return value || colorPath
}

// CSS class generators
export const adminThemeClasses = {
  // Layout
  layout: {
    container: 'bg-gray-50 text-gray-900',
    main: 'bg-gray-50',
    sidebar: 'bg-gray-800 text-gray-200',
    header: 'bg-white border-b border-gray-200 shadow-sm',
  },

  // Typography
  typography: {
    heading: {
      h1: 'text-3xl font-bold text-gray-900',
      h2: 'text-2xl font-semibold text-gray-900',
      h3: 'text-xl font-semibold text-gray-900',
      h4: 'text-lg font-medium text-gray-900',
    },
    body: {
      large: 'text-lg text-gray-700',
      base: 'text-base text-gray-700',
      small: 'text-sm text-gray-600',
      xs: 'text-xs text-gray-500',
    },
  },

  // Sidebar
  sidebar: {
    container:
      'bg-brand-primary text-white w-64 flex flex-col transition-all duration-300',
    header: 'p-4 border-b border-brand-dark',
    nav: 'flex-1 py-4 overflow-y-auto',
    item: 'flex items-center px-4 py-3 text-sm hover:bg-brand-dark cursor-pointer transition-colors',
    itemActive: 'bg-brand-dark border-r-2 border-blue-600',
    submenu: 'bg-brand-dark ml-4 rounded-lg',
    submenuItem:
      'block px-4 py-2 text-sm text-white hover:text-white hover:bg-brand-dark rounded transition-colors',
  },

  // Header
  header: {
    container:
      'bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center',
    title: 'text-xl font-semibold text-gray-900',
    actions: 'flex items-center space-x-4',
  },

  // Cards
  card: {
    container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    header: 'px-6 py-4 border-b border-gray-200 bg-gray-50',
    content: 'p-6',
    footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50',
  },

  // Buttons
  button: {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors',
    success:
      'bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
    danger:
      'bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
    outline:
      'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors',
  },

  // Tables
  table: {
    container: 'bg-white border border-gray-200 rounded-lg overflow-hidden',
    header: 'bg-gray-50 border-b border-gray-200',
    headerCell:
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    row: 'border-b border-gray-200 hover:bg-gray-50 transition-colors',
    cell: 'px-6 py-4 text-sm text-gray-900',
  },

  // Forms
  form: {
    label: 'block text-sm font-medium text-gray-700 mb-2',
    input:
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
    textarea:
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical',
    select:
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
  },

  // Badges
  badge: {
    success:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    warning:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    error:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    info: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    neutral:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800',
  },
} as const

// Dark mode support
export const adminDarkTheme = {
  ...adminTheme,
  colors: {
    ...adminTheme.colors,
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      dark: '#0f172a',
      sidebar: '#1e293b',
      sidebarHover: '#334155',
    },
  },
} as const
