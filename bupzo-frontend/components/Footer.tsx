'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-black text-xl text-gray-900">
            <span className="w-8 h-8 bg-[#3874ff] text-white rounded-lg flex items-center justify-center font-bold">B</span>
            <span>BUPZO</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Next-Gen AI-Powered Multi-Vendor E-Commerce Platform. Fast, secure, and semantic search driven.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-[#3874ff] transition-colors">Home Marketplace</Link></li>
            <li><Link href="/shops" className="hover:text-[#3874ff] transition-colors">Merchant Shops</Link></li>
            <li><Link href="/pricing" className="hover:text-[#3874ff] transition-colors">Seller Plans &amp; Pricing</Link></li>
            <li><Link href="/invoices" className="hover:text-[#3874ff] transition-colors">Order Invoices</Link></li>
            <li><Link href="/faq" className="hover:text-[#3874ff] transition-colors">FAQ &amp; Support</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Account & Location</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/account" className="hover:text-[#3874ff] transition-colors">Account Settings & Leaflet Pinpoint</Link></li>
            <li><Link href="/seller/create-merchant" className="hover:text-[#3874ff] transition-colors">Become a Merchant Seller</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Payment & Security</h4>
          <p className="text-xs text-gray-500">Secured with 256-bit SSL & Razorpay Escrow Payments.</p>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span>🛡️</span> 100% Escrow Protected
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2026 BUPZO Platform. All rights reserved.
      </div>
    </footer>
  );
}
