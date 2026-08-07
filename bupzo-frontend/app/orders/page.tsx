"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Truck, ExternalLink, MapPin, CheckCircle2, RotateCcw, Clock, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTracking, setActiveTracking] = useState<any | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState("wallet");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Mock default user ID if not logged in
  const userId = "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/orders/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackLive = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/shipping/track/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveTracking(data);
      }
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  const handleOpenReturnModal = (order: any) => {
    setReturnModalOrder(order);
    setReturnReason("");
  };

  const handleSubmitReturnRequest = async () => {
    if (!returnModalOrder || !returnReason) return;
    try {
      setSubmittingReturn(true);
      const res = await fetch(`${API_BASE}/api/refunds/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: returnModalOrder.id,
          user_id: userId,
          reason: returnReason,
          return_type: returnType,
          images: []
        })
      });
      if (res.ok) {
        alert("Return request submitted! Reverse pickup logistics will be scheduled upon approval.");
        setReturnModalOrder(null);
        fetchOrders();
      }
    } catch (err) {
      alert("Error submitting return request.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-400" /> My Orders & Live Tracking
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track shipments in real-time or request returns & refunds.
            </p>
          </div>
          <Link href="/shop" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition">
            Continue Shopping
          </Link>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
              No orders found. Explore our marketplace to place your first order!
            </div>
          ) : (
            orders.map((o) => {
              const isNimbus = o.shipping_partner === "nimbuspost";
              return (
                <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <div>
                      <span className="font-mono text-xs text-indigo-400 font-bold">
                        ORDER #{o.id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 ml-3">
                        {new Date(o.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isNimbus ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                        {isNimbus ? "NimbusPost Express" : "Shiprocket Partner"}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        o.status === 'return_requested' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {o.status || 'PROCESSING'}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {(o.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-1">
                        <span className="text-slate-200 font-medium">{item.name || item.product_name} x {item.quantity}</span>
                        <span className="text-white font-semibold">₹{parseFloat(item.price || item.price_at_purchase || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-sm font-bold text-white">
                      Total: ₹{parseFloat(o.total_amount || 0).toFixed(2)}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTrackLive(o.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg transition"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Live Tracking
                      </button>

                      {o.status === 'delivered' && (
                        <button
                          onClick={() => handleOpenReturnModal(o)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-lg transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Request Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Live Tracking Modal */}
        {activeTracking && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white">Real-Time Transit Progress</h3>
                </div>
                <button onClick={() => setActiveTracking(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>AWB Code:</span>
                  <span className="font-mono text-emerald-400 font-bold">{activeTracking.awb_code}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-indigo-400 font-bold">{activeTracking.current_status}</span>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {(activeTracking.history || []).map((h: any, idx: number) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">{h.status || h.activity}</div>
                      <div className="text-slate-500 text-[11px]">{h.date} • {h.location}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 text-right">
                <button onClick={() => setActiveTracking(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {returnModalOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-400" /> Request Return & Refund
                </h3>
                <button onClick={() => setReturnModalOrder(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reason for Return</label>
                  <textarea
                    rows={3}
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Describe why you want to return this product..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Refund Destination</label>
                  <select
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="wallet">Refund to Bupzo Wallet (Instant)</option>
                    <option value="bank">Refund to Original Payment Method</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button onClick={() => setReturnModalOrder(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReturnRequest}
                  disabled={submittingReturn || !returnReason}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg shadow-rose-600/20"
                >
                  {submittingReturn ? "Submitting..." : "Submit Return Request"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
