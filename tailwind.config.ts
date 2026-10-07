import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        xs: '365px',
        ...defaultTheme.screens,
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
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
            green: '#F1F5EB', // Light Green
            purple: '#F8F7FA', // Light Purple
          },
          success: '#14532d', // Green
          info: '#1e3a8a', // Blue
        },
        // Keep existing shadcn/ui colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        slide: {
          '0%, 16%': { transform: 'translateY(0%)' },
          '20%, 36%': { transform: 'translateY(-16.66%)' },
          '40%, 56%': { transform: 'translateY(-33.33%)' },
          '60%, 76%': { transform: 'translateY(-50%)' },
          '80%, 96%': { transform: 'translateY(-66.66%)' },
          '100%': { transform: 'translateY(-83.33%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        scroll: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-33.33%)' }, // Moves 1/3 of the width (since we have 3 sets of logos)
        },
      },
      animation: {
        slide: 'slide 10s cubic-bezier(0.2, 0.2, 0.2, 1) infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        scroll: 'scroll 30s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
