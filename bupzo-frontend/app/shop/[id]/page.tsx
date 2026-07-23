"use client";

import { useState, useEffect } from 'react';
import { Product, fetchSellerDetails, fetchSellerProducts, fetchSellerFollowers, followSeller, unfollowSeller, fetchSellerReviews, API_BASE_URL } from '@/lib/api';
import { useParams } from 'next/navigation';
import ProductPreviewModal from '@/components/ProductPreviewModal';
import { useUser } from '@/lib/authStore';
import { useCartStore } from '@/lib/cartStore';
import { addToWishlist, getWishlistItems } from '@/lib/api';
import { Navbar } from '@/components/Navbar';

export default function SellerShopPage() {
  const { id } = useParams() as { id: string };
  const { user } = useUser();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  
  // Dynamic Live Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Review Form inside Store Modal
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Modals for Stats
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);

  const cartStore = useCartStore();

  const loadFollowersAndReviews = async () => {
    try {
      const [fData, rData] = await Promise.all([
        fetchSellerFollowers(id),
        fetchSellerReviews(id)
      ]);
      if (fData) {
        setFollowersCount(fData.count || 0);
        setFollowersList(fData.followers || []);
        if (user && fData.followers?.some((f: any) => f.id === user.id)) {
          setIsFollowing(true);
        }
      }
      if (rData) {
        setStoreReviews(rData);
      }
    } catch(e) {}
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [sellerData, productsData] = await Promise.all([
          fetchSellerDetails(id),
          fetchSellerProducts(id)
        ]);
        setSeller(sellerData);
        setProducts(productsData);
        await loadFollowersAndReviews();
      } catch (e) {
        console.error("Failed to load shop data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!user || !user.id) {
      alert("Please login to follow this store.");
      return;
    }
    try {
      if (isFollowing) {
        await unfollowSeller(id, user.id);
        setIsFollowing(false);
        setFollowersCount(c => Math.max(0, c - 1));
        alert("Unfollowed store.");
      } else {
        await followSeller(id, user.id);
        setIsFollowing(true);
        setFollowersCount(c => c + 1);
        alert("You are now following this store!");
      }
      loadFollowersAndReviews();
    } catch(e) {
      alert("Failed to update follow status.");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#e52e06]"></div></div>;
  if (!seller) return <div className="text-center py-20 text-gray-500 font-bold">Shop not found.</div>;

  // Derive unique categories from seller products with fallback
  const categories = Array.from(new Set(products.map(p => p.category_name || (p as any).category || 'General')));

  // Filtered & Sorted products
  const filteredProducts = products.filter(p => {
    const pCat = p.category_name || (p as any).category || 'General';
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(pCat);
    const matchesPrice = p.price <= maxPrice;
    return matchesSearch && matchesCat && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'low') return a.price - b.price;
    if (sortBy === 'high') return b.price - a.price;
    return 0;
  });

  return (
    <div className="bg-[#f0f2f5] min-h-screen pb-20 flex flex-col font-sans relative">
      <Navbar 
        cartCount={cartStore.cart.reduce((sum, i) => sum + i.quantity, 0)} 
        wishlistCount={cartStore.wishlist.length} 
        unreadMsgs={0} 
        onTabChange={(t) => window.location.href = '/?tab=' + t}
        onAuthClick={() => window.location.href = '/'}
        onCartClick={() => window.location.href = '/'}
      />

      {/* Header Profile Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-md border-2 border-red-100 font-black text-3xl">
               🏪
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900">{seller.business_name || 'Seller Shop'}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-3 text-sm">
                
                {/* Clickable Ratings */}
                <button 
                  onClick={() => setShowRatingsModal(true)}
                  className="flex items-center gap-1.5 font-extrabold text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  <span className="text-[#23bb75] flex items-center gap-0.5">{seller.rating || '4.1'} ★</span>
                  <span className="text-gray-500 font-medium">Ratings</span>
                </button>

                {/* Clickable Followers */}
                <button 
                  onClick={() => setShowFollowersModal(true)}
                  className="flex items-center gap-1.5 font-extrabold text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  <span>{followersCount}</span>
                  <span className="font-medium text-gray-500">Followers</span>
                </button>

                {/* Clickable Products Count */}
                <button 
                  onClick={() => {
                    const el = document.getElementById('products-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 font-extrabold text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  <span>{products.length}</span>
                  <span className="font-medium text-gray-500">Products</span>
                </button>
              </div>
            </div>
            <div>
              <button 
                onClick={handleToggleFollow}
                className={`px-8 py-3 ${isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-[#e52e06] text-white hover:bg-[#cc2805]'} rounded-lg font-extrabold transition shadow-lg`}
              >
                {isFollowing ? 'Following ✓' : '+ Follow Store'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="products-section" className="max-w-7xl mx-auto px-4 mt-8 w-full flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">All Products</h2>
            <p className="text-sm text-gray-500">Showing {filteredProducts.length} of {products.length} products</p>
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none bg-white shadow-sm font-semibold"
          >
            <option value="relevance">Sort by : Relevance</option>
            <option value="low">Price : Low to High</option>
            <option value="high">Price : High to Low</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Dynamic Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#e52e06]">filter_list</span> Live Filters
              </h3>
              
              {/* Search Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Search Products</label>
                <input 
                  type="text"
                  placeholder="Type product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-[#e52e06]"
                />
              </div>

              {/* Category Filter Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Categories (Select Multiple)</label>
                <div className="space-y-1.5 text-xs text-gray-700 max-h-48 overflow-y-auto pr-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold border-b pb-1">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.length === 0} 
                      onChange={() => setSelectedCategories([])}
                      className="accent-[#e52e06] w-3.5 h-3.5 rounded" 
                    />
                    All Categories ({products.length})
                  </label>
                  {categories.map(cat => {
                    const isChecked = selectedCategories.includes(cat);
                    const catCount = products.filter(p => (p.category_name || (p as any).category || 'General') === cat).length;
                    return (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer font-semibold hover:text-[#e52e06] transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => {
                            if (isChecked) {
                              setSelectedCategories(prev => prev.filter(c => c !== cat));
                            } else {
                              setSelectedCategories(prev => [...prev, cat]);
                            }
                          }}
                          className="accent-[#e52e06] w-3.5 h-3.5 rounded" 
                        />
                        <span>{cat}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({catCount})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {/* Price Filter with Manual Number Input */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Max Price (₹):</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-24 border border-gray-300 rounded px-2 py-1 text-xs font-bold outline-none focus:border-[#e52e06] text-right"
                  />
                </div>
                <input 
                  type="range"
                  min="50"
                  max="10000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#e52e06]"
                />
              </div>

              {(searchQuery || selectedCategories.length > 0 || maxPrice < 10000) && (
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategories([]); setMaxPrice(10000); }}
                  className="w-full py-1.5 text-xs font-bold text-[#e52e06] border border-[#e52e06] rounded-lg hover:bg-red-50 transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500 font-bold border border-gray-200">
                No products match your selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(p => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group flex flex-col">
                    <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative p-4 flex items-center justify-center">
                      <img src={p.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' }} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">{p.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-base font-extrabold text-gray-900">₹{p.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{Math.floor(p.price * 1.4)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                         <span className="bg-[#23bb75] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          4.1 ★
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">Verified Seller Product</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Preview Modal */}
      {selectedProduct && (
        <ProductPreviewModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={(p) => {
             cartStore.addToCart(p);
             alert(`"${p.name}" added to cart!`);
             setSelectedProduct(null);
          }}
          onAddToWishlist={async (p) => {
             if (!user || !user.id || !user.phone) {
               alert("Please login to add items to your wishlist.");
               return;
             }
             try {
               await addToWishlist(p.id, user.id);
               alert(`"${p.name}" added to wishlist!`);
               const wishs = await getWishlistItems(user.id);
               cartStore.setWishlist(wishs);
             } catch (err: any) {
               console.warn(err);
               alert(err.message || "Failed to add item to wishlist.");
             }
          }}
        />
      )}

      {/* Ratings Modal with Live DB Data */}
      {showRatingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg text-gray-900">Store Ratings & Reviews ({storeReviews.length})</h3>
              <button onClick={() => setShowRatingsModal(false)} className="text-gray-500 font-bold hover:text-black">✕</button>
            </div>
            
            <div className="text-center py-4 bg-emerald-50 rounded-xl">
              <div className="text-4xl font-extrabold text-[#23bb75]">
                {storeReviews.length > 0 ? (storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length).toFixed(1) : (seller?.rating || '4.8')} ★
              </div>
              <p className="text-xs text-emerald-800 font-bold mt-1">Verified Customer Store Rating</p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto text-xs">
              {storeReviews.length === 0 ? (
                <p className="text-center text-gray-500 italic py-4">No reviews recorded yet for this merchant.</p>
              ) : (
                storeReviews.map((r, idx) => (
                  <div key={r.id || idx} className="p-3 border rounded-lg bg-gray-50 space-y-1">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>{r.user_name || 'Customer'}</span>
                      <span className="text-[#23bb75] font-extrabold">{r.rating} ★</span>
                    </div>
                    <p className="text-gray-700">{r.comment || r.content}</p>
                    {r.product_name && <p className="text-[10px] text-gray-400 font-semibold">Product: {r.product_name}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal with Live DB Data */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg text-gray-900">Store Followers ({followersCount})</h3>
              <button onClick={() => setShowFollowersModal(false)} className="text-gray-500 font-bold hover:text-black">✕</button>
            </div>
            <div className="space-y-2.5 max-h-64 overflow-y-auto text-xs">
              {followersList.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p className="font-bold mb-1">No followers yet</p>
                  <p className="text-[11px]">Be the first to follow this merchant!</p>
                </div>
              ) : (
                followersList.map((f, i) => (
                  <div key={f.id || i} className="flex items-center gap-3 p-2.5 border-b last:border-0 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-[#e52e06] font-bold flex items-center justify-center">
                      {(f.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{f.name || 'Bupzo Shopper'}</p>
                      <p className="text-[10px] text-gray-400">{f.email ? f.email.replace(/(.{2})(.*)(?=@)/, '$1***') : 'Follower'}</p>
                    </div>
                    <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded">Following</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
