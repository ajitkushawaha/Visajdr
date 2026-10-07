'use client'
import React, { useEffect, useState } from 'react'

interface CountrySwiperProps {
  countries: string[]
  className?: string
}

// No transition needed

const CountrySwiper: React.FC<CountrySwiperProps> = ({
  countries,
  className,
}) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (countries.length <= 1) return
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % countries.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [countries])

  return (
    <strong
      className={`block text-brand-primary text-3xl md:text-4xl leading-none m-0 p-0 ${className || ''}`}
      style={{
        minHeight: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {countries[index]}
    </strong>
  )
}

export default CountrySwiper
