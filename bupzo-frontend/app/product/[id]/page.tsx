'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ProductPreviewModal from '@/components/ProductPreviewModal';
import { Product, API_BASE_URL } from '@/lib/api';
import { Navbar } from '@/components/Navbar';

import { useCartStore } from '@/lib/cartStore';
import { addToWishlist, getWishlistItems } from '@/lib/api';
import { useUser } from '@/lib/authStore';

export default function ProductPage() {
  const { id } = useParams() as { id: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const { user } = useUser();
  const cartStore = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = (product: Product) => {
    cartStore.addToCart(product);
    alert(`"${product.name}" added to cart!`);
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!user || !user.id || !user.phone) {
      alert("Please login to add items to your wishlist.");
      return;
    }
    try {
      await addToWishlist(product.id, user.id);
      alert(`"${product.name}" added to wishlist!`);
      const wishs = await getWishlistItems(user.id);
      cartStore.setWishlist(wishs);
    } catch (err: any) {
      console.warn(err);
      alert(err.message || "Failed to add item to wishlist.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">Loading product details...</div>;
  
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
    <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
    <button onClick={() => router.push('/')} className="text-blue-500 underline">Return to Home</button>
  </div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar 
        cartCount={cartStore.cart.reduce((sum, i) => sum + i.quantity, 0)} 
        wishlistCount={cartStore.wishlist.length} 
        unreadMsgs={0} 
        onTabChange={(t) => router.push('/?tab=' + t)}
        onAuthClick={() => router.push('/')}
        onCartClick={() => router.push('/')}
      />
      <div className="flex-1 relative pt-20">
        <ProductPreviewModal 
          product={product} 
          onClose={() => router.push('/')} 
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      </div>
    </div>
  );
}
