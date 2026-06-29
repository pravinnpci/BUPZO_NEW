import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  weight_grams: number;
  image_url?: string;
  description?: string;
}

interface AdminProductsProps {
  products: Product[];
  setSelectedProduct: (p: Product) => void;
  setEditProductName: (val: string) => void;
  setEditProductPrice: (val: string) => void;
  setEditProductQty: (val: string) => void;
  setEditProductDesc: (val: string) => void;
  setEditProductImage: (val: string) => void;
  setShowEditProductModal: (show: boolean) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  setSelectedProduct,
  setEditProductName,
  setEditProductPrice,
  setEditProductQty,
  setEditProductDesc,
  setEditProductImage,
  setShowEditProductModal
}) => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold font-heading">Products Catalog</h2>
        <p className="text-xs text-zinc-500 mt-1">Audit, edit, and update merchant sweet inventories and catalogs.</p>
      </header>

      <div className="bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Image</th>
                <th className="py-2.5">Name</th>
                <th className="py-2.5">Price</th>
                <th className="py-2.5">Stock</th>
                <th className="py-2.5">Weight (g)</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-3">
                    <img 
                      src={p.image_url || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"} 
                      alt={p.name} 
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">{p.name}</td>
                  <td className="py-3 font-mono">₹{p.price}</td>
                  <td className="py-3 font-mono">{p.stock_quantity} units</td>
                  <td className="py-3 font-mono">{p.weight_grams}g</td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => {
                        setSelectedProduct(p);
                        setEditProductName(p.name);
                        setEditProductPrice(p.price.toString());
                        setEditProductQty(p.stock_quantity.toString());
                        setEditProductDesc(p.description || '');
                        setEditProductImage(p.image_url || '');
                        setShowEditProductModal(true);
                      }}
                      className="bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-3 py-1.5 rounded text-[10px] font-bold hover:opacity-90"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-400">No products found in platform catalog.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
