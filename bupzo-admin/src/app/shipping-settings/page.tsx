"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Save, RefreshCw, Key, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function ShippingSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Shiprocket State
  const [srEmail, setSrEmail] = useState("");
  const [srPassword, setSrPassword] = useState("");
  const [srActive, setSrActive] = useState(true);
  const [srWebhook, setSrWebhook] = useState("");

  // NimbusPost State
  const [npEmail, setNpEmail] = useState("");
  const [npToken, setNpToken] = useState("");
  const [npActive, setNpActive] = useState(true);
  const [npWebhook, setNpWebhook] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/shipping/settings/`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        data.forEach((s: any) => {
          if (s.provider === "shiprocket") {
            setSrEmail(s.email || "");
            setSrActive(s.is_active ?? true);
            setSrWebhook(s.webhook_secret || "");
          } else if (s.provider === "nimbuspost") {
            setNpEmail(s.email || "");
            setNpToken(s.api_token || "");
            setNpActive(s.is_active ?? true);
            setNpWebhook(s.webhook_secret || "");
          }
        });
      }
    } catch (err) {
      console.error("Failed to load shipping settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (provider: "shiprocket" | "nimbuspost") => {
    setSavingProvider(provider);
    setToast(null);
    try {
      const payload = provider === "shiprocket"
        ? { provider: "shiprocket", is_active: srActive, email: srEmail, password: srPassword, webhook_secret: srWebhook }
        : { provider: "nimbuspost", is_active: npActive, email: npEmail, api_token: npToken, webhook_secret: npWebhook };

      const res = await fetch(`${API_BASE}/api/shipping/settings/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setToast({ message: `${provider === 'shiprocket' ? 'Shiprocket' : 'NimbusPost'} credentials updated successfully!`, type: "success" });
        if (provider === "shiprocket") setSrPassword("");
      } else {
        setToast({ message: `Failed to save ${provider} settings`, type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error saving settings", type: "error" });
    } finally {
      setSavingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-indigo-400" />
                <h1 className="text-2xl font-bold tracking-tight text-white">Shipping & Aggregator API Settings</h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Configure API credentials, tokens, and webhooks for Shiprocket and NimbusPost multi-courier routing.
              </p>
            </div>
          </div>

          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border border-rose-800 text-rose-300'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. SHIPROCKET CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-lg">
                  SR
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Shiprocket API Integration</h2>
                  <span className="text-xs text-slate-400">Automated Courier Dispatch & Live Tracking</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={srActive}
                  onChange={(e) => setSrActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Shiprocket Registered Email
                </label>
                <input
                  type="email"
                  value={srEmail}
                  onChange={(e) => setSrEmail(e.target.value)}
                  placeholder="admin@bupzo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Shiprocket Password (Leave blank to keep existing)
                </label>
                <input
                  type="password"
                  value={srPassword}
                  onChange={(e) => setSrPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Shiprocket Webhook Secret
                </label>
                <input
                  type="text"
                  value={srWebhook}
                  onChange={(e) => setSrWebhook(e.target.value)}
                  placeholder="whsec_sr_live_..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4" /> Bearer Token Auto-Refreshed (24h TTL)
              </span>

              <button
                onClick={() => handleSave("shiprocket")}
                disabled={savingProvider === "shiprocket"}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                {savingProvider === "shiprocket" ? "Saving..." : "Save Credentials"}
              </button>
            </div>
          </div>

          {/* 2. NIMBUSPOST CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-lg">
                  NP
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">NimbusPost API Integration</h2>
                  <span className="text-xs text-slate-400">Multi-Courier Rate Discovery & Reverse Logistics</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={npActive}
                  onChange={(e) => setNpActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  NimbusPost Registered Email
                </label>
                <input
                  type="email"
                  value={npEmail}
                  onChange={(e) => setNpEmail(e.target.value)}
                  placeholder="logistics@bupzo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  NimbusPost API Token
                </label>
                <input
                  type="text"
                  value={npToken}
                  onChange={(e) => setNpToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  NimbusPost Webhook Secret
                </label>
                <input
                  type="text"
                  value={npWebhook}
                  onChange={(e) => setNpWebhook(e.target.value)}
                  placeholder="whsec_np_live_..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-blue-400 flex items-center gap-1.5 font-medium">
                <Key className="w-4 h-4" /> API Token Authentication Active
              </span>

              <button
                onClick={() => handleSave("nimbuspost")}
                disabled={savingProvider === "nimbuspost"}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                <Save className="w-4 h-4" />
                {savingProvider === "nimbuspost" ? "Saving..." : "Save Credentials"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
