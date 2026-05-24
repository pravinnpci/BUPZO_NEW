"use client";

import React from "react";
import Link from "next/link";

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-slate-900">Bupzo Seller</h1>
            <nav>
              <ul className="flex space-x-6">
                <li><Link href="/seller/dashboard" className="text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</Link></li>
                <li><Link href="/seller/products" className="text-slate-600 hover:text-indigo-600 transition-colors">Products</Link></li>
                <li><Link href="/seller/orders" className="text-slate-600 hover:text-indigo-600 transition-colors">Orders</Link></li>
                <li><Link href="/seller/settings" className="text-slate-600 hover:text-indigo-600 transition-colors">Settings</Link></li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">👤</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
