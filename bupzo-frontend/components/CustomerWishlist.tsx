import React from 'react';
import { Product, WishlistItem } from '@/lib/api';

interface CustomerWishlistProps {
  wishlist: WishlistItem[];
  removeFromWishlist: (itemId: string) => Promise<void>;
  setWishlist: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
  handleAddToCart: (product: Product) => void;
}

export const CustomerWishlist: React.FC<CustomerWishlistProps> = ({
  wishlist,
  removeFromWishlist,
  setWishlist,
  handleAddToCart
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading">My Wishlist</h2>
        <p className="text-xs text-zinc-500 mt-1">Keep track of Nagore specialties and treats you want to purchase later.</p>
      </div>

      <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="pb-3">Product Name</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Added Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-3 font-semibold text-zinc-800 dark:text-zinc-200">{item.product_name || "Specialty Item"}</td>
                  <td className="py-3 font-mono font-bold">₹{item.product_price || 0}</td>
                  <td className="py-3 text-zinc-400 font-mono text-[10px]">
                    {item.added_at ? new Date(item.added_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => {
                          const dummyProduct: Product = {
                            id: item.product_id,
                            name: item.product_name || "Specialty Item",
                            price: item.product_price || 0,
                            weight_grams: 500,
                            image_url: "",
                            description: "",
                            stock_quantity: 100,
                            category_id: "",
                            is_combo: false,
                            seller_id: "",
                            created_at: ""
                          };
                          handleAddToCart(dummyProduct);
                        }}
                        className="bg-[#3874ff] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-opacity-95 transition-all"
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await removeFromWishlist(item.id);
                            setWishlist(prev => prev.filter(w => w.id !== item.id));
                            alert("Removed from wishlist.");
                          } catch (err) {
                            console.warn(err);
                          }
                        }}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {wishlist.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-400 font-medium">Your wishlist is empty. Explore products to add some!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
