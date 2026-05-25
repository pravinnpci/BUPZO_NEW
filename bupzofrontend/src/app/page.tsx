'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import HeroCarousel from '@/components/HeroCarousel'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_combo: boolean
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-300 mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <HeroCarousel />

        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold mb-8">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.image_url}
                isCombo={product.is_combo}
              />
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold mb-8">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Halwa', image: 'https://picsum.photos/id/10/200/300' },
              { name: 'Dry Fruits', image: 'https://picsum.photos/id/11/200/300' },
              { name: 'Toys', image: 'https://picsum.photos/id/12/200/300' },
              { name: 'Electronics', image: 'https://picsum.photos/id/13/200/300' },
              { name: 'Ceramics', image: 'https://picsum.photos/id/14/200/300' },
              { name: 'Home Appliances', image: 'https://picsum.photos/id/15/200/300' }
            ].map((category, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800"
              >
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={`/category/${category.name.toLowerCase().replace(' ', '-')}`}
                    className="text-white text-center px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <span className="font-medium">{category.name}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}