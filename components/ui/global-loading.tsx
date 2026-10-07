'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lottie from 'lottie-react'
import loadingAnimation from '../../public/loading.json'
import TravelLoading from './animated-loading'

export default function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const pathname = usePathname()

  useEffect(() => {
    // Show loading immediately on page load
    setIsLoading(true)
    
    // Set different messages based on the route
    if (pathname?.includes('/auth')) {
      setLoadingMessage('Preparing your account...')
    } else if (pathname?.includes('/admin')) {
      setLoadingMessage('Loading admin panel...')
    } else if (pathname?.includes('/dashboard')) {
      setLoadingMessage('Loading your dashboard...')
    } else if (pathname?.includes('/quotation')) {
      setLoadingMessage('Preparing visa quotation...')
    } else {
      setLoadingMessage('Loading amazing experiences...')
    }

    // Hide loading after page is ready
    const handleLoad = () => {
      setTimeout(() => {
        setIsLoading(false)
      }, 1000) // Show for at least 1 second for smooth experience
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Lottie loading animation - larger size */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 mx-auto mb-6">
          <Lottie 
            animationData={loadingAnimation}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2">
          {pathname?.includes('/auth') ? 'Authenticating' : 
           pathname?.includes('/admin') ? 'Loading Admin Panel' :
           pathname?.includes('/dashboard') ? 'Loading Dashboard' :
           pathname?.includes('/quotation') ? 'Preparing Quotation' :
           'Preparing Your Journey'}
        </h3>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 animate-pulse">
          {loadingMessage}
        </p>
      </div>
    </div>
  )
}

// Page-specific loading components
export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Lottie loading animation - larger size */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 mx-auto mb-6">
          <Lottie 
            animationData={loadingAnimation}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2">Authenticating</h3>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">Please wait while we verify your credentials...</p>
      </div>
    </div>
  )
}

export function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Lottie loading animation - larger size */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 mx-auto mb-6">
          <Lottie 
            animationData={loadingAnimation}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2">Loading Dashboard</h3>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">Preparing your personalized experience...</p>
      </div>
    </div>
  )
}
