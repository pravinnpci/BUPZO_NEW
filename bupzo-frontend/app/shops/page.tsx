"use client";

import React, { useState, useEffect } from 'react';
import { fetchSellers } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { useUser } from '@/lib/authStore';
import Link from 'next/link';

export default function ShopsPage() {
  const { user } = useUser();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers()
      .then(data => {
        setSellers(data.filter((s: any) => s.status === 'APPROVED'));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        onTabChange={() => {}}
        onAuthClick={() => {}}
        onCartClick={() => {}}
        cartCount={0}
        wishlistCount={0}
        unreadMsgs={0}
      />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#232f3e] mb-2">Merchant Directory</h1>
          <p className="text-gray-500">Discover top-rated sellers and exclusive stores on Bupzo.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e52e06]"></div>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-400 mb-2">No Shops Found</h2>
            <p className="text-sm text-gray-500">Check back later for new merchants.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sellers.map((seller) => (
              <Link 
                href={`/shop/${seller.id}`} 
                key={seller.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#e52e06]/30 transition-all group"
              >
                <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 relative flex items-center justify-center group-hover:from-red-50 group-hover:to-orange-50 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center text-3xl">
                    🏪
                  </div>
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-bold text-[#232f3e] text-lg mb-1 truncate">{seller.business_name || seller.businessName || seller.user_name || 'Bupzo Merchant'}</h3>
                  <p className="text-xs font-bold text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full mb-3">Verified Partner</p>
                  
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-4">
                    <span className="material-symbols-outlined text-[14px] text-yellow-500">star</span>
                    <span className="font-bold text-gray-700">{seller.rating || '4.8'}</span>
                    <span>({seller.review_count || '120+'} reviews)</span>
                  </div>
                  
                  <button className="w-full py-2 bg-gray-50 group-hover:bg-[#e52e06] group-hover:text-white text-[#e52e06] font-bold text-sm rounded-lg transition-colors">
                    Visit Store
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
