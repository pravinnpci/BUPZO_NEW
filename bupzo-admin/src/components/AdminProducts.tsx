import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  weight_grams: number;
  image_url?: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  setSelectedProduct: (p: Product) => void;
  setEditProductName: (val: string) => void;
  setEditProductPrice: (val: string) => void;
  setEditProductQty: (val: string) => void;
  setEditProductDesc: (val: string) => void;
  setEditProductImage: (val: string) => void;
  setShowEditProductModal: (show: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  newCatName: string;
  setNewCatName: (val: string) => void;
  newCatDesc: string;
  setNewCatDesc: (val: string) => void;
  onCreateCategory: (e: React.FormEvent) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  setSelectedProduct,
  setEditProductName,
  setEditProductPrice,
  setEditProductQty,
  setEditProductDesc,
  setEditProductImage,
  setShowEditProductModal,
  onDeleteProduct,
  onDeleteCategory,
  newCatName,
  setNewCatName,
  newCatDesc,
  setNewCatDesc,
  onCreateCategory
}) => {
  const [subTab, setSubTab] = useState<'products' | 'categories'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Product | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [catSearchTerm, setCatSearchTerm] = useState('');
  const [catSortKey, setCatSortKey] = useState<keyof Category | ''>('');
  const [catSortOrder, setCatSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleProductSort = (key: keyof Product) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleCategorySort = (key: keyof Category) => {
    if (catSortKey === key) {
      setCatSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCatSortKey(key);
      setCatSortOrder('asc');
    }
  };

  // Filter & Sort Products
  const filteredProducts = products.filter(p => {
    const s = searchTerm.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(s) ||
      (p.description || '').toLowerCase().includes(s) ||
      (p.id || '').toLowerCase().includes(s)
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (sortKey === 'price' || sortKey === 'stock_quantity' || sortKey === 'weight_grams') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter & Sort Categories
  const filteredCategories = categories.filter(c => {
    const s = catSearchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(s) ||
      (c.description || '').toLowerCase().includes(s) ||
      (c.id || '').toLowerCase().includes(s)
    );
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (!catSortKey) return 0;
    let aVal = a[catSortKey];
    let bVal = b[catSortKey];

    aVal = String(aVal || '').toLowerCase();
    bVal = String(bVal || '').toLowerCase();

    if (aVal < bVal) return catSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return catSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIndicator = ({ k }: { k: keyof Product }) => {
    if (sortKey !== k) return <span className="ml-1 text-zinc-400 text-[10px] select-none">⇅</span>;
    return sortOrder === 'asc' ? <span className="ml-1 text-primary text-[10px] select-none">▲</span> : <span className="ml-1 text-primary text-[10px] select-none">▼</span>;
  };

  const CatSortIndicator = ({ k }: { k: keyof Category }) => {
    if (catSortKey !== k) return <span className="ml-1 text-zinc-400 text-[10px] select-none">⇅</span>;
    return catSortOrder === 'asc' ? <span className="ml-1 text-primary text-[10px] select-none">▲</span> : <span className="ml-1 text-primary text-[10px] select-none">▼</span>;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading">Sweet Inventory & Catalog</h2>
          <p className="text-xs text-zinc-500 mt-1">Audit, edit, and update platform sweet products and specialty categories.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sub-tabs toggler */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => { setSubTab('products'); setSearchTerm(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === 'products' ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Sweets ({products.length})
            </button>
            <button
              onClick={() => { setSubTab('categories'); setCatSearchTerm(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === 'categories' ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Categories ({categories.length})
            </button>
          </div>
        </div>
      </header>

      {subTab === 'products' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#110e16] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="text-zinc-400 text-xs">
              Showing {sortedProducts.length} of {products.length} products
            </div>
          </div>

          <div className="bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none">
                    <th className="py-2.5">Image</th>
                    <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleProductSort('name')}>Name <SortIndicator k="name" /></th>
                    <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleProductSort('price')}>Price <SortIndicator k="price" /></th>
                    <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleProductSort('stock_quantity')}>Stock <SortIndicator k="stock_quantity" /></th>
                    <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleProductSort('weight_grams')}>Weight (g) <SortIndicator k="weight_grams" /></th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((p) => (
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
                        <div className="flex justify-end gap-1.5">
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
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete product "${p.name}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="bg-red-500 hover:bg-red-650 text-white px-3 py-1.5 rounded text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-zinc-400">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm h-fit">
            <h3 className="text-md font-bold mb-4 font-heading">Add Sweet Category</h3>
            <form onSubmit={onCreateCategory} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Category Name</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Traditional Halwas" 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Description</label>
                <textarea 
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Rich heritage wheat and ghee based sweets..." 
                  rows={4}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#3f3b4c] dark:bg-[#ccc6dc] text-white dark:text-zinc-950 py-2.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-xs"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#110e16] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={catSearchTerm}
                  onChange={(e) => setCatSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="text-zinc-400 text-xs">
                Showing {sortedCategories.length} of {categories.length} categories
              </div>
            </div>

            <div className="bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none">
                      <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleCategorySort('name')}>Category Name <CatSortIndicator k="name" /></th>
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCategories.map((cat) => (
                      <tr key={cat.id} className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">{cat.name}</td>
                        <td className="py-3 text-zinc-500">{cat.description || "No description provided."}</td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete category "${cat.name}"? This might break products linked to it!`)) {
                                onDeleteCategory(cat.id);
                              }
                            }}
                            className="bg-red-500 hover:bg-red-650 text-white px-3 py-1.5 rounded text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sortedCategories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-zinc-400">No categories found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
