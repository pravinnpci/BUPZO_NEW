import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  updateQuantity: (id: string, qty: number) => void;
  user: any;
  onCheckout: (walletAmountUsed: number, shippingCost: number, shippingPartner: string, trustDonation?: number, gstAmount?: number, platformCharge?: number) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: any;
  handleApplyPromo: (e: any, cartTotal: number) => void;
};

// Haversine Distance Calculation Formula in Kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(R * c * 10) / 10);
}

function calculateGST(amount: number, gstRate: number = 18, sellerState: string = 'Tamil Nadu', customerState: string = 'Tamil Nadu') {
  const taxable = Math.round(amount * 100) / 100;
  const gstTotal = Math.round(taxable * gstRate) / 100;
  const isIntraState = sellerState.trim().toLowerCase() === customerState.trim().toLowerCase();
  return {
    taxable,
    cgst: isIntraState ? Math.round(gstTotal / 2 * 100) / 100 : 0,
    sgst: isIntraState ? Math.round(gstTotal / 2 * 100) / 100 : 0,
    igst: isIntraState ? 0 : Math.round(gstTotal * 100) / 100,
    rate: gstRate,
    total_gst: Math.round(gstTotal * 100) / 100,
    tax_type: isIntraState ? 'CGST + SGST' : 'IGST'
  };
}

