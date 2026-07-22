'use client';
import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cartStore';

export default function CartPage() {
  const { cart, updateQuantity, clearCart } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold font-heading mb-6">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded shadow text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <p className="text-gray-500 font-bold mb-4">Your cart is empty.</p>
            <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-brand-blue text-white rounded font-bold hover:bg-blue-700">Continue Shopping</button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="bg-white rounded shadow p-6">
                <div className="flex justify-between border-b pb-4 mb-4 font-bold text-gray-700">
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Price</span>
                </div>
                {cart.map(item => (
                  <div key={item.product.id} className="flex flex-col md:flex-row items-center justify-between py-4 border-b last:border-0">
                    <div className="flex items-center gap-4 w-full md:w-1/2">
                      <img src={item.product.image_url || 'https://placehold.co/150/png'} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{item.product.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Seller ID: {item.product.seller_id.split('-')[0]}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 my-4 md:my-0">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100">-</button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100">+</button>
                    </div>

                    <div className="font-bold text-[#B12704]">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-80 shrink-0">
              <div className="bg-white rounded shadow p-6">
                <h2 className="font-bold text-lg mb-4 text-gray-800">Order Summary</h2>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Shipping Estimate</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => window.location.href = '/checkout'}
                  className="w-full bg-[#9f2089] text-white py-3 rounded font-bold shadow hover:bg-pink-800 transition"
                >
                  Proceed to Checkout
                </button>
                <button 
                  onClick={clearCart}
                  className="w-full mt-3 text-red-500 text-sm font-bold hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
