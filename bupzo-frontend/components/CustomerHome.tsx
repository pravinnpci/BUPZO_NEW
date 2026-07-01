import React, { useRef } from 'react';
import { Product } from '@/lib/api';

interface CustomerHomeProps {
  products: Product[];
  setPreviewProduct: (p: Product) => void;
  handleAddToWishlist: (p: Product) => void;
  handleAddToCart: (p: Product) => void;
  categories: { id: string; name: string }[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  products,
  setPreviewProduct,
  handleAddToWishlist,
  handleAddToCart,
  categories,
  selectedCategoryId,
  setSelectedCategoryId
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -800, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 800, behavior: 'smooth' });
    }
  };

  const recommendedProducts = products.filter(p => !selectedCategoryId || p.category_id === selectedCategoryId);

  return (
    <div className="w-full bg-brand-gray-light min-h-screen pb-12 font-sans">
      
      {/* Category Pills Header */}
      {categories.length > 0 && (
        <div className="bg-white px-4 py-4 mb-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedCategoryId(null)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${!selectedCategoryId ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-blue hover:text-brand-blue'}`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategoryId === cat.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-blue hover:text-brand-blue'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-6">
        
        {/* Recommended For You Section */}
        <section className="bg-white border border-gray-200">
          
          <div className="text-center py-4 border-b border-gray-200 relative">
            <h2 className="inline-block px-4 font-bold text-gray-900 tracking-wide uppercase text-sm md:text-base border-b-2 border-brand-red">
              RECOMMENDED FOR YOU
            </h2>
          </div>

          <div className="relative group">
            <button 
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-100/90 hover:bg-white text-gray-500 hover:text-gray-900 p-2 h-16 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-1 p-4 no-scrollbar snap-x scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recommendedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="min-w-[200px] md:min-w-[240px] max-w-[240px] snap-start flex-shrink-0 flex flex-col items-center p-3 cursor-pointer hover:shadow-lg transition-shadow bg-white rounded group/card relative border-r border-gray-100 last:border-r-0"
                  onClick={() => setPreviewProduct(product)}
                >
                   {/* Wishlist Heart - Visible on Hover */}
                   <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWishlist(product);
                      }}
                      className="absolute top-3 right-3 text-gray-300 hover:text-brand-red opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>

                  <div className="w-full h-48 md:h-56 relative mb-4">
                    <img 
                      src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"} 
                      alt={product.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-sm text-center leading-tight line-clamp-2 h-10 mb-1">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs text-brand-blue underline mb-4">{product.description ? product.description.substring(0, 15) + '...' : 'Brand'}</p>
                  
                  <div className="flex flex-col items-center mt-auto w-full">
                    {/* Fake original price logic for the 'Save' effect */}
                    <div className="text-[10px] text-gray-500 font-bold mb-1">
                      Don't pay ${Math.floor(product.price * 1.4)}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {/* Signature Red Polygon Price Tag */}
                      <div className="relative bg-brand-red text-white font-extrabold text-xl md:text-2xl px-3 py-1 flex items-center justify-center min-w-[70px]">
                        ${product.price}
                        <div className="absolute -right-3 top-0 w-0 h-0 border-y-[18px] border-y-transparent border-l-[12px] border-l-brand-red"></div>
                      </div>
                      <div className="ml-4 flex flex-col justify-center items-center border border-gray-200 px-1 py-0.5">
                        <span className="text-[9px] font-bold text-gray-800">SAVE</span>
                        <span className="text-xs font-bold text-gray-800">${Math.floor(product.price * 1.4) - product.price}</span>
                      </div>
                    </div>

                    {/* Delivery & Ratings */}
                    <div className="flex flex-col items-center border-t border-gray-100 w-full pt-3">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-purple-600 font-bold text-[10px]">BupzoPass</span>
                      </div>
                      <div className="text-brand-blue font-bold text-[10px]">Free delivery</div>
                      
                      <div className="flex items-center mt-2">
                         <div className="flex text-brand-yellow text-xs">
                           {'★'.repeat(4)}{'☆'}
                         </div>
                         <span className="text-[9px] text-gray-400 ml-1">(12)</span>
                      </div>
                    </div>

                    {/* Add to Cart Button (Only on hover, replaces delivery/rating in a real app, but we add it below) */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full mt-4 bg-brand-blue hover:bg-blue-700 text-white font-bold py-2 rounded text-xs opacity-0 group-hover/card:opacity-100 transition-opacity"
                    >
                      Add to Cart
                    </button>
                  </div>

                </div>
              ))}
              
              {recommendedProducts.length === 0 && (
                <div className="w-full py-16 text-center text-gray-400 font-medium">No products available in this category.</div>
              )}
            </div>

            <button 
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-100/90 hover:bg-white text-gray-500 hover:text-gray-900 p-2 h-16 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
