"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/authStore";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, clearUser } = useUser();

  return (
    <nav className="w-full font-sans shadow-sm z-50 relative">
      {/* Top Blue Bar */}
      <div className="bg-[#0055D4] w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1">
            <div className="bg-yellow-400 text-brand-blue font-extrabold text-2xl px-3 py-1 rounded-lg transform -skew-x-12 tracking-tighter">
              Bupzo
            </div>
            <span className="text-white font-bold text-[10px] mt-4">.in</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full flex items-center">
              <input 
                type="text" 
                placeholder="Search for products and brands..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-l-md py-2.5 pl-4 pr-10 outline-none text-sm text-gray-800 placeholder-gray-500 font-medium"
              />
              <button className="bg-white px-4 py-2.5 rounded-r-md border-l border-gray-200 hover:bg-gray-50 transition-colors">
                <span className="text-yellow-400 font-bold">🔍</span>
              </button>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-6">
            
            {/* Account / Login */}
            <div className="hidden sm:flex items-center gap-2 text-white hover:text-yellow-300 cursor-pointer transition-colors group">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex flex-col leading-none">
                {user ? (
                  <>
                    <span className="text-[10px] text-blue-200">Hello,</span>
                    <span className="text-sm font-bold truncate max-w-[80px]">{user.name || user.phone}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold mt-1 group-hover:underline">Hello!</span>
                  </>
                )}
              </div>
            </div>

            {/* BupzoPass Badge (Mocking OnePass) */}
            <div className="hidden lg:flex flex-col items-center justify-center border-l border-blue-500/50 pl-6 cursor-pointer group">
              <span className="text-white font-bold text-sm group-hover:text-yellow-300 transition-colors">BupzoPass</span>
              <span className="text-xs text-blue-200">Free delivery ⌄</span>
            </div>

            {/* Wishlist */}
            <div className="text-white hover:text-yellow-300 cursor-pointer transition-colors border-l border-blue-500/50 pl-6 hidden sm:block">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>

            {/* Cart */}
            <div className="text-white hover:text-yellow-300 cursor-pointer transition-colors border-l border-blue-500/50 pl-6 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {/* Optional cart badge indicator */}
              <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="md:hidden mt-3 w-full">
            <div className="relative w-full flex items-center">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-white rounded-l-md py-2 pl-3 pr-8 outline-none text-sm"
              />
              <button className="bg-white px-3 py-2 rounded-r-md">
                <span className="text-yellow-400">🔍</span>
              </button>
            </div>
        </div>
      </div>

      {/* Secondary Category Nav */}
      <div className="bg-white border-b border-gray-200 hidden md:block w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center space-x-8 h-12 text-sm font-semibold text-gray-700">
            <li className="flex items-center gap-1 cursor-pointer hover:text-brand-blue">
              Shop All Categories <span className="text-[10px]">▼</span>
            </li>
            <li className="text-purple-600 cursor-pointer font-bold hover:text-purple-700">
              BupzoPass
            </li>
            <li className="text-brand-red border-b-2 border-brand-red h-full flex items-center cursor-pointer">
              Today's Deals
            </li>
            <li className="cursor-pointer hover:text-brand-blue">New to Bupzo</li>
            <li className="cursor-pointer hover:text-brand-blue">Top Brands</li>
            <li className="cursor-pointer hover:text-brand-blue">Clearance</li>
          </ul>
        </div>
      </div>
      
      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full left-0 z-40 border-b">
          <div className="px-4 py-3 space-y-3">
             <Link href="/seller" className="block text-gray-800 font-bold hover:text-brand-blue py-2 border-b">Seller Portal</Link>
             <Link href="/" className="block text-gray-800 font-bold hover:text-brand-blue py-2">Today's Deals</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
