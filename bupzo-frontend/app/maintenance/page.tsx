'use client';

import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner">
          🛠️
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Under Maintenance</h1>
        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
          We are currently upgrading Bupzo AI Marketplace services. We will be back online shortly!
        </p>

        <div className="p-4 rounded-xl bg-gray-100 text-xs font-bold text-gray-700">
          Estimated completion time: ~15 minutes
        </div>

        <div>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Refresh Page
          </Link>
        </div>
      </div>
    </div>
  );
}
