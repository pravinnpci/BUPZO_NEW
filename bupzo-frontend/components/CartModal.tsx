import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/api';
import { fetchShippingRates } from '@/lib/api';

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  updateQuantity: (id: string, qty: number) => void;
  user: any;
  onCheckout: (walletAmountUsed: number, shippingCost: number, shippingPartner: string, trustDonation?: number) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: any;
  handleApplyPromo: (e: any, cartTotal: number) => void;
};

export default function CartModal({
  isOpen, onClose, cart, updateQuantity, user, onCheckout,
  promoCode, setPromoCode, appliedPromo, handleApplyPromo
}: CartModalProps) {
  const [cartTotal, setCartTotal] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [shippingPartners, setShippingPartners] = useState<{name: string, cost: number, estimated_delivery_days?: string}[]>([
    { name: 'Standard Delivery', cost: 50, estimated_delivery_days: '3-5' }
  ]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  
  // Auto-select cheapest
  const bestShipping = shippingPartners.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
  const [selectedShipping, setSelectedShipping] = useState(bestShipping.name);

  useEffect(() => {
    let total = 0;
    cart.forEach((item: any) => {
      total += (item.product?.price || 0) * item.quantity;
    });
    setCartTotal(total);
  }, [cart]);

  const handleSaveAddress = async () => {
    if (!user || !deliveryAddress) return;
    try {
      const parts = deliveryAddress.split(',');
      const addr = {
        name: "Cart Address",
        street: parts[0] || deliveryAddress,
        city: parts[1]?.trim() || "City",
        state: "State",
        zip_code: user.pincode || "000000"
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004'}/api/addresses/?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addr)
      });
      if (res.ok) alert('Address saved successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004'}/api/addresses/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSavedAddresses(data);
            if (data.length > 0 && !deliveryAddress) {
              const first = data[0];
              setDeliveryAddress(`${first.name}, ${first.street}, ${first.city}, ${first.state} - ${first.zip_code}`);
            }
          }
        })
        .catch(() => {});
        
      if (!deliveryAddress && user?.address) {
        setDeliveryAddress(`${user.address}, ${user.pincode || ''}`);
      }
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen && user?.pincode) {
      setLoadingShipping(true);
      // Calculate total weight (assuming 1kg per item for now if not available)
      const totalWeight = cart.reduce((sum, item) => sum + ((item.product as any).weight_grams ? (item.product as any).weight_grams/1000 : 1) * item.quantity, 0);
      const uniqueSellers = new Set(cart.map(item => item.product.seller_id)).size || 1;
      fetchShippingRates(user.pincode, totalWeight)
        .then(rates => {
          if (rates && rates.length > 0) {
            const multiSellerRates = rates.map(r => ({ ...r, cost: r.cost * uniqueSellers }));
            setShippingPartners(multiSellerRates);
            const bestShipping = multiSellerRates.reduce((prev: any, curr: any) => prev.cost < curr.cost ? prev : curr);
            setSelectedShipping(bestShipping.name);
          }
        })
        .catch(err => console.error("Error fetching shipping rates:", err))
        .finally(() => setLoadingShipping(false));
    }
  }, [isOpen, user?.pincode, cart.length]);

  const [addDonation, setAddDonation] = useState<boolean>(true);
  const donationAmount = addDonation ? 2 : 0;

  if (!isOpen) return null;

  const discount = appliedPromo?.discount_amount || 0;
  const totalAfterDiscount = Math.max(0, cartTotal - discount);
  
  const currentShippingCost = shippingPartners.find(p => p.name === selectedShipping)?.cost || 0;
  const totalWithDonation = totalAfterDiscount + currentShippingCost + donationAmount;
  
  const maxWalletUsable = user?.wallet_balance ? Math.min(totalWithDonation, parseFloat(user.wallet_balance)) : 0;
  const walletAmountUsed = useWallet ? maxWalletUsable : 0;
  const finalTotal = Math.max(0, totalWithDonation - walletAmountUsed);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Side Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left border-l border-gray-200">
        {/* Colorful Gradient Header */}
        <div className="bg-gradient-to-r from-[#232f3e] via-[#2c3b4e] to-[#e52e06] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-xl font-extrabold uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">shopping_cart</span>
            My Cart ({cart.length})
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition bg-white/10 hover:bg-white/20 p-1.5 rounded-full">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f8f8]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-6xl text-gray-300">remove_shopping_cart</span>
              <p className="text-gray-500 font-medium">Your cart is currently empty.</p>
              <button onClick={onClose} className="bg-[#e52e06] text-white px-6 py-2 rounded-full font-bold uppercase hover:bg-[#cc2805] transition mt-4">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={item?.product?.id || idx} className="bg-white p-4 rounded shadow-sm flex gap-4 relative">
                  <div className="w-20 h-20 bg-gray-100 rounded p-2 flex items-center justify-center">
                    <img src={item?.product?.image_url || 'https://placehold.co/150/png'} alt={item?.product?.name || 'Unknown Product'} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-[#232f3e] text-sm line-clamp-1">{item?.product?.name || 'Unknown Product'}</h3>
                    <p className="text-[#e52e06] font-extrabold text-sm">₹{(item?.product?.price || 0).toLocaleString()}</p>
                    
                    <div className="flex items-center border border-gray-200 rounded text-sm">
                      <button 
                        onClick={() => updateQuantity(item?.product?.id, item.quantity - 1)}
                        className="bg-gray-50 hover:bg-gray-100 px-3 py-1 text-gray-600 transition"
                      >-</button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item?.product?.id, item.quantity + 1)}
                        className="bg-gray-50 hover:bg-gray-100 px-3 py-1 text-gray-600 transition"
                      >+</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateQuantity(item?.product?.id, 0)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6 space-y-4">
            {/* Promo Code */}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Promo Code" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#e52e06]"
              />
              <button 
                onClick={(e) => handleApplyPromo(e, cartTotal)}
                className="bg-[#232f3e] text-white px-4 py-2 rounded text-sm font-bold uppercase hover:bg-[#1a232e] transition"
              >Apply</button>
            </div>
            
            <div className="space-y-2 text-sm font-medium text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedPromo?.code || 'Promo'})</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm font-medium border-t border-gray-200 pt-3">
                <span className="text-gray-600">Shipping Partner</span>
                <select 
                   value={selectedShipping}
                   onChange={(e) => setSelectedShipping(e.target.value)}
                   className="text-xs p-1 border rounded bg-gray-50 outline-none cursor-pointer"
                >
                  {shippingPartners.map(p => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.name === bestShipping.name ? '(Best)' : ''} - ₹{p.cost}
                    </option>
                  ))}
                </select>
              </div>

              {/* ₹2 Trust Donation Row */}
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-sm flex justify-between items-center my-2">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold text-base">🛡️</span>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-xs">Escrow Trust Donation</h4>
                    <p className="text-[11px] text-emerald-700">Add ₹2 to seller escrow trust fund</p>
                  </div>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-emerald-900 bg-white px-2 py-1 rounded border border-emerald-300 shadow-sm">
                  <input type="checkbox" checked={addDonation} onChange={(e) => setAddDonation(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                  +₹2
                </label>
              </div>

              <div className="flex justify-between text-lg font-extrabold text-[#232f3e] border-t border-gray-200 pt-2 mt-3">
                <span>Total</span>
                <span>₹{totalWithDonation.toLocaleString()}</span>
              </div>
            </div>

            {user && parseFloat(user.wallet_balance || '0') > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded.lg border border-blue-200 text-sm flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-blue-900 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-blue-600">account_balance_wallet</span> Wallet Balance</h4>
                  <p className="text-blue-700 text-xs">Available: ₹{parseFloat(user.wallet_balance).toLocaleString()}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-900 bg-white px-2 py-1 rounded border border-blue-300">
                  <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  Use ₹{maxWalletUsable.toLocaleString()}
                </label>
              </div>
            )}

            {useWallet && (
               <div className="flex justify-between text-base font-extrabold text-[#232f3e] bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                 <span>Final Amount to Pay</span>
                 <span className="text-[#e52e06]">₹{finalTotal.toLocaleString()}</span>
               </div>
            )}

            {user && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-gray-500">local_shipping</span> Delivery Address</h4>
                
                {savedAddresses.length > 0 && (
                  <select 
                    className="w-full border border-gray-300 rounded p-2 mb-2 outline-none text-xs bg-white"
                    onChange={(e) => {
                      if (e.target.value) {
                        setDeliveryAddress(e.target.value);
                      }
                    }}
                  >
                    <option value="">Select a saved address...</option>
                    {savedAddresses.map((a, i) => (
                      <option key={i} value={`${a.name}, ${a.street}, ${a.city}, ${a.state} - ${a.zip_code}`}>
                        {a.name} - {a.street}, {a.city}
                      </option>
                    ))}
                  </select>
                )}
                
                <textarea 
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address here..."
                  className="w-full border border-gray-300 rounded p-2 outline-none text-xs text-gray-700 bg-white"
                  rows={2}
                />
                <button 
                  onClick={handleSaveAddress}
                  className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded font-medium transition"
                >
                  Save Address for Later
                </button>
              </div>
            )}

            <button 
              onClick={() => {
                if (!user) {
                  alert('Please login to checkout.');
                  return;
                }
                onClose();
                onCheckout(walletAmountUsed, currentShippingCost, selectedShipping, donationAmount);
              }}
              className="w-full bg-[#e52e06] text-white py-4 rounded-lg font-extrabold uppercase tracking-widest hover:bg-[#cc2805] transition shadow-lg flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">lock</span>
              Proceed to Checkout (₹{finalTotal.toLocaleString()})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
