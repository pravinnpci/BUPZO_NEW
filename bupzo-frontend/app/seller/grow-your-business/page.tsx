import React from 'react';

export default function GrowBusinessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20">
      <div className="max-w-4xl w-full px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Grow Your Business</h1>
        <div className="bg-white p-8 rounded shadow text-gray-700">
          <p className="mb-4">With BUPZO's advanced tools, scaling your business is easier than ever.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="border border-gray-200 p-4 rounded bg-blue-50">
              <h3 className="font-bold text-brand-blue mb-2">AI Generated Listings</h3>
              <p className="text-sm">Our built-in AI will help you write SEO optimized descriptions and tags automatically.</p>
            </div>
            <div className="border border-gray-200 p-4 rounded bg-purple-50">
              <h3 className="font-bold text-[#A6808C] mb-2">Analytics & Insights</h3>
              <p className="text-sm">Track views, clicks, and revenue in real-time on your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
