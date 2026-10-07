'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Slide {
  src: string
  label: string
}

interface ApplicationPacketCarouselProps {
  slides: Slide[]
  title?: string
  description?: string
  previewTitle?: string
  previewSubtitle?: string
  disclaimer?: string
}

export default function ApplicationPacketCarousel({
  slides,
  title,
  description,
  previewTitle,
  previewSubtitle,
  disclaimer,
}: ApplicationPacketCarouselProps) {
  if (!slides || slides.length === 0) return null

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold lg:text-2xl">
          {title || 'What you get'}
        </h2>
        <div className="mt-2.5 w-12 border border-primary" />
      </header>

      <p className="text-gray-700">
        {description ||
          'Visa 4 gives you a fully prepared application packet with all required documents.'}
      </p>

      <div className="mx-auto max-w-4xl rounded-xl border bg-white py-6">
        <div className="flex items-center gap-2 pb-4 px-4">
          <hr className="flex-1 border-gray-200" />
          <h3 className="text-sm font-semibold md:text-xl text-center">
            {previewTitle || 'Your Final Application Preview'}
          </h3>
          <hr className="flex-1 border-gray-200" />
        </div>

        <p className="mb-4 text-center text-xs tracking-wide text-gray-500 md:text-sm">
          {previewSubtitle || 'Application Packet'}
        </p>

        {/* Carousel */}
        <div className="relative px-4 md:px-10">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={50}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-custom',
              renderBullet: function (index, className) {
                return `<span class="${className} h-2 w-2 rounded-full bg-gray-300 transition-all data-[active]:w-6 data-[active]:bg-primary"></span>`
              },
            }}
            className="relative"
          >
            {slides.map((slide, i) => (
              <SwiperSlide key={i}>
                <div className="relative h-[400px] w-full md:h-[480px] rounded-xl bg-gray-200 p-2">
                  <img
                    src={
                      slide.src.startsWith('http')
                        ? slide.src
                        : `https://media.atlys.com/b2c/schengen/Images/clp/carousel/${slide.src}`
                    }
                    alt={slide.label}
                    className="h-full w-full rounded-lg object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation */}
          <div className="swiper-button-prev-custom absolute top-1/2 left-2 -translate-y-1/2 z-10 cursor-pointer rounded-full bg-white/50 p-1 hover:bg-white/80 md:left-4">
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </div>
          <div className="swiper-button-next-custom absolute top-1/2 right-2 -translate-y-1/2 z-10 cursor-pointer rounded-full bg-white/50 p-1 hover:bg-white/80 md:right-4">
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </div>
        </div>

        <p className="py-4 text-center text-sm italic text-gray-500">
          {disclaimer ||
            'For illustrative purposes only; actual packet will reflect your details'}
        </p>

        {/* Custom Pagination */}
        <div className="swiper-pagination-custom mt-4 flex justify-center gap-2" />
      </div>
    </section>
  )
}
