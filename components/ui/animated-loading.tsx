'use client'

import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import loadingAnimation from '../../public/loading.json'

interface AnimatedLoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'plane' | 'globe'
  className?: string
}

export default function AnimatedLoading({ 
  message = "Loading...", 
  size = 'md',
  variant = 'spinner',
  className = ""
}: AnimatedLoadingProps) {
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    if (message === "Loading...") {
      const messages = ["Loading...", "Preparing your experience...", "Almost ready...", "Final touches..."]
      let index = 0
      const interval = setInterval(() => {
        setCurrentMessage(messages[index])
        index = (index + 1) % messages.length
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [message])

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const renderAnimation = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`} />
        )
      
      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-blue-600 rounded-full animate-pulse"
                style={{ 
                  height: '20px',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )
      
      case 'plane':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-full h-full text-blue-600 animate-bounce" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
          </div>
        )
      
      case 'globe':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-full h-full text-blue-600 animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        )
      
      default: // spinner
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderAnimation()}
      <p className={`text-gray-600 ${textSizeClasses[size]} font-medium animate-pulse`}>
        {currentMessage}
      </p>
    </div>
  )
}

// Travel-themed loading component with Lottie
export function TravelLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Lottie loading animation - responsive size */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden shadow-lg">
        <Lottie 
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/10 rounded-full"></div>
      </div>

      {/* Loading text with travel theme */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Preparing Your Journey
        </h3>
        <p className="text-sm text-gray-600 animate-pulse">
          Loading amazing travel experiences...
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex space-x-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// Visa processing loading component with Lottie
export function VisaProcessingLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Lottie loading animation - responsive size */}
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden shadow-lg">
        <Lottie 
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Processing checkmark overlay - responsive */}
        <div className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Processing Your Application
        </h3>
        <p className="text-sm text-gray-600">
          Please wait while we verify your documents...
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  )
}
