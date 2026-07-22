import React, { useState } from 'react';

export const CustomerOrders = ({ customerOrders, user }: any) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
                    <div className="text-right">
                      <p className="text-[#e52e06] font-extrabold text-xl">₹{ord.total_amount.toLocaleString()}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${ord.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ord.status}</span>
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
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Order Status</h4>
                    <div className="flex items-center w-full mt-4">
                      {['pending', 'processing', 'shipped', 'delivered'].map((step, idx, arr) => {
                        const stepIndex = arr.indexOf(ord.status?.toLowerCase());
                        const isCompleted = idx <= (stepIndex === -1 ? 0 : stepIndex);
                        const isLast = idx === arr.length - 1;
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {isCompleted ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[10px] mt-1 font-bold uppercase ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>{step}</span>
                            </div>
                            {!isLast && (
                              <div className={`flex-1 h-1 mx-2 ${idx < (stepIndex === -1 ? 0 : stepIndex) ? 'bg-green-500' : 'bg-gray-200'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                  {ord.tracking_id && (
                     <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded">
                        <strong>Tracking ID:</strong> {ord.tracking_id} ({ord.shipping_partner})
                     </div>
                  )}
                </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
