'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import LottieSpinner from './lottie-spinner'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingKey, setLoadingKey] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
      setLoadingKey(prev => prev + 1)
    }

    const handleComplete = () => {
      setTimeout(() => {
        setIsLoading(false)
      }, 500) // Small delay for smooth transition
    }

    // Listen for route changes
    handleStart()
    handleComplete()

    return () => {
      handleComplete()
    }
  }, [pathname])

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
          <div className="text-center">
            <LottieSpinner size="md" className="mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Smooth page transition wrapper
export function SmoothTransition({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div 
      className={`transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  )
}
