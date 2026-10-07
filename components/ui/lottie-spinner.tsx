'use client'

import Lottie from 'lottie-react'
import loadingAnimation from '../../public/loading.json'

interface LottieSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LottieSpinner({ 
  size = 'md', 
  className = "" 
}: LottieSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Lottie 
        animationData={loadingAnimation}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
