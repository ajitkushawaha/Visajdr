"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Check,
  Eye,
  Download
} from "lucide-react"
import { adminThemeClasses } from "@/lib/adminTheme"

type ThemeVariant = 'light' | 'dark' | 'auto'

interface ThemeOption {
  id: ThemeVariant
  name: string
  description: string
  icon: React.ReactNode
  preview: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
  }
}

const themeOptions: ThemeOption[] = [
  {
    id: 'light',
    name: 'Light Theme',
    description: 'Clean and bright interface',
    icon: <Sun className="h-4 w-4" />,
    preview: 'bg-white border-slate-200',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1e293b'
    }
  },
  {
    id: 'dark',
    name: 'Dark Theme',
    description: 'Easy on the eyes for night work',
    icon: <Moon className="h-4 w-4" />,
    preview: 'bg-slate-900 border-slate-700',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      background: '#0f172a',
      text: '#f1f5f9'
    }
  },
  {
    id: 'auto',
    name: 'Auto Theme',
    description: 'Follows system preference',
    icon: <Monitor className="h-4 w-4" />,
    preview: 'bg-gradient-to-r from-white to-slate-900 border-slate-400',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: 'auto',
      text: 'auto'
    }
  }
]

export function AdminThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>('light')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('admin-theme') as ThemeVariant
    if (savedTheme && themeOptions.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (theme: ThemeVariant) => {
    const root = document.documentElement
    
    switch (theme) {
      case 'light':
        root.classList.remove('dark')
        root.style.setProperty('--admin-bg-primary', '#ffffff')
        root.style.setProperty('--admin-bg-secondary', '#f8fafc')
        root.style.setProperty('--admin-text-primary', '#1e293b')
        root.style.setProperty('--admin-text-secondary', '#64748b')
        break
      case 'dark':
        root.classList.add('dark')
        root.style.setProperty('--admin-bg-primary', '#0f172a')
        root.style.setProperty('--admin-bg-secondary', '#1e293b')
        root.style.setProperty('--admin-text-primary', '#f1f5f9')
        root.style.setProperty('--admin-text-secondary', '#94a3b8')
        break
      case 'auto':
        // Remove manual theme classes and let system preference take over
        root.classList.remove('dark')
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark')
        }
        break
    }
  }

  const handleThemeChange = (theme: ThemeVariant) => {
    setCurrentTheme(theme)
    applyTheme(theme)
    localStorage.setItem('admin-theme', theme)
    setIsOpen(false)
  }

  const currentThemeOption = themeOptions.find(t => t.id === currentTheme)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Palette className="h-4 w-4" />
        <span>Theme</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Choose Theme</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {themeOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    currentTheme === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => handleThemeChange(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {option.icon}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {option.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Color Preview */}
                      <div className="flex space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-slate-200"
                          style={{ backgroundColor: option.colors.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border border-slate-200"
                          style={{ backgroundColor: option.colors.secondary }}
                        />
                      </div>
                      
                      {currentTheme === option.id && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Theme Preview */}
                  <div className={`mt-2 p-2 rounded border ${option.preview}`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Current: {currentThemeOption?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      // Preview functionality could be added here
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
