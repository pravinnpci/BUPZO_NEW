'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    {
      title: 'Diwali Special Offers',
      description: 'Get up to 50% off on all Nagore sweets',
      image: 'https://picsum.photos/id/200/1200/400',
      link: '/category/halwa'
    },
    {
      title: 'New Arrivals: Smart Toys',
      description: 'Explore the latest collection of educational toys',
      image: 'https://picsum.photos/id/201/1200/400',
      link: '/category/toys'
    },
    {
      title: 'Premium Dry Fruits',
      description: 'Assorted dry fruits for a healthy snack',
      image: 'https://picsum.photos/id/202/1200/400',
      link: '/category/dry-fruits'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="relative w-full max-w-6xl mx-auto mb-12">
      <div className="relative h-96 overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full h-full relative bg-gray-100 dark:bg-gray-800"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-8 flex flex-col justify-center h-full">
                <h2 className="text-3xl font-heading font-bold text-white mb-3">
                  {slide.title}
                </h2>
                <p className="text-lg text-white mb-6">
                  {slide.description}
                </p>
                <a
                  href={slide.link}
                  className="inline-block bg-white text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Shop Now
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 text-white p-2 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 text-white p-2 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50 dark:bg-gray-800/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}