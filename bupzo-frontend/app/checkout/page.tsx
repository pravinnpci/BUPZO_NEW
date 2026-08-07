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

  const TRUST_DONATION_AMOUNT = 2;
  const PLATFORM_FEE = 5;
  const GST_RATE = 0.18;
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const gstAmount = parseFloat((subtotal * GST_RATE).toFixed(2));
  const totalAmountDue = subtotal + gstAmount + shippingCost + PLATFORM_FEE + TRUST_DONATION_AMOUNT;
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

  // A3: Verification gate — block checkout for unverified users
  const isVerified = user?.is_verified || user?.email_verified || user?.phone_verified || user?.google_verified;
  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-6">Please verify your email or phone number in Account Settings before placing an order.</p>
          <button onClick={() => window.location.href = '/account'} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Go to Account Settings</button>
          <button onClick={() => window.location.href = '/'} className="w-full mt-3 text-gray-500 text-sm hover:text-gray-700">Continue Shopping</button>
        </div>
      </div>
    );
  }

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'>('COD');

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      if (paymentMethod === 'COD') {
        alert("✅ Cash on Delivery selected. Your order will be placed and you can pay cash upon delivery!");
      } else if (remainingAmount > 0) {
        alert(`Proceeding to ${paymentMethod} Payment Gateway to pay remaining ₹${remainingAmount.toFixed(2)}`);
      }
      
      const sellerCarts: Record<string, any[]> = {};
      for (const item of cart) {
        if (!sellerCarts[item.product.seller_id]) sellerCarts[item.product.seller_id] = [];
        sellerCarts[item.product.seller_id].push(item);
      }

      const numSellers = Object.keys(sellerCarts).length || 1;
      for (const sellerId of Object.keys(sellerCarts)) {
        const sellerItems = sellerCarts[sellerId];
        const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const sellerShip = shippingCost / numSellers;
        const sellerDonation = TRUST_DONATION_AMOUNT / numSellers;
        const taxableAmount = Math.round((sellerSubtotal / 1.18) * 100) / 100;
        const totalGst = Math.round((sellerSubtotal - taxableAmount) * 100) / 100;
        const shippingGst = Math.round((sellerShip * 0.18) * 100) / 100;
        
        // Intra-state standard calculation for default Tamil Nadu (TN)
        const isIntraState = true;
        const cgst = isIntraState ? Math.round((totalGst / 2) * 100) / 100 : 0;
        const sgst = isIntraState ? Math.round((totalGst / 2) * 100) / 100 : 0;
        const igst = !isIntraState ? totalGst : 0;

        await createCheckout({
          user_id: user.id,
          seller_id: sellerId,
          items: sellerItems.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
          total_amount: sellerSubtotal + sellerShip + sellerDonation,
          order_source: 'WEB',
          payment_gateway: remainingAmount <= 0 ? 'Wallet' : paymentMethod,
          payment_status: paymentMethod === 'COD' ? 'PENDING_COD' : 'COMPLETED',
          trust_donation_amount: sellerDonation,
          taxable_amount: taxableAmount,
          cgst_amount: cgst,
          sgst_amount: sgst,
          igst_amount: igst,
          shipping_gst: shippingGst,
          customer_gstin: (user as any).gstin || '',
          seller_state: 'Tamil Nadu',
          shipping_state: 'Tamil Nadu'
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
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-semibold">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping ({shippingProvider || 'Standard'})</span>
                <span className="font-semibold">{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-semibold">₹{PLATFORM_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trust Donation</span>
                <span className="font-semibold">₹{TRUST_DONATION_AMOUNT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-base">
                <span>Total</span>
                <span>₹{totalAmountDue.toFixed(2)}</span>
              </div>
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

            {/* Multiple Payment Options Aggregator */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-2">Select Payment Method</h3>
              
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="payMode" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">💵 Cash on Delivery (COD)</div>
                    <div className="text-[10px] text-emerald-700">Pay cash upon home delivery</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">FREE COD</span>
              </label>

              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${paymentMethod === 'UPI' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="payMode" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">📱 UPI / PhonePe / GPay</div>
                    <div className="text-[10px] text-gray-500">Instant UPI QR & Mobile App</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Instant</span>
              </label>

              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${paymentMethod === 'CARD' ? 'border-purple-500 bg-purple-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="payMode" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="text-purple-600" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">💳 Credit / Debit Card</div>
                    <div className="text-[10px] text-gray-500">Visa, MasterCard, RuPay</div>
                  </div>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${paymentMethod === 'NETBANKING' ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="payMode" checked={paymentMethod === 'NETBANKING'} onChange={() => setPaymentMethod('NETBANKING')} className="text-amber-600" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">🏦 Net Banking</div>
                    <div className="text-[10px] text-gray-500">All Major Indian Banks</div>
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-between text-base font-bold mt-4 pt-4 border-t border-gray-200 text-gray-900">
              <span>Amount to Pay</span>
              <span>₹{remainingAmount.toFixed(2)}</span>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 bg-[#e52e06] text-white py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Processing...' : (paymentMethod === 'COD' ? `Confirm Order via Cash on Delivery (₹${remainingAmount.toFixed(2)})` : `Pay ₹${remainingAmount.toFixed(2)} via ${paymentMethod}`)}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-3">By placing this order, you agree to BUPZO's Escrow Terms & Conditions.</p>
          </div>
        </div>


      </div>
    </div>
  );
}
