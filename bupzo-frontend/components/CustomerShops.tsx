"use client";

import React, { useState, useEffect } from 'react';
import { fetchSellers, API_BASE_URL } from '@/lib/api';
import { useUser } from '@/lib/authStore';

interface CustomerShopsProps {
  onSelectShop?: (shopId: string) => void;
}

export function CustomerShops({ onSelectShop }: CustomerShopsProps) {
  const { user } = useUser();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedSellers, setFollowedSellers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const activeUserId = user?.id || 'e6db98c7-06a2-4887-aab2-539bd9280f01';
    Promise.all([
      fetchSellers(),
      fetch(`${API_BASE_URL}/api/users/${activeUserId}/followed-sellers`).then(res => res.ok ? res.json() : []).catch(() => [])
    ])
      .then(([data, followedIds]) => {
        const approved = data.filter((s: any) => s.status === 'APPROVED');
        setSellers(approved);
        if (Array.isArray(followedIds)) {
          const initialMap: Record<string, boolean> = {};
          followedIds.forEach((id: string) => { initialMap[id] = true; });
          setFollowedSellers(initialMap);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const toggleFollow = async (sellerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyFollowing = !!followedSellers[sellerId];
    const newFollowingState = !isCurrentlyFollowing;

    setFollowedSellers(prev => ({ ...prev, [sellerId]: newFollowingState }));
    setSellers(sList => sList.map(s => {
      if (s.id === sellerId) {
        const currentCount = s.followers_count || 0;
        return {
          ...s,
          followers_count: newFollowingState ? currentCount + 1 : Math.max(0, currentCount - 1)
        };
      }
      return s;
    }));

    try {
      const activeUserId = user?.id || 'e6db98c7-06a2-4887-aab2-539bd9280f01';
      if (newFollowingState) {
        await fetch(`${API_BASE_URL}/api/sellers/${sellerId}/follow?user_id=${activeUserId}`, { method: 'POST' });
      } else {
        await fetch(`${API_BASE_URL}/api/sellers/${sellerId}/follow?user_id=${activeUserId}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.error("Failed to update follow status in DB:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl font-sans">
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
                      className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold transition shadow-sm ${
                        isFollowing 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-white/90 text-gray-800 hover:bg-white border border-gray-200'
                      }`}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </button>
                  </div>

                  <div className="p-4 text-center">
                    <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-[#e52e06] transition-colors">
                      {seller.business_name || 'Verified Store'}
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                      Verified Partner
                    </span>

                    <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-500 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">★</span> {ratingVal} <span className="text-gray-400">({reviewCountVal})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👥</span> {followersCountVal} Followers
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      if (onSelectShop) {
                        onSelectShop(seller.id);
                      } else {
                        window.location.href = `/shop/${seller.id}`;
                      }
                    }}
                    className="w-full py-2 bg-gray-100 group-hover:bg-[#e52e06] text-gray-800 group-hover:text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-1 shadow-sm"
                  >
                    Visit Store
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
