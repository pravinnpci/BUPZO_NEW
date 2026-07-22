import React, { useState, useEffect } from 'react';
import { Product, API_BASE_URL, uploadImage } from '@/lib/api';
import { useUser } from '@/lib/authStore';

interface ProductPreviewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onBuyNow?: () => void;
}

export default function ProductPreviewModal({ product, onClose, onAddToCart, onAddToWishlist, onBuyNow }: ProductPreviewModalProps) {
  const { user } = useUser();
  const [activeImage, setActiveImage] = useState(product.image_url || 'https://placehold.co/400/png');
  const [referralLink, setReferralLink] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('Double');
  const [sellerName, setSellerName] = useState<string>('Seller');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchReviewsAndStats = async () => {
      try {
        const [reviewsResp, statsResp] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reviews/?product_id=${product.id}`),
          fetch(`${API_BASE_URL}/api/products/${product.id}/stats`)
        ]);
        if (reviewsResp.ok) {
          setReviews(await reviewsResp.json());
        }
        if (statsResp.ok) {
          setStats(await statsResp.json());
        }
      } catch (e) {
        console.warn("Failed to load reviews/stats", e);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviewsAndStats();
    
    const fetchSeller = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/sellers/${product.seller_id}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.business_name) setSellerName(data.business_name);
        }
      } catch (e) {}
    }
    fetchSeller();
  }, [product.id, product.seller_id]);

  const generateReferralLink = () => {
    if (!user) {
      alert("Please sign in to generate a referral link.");
      return;
    }
    const link = `${window.location.origin}/product/${product.id}?ref=${user.id}`;
    setReferralLink(link);
    navigator.clipboard.writeText(link);
    alert("Referral link copied to clipboard!");
  };

  let parsedImages: string[] = [];
  try {
    if (product.images && typeof product.images === 'string') parsedImages = JSON.parse(product.images);
    else if (Array.isArray(product.images)) parsedImages = product.images;
  } catch(e) {}
  
  if (parsedImages.length === 0 && product.image_url) {
    if (product.image_url.includes(',')) {
      parsedImages = product.image_url.split(',').map(url => url.trim()).filter(url => url);
    } else {
      parsedImages = [product.image_url];
    }
  }

  const images = parsedImages.slice(0, 4);
  
  // Dynamic Sizes based on Category
  const cat = (product.category_name || '').toLowerCase();
  let sizes: string[] = [];
  let variantLabel = "Select Variant";
  let showVariants = true;

  if (cat.includes('fashion') || cat.includes('dress') || cat.includes('cloth')) {
    sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    variantLabel = "Select Size";
  } else if (cat.includes('food') || cat.includes('grocer')) {
    sizes = ['250g', '500g', '1kg', '2kg'];
    variantLabel = "Select Weight";
  } else if (cat.includes('home') || cat.includes('bed')) {
    sizes = ['Single', 'Double', 'Queen', 'King'];
    variantLabel = "Select Size";
  } else {
    showVariants = false; // Optional for other categories
  }

  // Set default selected size if variants are shown
  useEffect(() => {
    if (showVariants && sizes.length > 0 && !sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
  }, [showVariants, sizes]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#f0f2f5] dark:bg-gray-900 w-full max-w-6xl rounded-lg shadow-2xl relative flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute z-50 top-4 right-4 bg-white dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 shadow-md hover:bg-gray-100 transition">×</button>
        
        {/* Left Side: Images & Buy Actions */}
        <div className="w-full md:w-5/12 bg-white dark:bg-gray-800 p-6 flex flex-col overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 mb-4">
            {/* Thumbnails Sidebar */}
            <div className="flex flex-col gap-2 w-16 shrink-0">
              {images.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  className={`w-14 h-14 rounded border cursor-pointer object-cover ${activeImage === img ? 'border-[#0055D4]' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setActiveImage(img)}
                  alt={`${product.name} thumbnail ${i}`}
                />
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 relative border border-gray-100 rounded flex items-center justify-center min-h-[350px] p-2">
              <img src={activeImage} alt={product.name} className="w-full h-auto max-h-[450px] object-contain mix-blend-multiply dark:mix-blend-normal" />
              <div className="absolute bottom-4 right-4 bg-white/90 shadow-md backdrop-blur rounded-full px-4 py-2 text-xs font-bold text-gray-800 border border-gray-200">
                360° VIEW
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mb-6">
            <button 
              onClick={() => { 
                const productWithVariant = showVariants ? { ...product, name: `${product.name} (${selectedSize})` } : product;
                onAddToCart(productWithVariant); 
                onClose(); 
              }} 
              className="flex-1 py-3 px-4 border border-[#0055D4] text-[#0055D4] rounded flex items-center justify-center gap-2 font-bold hover:bg-blue-50 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Add to Cart
            </button>
            <button 
              onClick={() => { 
                const productWithVariant = showVariants ? { ...product, name: `${product.name} (${selectedSize})` } : product;
                onAddToCart(productWithVariant); 
                onClose(); 
                if (onBuyNow) onBuyNow();
              }} 
              className="flex-1 py-3 px-4 bg-[#0055D4] text-white rounded flex items-center justify-center gap-2 font-bold shadow hover:bg-blue-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Buy Now
            </button>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-sm">Similar Products</h3>
            <div className="flex gap-2">
               {images.slice(0, 3).map((img, i) => (
                 <img key={`sim-${i}`} src={img} className="w-16 h-16 rounded border border-gray-200 object-cover" />
               ))}
            </div>
          </div>
        </div>
        
        {/* Right Side: Details Cards (Meesho Style) */}
        <div className="w-full md:w-7/12 p-4 md:p-6 overflow-y-auto space-y-4">
          
          {/* Card 1: Title & Price */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 relative">
            
            {/* Wishlist Heart Icon */}
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToWishlist(product); }}
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition"
              title="Add to Wishlist"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>

            <h1 className="text-xl text-gray-600 dark:text-gray-300 font-medium mb-3 leading-snug pr-8">{product.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
              <span className="text-sm text-gray-500 font-medium mt-1">onwards</span>
              <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#23bb75] text-white text-sm font-bold px-2 py-1 rounded flex items-center gap-1">
                {stats ? stats.average_rating : 4.1} <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </span>
              <span className="text-xs text-gray-500 font-medium">{stats ? stats.total_ratings : 0} Ratings, {stats ? stats.total_reviews : 0} Reviews</span>
            </div>
          </div>

          {/* Card 2: Select Variant (Dynamic) */}
          {showVariants && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-base">{variantLabel}</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition flex flex-col items-center ${selectedSize === s ? 'border-[#0055D4] text-[#0055D4] bg-blue-50' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                  >
                    <span>{s}</span>
                    <span className={`text-[10px] ${selectedSize === s ? 'text-[#0055D4]' : 'text-gray-400'}`}>
                      ₹{product.price + (sizes.indexOf(s) * 50)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card 3: Product Highlights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 relative">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-base">Product Highlights</h3>
            <button className="absolute top-5 right-5 text-xs font-bold text-[#0055D4]">COPY</button>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Net Quantity (N)</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">1</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.category_name || 'Fitted Bedsheets'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Color</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Multicolor</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Thread Count</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">320</span>
              </div>
            </div>
            
            <details className="text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 pt-3 group">
              <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                Additional Details
                <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </summary>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">{product.description}</p>
            </details>
          </div>

          {/* Card 4: Sold By */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-base">Sold By</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-gray-100">{sellerName}</h4>
              </div>
              <button onClick={() => { onClose(); window.location.href = `/shop/${product.seller_id}`; }} className="px-4 py-1.5 border border-[#0055D4] text-[#0055D4] rounded font-bold text-sm hover:bg-blue-50 transition">View Shop</button>
            </div>
            
            <div className="flex justify-around mb-4 text-center">
              <div>
                <div className="font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">{stats ? stats.average_rating : 4.1} <svg className="w-3 h-3 text-[#23bb75]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></div>
                <div className="text-xs text-gray-500">{stats ? stats.total_ratings : 0} Ratings</div>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">Active</div>
                <div className="text-xs text-gray-500">Status</div>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">KYC</div>
                <div className="text-xs text-gray-500">Verified</div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 pt-3">
              <button onClick={() => { 
                  if (!localStorage.getItem('auth_token')) {
                     alert("Please login to contact the seller.");
                  } else {
                     onClose(); 
                     window.location.href = `/?tab=messages&to=${product.seller_id}`; 
                  }
               }} className="flex-1 text-xs font-bold bg-blue-50 text-blue-600 py-2 rounded">✉️ Contact Seller</button>
              <button onClick={generateReferralLink} className="flex-1 text-xs font-bold bg-green-50 text-green-600 py-2 rounded">🔗 Affiliate Link</button>
            </div>
            {referralLink && (
              <input type="text" readOnly value={referralLink} className="w-full mt-2 text-xs p-2 rounded bg-gray-100 border border-gray-200 outline-none text-center text-gray-600" />
            )}
          </div>

          {/* Card 5: Ratings & Reviews */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-base">Product Ratings & Reviews</h3>
            
            <div className="flex gap-6 mb-6">
              <div className="flex flex-col justify-center items-center">
                <div className="text-4xl font-bold text-[#23bb75] flex items-center gap-1">
                  {stats ? stats.average_rating : 4.1} <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </div>
                <div className="text-[10px] text-gray-500 text-center mt-1">{stats ? stats.total_ratings : 0} Ratings,<br/>{stats ? stats.total_reviews : 0} Reviews</div>
              </div>

              <div className="flex-1 space-y-1">
                {(() => {
                  const dist = stats && stats.distribution ? stats.distribution : [
                    { label: 'Excellent', percent: 70, count: 9015, color: 'bg-[#23bb75]' },
                    { label: 'Very Good', percent: 40, count: 4644, color: 'bg-[#23bb75]' },
                    { label: 'Good', percent: 20, count: 1993, color: 'bg-yellow-400' },
                    { label: 'Average', percent: 5, count: 601, color: 'bg-orange-400' },
                    { label: 'Poor', percent: 10, count: 1117, color: 'bg-red-500' },
                  ];
                  return dist.map((bar: any) => (
                    <div key={bar.label} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-16">{bar.label}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color}`} style={{ width: `${bar.percent}%` }}></div>
                      </div>
                      <span className="w-8 text-right text-gray-400">{bar.count}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-4">
              {/* Add Review Form */}
              {user ? (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 text-gray-800 dark:text-gray-200">Write a Review</h4>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const rating = parseInt((form.elements.namedItem('rating') as HTMLSelectElement).value);
                    const comment = (form.elements.namedItem('comment') as HTMLTextAreaElement).value;
                    const fileInput = form.elements.namedItem('image') as HTMLInputElement;
                    
                    let imageUrls: string[] = [];
                    if (fileInput.files && fileInput.files.length > 0) {
                      const file = fileInput.files[0];
                      try {
                        const uploadRes = await uploadImage(file);
                        if (uploadRes.success) {
                          imageUrls.push(uploadRes.url);
                        }
                      } catch (e) {
                        alert("Failed to upload image");
                        return;
                      }
                    }

                    try {
                      const res = await fetch(`${API_BASE_URL}/api/reviews/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_id: user.id,
                          product_id: product.id,
                          rating,
                          comment,
                          images: imageUrls
                        })
                      });
                      if (res.ok) {
                        const newRev = await res.json();
                        setReviews([newRev, ...reviews]);
                        form.reset();
                        alert("Review submitted successfully!");
                      } else {
                        const err = await res.json();
                        alert(err.detail || "Failed to submit review.");
                      }
                    } catch(e) {
                      alert("Error submitting review.");
                    }
                  }}>
                    <div className="flex gap-2 mb-2">
                      <select name="rating" className="border border-gray-300 rounded p-1 text-sm bg-white dark:bg-gray-600 dark:text-white" required>
                        <option value="5">5 ★ - Excellent</option>
                        <option value="4">4 ★ - Very Good</option>
                        <option value="3">3 ★ - Good</option>
                        <option value="2">2 ★ - Average</option>
                        <option value="1">1 ★ - Poor</option>
                      </select>
                    </div>
                    <textarea 
                      name="comment" 
                      placeholder="Share your experience with this product..."
                      className="w-full border border-gray-300 rounded p-2 text-sm bg-white dark:bg-gray-600 dark:text-white mb-2"
                      required
                    ></textarea>
                    <div className="mb-3">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Attach Image (Optional)</label>
                      <input type="file" name="image" accept="image/*" className="text-xs" />
                    </div>
                    <button type="submit" className="bg-[#0055D4] text-white text-xs font-bold px-4 py-2 rounded hover:bg-blue-800 transition">
                      Submit Review
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-center text-gray-500">
                  <button onClick={() => { onClose(); window.location.href = '/'; alert('Please use the Login button on the homepage.'); }} className="text-[#0055D4] font-bold hover:underline">Log in</button> to write a review.
                </div>
              )}
              
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No reviews yet.</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="pb-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                        {r.user_name ? r.user_name.charAt(0) : 'U'}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{r.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#23bb75] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        {r.rating} ★
                      </span>
                      <span className="text-xs text-gray-400">Posted recently</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{r.comment}</p>
                    {(() => {
                      let rImages = [];
                      try { rImages = typeof r.images === 'string' ? JSON.parse(r.images) : r.images; } catch(e) {}
                      return rImages && rImages.length > 0 ? (
                        <div className="mt-3 flex gap-2">
                          {rImages.map((img: string, idx: number) => (
                            <img key={idx} src={img} className="w-16 h-16 object-cover rounded border border-gray-200" />
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
