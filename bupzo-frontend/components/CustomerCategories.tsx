import React from 'react';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  weight_grams: number;
  image_url: string;
  description: string;
  stock_quantity: number;
  category_id?: string;
}

interface CustomerCategoriesProps {
  categories: Category[];
  products: Product[];
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (id: string | null) => void;
  setPreviewProduct: (p: Product) => void;
  handleAddToWishlist: (p: Product) => void;
  handleAddToCart: (p: Product) => void;
}

export const CustomerCategories: React.FC<CustomerCategoriesProps> = ({
  categories,
  products,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  setPreviewProduct,
  handleAddToWishlist,
  handleAddToCart
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading">Shop By Category</h2>
        <p className="text-xs text-zinc-500 mt-1">Browse and filter traditional sweets, dry fruits, combo offers, and craftsmanship.</p>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button 
          onClick={() => setSelectedCategoryFilter(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!selectedCategoryFilter ? 'bg-[#3874ff] text-white' : 'bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/10'}`}
        >
          All Specialties
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategoryFilter(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategoryFilter === cat.id ? 'bg-[#3874ff] text-white' : 'bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/10'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filtered Grid */}
      <div className="space-y-4 pt-4">
        <h3 className="text-md font-bold uppercase tracking-wider">
          {selectedCategoryFilter 
            ? `${categories.find(c => c.id === selectedCategoryFilter)?.name || 'Filtered'} Selection`
            : "Full Platform Catalog"
          }
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter(p => !selectedCategoryFilter || p.category_id === selectedCategoryFilter)
            .map((p) => (
              <div 
                key={p.id}
                onClick={() => setPreviewProduct(p)}
                className="bg-white dark:bg-[#15131b] rounded-xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-all"
              >
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"} alt={p.name} className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(p);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-red-500 hover:scale-110 active:scale-95 transition-all shadow-sm font-bold text-xs"
                    title="Add to Wishlist"
                  >
                    ❤️
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-dusty-mauve">Nagore Specialties</span>
                    <h4 className="font-bold text-sm mt-1">{p.name}</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2" onClick={(e) => e.stopPropagation()}>
                    <span className="font-bold text-sm">₹{p.price}</span>
                    <button 
                      onClick={() => handleAddToCart(p)}
                      className="bg-charcoal dark:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-opacity-90 active:scale-95 transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          {products.filter(p => !selectedCategoryFilter || p.category_id === selectedCategoryFilter).length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-400 font-medium">No specialties listed in this category yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
