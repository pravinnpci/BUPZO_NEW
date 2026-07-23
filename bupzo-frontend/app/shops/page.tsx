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
  const [followedSellers, setFollowedSellers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSellers()
      .then(data => {
        const approved = data.filter((s: any) => s.status === 'APPROVED');
        setSellers(approved);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = (sellerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowedSellers(prev => {
      const isFollowing = !prev[sellerId];
      // Sync follow count on state
      setSellers(sList => sList.map(s => {
        if (s.id === sellerId) {
          const currentCount = s.followers_count || s.followers || 0;
          return {
            ...s,
            followers_count: isFollowing ? currentCount + 1 : Math.max(0, currentCount - 1)
          };
        }
        return s;
      }));
      return { ...prev, [sellerId]: isFollowing };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
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
          <p className="text-gray-500 text-sm">Discover verified sellers, ratings, and exclusive stores on Bupzo.</p>
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
            {sellers.map((seller) => {
              const ratingVal = seller.rating ? Number(seller.rating).toFixed(1) : '4.5';
              const reviewCountVal = seller.review_count !== undefined ? seller.review_count : 0;
              const followersCountVal = seller.followers_count !== undefined ? seller.followers_count : 0;
              const isFollowing = !!followedSellers[seller.id];

              return (
                <div 
                  key={seller.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:border-[#e52e06]/30 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 relative flex items-center justify-center group-hover:from-red-50 group-hover:to-orange-50 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center text-3xl">
                        🏪
                      </div>
                      <button
                        onClick={(e) => toggleFollow(seller.id, e)}
                        className={`absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full shadow transition ${
                          isFollowing 
                            ? 'bg-green-600 text-white' 
                            : 'bg-white/90 text-gray-800 hover:bg-[#e52e06] hover:text-white'
                        }`}
                      >
                        {isFollowing ? '✓ Following' : '+ Follow'}
                      </button>
                    </div>

                    <div className="p-5 text-center">
                      <h3 className="font-bold text-[#232f3e] text-lg mb-1 truncate">
                        {seller.business_name || seller.businessName || seller.user_name || 'Bupzo Merchant'}
                      </h3>
                      <p className="text-xs font-bold text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full mb-3">
                        Verified Partner
                      </p>
                      
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-2 font-semibold">
                        <span className="material-symbols-outlined text-[14px] text-yellow-500">star</span>
                        <span className="font-bold text-gray-800">{ratingVal}</span>
                        <span className="text-gray-500">({reviewCountVal} reviews)</span>
                      </div>

                      <div className="text-[11px] text-gray-500 mb-4 font-mono font-medium">
                        👥 {followersCountVal} Followers
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={`/shop/${seller.id}`}
                      className="block w-full py-2.5 bg-gray-100 group-hover:bg-[#e52e06] group-hover:text-white text-[#e52e06] font-bold text-sm text-center rounded-lg transition-colors shadow-sm"
                    >
                      Visit Store
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Switch to Seller Dashboard Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => { window.location.href = '/?seller=true'; }}
          className="bg-[#232f3e] hover:bg-[#1a232e] text-white text-xs font-extrabold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-gray-700 transition hover:scale-105 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm text-yellow-400">storefront</span>
          Switch to Seller Dashboard
        </button>
      </div>
    </div>
  );
}
