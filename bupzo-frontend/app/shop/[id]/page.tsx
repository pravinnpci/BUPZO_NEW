"use client";

import { useState, useEffect } from 'react';
import { Product, fetchSellerDetails, fetchSellerProducts } from '@/lib/api';
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
  const cartStore = useCartStore();

  useEffect(() => {
    async function loadData() {
      try {
        const [sellerData, productsData] = await Promise.all([
          fetchSellerDetails(id),
          fetchSellerProducts(id)
        ]);
        setSeller(sellerData);
        setProducts(productsData);
      } catch (e) {
        console.error("Failed to load shop data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0055D4]"></div></div>;
  if (!seller) return <div className="text-center py-20 text-gray-500 font-bold">Shop not found.</div>;

  return (
    <div className="bg-[#f0f2f5] min-h-screen pb-12 flex flex-col">
      <Navbar 
        cartCount={cartStore.cart.reduce((sum, i) => sum + i.quantity, 0)} 
        wishlistCount={cartStore.wishlist.length} 
        unreadMsgs={0} 
        onTabChange={(t) => window.location.href = '/?tab=' + t}
        onAuthClick={() => window.location.href = '/'}
        onCartClick={() => window.location.href = '/'}
      />
      {/* Header Profile Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{seller.business_name || 'Seller Shop'}</h1>
              <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1 font-bold text-gray-900">
                  <span className="text-[#23bb75] flex items-center gap-0.5">{seller.rating || '4.1'} <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></span>
                  <span className="text-gray-500 font-normal">Ratings</span>
                </span>
                <span className="font-bold text-gray-900">{isFollowing ? '94' : '93'} <span className="font-normal text-gray-500">Followers</span></span>
                <span className="font-bold text-gray-900">{products.length} <span className="font-normal text-gray-500">Products</span></span>
              </div>
            </div>
            <div>
              <button 
                onClick={() => {
                  setIsFollowing(!isFollowing);
                  alert(isFollowing ? "Unfollowed seller." : "You are now following this seller!");
                }}
                className={`px-8 py-2.5 ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-brand-blue text-white hover:bg-blue-700'} rounded font-bold transition shadow`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">All Products</h2>
        <p className="text-sm text-gray-500 mb-6">Showing 1-{products.length} out of {products.length} products</p>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-64 shrink-0 space-y-4 hidden md:block">
            <select className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-700 outline-none focus:border-gray-400 bg-white shadow-sm mb-4">
              <option>Sort by : Relevance</option>
              <option>Sort by : New Arrivals</option>
              <option>Sort by : Price (Low to High)</option>
              <option>Sort by : Price (High to Low)</option>
            </select>
            
            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
              <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide mb-1">Filters</h3>
              <p className="text-xs text-gray-400 mb-4">{products.length} Products</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-700 mb-2 text-sm flex justify-between items-center cursor-pointer">Category <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg></h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Bedsheets</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Boxes, Baskets & Bins</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Comforter Sets</label>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-700 mb-3 text-sm flex justify-between items-center cursor-pointer">Color <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg></h4>
                  <div className="flex flex-wrap gap-2">
                    {['Beige', 'Black', 'Brown', 'Grey', 'Maroon', 'Multicolor'].map(c => (
                      <button key={c} className="px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-600 hover:border-gray-300">{c}</button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-700 text-sm flex justify-between items-center cursor-pointer">Fabric <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></h4>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-700 text-sm flex justify-between items-center cursor-pointer">Price <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></h4>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white border border-gray-200 rounded overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group relative flex flex-col">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative p-4 flex items-center justify-center">
                    <img src={p.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' }} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="text-sm text-gray-500 font-medium truncate">{p.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{p.price}</span>
                      <span className="text-xs text-gray-500 line-through">₹{Math.floor(p.price * 1.5)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                       <span className="bg-[#23bb75] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        4.1 <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">17373 Reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
}
