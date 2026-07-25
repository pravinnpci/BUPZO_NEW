'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-24 h-24 bg-blue-50 text-[#3874ff] rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner font-black">
          404
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Page Not Found</h1>
        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-[#3874ff] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
