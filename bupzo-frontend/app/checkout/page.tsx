'use client';
import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cartStore';
import { useUser } from '@/lib/authStore';
import { createCheckout } from '@/lib/api';

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [walletAmountToUse, setWalletAmountToUse] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [shippingCost, setShippingCost] = useState(0);
  const [shippingProvider, setShippingProvider] = useState('');

  useEffect(() => {
    if (cart.length > 0) {
      // Simulate multiple shipping APIs
      const dhl = 50 + Math.random() * 20;
      const bluedart = 45 + Math.random() * 25;
      const delhivery = 40 + Math.random() * 15;
      
      const minRate = Math.min(dhl, bluedart, delhivery);
      setShippingCost(Math.round(minRate));
      setShippingProvider(minRate === dhl ? 'DHL' : minRate === bluedart ? 'BlueDart' : 'Delhivery');
    }
  }, [cart.length]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmountDue = subtotal + shippingCost; 
  const maxWalletUsable = Math.min(totalAmountDue, user?.walletBalance || 0);
  const remainingAmount = totalAmountDue - walletAmountToUse;

  useEffect(() => {
    setWalletAmountToUse(maxWalletUsable);
  }, [maxWalletUsable]);

  if (!mounted) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-sm">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your order has been successfully placed.</p>
          <button onClick={() => window.location.href = '/'} className="bg-brand-blue text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (!user || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Your cart is empty or you are not logged in.</h2>
          <button onClick={() => window.location.href = '/'} className="bg-brand-blue text-white px-6 py-2 rounded font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Logic for split payment
      if (remainingAmount > 0) {
        alert(`Proceeding to Payment Gateway to pay the remaining ₹${remainingAmount.toFixed(2)}`);
        // Here we simulate the gateway success
      }
      
      const sellerCarts: Record<string, any[]> = {};
      for (const item of cart) {
        if (!sellerCarts[item.product.seller_id]) sellerCarts[item.product.seller_id] = [];
        sellerCarts[item.product.seller_id].push(item);
      }

      for (const sellerId of Object.keys(sellerCarts)) {
        const sellerItems = sellerCarts[sellerId];
        const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        
        await createCheckout({
          user_id: user.id,
          seller_id: sellerId,
          items: sellerItems.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
          total_amount: sellerSubtotal,
          order_source: 'WEB',
          payment_gateway: remainingAmount > 0 ? 'Razorpay' : 'Wallet'
        });
      }
      
      clearCart();
      setSuccess(true);
    } catch (e: any) {
      alert(e.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
        
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <p className="font-bold">{user.name} (Personal Address)</p>
              <p className="text-sm text-gray-700 mt-1">{user.address}</p>
              <p className="text-sm text-gray-700">Pincode: {user.pincode}</p>
              <p className="text-sm text-gray-700">Phone: {user.phone}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-4 border-b pb-4">
                  <img src={item.product.image_url || 'https://placehold.co/150/png'} alt={item.product.name} className="w-16 h-16 rounded object-cover" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{item.product.name}</h3>
                    <p className="text-gray-600 text-xs mt-1">Qty: {item.quantity}</p>
                    <p className="font-bold text-[#B12704] mt-1">₹{item.product.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-6 shrink-0">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Payment Summary</h2>
            
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Total Item Price</span>
              <span className="font-bold">₹{totalAmountDue.toFixed(2)}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={walletAmountToUse > 0} 
                  onChange={(e) => setWalletAmountToUse(e.target.checked ? maxWalletUsable : 0)}
                  disabled={maxWalletUsable === 0}
                  className="rounded text-brand-blue"
                />
                <span className="text-sm font-bold text-gray-800">Use Wallet Balance</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">Available: ₹{(user?.walletBalance || 0).toFixed(2)}</p>
              
              {walletAmountToUse > 0 && (
                <div className="flex justify-between text-sm mt-3 ml-6 text-green-600 font-bold">
                  <span>Wallet Applied</span>
                  <span>-₹{walletAmountToUse.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-base font-bold mt-4 pt-4 border-t border-gray-200 text-gray-900">
              <span>Amount to Pay</span>
              <span>₹{remainingAmount.toFixed(2)}</span>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 bg-[#9f2089] text-white py-3 rounded font-bold hover:bg-pink-800 transition"
            >
              {loading ? 'Processing...' : (remainingAmount > 0 ? `Pay ₹${remainingAmount.toFixed(2)} via Gateway` : 'Place Order')}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-3">By placing this order, you agree to BUPZO's Terms & Conditions.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
