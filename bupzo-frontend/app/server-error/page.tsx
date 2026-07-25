'use client';

import Link from 'next/link';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner font-black">
          500
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Internal Server Error</h1>
        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
          Oops! Something went wrong on our end. Our technical team has been notified.
        </p>

        <div>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
