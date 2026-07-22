import React from 'react';

type CustomerHomeProps = {
  products: any[];
  setPreviewProduct: (p: any) => void;
  handleAddToWishlist: (p: any) => void;
  handleAddToCart: (p: any) => void;
  categories: any[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
};

export function CustomerHome({
  products,
  setPreviewProduct,
  handleAddToWishlist,
  handleAddToCart,
  categories,
  selectedCategoryId,
  setSelectedCategoryId
}: CustomerHomeProps) {

  return (
    <div className="w-full pb-20">
      {/* Sprylo Hero Section */}
      <div className="w-full bg-[#fce5df] py-16 md:py-32 flex items-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center">
           <div className="md:w-1/2 space-y-6">
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#e52e06] leading-tight">
                Sale 20% Off <br/> <span className="text-[#232f3e]">On Everything</span>
              </h1>
              <p className="text-gray-700 max-w-md text-lg leading-relaxed">
                Experience the best online shopping with Bupzo. Premium products delivered straight to your doorstep with guaranteed quality.
              </p>
              <button className="bg-[#e52e06] hover:bg-[#cc2805] text-white px-8 py-4 rounded-full font-bold text-lg uppercase tracking-wider transition shadow-lg mt-4 inline-block">
                 Shop Now
              </button>
           </div>
           <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80" alt="Fashion" className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition duration-500" />
           </div>
        </div>
      </div>

      {/* Sprylo Features / Info Boxes */}
      <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#232f3e] text-white p-8 flex items-center gap-6 rounded shadow hover:-translate-y-2 transition duration-300">
               <span className="material-symbols-outlined text-5xl text-[#e52e06]">local_shipping</span>
               <div>
                  <h3 className="text-xl font-bold uppercase mb-1">Fast Delivery</h3>
                  <p className="text-sm text-gray-400">Variations of passages of Lorem Ipsum available</p>
               </div>
            </div>
            <div className="bg-[#e52e06] text-white p-8 flex items-center gap-6 rounded shadow hover:-translate-y-2 transition duration-300">
               <span className="material-symbols-outlined text-5xl">verified</span>
               <div>
                  <h3 className="text-xl font-bold uppercase mb-1">Free Shiping</h3>
                  <p className="text-sm text-[#ffccc3]">Variations of passages of Lorem Ipsum available</p>
               </div>
            </div>
            <div className="bg-[#232f3e] text-white p-8 flex items-center gap-6 rounded shadow hover:-translate-y-2 transition duration-300">
               <span className="material-symbols-outlined text-5xl text-[#e52e06]">workspace_premium</span>
               <div>
                  <h3 className="text-xl font-bold uppercase mb-1">Best Quality</h3>
                  <p className="text-sm text-gray-400">Variations of passages of Lorem Ipsum available</p>
               </div>
            </div>
         </div>
      </div>

      {/* Our Products Heading */}
      <div className="text-center py-16">
         <h2 className="text-4xl font-extrabold uppercase text-[#232f3e] mb-4">Our <span className="text-[#e52e06]">Products</span></h2>
         <div className="w-16 h-1 bg-[#e52e06] mx-auto"></div>
      </div>

      {/* Product Grid (Sprylo Style) */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500 font-medium text-lg">
              No products found in the catalog.
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-[#f8f8f8] p-4 rounded group relative transition hover:shadow-xl flex flex-col justify-between h-[420px]">
                 {/* Product Image Box */}
                 <div className="bg-white rounded h-[220px] mb-4 flex items-center justify-center p-4 relative overflow-hidden">
                    <img 
                      src={product.image_url} 
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/400/png' }}
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
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
        
        {products.length > 0 && (
           <div className="text-center mt-12">
              <button 
                onClick={() => window.location.href = '/shops'}
                className="bg-[#e52e06] hover:bg-[#cc2805] text-white px-10 py-3 rounded-full font-bold uppercase transition">
                 View All Products
              </button>
           </div>
        )}
      </div>

    </div>
  );
}
