'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const PLANS = [
    {
      name: 'Starter Merchant',
      badge: 'Free Tier',
      commission: '10% Sales Commission',
      priceMonthly: '₹0',
      priceAnnual: '₹0',
      description: 'Ideal for new sellers launching their first store on Bupzo.',
      features: [
        'Up to 50 Product Listings',
        'Standard Shiprocket Logistics',
        'Escrow Wallet Settlements',
        'Standard Email Support',
        'Basic Store Analytics'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro Merchant',
      badge: 'Most Popular',
      commission: '8% Reduced Commission',
      priceMonthly: '₹499 / mo',
      priceAnnual: '₹399 / mo',
      description: 'Perfect for growing brands aiming for higher volume & sales.',
      features: [
        'Unlimited Product Listings',
        'Priority AI Semantic Search Rank',
        'Fast Escrow Wallet Settlements',
        'WhatsApp Order Notifications',
        '24/7 Dedicated Merchant Support',
        'Custom Store Banner & Branding'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Enterprise Brand',
      badge: 'Low Commission',
      commission: '5% Enterprise Rate',
      priceMonthly: '₹1,499 / mo',
      priceAnnual: '₹1,199 / mo',
      description: 'Designed for large multi-location stores & high-volume merchants.',
      features: [
        'Unlimited Product Listings',
        'Lowest 5% Platform Commission',
        'Dedicated Key Account Manager',
        'Custom Logistics API Routing',
        'pgvector AI Search Priority Boost',
        'Kubernetes High Availability'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d3748]">
      <Navbar />

      {/* Hero */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-widest bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Seller Plans & Pricing</span>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Flexible Plans for Every Seller</h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">Choose the tier that fits your e-commerce growth. Scale effortlessly with Bupzo AI Marketplace.</p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <span className={`text-xs font-bold ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly Billing</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-gray-300 rounded-full p-1 transition-colors relative"
          >
            <div className={`w-6 h-6 bg-[#3874ff] rounded-full shadow-md transform transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-bold flex items-center gap-1 ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
            Annual Billing <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-extrabold">Save 20%</span>
          </span>
        </div>
      </section>

      {/* Cards Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-3xl p-8 bg-white border transition-all relative flex flex-col justify-between ${plan.popular ? 'border-[#3874ff] shadow-xl ring-2 ring-blue-500/20' : 'border-gray-200 shadow-sm hover:shadow-md'}`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3874ff] text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-full shadow-md">
                {plan.badge}
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">{plan.name}</h2>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mt-1">
                  {plan.commission}
                </div>
              </div>

              <div className="text-3xl font-black text-gray-900">
                {isAnnual ? plan.priceAnnual : plan.priceMonthly}
              </div>

              <p className="text-xs text-gray-500 border-b border-gray-100 pb-4">{plan.description}</p>

              <ul className="space-y-3 pt-2">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="text-xs text-gray-700 font-semibold flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => alert(`Selected plan: ${plan.name}`)}
                className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${plan.popular ? 'bg-[#3874ff] hover:bg-blue-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