export default function CartModal({
  isOpen, onClose, cart, updateQuantity, user, onCheckout,
  promoCode, setPromoCode, appliedPromo, handleApplyPromo
}: CartModalProps) {
  const [cartTotal, setCartTotal] = useState(0);
  const [gstBreakdown, setGstBreakdown] = useState<{taxable: number; cgst: number; sgst: number; igst: number; rate: number; total_gst: number; tax_type: string}>({taxable: 0, cgst: 0, sgst: 0, igst: 0, rate: 18, total_gst: 0, tax_type: 'CGST + SGST'});
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [selectedAddrId, setSelectedAddrId] = useState<string>('personal');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [loadingRates, setLoadingRates] = useState(false);

  // Coordinates
  const [sellerLat] = useState<number>(11.0168); // Nagore/Nagapattinam area
  const [sellerLng] = useState<number>(79.8412);
  const [customerLat, setCustomerLat] = useState<number>(user?.address_lat ? Number(user.address_lat) : 13.0827);
  const [customerLng, setCustomerLng] = useState<number>(user?.address_lng ? Number(user.address_lng) : 80.2707);
  const [customerPincode, setCustomerPincode] = useState<string>(user?.pincode || '600001');
  const [distanceKm, setDistanceKm] = useState<number>(5.2);

  // Seller resolved from first cart item
  const sellerIdFromCart = cart[0]?.product?.seller_id || null;

  const [shippingPartners, setShippingPartners] = useState<{name: string; aggregator: string; courier_id: any; cost: number; estimated_delivery_days?: string; rating?: number}[]>([
    { aggregator: 'shiprocket', courier_id: 1, name: '📦 Shiprocket Standard (Delhivery / BlueDart)', cost: 55, estimated_delivery_days: '3-5 Days', rating: 4.5 },
    { aggregator: 'nimbuspost', courier_id: 101, name: '⚡ NimbusPost BlueDart Express', cost: 75, estimated_delivery_days: '1-2 Days', rating: 4.8 },
    { aggregator: 'shiprocket', courier_id: 2, name: '🚚 Shiprocket DTDC Air', cost: 65, estimated_delivery_days: '2-3 Days', rating: 4.3 }
  ]);
  const [selectedShipping, setSelectedShipping] = useState(shippingPartners[0].name);

  useEffect(() => {
    let total = 0;
    cart.forEach((item: any) => {
      total += (item.product?.price || 0) * item.quantity;
    });
    setCartTotal(total);
    // Calculate GST on subtotal (default 18% intra-state)
    const avgGstRate = cart.length > 0 
      ? cart.reduce((sum: number, item: any) => sum + (item.product?.gst_rate || 18), 0) / cart.length
      : 18;
    const gst = calculateGST(total, avgGstRate);
    setGstBreakdown(gst);
  }, [cart]);

  // Fetch LIVE rates from backend when customer pincode changes
  const fetchLiveRates = useCallback(async (delivPincode: string) => {
    if (!delivPincode || delivPincode.length < 5) return;
    setLoadingRates(true);
    try {
      const totalWeightKg = cart.reduce((acc: number, item: any) => {
        return acc + ((item.product?.weight_grams || 300) / 1000) * item.quantity;
      }, 0) || 0.5;

      let url = `${API_BASE}/api/shipping-rates/?delivery_pincode=${delivPincode}&weight_kg=${totalWeightKg.toFixed(2)}`;
      if (sellerIdFromCart) url += `&seller_id=${sellerIdFromCart}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const rates = data.rates || data;
        if (Array.isArray(rates) && rates.length > 0) {
          const mapped = rates.map((r: any) => ({
            aggregator: r.aggregator || 'shiprocket',
            courier_id: r.courier_id,
            name: `${r.aggregator === 'nimbuspost' ? '⚡' : '📦'} ${r.name}`,
            cost: Math.round(r.cost || 0),
            estimated_delivery_days: r.estimated_delivery_days || '3-5 Days',
            rating: r.rating || 4.5
          }));
          setShippingPartners(mapped);
          setSelectedShipping(mapped[0].name);
        }
      }
    } catch (err) {
      console.warn('[Cart] Live rates fetch failed, using static fallback:', err);
    } finally {
      setLoadingRates(false);
    }
  }, [cart, sellerIdFromCart]);

  // Recalculate distance whenever customer coordinates update
  useEffect(() => {
    const dist = calculateDistanceKm(sellerLat, sellerLng, customerLat, customerLng);
    setDistanceKm(dist);
  }, [sellerLat, sellerLng, customerLat, customerLng]);

  // Fetch live rates when cart opens or customer pincode changes
  useEffect(() => {
    if (isOpen && customerPincode) {
      fetchLiveRates(customerPincode);
    }
  }, [isOpen, customerPincode]);



  const handleSaveAddress = async () => {
    if (!user || !deliveryAddress) return;
    try {
      const parts = deliveryAddress.split(',');
      const addr = {
        name: "Cart Address",
        street: parts[0] || deliveryAddress,
        city: parts[1]?.trim() || "City",
        state: "Tamil Nadu",
        zip_code: user.pincode || "600001",
        address_lat: customerLat,
        address_lng: customerLng
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004'}/api/addresses/?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addr)
      });
      if (res.ok) alert('✨ Address saved successfully with Pinpoint Coordinates!');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetch(`${API_BASE}/api/addresses/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSavedAddresses(data);
          }
        })
        .catch(() => {});
        
      if (!deliveryAddress && user?.address) {
        setDeliveryAddress(`${user.address}, ${user.pincode || ''}`);
        if (user.address_lat) setCustomerLat(Number(user.address_lat));
        if (user.address_lng) setCustomerLng(Number(user.address_lng));
        if (user.pincode) setCustomerPincode(user.pincode);
      }
    }
  }, [user, isOpen]);


  const PLATFORM_CHARGE = 5;
  const TRUST_DONATION_AMOUNT = 2;
  const [addDonation, setAddDonation] = useState<boolean>(true);
  const donationAmount = addDonation ? TRUST_DONATION_AMOUNT : 0;

  if (!isOpen) return null;

  const discount = appliedPromo?.discount_amount || 0;
  const totalAfterDiscount = Math.max(0, cartTotal - discount);

  // Recalculate GST on discounted amount
  const avgGstRate = cart.length > 0 
    ? cart.reduce((sum: number, item: any) => sum + (item.product?.gst_rate || 18), 0) / cart.length
    : 18;
  const gstOnDiscounted = calculateGST(totalAfterDiscount, avgGstRate);
  const gstTotal = gstOnDiscounted.total_gst;

  const currentShippingCost = shippingPartners.find(p => p.name === selectedShipping)?.cost || shippingPartners[0].cost;
  const totalWithDonation = totalAfterDiscount + gstTotal + currentShippingCost + donationAmount + PLATFORM_CHARGE;

  
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
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-left border-l border-gray-200">
        {/* Colorful Gradient Header */}
        <div className="bg-gradient-to-r from-[#232f3e] via-[#2c3b4e] to-[#e52e06] text-white px-6 py-5 flex items-center justify-between shadow-md">
          <h2 className="text-xl font-extrabold uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">shopping_cart</span>
            My Cart ({cart.length})
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition bg-white/10 hover:bg-white/20 p-2 rounded-full">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f8f8] space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <span className="material-symbols-outlined text-6xl text-gray-300">remove_shopping_cart</span>
              <p className="text-gray-500 font-medium">Your cart is currently empty.</p>
              <button onClick={onClose} className="bg-[#e52e06] text-white px-6 py-2 rounded-full font-bold uppercase hover:bg-[#cc2805] transition mt-4">
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-gray-700 uppercase tracking-wider">Selected Products</h3>
                {cart.map((item, idx) => (
                  <div key={item?.product?.id || idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 relative hover:shadow-md transition-all">
                    <div className="w-24 h-24 bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-center shrink-0">
                      <img src={item?.product?.image_url || 'https://placehold.co/150/png'} alt={item?.product?.name || 'Product'} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="font-extrabold text-[#232f3e] text-base leading-snug pr-6">{item?.product?.name || 'Product Item'}</h3>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">{item?.product?.category_name || 'Bupzo Verified Product'}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-[#e52e06] font-black text-lg">₹{(item?.product?.price || 0).toLocaleString()}</p>
                        
                        <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                          <button 
                            onClick={() => updateQuantity(item?.product?.id, item.quantity - 1)}
                            className="bg-white hover:bg-gray-100 px-3 py-1 text-gray-700 font-extrabold transition border-r border-gray-200 text-sm"
                          >-</button>
                          <span className="text-sm font-black w-8 text-center text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item?.product?.id, item.quantity + 1)}
                            className="bg-white hover:bg-gray-100 px-3 py-1 text-gray-700 font-extrabold transition border-l border-gray-200 text-sm"
                          >+</button>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateQuantity(item?.product?.id, 0)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded-full"
                      title="Remove item"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Options Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm text-gray-700 uppercase tracking-wider border-b pb-2">Order Options & Summary</h3>
                
                {/* Promo Code */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Promo Code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#e52e06] font-semibold"
                  />
                  <button 
                    onClick={(e) => handleApplyPromo(e, cartTotal)}
                    className="bg-[#232f3e] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-[#1a232e] transition"
                  >Apply</button>
                </div>
                
                <div className="space-y-2 text-xs font-medium text-gray-600 pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {/* GST Breakdown */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 space-y-1 my-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-800 flex items-center gap-1">🧾 GST ({gstBreakdown.rate}%)</span>
                      <span className="font-bold text-amber-900">+₹{gstBreakdown.total_gst.toLocaleString()}</span>
                    </div>
                    {gstBreakdown.tax_type === 'CGST + SGST' ? (
                      <div className="space-y-0.5 text-[10px] text-amber-700 pl-2">
                        <div className="flex justify-between">
                          <span>CGST ({gstBreakdown.rate/2}%)</span>
                          <span>₹{gstBreakdown.cgst.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST ({gstBreakdown.rate/2}%)</span>
                          <span>₹{gstBreakdown.sgst.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-700 pl-2 flex justify-between">
                        <span>IGST ({gstBreakdown.rate}%)</span>
                        <span>₹{gstBreakdown.igst.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Platform Charge */}
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">⚙️ Platform Charge</span>
                    <span className="font-bold text-gray-800">+₹{PLATFORM_CHARGE}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedPromo?.code || 'Promo'})</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {/* Live Multi-Partner Shipping Aggregator Selection */}
                  <div className="space-y-2 border-t border-gray-100 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-700 font-bold flex items-center gap-1">
                        🚚 Shipping Partner Aggregator
                        {loadingRates && <span className="ml-1 text-[10px] text-blue-500 animate-pulse">⟳ Fetching live rates...</span>}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        📍 {distanceKm} km from Seller
                      </span>
                    </div>

                    <select
                       value={selectedShipping}
                       onChange={(e) => setSelectedShipping(e.target.value)}
                       disabled={loadingRates}
                       className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-gray-50 outline-none cursor-pointer font-bold text-gray-800 disabled:opacity-60"
                    >
                      {shippingPartners.map(p => (
                        <option key={p.name} value={p.name}>
                          {p.name} ({p.estimated_delivery_days}) - ₹{p.cost} {p.rating ? `★${p.rating}` : ''}
                        </option>
                      ))}
                    </select>

                    {/* Active Aggregator Badge */}
                    {(() => {
                      const activePartner = shippingPartners.find(p => p.name === selectedShipping);
                      return activePartner ? (
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${activePartner.aggregator === 'nimbuspost' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                            {activePartner.aggregator === 'nimbuspost' ? '⚡ NimbusPost' : '📦 Shiprocket'}
                          </span>
                          <span className="text-gray-500">{activePartner.estimated_delivery_days} delivery</span>
                          {activePartner.rating && <span className="text-amber-600 font-bold">★ {activePartner.rating}</span>}
                        </div>
                      ) : null;
                    })()}
                  </div>


                  {/* ₹2 Trust Donation Row */}
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs flex justify-between items-center my-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-bold text-base">🛡️</span>
                      <div>
                        <h4 className="font-bold text-emerald-900 text-xs">Escrow Trust Donation</h4>
                        <p className="text-[10px] text-emerald-700">Add ₹2 to seller escrow trust fund</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-emerald-900 bg-white px-2 py-1 rounded border border-emerald-300 shadow-sm">
                      <input type="checkbox" checked={addDonation} onChange={(e) => setAddDonation(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                      +₹2
                    </label>
                  </div>

                  {addDonation && (
                    <div className="flex justify-between text-emerald-700 font-bold text-xs">
                      <span>+ ₹2 Bupzo Trust Donation</span>
                      <span>+₹{TRUST_DONATION_AMOUNT}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-extrabold text-[#232f3e] border-t border-gray-200 pt-2 mt-3">
                    <span>Total</span>
                    <span>₹{totalWithDonation.toLocaleString()}</span>
                  </div>
                </div>

                {user && parseFloat(user.wallet_balance || '0') > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 text-xs flex justify-between items-center shadow-sm">
                    <div>
                      <h4 className="font-bold text-blue-900 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-blue-600">account_balance_wallet</span> Wallet Balance</h4>
                      <p className="text-blue-700 text-[11px]">Available: ₹{parseFloat(user.wallet_balance).toLocaleString()}</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-900 bg-white px-2 py-1 rounded border border-blue-300">
                      <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      Use ₹{maxWalletUsable.toLocaleString()}
                    </label>
                  </div>
                )}

                {useWallet && (
                   <div className="flex justify-between text-sm font-extrabold text-[#232f3e] bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                     <span>Final Amount to Pay</span>
                     <span className="text-[#e52e06]">₹{finalTotal.toLocaleString()}</span>
                   </div>
                )}

                {/* Saved Delivery Address Selector */}
                {user && (
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs space-y-2.5">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-amber-600">location_on</span> Delivery Address & Pinpoint
                      </h4>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Lat: {customerLat.toFixed(4)}, Lng: {customerLng.toFixed(4)}
                      </span>
                    </div>

                    <select 
                      value={selectedAddrId}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none text-xs bg-white font-semibold text-gray-800 shadow-sm"
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedAddrId(val);
                        if (val === 'personal') {
                          setDeliveryAddress(`${user.address || ''}, ${user.pincode || ''}`);
                          if (user.address_lat) setCustomerLat(Number(user.address_lat));
                          if (user.address_lng) setCustomerLng(Number(user.address_lng));
                          if (user.pincode) setCustomerPincode(user.pincode);
                        } else {
                          const found = savedAddresses.find(a => String(a.id) === val);
                          if (found) {
                            setDeliveryAddress(`${found.name}, ${found.street}, ${found.city}, ${found.state} - ${found.zip_code}`);
                            if (found.address_lat) setCustomerLat(Number(found.address_lat));
                            if (found.address_lng) setCustomerLng(Number(found.address_lng));
                            if (found.zip_code) setCustomerPincode(found.zip_code);
                          }
                        }

                      }}
                    >
                      <option value="personal">📍 Personal Info Address ({user?.address ? `${user.address.substring(0, 30)}...` : 'Default Profile Address'})</option>
                      {savedAddresses.map((a, i) => (
                        <option key={i} value={String(a.id)}>
                          🏢 {a.name} - {a.street}, {a.city} (Lat: {a.address_lat ? Number(a.address_lat).toFixed(2) : customerLat.toFixed(2)}, Lng: {a.address_lng ? Number(a.address_lng).toFixed(2) : customerLng.toFixed(2)})
                        </option>
                      ))}
                    </select>

                    <textarea 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your full delivery address here..."
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none text-xs text-gray-700 bg-white font-medium shadow-sm"
                      rows={2}
                    />
                    <button 
                      onClick={handleSaveAddress}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg font-bold transition shadow-sm"
                    >
                      Save Address for Later
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky Fixed Bottom Checkout Button */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-30 shadow-2xl">
            <button 
              onClick={() => {
                if (!user) {
                  alert('Please login to checkout.');
                  return;
                }
                onClose();
                onCheckout(walletAmountUsed, currentShippingCost, selectedShipping, donationAmount, gstTotal, PLATFORM_CHARGE);
              }}
              className="w-full bg-[#e52e06] text-white py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-[#cc2805] transition shadow-xl flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">lock</span>
              Proceed to Checkout (₹{finalTotal.toLocaleString()})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
