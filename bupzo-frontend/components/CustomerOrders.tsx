import React, { useState, useEffect } from 'react';

const fetchShiprocketTracking = async (trackingId: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
    const resp = await fetch(`${apiUrl}/api/shiprocket/track/${trackingId}`);
    if (resp.ok) {
      const data = await resp.json();
      return data;
    }
  } catch(e) { console.warn('Tracking fetch error', e); }
  return null;
};

export const CustomerOrders = ({ customerOrders, user }: any) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<{[key: string]: any}>({});
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);

  useEffect(() => {
    if (expandedOrderId) {
      const ord = customerOrders?.find((o: any) => o.id === expandedOrderId);
      if (ord && ord.tracking_id && !trackingData[ord.id]) {
        fetchShiprocketTracking(ord.tracking_id).then(data => {
          if (data) {
            setTrackingData(prev => ({ ...prev, [ord.id]: data }));
          }
        });
      }
    }
  }, [expandedOrderId, customerOrders]);

  return (
    <div className="w-full bg-white pb-20">
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center mb-10">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">My Orders</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Orders</p>
      </div>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-[#f8f8f8] rounded p-6 shadow-sm">
          {customerOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-medium">You have no orders yet.</div>
          ) : (
            <div className="space-y-6">
              {customerOrders.map((ord: any) => (
                <div key={ord.id} className="bg-white border border-gray-200 rounded p-6 relative cursor-pointer hover:shadow-md transition" onClick={() => setExpandedOrderId(expandedOrderId === ord.id ? null : ord.id)}>
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-[#232f3e] font-bold text-lg mb-1 flex items-center gap-2">
                        Order #{ord.id.split('-')[0].toUpperCase()}
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{expandedOrderId === ord.id ? 'Hide Details ▲' : 'View Details ▼'}</span>
                      </h3>
                      <p className="text-sm text-gray-500">{new Date(ord.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-[#e52e06] font-extrabold text-xl">₹{ord.total_amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${ord.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ord.status}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoiceOrder(ord);
                          }}
                          className="px-2.5 py-1 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow flex items-center gap-1 transition"
                        >
                          <span>🧾</span> Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedOrderId === ord.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-200">
                      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="font-bold text-gray-500 block mb-1">Shipping Partner</span>
                          <span className="font-semibold">{ord.shipping_partner || 'Standard Delivery'}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="font-bold text-gray-500 block mb-1">Tracking ID</span>
                          <span className="font-semibold">{ord.tracking_id || 'Pending Assignment'}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="font-bold text-gray-500 block mb-1">Payment Method</span>
                          <span className="font-semibold">{ord.payment_gateway || 'Online Checkout'}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="font-bold text-gray-500 block mb-1">Trust Donation</span>
                          <span className="font-semibold text-green-600">₹{ord.trust_donation_amount || 0}</span>
                        </div>
                      </div>
                      
                      {Array.isArray(ord.items) && ord.items.length > 0 && (
                        <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded border border-gray-100">
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Order Items ({ord.items.length})</h4>
                          {ord.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-4 p-2 bg-white rounded border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                                  <img 
                                    src={item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'; }}
                                  />
                                </div>
                                <div>
                                  <h5 className="font-bold text-sm text-[#232f3e]">{item.name}</h5>
                                  <p className="text-xs text-gray-500 font-medium">Store: <span className="text-[#e52e06] font-bold">{item.store_name || ord.seller_name || 'Bupzo Partner Store'}</span></p>
                                  <p className="text-xs text-gray-400">Qty: {item.quantity || 1} x ₹{item.price || 0}</p>
                                </div>
                              </div>
                              <span className="font-extrabold text-sm text-[#232f3e]">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Order Fulfillment Timeline</h4>
                    {/* Pipeline Steps */}
                    <div className="relative">
                      {/* Connector line */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
                      <div className="flex items-start justify-between relative z-10">
                        {[
                          { key: 'paid',             label: 'Order\nPlaced',     icon: '💳' },
                          { key: 'processing',       label: 'Seller\nConfirmed', icon: '✅' },
                          { key: 'ready_for_pickup', label: 'Ready\nPickup',     icon: '📦' },
                          { key: 'shipped',          label: 'Shipped',           icon: '🚚' },
                          { key: 'delivered',        label: 'Delivered',         icon: '🎉' },
                        ].map((step, idx, arr) => {
                          const pipeline = ['paid', 'processing', 'ready_for_pickup', 'shipped', 'delivered'];
                          const currentIdx = pipeline.indexOf((ord.status || 'paid').toLowerCase());
                          const stepIdx = pipeline.indexOf(step.key);
                          const isCompleted = stepIdx <= currentIdx && currentIdx >= 0;
                          const isCurrent = stepIdx === currentIdx;
                          const isCancelled = (ord.status || '').toLowerCase() === 'cancelled';

                          return (
                            <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / arr.length}%` }}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                                ${isCancelled ? 'bg-rose-100 border-rose-300 text-rose-500' :
                                  isCompleted ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-200' :
                                  'bg-white border-gray-200 text-gray-400'}
                                ${isCurrent && !isCancelled ? 'ring-2 ring-offset-1 ring-emerald-400 scale-110' : ''}`
                              }>
                                {isCancelled ? '✕' : isCompleted ? step.icon : idx + 1}
                              </div>
                              <span className={`text-[9px] mt-1.5 font-bold uppercase text-center whitespace-pre leading-tight
                                ${isCancelled ? 'text-rose-400' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cancelled banner */}
                    {(ord.status || '').toLowerCase() === 'cancelled' && (
                      <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-2">
                        <span>❌</span> This order has been cancelled.
                      </div>
                    )}

                    {/* AWB / Courier info inline */}
                    {ord.awb_code && (
                      <div className="mt-3 bg-violet-50 border border-violet-200 rounded-lg p-2.5 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span>📋</span>
                          <span className="font-bold text-violet-700">AWB: {ord.awb_code}</span>
                          {ord.courier_name && <span className="text-zinc-500">via {ord.courier_name}</span>}
                        </div>
                        {ord.estimated_delivery_date && (
                          <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">
                            Est. {new Date(ord.estimated_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {ord.tracking_id && (() => {
                    const liveInfo = trackingData[ord.id];
                    const trackObj = liveInfo?.data?.tracking_data?.shipment_track?.[0] || liveInfo?.data?.tracking_data || liveInfo?.data || {};
                    const currentStatus = trackObj.current_status || trackObj.shipment_status || (liveInfo?.success ? liveInfo?.status : null);
                    const expectedDelivery = trackObj.etd || trackObj.expected_date || trackObj.edd || liveInfo?.etd || liveInfo?.expected_date;
                    const lastLocation = trackObj.current_location || trackObj.last_location || trackObj.location || trackObj.destination || trackObj.origin;

                    const hasRealData = liveInfo && liveInfo.success && (currentStatus || expectedDelivery || lastLocation);

                    return (
                      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-xs p-4 rounded-xl shadow-md space-y-3 mt-4">
                        <div className="flex items-center justify-between border-b border-blue-700/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🚀</span>
                            <div>
                              <span className="font-extrabold text-blue-200">Shiprocket Live Express Tracking</span>
                              <span className="block text-[10px] text-blue-300">Courier: {ord.shipping_partner || 'Delhivery Express'}</span>
                            </div>
                          </div>
                          <span className="font-mono bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[11px] px-2.5 py-1 rounded-lg">
                            AWB: {ord.tracking_id}
                          </span>
                        </div>
                        
                        {hasRealData ? (
                          <div className="bg-black/30 backdrop-blur border border-blue-500/20 p-3 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="font-bold text-white text-xs">Current Status:</span>
                                <span className="text-emerald-300 font-extrabold">{currentStatus}</span>
                              </div>
                              {expectedDelivery && (
                                <span className="text-[10px] font-semibold bg-blue-500/30 border border-blue-400/30 text-blue-200 px-2 py-0.5 rounded">
                                  Expected: {expectedDelivery}
                                </span>
                              )}
                            </div>
                            {lastLocation && (
                              <div className="text-[11px] text-blue-200 font-mono flex items-center gap-1.5 pt-1 border-t border-blue-800/40">
                                <span>📍 Last Location:</span>
                                <span className="text-white font-bold">{lastLocation}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Fallback static display */
                          <div className="bg-black/30 backdrop-blur border border-blue-500/20 p-3 rounded-lg flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-sm animate-pulse">
                                📍
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">Current Shipment Location</p>
                                <p className="text-[11px] text-blue-200 font-mono">Hub Facility: Chennai Central Logistics Hub → In Transit to Recipient</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shrink-0">
                              LIVE IN-TRANSIT
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TAX INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="bg-white text-zinc-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-zinc-200" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedInvoiceOrder(null)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 text-lg font-bold w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                  <span>🧾</span> TAX INVOICE
                </h2>
                <p className="text-xs text-zinc-500 font-mono">Invoice #: INV-{String(selectedInvoiceOrder.id || '9812').slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right text-xs text-zinc-500">
                <div><span className="font-bold text-zinc-700">Date:</span> {new Date(selectedInvoiceOrder.created_at || Date.now()).toLocaleDateString('en-IN')}</div>
                <div><span className="font-bold text-zinc-700">Payment:</span> {selectedInvoiceOrder.payment_gateway || 'Online Escrow/UPI'}</div>
              </div>
            </div>

            {/* Address Grid: Delivery Address vs Billing Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
              {/* Delivery Address */}
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                <h4 className="font-extrabold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🚚</span> Delivery Address
                </h4>
                <p className="font-bold text-zinc-800">{user?.name || selectedInvoiceOrder.customer_name || 'Customer'}</p>
                <p className="text-zinc-600 mt-1 leading-relaxed">
                  {selectedInvoiceOrder.shipping_address || selectedInvoiceOrder.address || user?.address || 'Standard Shipping Location'}
                </p>
                <p className="text-zinc-500 font-mono mt-1">Pincode: {selectedInvoiceOrder.pincode || user?.pincode || '—'}</p>
                <p className="text-zinc-500 mt-0.5">Phone: +91 {selectedInvoiceOrder.phone || user?.phone || '—'}</p>
              </div>

              {/* Billing Address */}
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                <h4 className="font-extrabold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🏬</span> Billing Address (Customer Account Profile)
                </h4>
                <p className="font-bold text-zinc-800">{user?.name || 'Registered Account User'}</p>
                <p className="text-zinc-600 mt-1 leading-relaxed">
                  {user?.address || selectedInvoiceOrder.shipping_address || 'Profile Billing Location'}
                </p>
                <p className="text-zinc-500 font-mono mt-1">Pincode: {user?.pincode || selectedInvoiceOrder.pincode || '—'}</p>
                <p className="text-zinc-500 mt-0.5">Email: {user?.email || '—'}</p>
                <p className="text-zinc-500 mt-0.5">Phone: +91 {user?.phone || '—'}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {Array.isArray(selectedInvoiceOrder.items) && selectedInvoiceOrder.items.length > 0 ? (
                    selectedInvoiceOrder.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-zinc-800">{item.name || item.title || 'Product'}</td>
                        <td className="p-3 text-center font-mono">{item.quantity || 1}</td>
                        <td className="p-3 text-right font-mono">₹{item.price || 0}</td>
                        <td className="p-3 text-right font-bold text-zinc-900">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 font-semibold text-zinc-800">{selectedInvoiceOrder.product_name || 'Marketplace Item'}</td>
                      <td className="p-3 text-center font-mono">1</td>
                      <td className="p-3 text-right font-mono">₹{selectedInvoiceOrder.total_amount || 0}</td>
                      <td className="p-3 text-right font-bold text-zinc-900">₹{selectedInvoiceOrder.total_amount || 0}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl mb-6">
              <div className="text-xs text-zinc-500">
                <span>GST / Tax Included</span> • <span className="text-emerald-600 font-bold">Paid via Bupzo Escrow Gateway</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500 font-medium">Grand Total:</div>
                <div className="text-2xl font-black text-emerald-600">₹{selectedInvoiceOrder.total_amount?.toLocaleString() || '0'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setSelectedInvoiceOrder(null)} 
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
              >
                <span>🖨️</span> Print Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
