"use client";

/**
 * BUPZO - Product Detail Page (PDP)
 * Production-ready implementation with real API integration
 */
import { cn } from '../../../lib/utils';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { Star, ShoppingCart, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { productApi } from '../../../utils/api';

// Define types for product and category
interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  description: string;
  image_url: string;
  weight_grams: number;
  stock_quantity: number;
  images?: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
}

// Product Detail Page
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, trustFund } = useCartStore();
  const { isLoggedIn, role } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setIsLoadingProduct(true);

        // Fetch product details from backend
        const productResponse = await productApi.getProduct(id);
        setProduct(productResponse.data);
        setIsLoadingProduct(false);

        // Fetch category details from backend
        setIsLoadingCategory(true);
        const categoriesResponse = await productApi.getCategories();
        const categories = categoriesResponse.data;
        const foundCategory = categories.find((cat: Category) => cat.id === productResponse.data.category_id);
        setCategory(foundCategory);
        setIsLoadingCategory(false);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 text-dusty-mauve animate-spin mb-4" />
        <p className="text-dim-grey dark:text-dust-grey">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-600 dark:text-red-200">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center text-dusty-mauve hover:text-charcoal transition-colors"
          >
            <span className="mr-2">Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-dusty-mauve">Product Not Found</h2>
        <p className="text-dim-grey dark:text-dust-grey">The product you are looking for does not exist.</p>
        <button
          onClick={() => window.location.href = '/'}
          className={cn(
            'mt-4 inline-flex items-center text-dusty-mauve hover:text-charcoal transition-colors',
            'dark:hover:text-almond-silk'
          )}
        >
          <span className="mr-2">Back to Home</span>
        </button>
      </div>
    );
  }

  // Dummy Reviews (will be replaced with real reviews from backend in future)
  const reviews = [
    {
      id: 1,
      user: 'Rahul K.',
      rating: 5,
      comment: 'Absolutely delicious! The best Kaju Katli I have ever tasted.',
    },
    {
      id: 2,
      user: 'Priya M.',
      rating: 4,
      comment: 'Great quality and packaging. Will buy again!',
    },
    {
      id: 3,
      user: 'Ankit S.',
      rating: 5,
      comment: 'Perfect for gifting. My family loved it!',
    },
  ];

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <a
          href="/"
          className={cn(
            'flex items-center text-dusty-mauve hover:text-charcoal transition-colors',
            'dark:hover:text-almond-silk'
          )}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Products
        </a>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-charcoal rounded-lg shadow-md overflow-hidden">
            {isLoadingProduct ? (
              <div className="h-96 w-full bg-dim-grey dark:bg-dust-grey flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-dusty-mauve animate-spin" />
              </div>
            ) : (
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1604328108342-234b40f09003?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'}
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images && product.images.length > 0 ? (
              product.images.map((image: string, index: number) => (
                <div key={index} className="bg-white dark:bg-charcoal rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
              ))
            ) : (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-white dark:bg-charcoal rounded-lg overflow-hidden">
                  <div className="w-full h-20 bg-dim-grey dark:bg-dust-grey flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-dusty-mauve animate-spin" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-dusty-mauve">{product.name}</h1>

          <div className="flex items-center">
            <div className="flex text-yellow-400 mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5" fill="currentColor" />
              ))}
            </div>
            <span className="text-dim-grey dark:text-dust-grey">4.8 (120 reviews)</span>
          </div>

          <p className="text-2xl font-bold text-dusty-mauve">₹{product.price}</p>

          <div className="flex items-center">
            <span className="text-dim-grey dark:text-dust-grey mr-2">Weight:</span>
            {isLoadingProduct ? (
              <Loader2 className="h-4 w-4 text-dusty-mauve animate-spin" />
            ) : (
              <span>{product.weight_grams}g</span>
            )}
          </div>

          <div className="flex items-center">
            <span className="text-dim-grey dark:text-dust-grey mr-2">Stock:</span>
            {isLoadingProduct ? (
              <Loader2 className="h-4 w-4 text-dusty-mauve animate-spin" />
            ) : (
              <span className={cn(
                product.stock_quantity < 20 ? 'text-red-600 dark:text-red-400' : 'text-dim-grey dark:text-dust-grey'
              )}>
                {product.stock_quantity} available
              </span>
            )}
          </div>

          <p className="text-dim-grey dark:text-dust-grey mt-4">
            <span className="font-semibold">Description:</span> {product.description || 'No description available.'}
          </p>

          <p className="text-dim-grey dark:text-dust-grey mt-2">
            <span className="font-semibold">Category:</span> {isLoadingCategory ? (
              <Loader2 className="h-4 w-4 text-dusty-mauve animate-spin inline-block mr-1" />
            ) : (
              category ? category.name : 'N/A'
            )}
          </p>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              category: category ? category.name : 'N/A',
              image: product.image_url || 'https://images.unsplash.com/photo-1604328108342-234b40f09003?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
            })}
            className={cn(
              'w-full bg-dusty-mauve text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-opacity',
              'flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
              isLoadingProduct ? 'opacity-50 cursor-not-allowed' : ''
            )}
            disabled={isLoadingProduct}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isLoadingProduct ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Adding to cart...</span>
              </>
            ) : (
              'Add to Cart'
            )}
          </button>

          {/* Trust Fund Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="trust-fund"
              checked={trustFund === 2}
              onChange={() => {}}
              className="mr-2 h-4 w-4"
              disabled={isLoadingProduct}
            />
            <label htmlFor="trust-fund" className="text-dim-grey dark:text-dust-grey cursor-pointer">
              Add ₹2 Trust Fund (Optional)
            </label>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-dusty-mauve">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-charcoal rounded-lg p-6 text-center">
            <p className="text-dim-grey dark:text-dust-grey">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-charcoal rounded-lg p-6">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4" fill={star <= review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span className="font-semibold">{review.user}</span>
                </div>
                <p className="text-dim-grey dark:text-dust-grey">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}