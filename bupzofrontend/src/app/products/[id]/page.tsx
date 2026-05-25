"use client";

import { useParams } from 'next/navigation';
import { Heart, ShoppingCart, ArrowLeft, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const productDetails = {
  '1': {
    id: '1',
    name: 'Nagore Special Ghee Halwa 500g',
    price: 450.00,
    imageUrl: 'https://picsum.photos/id/101/600/400',
    description: 'Rich and authentic ghee halwa from Nagore, made with premium ingredients and traditional recipes. Perfect for festivals and special occasions.',
    weight: '500g',
    rating: 4.8,
    reviews: 128,
    seller: 'Nagore Halwa House',
    stock: 100,
    features: [
      'Made with pure ghee',
      'No artificial flavors',
      'Handcrafted by local artisans',
      'Perfect for gifting'
    ],
    specifications: {
      'Ingredients': 'Ghee, Sugar, Cardamom, Saffron',
      'Shelf Life': '30 days from manufacturing date',
      'Storage': 'Keep in a cool, dry place'
    }
  },
  '2': {
    id: '2',
    name: 'Premium Mixed Dry Fruits 1kg',
    price: 999.00,
    imageUrl: 'https://picsum.photos/id/102/600/400',
    description: 'Assorted premium quality dry fruits and nuts for a healthy snack. Packed with essential nutrients and perfect for daily consumption.',
    weight: '1kg',
    rating: 4.5,
    reviews: 87,
    seller: 'Funky Toys Store',
    stock: 50,
    features: [
      '100% Natural',
      'No preservatives',
      'Rich in vitamins and minerals',
      'Great for weight management'
    ],
    specifications: {
      'Ingredients': 'Almonds, Cashews, Walnuts, Pistachios, Raisins, Dates',
      'Shelf Life': '6 months from manufacturing date',
      'Storage': 'Keep in an airtight container'
    }
  },
  '3': {
    id: '3',
    name: 'Educational Building Blocks Set',
    price: 750.00,
    imageUrl: 'https://picsum.photos/id/103/600/400',
    description: 'Colorful building blocks set for creative learning and development. Helps in improving motor skills, creativity, and problem-solving abilities.',
    weight: '1.2kg',
    rating: 4.7,
    reviews: 65,
    seller: 'Funky Toys Store',
    stock: 200,
    features: [
      'Eco-friendly materials',
      'Non-toxic and safe',
      'Encourages STEM learning',
      'Durable and long-lasting'
    ],
    specifications: {
      'Pieces': '250+',
      'Colors': '10+',
      'Age Group': '3-8 years',
      'Material': 'Bamboo'
    }
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const product = productDetails[productId] || productDetails['1'];
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    alert(`Added ${quantity} x ${product.name} to cart!`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            className="flex items-center text-primary-500 hover:text-primary-600 transition-colors"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="relative h-96 w-full">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                onClick={toggleFavorite}
              >
                <Heart
                  className={`h-6 w-6 text-neutral-600 dark:text-neutral-300 ${
                    isFavorite ? 'text-red-500' : ''
                  }`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">{product.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5" fill={product.rating > i ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary-500">₹{product.price.toFixed(2)}</span>
                <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400 line-through">₹{Math.round(product.price * 1.2).toFixed(2)}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Quantity</label>
                  <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded">
                    <button
                      className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button
                      className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  className="w-full btn-primary py-3"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 inline-block mr-2" />
                  Add to Cart
                </button>
              </div>

              <div>
                <button className="w-full btn-accent py-3">
                  <span className="inline-block mr-2">🔥</span>
                  1-Click Checkout
                </button>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Product Details</h2>
              <p className="text-neutral-600 dark:text-neutral-400">{product.description}</p>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Weight</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{product.weight}</p>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Seller</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{product.seller}</p>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Stock Available</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{product.stock} items</p>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Features</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-neutral-600 dark:text-neutral-400">{feature}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Specifications</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <li key={index} className="text-neutral-600 dark:text-neutral-400">
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}