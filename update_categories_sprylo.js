const fs = require('fs');
const file = 'bupzo-frontend/components/CustomerCategories.tsx';

const newCategories = `import React from 'react';

type CustomerCategoriesProps = {
  categories: any[];
  products: any[];
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (id: string | null) => void;
  setPreviewProduct: (p: any) => void;
  handleAddToWishlist: (p: any) => void;
  handleAddToCart: (p: any) => void;
};

export function CustomerCategories({
  categories,
  products,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  setPreviewProduct,
  handleAddToWishlist,
  handleAddToCart
}: CustomerCategoriesProps) {

  const filteredProducts = selectedCategoryFilter && selectedCategoryFilter !== 'all'
    ? products.filter(p => p.category_id === selectedCategoryFilter)
    : products;

  return (
    <div className="w-full pb-20 bg-white">
      {/* Page Header (Sprylo Style) */}
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">Shop</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Shop</p>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
         {/* Left Sidebar */}
         <div className="lg:w-1/4">
            <div className="bg-[#f8f8f8] p-6 rounded mb-8">
               <h3 className="text-xl font-bold text-[#232f3e] uppercase mb-4 border-b border-gray-200 pb-2">Categories</h3>
               <ul className="space-y-3">
                 <li 
                    className={\`cursor-pointer hover:text-[#e52e06] transition flex justify-between items-center text-sm \${(!selectedCategoryFilter || selectedCategoryFilter === 'all') ? 'text-[#e52e06] font-bold' : 'text-gray-600'}\`}
                    onClick={() => setSelectedCategoryFilter('all')}
                 >
                    <span>All Products</span>
                    <span className="bg-gray-200 text-xs px-2 py-0.5 rounded">{products.length}</span>
                 </li>
                 {categories.map(cat => {
                   const count = products.filter(p => p.category_id === cat.id).length;
                   return (
                     <li 
                        key={cat.id} 
                        className={\`cursor-pointer hover:text-[#e52e06] transition flex justify-between items-center text-sm \${selectedCategoryFilter === cat.id ? 'text-[#e52e06] font-bold' : 'text-gray-600'}\`}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                     >
                        <span>{cat.name}</span>
                        <span className="bg-gray-200 text-xs px-2 py-0.5 rounded">{count}</span>
                     </li>
                   )
                 })}
               </ul>
            </div>
            
            <div className="bg-[#fce5df] p-6 rounded flex flex-col items-center justify-center text-center">
               <h4 className="font-extrabold text-[#e52e06] text-xl mb-2">Special Offer</h4>
               <p className="text-gray-700 text-sm mb-4">Get 20% off on your first order</p>
               <button className="bg-[#232f3e] text-white px-6 py-2 rounded-full font-bold text-xs uppercase hover:bg-[#1a232e] transition">Shop Now</button>
            </div>
         </div>

         {/* Product Grid */}
         <div className="lg:w-3/4">
            <div className="flex justify-between items-center bg-[#f8f8f8] p-4 rounded mb-6">
               <span className="text-sm font-bold text-gray-500">Showing {filteredProducts.length} results</span>
               <select className="border border-gray-200 bg-white px-4 py-2 rounded text-sm outline-none cursor-pointer">
                 <option>Default Sorting</option>
                 <option>Sort by Price: Low to High</option>
                 <option>Sort by Price: High to Low</option>
               </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredProducts.length === 0 ? (
                 <div className="col-span-full text-center py-20 text-gray-500 font-medium text-lg">
                   No products found in this category.
                 </div>
               ) : (
                 filteredProducts.map((product) => (
                   <div key={product.id} className="bg-[#f8f8f8] p-4 rounded group relative transition hover:shadow-xl flex flex-col justify-between h-[420px]">
                      {/* Product Image Box */}
                      <div className="bg-white rounded h-[220px] mb-4 flex items-center justify-center p-4 relative overflow-hidden">
                         <img 
                           src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'} 
                           alt={product.name} 
                           className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-500" 
                         />
                         {/* Hover Actions Overlay */}
                         <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="bg-[#e52e06] text-white w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#232f3e] transition"
                              title="Add to Cart"
                            >
                               <span className="material-symbols-outlined text-sm">shopping_cart</span>
                            </button>
                            <button 
                              onClick={() => handleAddToWishlist(product)}
                              className="bg-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#e52e06] hover:text-white transition shadow"
                              title="Add to Wishlist"
                            >
                               <span className="material-symbols-outlined text-sm">favorite</span>
                            </button>
                            <button 
                              onClick={() => setPreviewProduct(product)}
                              className="bg-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#e52e06] hover:text-white transition shadow"
                              title="Quick View"
                            >
                               <span className="material-symbols-outlined text-sm">visibility</span>
                            </button>
                         </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="text-center flex-1 flex flex-col justify-end">
                         <h3 className="text-lg font-bold text-[#232f3e] mb-2 hover:text-[#e52e06] cursor-pointer transition line-clamp-2" onClick={() => setPreviewProduct(product)}>
                           {product.name}
                         </h3>
                         <p className="text-[#e52e06] font-extrabold text-xl">₹{product.price.toLocaleString()}</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(file, newCategories);
console.log('CustomerCategories updated to Sprylo theme!');
