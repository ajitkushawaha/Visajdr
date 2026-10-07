/**
 * Theme Usage Examples
 * This file shows how to use the Visa4 theme across different components and pages
 */

import { theme, themeClasses } from './theme'

// Example 1: Button Components with Theme
export const ThemedButton = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}: {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline'
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  const getButtonClasses = () => {
    const baseClasses =
      'px-6 py-3 rounded-lg font-medium transition-colors duration-200'

    switch (variant) {
      case 'primary':
        return `${baseClasses} ${themeClasses.bgSecondary} ${themeClasses.textWhite} hover:bg-brand-accent`
      case 'secondary':
        return `${baseClasses} ${themeClasses.bgPrimary} ${themeClasses.textWhite} hover:bg-brand-dark`
      case 'accent':
        return `${baseClasses} ${themeClasses.bgAccent} ${themeClasses.textWhite} hover:bg-brand-secondary`
      case 'outline':
        return `${baseClasses} border-2 ${themeClasses.borderPrimary} ${themeClasses.textPrimary} hover:bg-brand-primary hover:text-white`
      default:
        return `${baseClasses} ${themeClasses.bgSecondary} ${themeClasses.textWhite}`
    }
  }

  return (
    <button className={`${getButtonClasses()} ${className}`} {...props}>
      {children}
    </button>
  )
}

// Example 2: Card Components with Theme
export const ThemedCard = ({
  variant = 'default',
  children,
  className = '',
  ...props
}: {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'light'
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  const getCardClasses = () => {
    const baseClasses = 'rounded-xl p-6 shadow-sm'

    switch (variant) {
      case 'primary':
        return `${baseClasses} ${themeClasses.bgPrimary} ${themeClasses.textWhite}`
      case 'secondary':
        return `${baseClasses} ${themeClasses.bgSecondary} ${themeClasses.textWhite}`
      case 'accent':
        return `${baseClasses} ${themeClasses.bgAccent} ${themeClasses.textWhite}`
      case 'light':
        return `${baseClasses} ${themeClasses.bgLight} ${themeClasses.textDark}`
      default:
        return `${baseClasses} bg-white border border-gray-200`
    }
  }

  return (
    <div className={`${getCardClasses()} ${className}`} {...props}>
      {children}
    </div>
  )
}

// Example 3: Section Components with Theme
export const ThemedSection = ({
  variant = 'default',
  children,
  className = '',
  ...props
}: {
  variant?: 'default' | 'primary' | 'secondary' | 'light' | 'dark'
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  const getSectionClasses = () => {
    const baseClasses = 'py-16 px-4'

    switch (variant) {
      case 'primary':
        return `${baseClasses} ${themeClasses.bgPrimary} ${themeClasses.textWhite}`
      case 'secondary':
        return `${baseClasses} ${themeClasses.bgSecondary} ${themeClasses.textWhite}`
      case 'light':
        return `${baseClasses} ${themeClasses.bgLight} ${themeClasses.textDark}`
      case 'dark':
        return `${baseClasses} ${themeClasses.bgDark} ${themeClasses.textWhite}`
      default:
        return `${baseClasses} bg-white`
    }
  }

  return (
    <section className={`${getSectionClasses()} ${className}`} {...props}>
      {children}
    </section>
  )
}

// Example 4: Navigation with Theme
export const ThemedNavigation = ({
  children,
  className = '',
  ...props
}: any) => {
  return (
    <nav
      className={`${themeClasses.bgPrimary} ${themeClasses.textWhite} shadow-lg ${className}`}
      {...props}
    >
      {children}
    </nav>
  )
}

// Example 5: Footer with Theme
export const ThemedFooter = ({ children, className = '', ...props }: any) => {
  return (
    <footer
      className={`${themeClasses.bgDark} ${themeClasses.textWhite} py-12 ${className}`}
      {...props}
    >
      {children}
    </footer>
  )
}

// Example 6: Form Elements with Theme
export const ThemedInput = ({ className = '', ...props }: any) => {
  return (
    <input
      className={`w-full px-4 py-3 border-2 ${themeClasses.borderPrimary} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent ${className}`}
      {...props}
    />
  )
}

export const ThemedTextarea = ({ className = '', ...props }: any) => {
  return (
    <textarea
      className={`w-full px-4 py-3 border-2 ${themeClasses.borderPrimary} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent resize-none ${className}`}
      {...props}
    />
  )
}

// Example 7: Badge/Label Components
export const ThemedBadge = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}: {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'info'
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  const getBadgeClasses = () => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium'

    switch (variant) {
      case 'primary':
        return `${baseClasses} ${themeClasses.bgPrimary} ${themeClasses.textWhite}`
      case 'secondary':
        return `${baseClasses} ${themeClasses.bgSecondary} ${themeClasses.textWhite}`
      case 'accent':
        return `${baseClasses} ${themeClasses.bgAccent} ${themeClasses.textWhite}`
      case 'success':
        return `${baseClasses} bg-theme-success ${themeClasses.textWhite}`
      case 'info':
        return `${baseClasses} bg-theme-info ${themeClasses.textWhite}`
      default:
        return `${baseClasses} ${themeClasses.bgPrimary} ${themeClasses.textWhite}`
    }
  }

  return (
    <span className={`${getBadgeClasses()} ${className}`} {...props}>
      {children}
    </span>
  )
}

// Example 8: Page Layout with Theme
export const ThemedPageLayout = ({
  children,
  headerVariant = 'primary',
  footerVariant = 'dark',
  className = '',
  ...props
}: {
  children: React.ReactNode
  headerVariant?: 'primary' | 'secondary' | 'dark'
  footerVariant?: 'primary' | 'secondary' | 'dark'
  className?: string
  [key: string]: any
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`} {...props}>
      {/* Header */}
      <header
        className={`${
          headerVariant === 'primary'
            ? themeClasses.bgPrimary
            : headerVariant === 'secondary'
              ? themeClasses.bgSecondary
              : themeClasses.bgDark
        } ${themeClasses.textWhite} shadow-lg`}
      >
        {/* Header content */}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className={`${
          footerVariant === 'primary'
            ? themeClasses.bgPrimary
            : footerVariant === 'secondary'
              ? themeClasses.bgSecondary
              : themeClasses.bgDark
        } ${themeClasses.textWhite} py-12`}
      >
        {/* Footer content */}
      </footer>
    </div>
  )
}
