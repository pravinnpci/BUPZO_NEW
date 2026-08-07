"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, ExternalLink, RefreshCw, ArrowLeft, Search, Filter, MapPin, CheckCircle2, Clock, PackageCheck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function ShippingTrackingCommandCenter() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPartner, setFilterPartner] = useState("all");
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/orders/tracking`);
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

  const handleFetchLiveTracking = async (awb_code: string, aggregator: string) => {
    if (!awb_code) return;
    try {
      const res = await fetch(`${API_BASE}/api/tracking/${awb_code}?aggregator=${aggregator || 'shiprocket'}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrderTracking(data);
      }
    } catch (err) {
      console.error("Failed to fetch live tracking:", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.awb_code && o.awb_code.toLowerCase().includes(search.toLowerCase())) ||
      (o.courier_name && o.courier_name.toLowerCase().includes(search.toLowerCase()));

    const matchesPartner =
      filterPartner === "all" ||
      (filterPartner === "shiprocket" && (o.shipping_partner === "shiprocket" || !o.shipping_partner)) ||
      (filterPartner === "nimbuspost" && o.shipping_partner === "nimbuspost") ||
      (filterPartner === "cancelled" && o.status === "cancelled") ||
      (filterPartner === "in_transit" && o.status === "shipped") ||
      (filterPartner === "delivered" && o.status === "delivered");

    return matchesSearch && matchesPartner;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-indigo-400" />
                <h1 className="text-2xl font-bold tracking-tight text-white">Shipping & Live Tracking Audit Command Center</h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Real-time multi-aggregator dispatch monitoring across Shiprocket and NimbusPost partners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Shipments
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search Order ID, AWB, Courier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Aggregators</option>
              <option value="shiprocket">Shiprocket Only</option>
              <option value="nimbuspost">NimbusPost Only</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Aggregator & Courier</th>
                  <th className="p-4">AWB Code</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Live Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No active shipments found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const isNimbus = o.shipping_partner === "nimbuspost";
                    return (
                      <tr key={o.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <div className="font-mono text-xs text-indigo-400 font-bold">
                            #{o.id.substring(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {new Date(o.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isNimbus ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                              {isNimbus ? "NimbusPost" : "Shiprocket"}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-300 mt-1">
                            {o.courier_name || "Standard Courier"}
                          </div>
                        </td>

                        <td className="p-4 font-mono text-xs">
                          {o.awb_code ? (
                            <span className="text-emerald-400 font-semibold">{o.awb_code}</span>
                          ) : (
                            <span className="text-slate-500 italic">Pending AWB</span>
                          )}
                        </td>

                        <td className="p-4 font-semibold text-white">
                          ₹{parseFloat(o.total_amount || 0).toFixed(2)}
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            o.status === 'ready_for_pickup' || o.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            o.status === 'return_requested' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {o.status || 'NEW'}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleFetchLiveTracking(o.awb_code, o.shipping_partner || 'shiprocket')}
                            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                            disabled={!o.awb_code}
                          >
                            <MapPin className="w-3.5 h-3.5" /> {o.awb_code ? 'Track Live' : 'No AWB'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Tracking Modal */}
        {selectedOrderTracking && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white">Live Tracking Timeline</h3>
                </div>
                <button
                  onClick={() => setSelectedOrderTracking(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>AWB Code:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedOrderTracking.awb_code}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Courier Partner:</span>
                  <span className="text-white font-medium">{selectedOrderTracking.courier_name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Status:</span>
                  <span className="text-indigo-400 font-bold">{selectedOrderTracking.current_status}</span>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {(selectedOrderTracking.history || []).map((h: any, idx: number) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <div className="mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{h.status || h.activity}</div>
                      <div className="text-slate-500 text-[11px]">{h.date} • {h.location}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <a
                  href={selectedOrderTracking.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  External Courier Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
