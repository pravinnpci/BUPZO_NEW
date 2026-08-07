"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RotateCcw, ArrowLeft, RefreshCw, CheckCircle, XCircle, Truck, DollarSign, Image as ImageIcon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function RefundManagementPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<"shiprocket" | "nimbuspost">("shiprocket");

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/refunds/`);
      if (res.ok) {
        const data = await res.json();
        setRefunds(data);
      }
    } catch (err) {
      console.error("Failed to load refunds:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (refundId: string) => {
    try {
      setActionLoading(refundId);
      const res = await fetch(`${API_BASE}/api/refunds/${refundId}/approve?aggregator=${selectedPartner}`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Return approved! Reverse pickup logistics scheduled.");
        fetchRefunds();
      }
    } catch (err) {
      console.error("Approve return error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessWalletRefund = async (refundId: string) => {
    try {
      setActionLoading(refundId);
      const res = await fetch(`${API_BASE}/api/refunds/${refundId}/process-refund`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Refund completed! Wallet credited to customer.");
        fetchRefunds();
      }
    } catch (err) {
      console.error("Process refund error:", err);
    } finally {
      setActionLoading(null);
    }
  };

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
                <RotateCcw className="w-6 h-6 text-rose-400" />
                <h1 className="text-2xl font-bold tracking-tight text-white">Refund & Return Management System</h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Audit customer return requests, approve returns, and trigger reverse pickup logistics via Shiprocket or NimbusPost.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPartner}
              onChange={(e: any) => setSelectedPartner(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="shiprocket">Reverse Logistics: Shiprocket</option>
              <option value="nimbuspost">Reverse Logistics: NimbusPost</option>
            </select>

            <button
              onClick={fetchRefunds}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Return ID & Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reason & Type</th>
                  <th className="p-4">Refund Amount</th>
                  <th className="p-4">Status & Reverse AWB</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {refunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No return requests found.
                    </td>
                  </tr>
                ) : (
                  refunds.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="font-mono text-xs text-rose-400 font-bold">
                          #{r.id.substring(0, 8).toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Order #{r.order_id.substring(0, 8).toUpperCase()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-white">{r.customer_name || "Customer"}</div>
                        <div className="text-xs text-slate-500">{r.customer_phone}</div>
                      </td>

                      <td className="p-4">
                        <div className="text-xs text-slate-200">{r.reason}</div>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                          Refund to {r.return_type || "Wallet"}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-emerald-400">
                        ₹{parseFloat(r.refund_amount || 0).toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          r.status === 'refunded' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          r.status === 'approved' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {r.status}
                        </span>
                        {r.reverse_awb && (
                          <div className="text-[11px] font-mono text-emerald-400 mt-1">
                            Rev AWB: {r.reverse_awb}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {r.status === "requested" && (
                          <button
                            onClick={() => handleApproveReturn(r.id)}
                            disabled={actionLoading === r.id}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                          >
                            Approve & Schedule Pickup
                          </button>
                        )}
                        {r.status === "approved" && (
                          <button
                            onClick={() => handleProcessWalletRefund(r.id)}
                            disabled={actionLoading === r.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                          >
                            Complete Wallet Refund
                          </button>
                        )}
                        {r.status === "refunded" && (
                          <span className="text-xs text-slate-500 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
