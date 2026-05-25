"use client";

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import ProductCard from '@/components/ProductCard'

export default function Home() {
  const { theme } = useTheme()
  const [products, setProducts] = useState([])

  useEffect(() => {
    // Fetch products from the API
    fetch('http://localhost:8003/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data)
      })
      .catch(error => {
        console.error('Error fetching products:', error)
        // Use mock data if API fails
        setProducts([
          {
            id: '1',
            name: 'Nagore Special Ghee Halwa 500g',
            description: 'Rich and authentic ghee halwa from Nagore',
            price: 450.00,
            image_url: 'https://picsum.photos/id/101/200/300',
            is_combo: false
          },
          {
            id: '2',
            name: 'Premium Mixed Dry Fruits 1kg',
            description: 'Assorted dry fruits for a healthy snack',
            price: 999.00,
            image_url: 'https://picsum.photos/id/102/200/300',
            is_combo: false
          },
          {
            id: '3',
            name: 'Educational Building Blocks Set',
            description: 'Colorful blocks for creative learning',
            price: 750.00,
            image_url: 'https://picsum.photos/id/103/200/300',
            is_combo: false
          },
          {
            id: '4',
            name: 'Wireless Bluetooth Earbuds',
            description: 'High-quality sound with long battery life',
            price: 1299.00,
            image_url: 'https://picsum.photos/id/104/200/300',
            is_combo: false
          },
          {
            id: '5',
            name: 'Halwa & Dry Fruits Combo',
            description: 'Special combo pack of Nagore Halwa and Dry Fruits',
            price: 1300.00,
            image_url: 'https://picsum.photos/id/105/200/300',
            is_combo: true
          }
        ])
      })
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-primary-500 to-mauve-600 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Welcome to BUPZO
          </h1>
          <p className="text-xl md:text-2xl text-white mb-6 max-w-2xl mx-auto">
            Your Trusted Multi-Vendor Marketplace for Nagore Specialties, Toys, Electronics, and More
          </p>
          <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-100 transition-colors">
            Shop Now
          </button>
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="py-12 px-4">
        <h2 className="text-3xl font-heading font-bold mb-8 text-center">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}