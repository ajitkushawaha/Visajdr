'use client'

import { Star, Quote } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const testimonials = [
  {
    content:
      'Had a great experience here. Jewellery designs were amazing also the staff assisted us so well, especially Aliya. Been so kind enough to help us in choosing the design; she was really very good at her work. Also it was really good experience shopping at the place.',
    author: 'Ulhas Jewellers',
    date: '04 Jul 2024',
    rating: 5,
    initial: 'U',
  },
  {
    content:
      'The visa process was super smooth and efficient. The team was helpful throughout the documentation.',
    author: 'Mohit Sharma',
    date: '15 Jul 2024',
    rating: 5,
    initial: 'M',
  },
  {
    content:
      'I was worried about my visa application, but the team made it so easy. They guided me through every step and I got my visa on time. Highly recommended!',
    author: 'Priya Patel',
    date: '20 Jul 2024',
    rating: 5,
    initial: 'P',
  },
]

export default function AboutTestimonials({
  initialData,
}: {
  initialData?: any
}) {
  const {
    badgeText = 'Client Testimonials',
    title = 'What People Say About Us',
    description = "Don't just take our word for it. Hear it straight from the jet-setters themselves.",
    testimonials: dynamicTestimonials = [],
  } = initialData || {}

  const displayTestimonials =
    dynamicTestimonials && dynamicTestimonials.length > 0
      ? dynamicTestimonials.map((t: any) => ({
          content: t.text,
          author: t.name,
          date: t.date,
          rating: t.rating || 5,
          initial: t.name.charAt(0).toUpperCase(),
        }))
      : testimonials

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-brand-accent font-semibold tracking-wider uppercase text-sm mb-2 block">
            {badgeText}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-gray-900">
            {title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 32,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32,
              },
            }}
            className="pb-12 !px-4"
          >
            {displayTestimonials.map((testimonial: any, index: number) => (
              <SwiperSlide key={index} className="!h-auto !flex">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full w-full select-none cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? 'text-brand-accent fill-brand-accent'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="relative mb-6 flex-grow">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-brand-accent/20 rotate-180" />
                    <p className="text-gray-600 relative z-10 leading-relaxed pt-2">
                      {testimonial.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent font-bold text-lg">
                      {testimonial.initial}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                        {testimonial.author}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {testimonial.date}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
