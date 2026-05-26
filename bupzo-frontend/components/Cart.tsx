'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useUser } from '@/lib/authStore';
import { getCartItems, removeFromCart, updateCartItemQuantity } from '@/lib/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description?: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Sample data for demo purposes
useEffect(() => {
    const { user } = useUser();
    if (user?.id) {
      loadCartItems(user.id);
    }
  }, []);

const loadCartItems = async (userId: string) => {
    try {
      const items = await getCartItems(userId);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    }
  };

const removeFromCart = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      loadCartItems(useUser().user.id);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

const increaseQuantity = async (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + 1;
      try {
        await updateCartItemQuantity(itemId, newQuantity);
        loadCartItems(useUser().user.id);
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

const decreaseQuantity = async (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      try {
        await updateCartItemQuantity(itemId, newQuantity);
        loadCartItems(useUser().user.id);
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="bg-almond-silk p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-charcoal text-xl">My Cart</h3>
        <span className="text-dim-grey dark:text-dust-grey">{cartItems.length} items</span>
      </div>
      {cartItems.length === 0 ? (
        <p className="text-dim-grey dark:text-dust-grey">Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <ProductCard
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    imageUrl={item.imageUrl}
                    description={item.description}
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="bg-charcoal text-white p-1 rounded-full hover:bg-dusty-mauve transition"
                    >
                      -
                    </button>
                    <span className="text-charcoal">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="bg-charcoal text-white p-1 rounded-full hover:bg-dusty-mauve transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-dim-grey dark:text-dust-grey hover:text-charcoal"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-charcoal font-bold">Total:</span>
              <span className="text-charcoal font-bold">₹{calculateTotal()}</span>
            </div>
            <button
              onClick={() => window.location.href = '/checkout'}
              className="w-full bg-charcoal text-white py-2 rounded-lg hover:bg-dusty-mauve transition mt-4"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}