import React from 'react';

export const CustomerWishlist = ({ wishlist, removeFromWishlist, handleAddToCart, onProductClick }: any) => {
  return (
    <div className="w-full bg-white pb-20">
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center mb-10">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">Wishlist</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Wishlist</p>
      </div>
      <div className="container mx-auto px-4">
        {wishlist.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium">Your wishlist is empty.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {wishlist.map((item: any) => (
               <div key={item.id} className="bg-[#f8f8f8] p-4 rounded group relative transition hover:shadow-xl flex flex-col justify-between h-[420px]">
                  <div className="bg-white rounded h-[220px] mb-4 flex items-center justify-center p-4 relative overflow-hidden">
                     <img src={item.product_image_url || 'https://placehold.co/300/png'} alt={item.product_name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-500" />
                     <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <button onClick={() => handleAddToCart({ id: item.product_id, name: item.product_name, price: item.product_price, image_url: item.product_image_url })} className="bg-[#e52e06] text-white w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#232f3e] transition" title="Add to Cart"><span className="material-symbols-outlined text-sm">shopping_cart</span></button>
                        <button onClick={() => removeFromWishlist(item.id)} className="bg-white text-red-500 w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#e52e06] hover:text-white transition shadow" title="Remove"><span className="material-symbols-outlined text-sm">delete</span></button>
                        <button onClick={() => onProductClick({ id: item.product_id, name: item.product_name, price: item.product_price, image_url: item.product_image_url })} className="bg-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#232f3e] hover:text-white transition shadow" title="View"><span className="material-symbols-outlined text-sm">visibility</span></button>
                     </div>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-end">
                     <h3 className="text-lg font-bold text-[#232f3e] mb-2 cursor-pointer transition line-clamp-2" onClick={() => onProductClick({ id: item.product_id, name: item.product_name, price: item.product_price, image_url: item.product_image_url })}>{item.product_name}</h3>
                     <p className="text-[#e52e06] font-extrabold text-xl">₹{item.product_price?.toLocaleString()}</p>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
