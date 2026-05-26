'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useUser } from '@/lib/authStore';
import { getWishlistItems, removeFromWishlist } from '@/lib/api';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // Sample data for demo purposes
useEffect(() => {
    const { user } = useUser();
    if (user?.id) {
      loadWishlistItems(user.id);
    }
  }, []);

const loadWishlistItems = async (userId: string) => {
    try {
      const items = await getWishlistItems(userId);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      setWishlistItems([]);
    }
  };

const removeFromWishlist = async (itemId: string) => {
    try {
      await removeFromWishlist(itemId);
      loadWishlistItems(useUser().user.id);
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  return (
    <div className="bg-almond-silk p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-charcoal text-xl">My Wishlist</h3>
        <span className="text-dim-grey dark:text-dust-grey">{wishlistItems.length} items</span>
      </div>
      {wishlistItems.length === 0 ? (
        <p className="text-dim-grey dark:text-dust-grey">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {wishlistItems.map(item => (
            <div key={item.id} className="relative">
              <ProductCard
                id={item.id}
                name={item.name}
                price={item.price}
                imageUrl={item.imageUrl}
                description={item.description}
              />
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-2 right-2 bg-white dark:bg-charcoal text-charcoal dark:text-almond-silk p-1 rounded-full hover:bg-dust-grey transition"
              >
                ❤️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}