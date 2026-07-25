'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

const FAQ_DATA = [
  {
    category: 'Orders & Delivery',
    icon: '📦',
    questions: [
      { q: 'How long does delivery take on Bupzo?', a: 'Standard delivery usually takes 2-4 business days depending on seller location and Shiprocket logistics partner routing.' },
      { q: 'Can I track my live shipment?', a: 'Yes! Once shipped, you can track live updates via your Orders tab using the integrated logistics tracking ID.' },
      { q: 'What happens if a product is damaged?', a: 'You can request an instant refund to your Bupzo Escrow Wallet within 7 days of delivery.' }
    ]
  },
  {
    category: 'Payments & Escrow',
    icon: '💳',
    questions: [
      { q: 'Is Razorpay payment secure?', a: 'Yes, all transactions use 256-bit SSL encryption powered by Razorpay payment gateway.' },
      { q: 'How does the Bupzo Escrow Wallet work?', a: 'Customer payments are held safely in escrow and released to merchant sellers only upon confirmed delivery.' }
    ]
  },
  {
    category: 'Merchant Selling',
    icon: '🏪',
    questions: [
      { q: 'How do I register as a seller store on Bupzo?', a: 'Click "Switch to Seller Dashboard" or visit Seller Onboarding to submit your store name, phone, and GST/KYC documents.' },
      { q: 'What commission rates apply to sellers?', a: 'Bupzo charges competitive commission rates ranging between 5% and 10% based on seller tier.' }
    ]
  }
];

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const filteredCategories = FAQ_DATA.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      (activeCategory === 'All' || cat.category === activeCategory) &&
      (q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase()))
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d3748]">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-blue-100">Help Center & Support</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Frequently Asked Questions</h1>
          <p className="text-sm md:text-base text-blue-100 max-w-2xl mx-auto">Have questions about orders, payments, escrow wallet, or seller onboarding? We have answers.</p>

          <div className="max-w-xl mx-auto mt-6 relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions or keywords..."
              className="w-full px-6 py-4 rounded-2xl border-0 text-gray-900 shadow-xl outline-none text-sm pr-12"
            />
            <span className="absolute right-4 top-4 text-xl">🔍</span>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'All' ? 'bg-[#3874ff] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            All Questions
          </button>
          {FAQ_DATA.map(cat => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeCategory === cat.category ? 'bg-[#3874ff] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            >
              <span>{cat.icon}</span> {cat.category}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {filteredCategories.map(cat => (
            <div key={cat.category} className="space-y-4">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>{cat.icon}</span> {cat.category}
              </h2>

              <div className="space-y-3">
                {cat.questions.map((item, idx) => {
                  const itemKey = `${cat.category}-${idx}`;
                  const isOpen = openIndex === itemKey;
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : itemKey)}
                        className="w-full px-6 py-4 text-left font-bold text-sm text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span>{item.q}</span>
                        <span className="text-lg font-bold text-gray-400">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-xs text-gray-600 border-t border-gray-50 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="font-bold text-gray-900">No matching questions found</h3>
              <p className="text-xs text-gray-500 mt-1">Try searching with different keywords.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
