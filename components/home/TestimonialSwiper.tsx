'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { UsersRound, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Testimonial {
  _id?: string;
  text: string;
  name: string;
  date: string;
  rating?: number;
  avatar?: string;
  order: number;
  status: "active" | "inactive";
}

interface TestimonialsSliderProps {
  testimonials?: Testimonial[];
}

const TestimonialsSlider = ({ testimonials: propTestimonials }: TestimonialsSliderProps) => {
  const defaultTestimonials = [
    {
      text: `Had a great experience here. Jewellery designs were amazing also the staff assisted us so well,
      especially Aliya. Been so kind enough to help us in choosing the design; she was really very good
      at her work. Also it was really good experience shopping at the place.`,
      name: 'Ulhas Jewellers',
      date: '04 Jul 2024',
      rating: 5,
      order: 0,
      status: 'active' as const
    },
    {
      text: `The visa process was super smooth and efficient. The team was helpful throughout the documentation.`,
      name: 'Mohit Sharma',
      date: '15 Jul 2024',
      rating: 5,
      order: 1,
      status: 'active' as const
    },
  ];

  const testimonials = propTestimonials && propTestimonials.length > 0 ? propTestimonials : defaultTestimonials;

  return (
    <div className="relative w-full max-w-sm md:max-w-xl mx-auto px-4 py-5 border border-gray-200 rounded-2xl ">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: '.swiper-next',
          prevEl: '.swiper-prev',
        }}
        className="overflow-hidden"
      >
        {testimonials.map((item, idx) => (
          <SwiperSlide key={idx}>
            <div
              className="w-full relative  bg-white min-h-[300px] flex flex-col justify-between overflow-hidden"
            >
              <div
                className="absolute top-0 right-0  inset-0 z-0 opacity-5
             bg-[url('/visa/quote.png')] 
             bg-no-repeat 
             bg-contain 
             bg-[position:right] 
             
            ">
              </div>

              <p className="relative z-10 text-gray-800 text-base md:text-lg leading-relaxed">
                "{item.text}"
              </p>
              <div className="relative z-10 flex items-center gap-3 mt-6">
                <div className="bg-[#07034F] p-2 rounded-full text-white">
                  <UsersRound size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-gray-900 font-semibold">{item.name}</p>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < item.rating! ? "text-yellow-400 fill-current" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="absolute bottom-2 right-4 flex gap-3 z-10">
        <button className="swiper-prev bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition">
          <ArrowLeft size={20} />
        </button>
        <button className="swiper-next bg-[#07034F] hover:bg-[#1f1c84] text-white p-2 rounded-full transition">
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TestimonialsSlider;
