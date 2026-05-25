'use client'

import { useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_combo: boolean
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        {product.is_combo && (
          <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
            Combo
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-medium text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-medium text-primary-600 dark:text-primary-400">
            ₹{product.price.toFixed(2)}
          </span>
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-md text-sm transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}