import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  weight_grams: number;
  image_url: string;
  description: string;
  stock_quantity: number;
}

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
  return (
    <div className="space-y-8">
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-dusty-mauve flex items-center justify-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-70">
          <source src="/Bupzo-gif.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 text-center space-y-2 text-white px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading">Discover Nagore Specialties</h1>
          <p className="text-xs md:text-sm">Authentic Halwa, premium Dry Fruits, and handcrafted items delivered directly.</p>
        </div>
      </div>

      {/* Category Navigation Bar (Pills) */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Select Specialty</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!selectedCategoryId ? 'bg-[#3874ff] text-white shadow-sm' : 'bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/10 hover:text-[#3874ff]'}`}
          >
            All Specialties
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategoryId === cat.id ? 'bg-[#3874ff] text-white shadow-sm' : 'bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/10 hover:text-[#3874ff]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Catalog Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold font-heading text-[#3f3b4c] dark:text-[#ccc6dc]">Featured Catalog</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter(p => !selectedCategoryId || p.category_id === selectedCategoryId)
            .map((product: any) => (
              <div 
                key={product.id} 
                onClick={() => setPreviewProduct(product)}
                className="bg-white dark:bg-[#15131b] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative h-48 bg-zinc-50 dark:bg-zinc-900/50">
                  <img 
                    src={product.image_url || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Heart Button Overlay */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(product);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/95 dark:bg-[#15131b]/95 hover:bg-white dark:hover:bg-[#15131b] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all text-xs font-bold flex items-center justify-center border border-zinc-100 dark:border-zinc-800"
                    title="Add to Wishlist"
                  >
                    ❤️
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-dusty-mauve">Nagore Specialties</span>
                    <h4 className="font-bold text-sm mt-1 text-zinc-800 dark:text-zinc-100">{product.name}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2" onClick={(e) => e.stopPropagation()}>
                    <span className="font-bold text-sm font-mono text-zinc-900 dark:text-zinc-100">₹{product.price}</span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-charcoal dark:bg-zinc-800 hover:opacity-90 active:scale-95 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          {products.filter(p => !selectedCategoryId || p.category_id === selectedCategoryId).length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-400 font-medium">No specialties listed under this category yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
