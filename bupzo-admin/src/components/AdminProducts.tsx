import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  weight_grams: number;
  image_url?: string;
  images?: string[];
  description?: string;
  category_name?: string;
  seller_id?: string;
  seller_name?: string;
  is_approved?: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

interface Seller {
  id: string;
  businessName: string;
}

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  sellers: Seller[];
  
  onUpdateProduct: (id: string, productData: any) => Promise<boolean>;
  onDeleteProduct: (productId: string) => void;
  onApproveProduct: (productId: string, is_approved: boolean, rejection_reason?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  newCatName: string;
  setNewCatName: (val: string) => void;
  newCatDesc: string;
  setNewCatDesc: (val: string) => void;
  onCreateCategory: (e: React.FormEvent) => void;
  onCreateProduct: (data: any) => Promise<any>;
  onUpdateCategory: (catId: string, name: string, description: string) => Promise<void>;
  onUploadImage: (file: File) => Promise<string | null>;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  sellers,
  
  onUpdateProduct,
  onDeleteProduct,
  onApproveProduct,
  onDeleteCategory,
  newCatName,
  setNewCatName,
  newCatDesc,
  setNewCatDesc,
  onCreateCategory,
  onCreateProduct,
  onUpdateCategory,
  onUploadImage
}) => {
  const [subTab, setSubTab] = useState<'products' | 'categories'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Product | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [catSearchTerm, setCatSearchTerm] = useState('');
  const [catSortKey, setCatSortKey] = useState<keyof Category | ''>('');
  const [catSortOrder, setCatSortOrder] = useState<'asc' | 'desc'>('asc');

  // New Product Form States
  const [addProductName, setAddProductName] = useState('');
  const [addProductPrice, setAddProductPrice] = useState('');
  const [addProductQty, setAddProductQty] = useState('');
  const [addProductWeight, setAddProductWeight] = useState('');
  const [addProductDesc, setAddProductDesc] = useState('');
  const [addProductImage, setAddProductImage] = useState('');
  const [addProductCategory, setAddProductCategory] = useState('');
  const [addProductSeller, setAddProductSeller] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productStatus, setProductStatus] = useState<string>('pending');
  const [isUploading, setIsUploading] = useState(false);

  // Edit Category Modal States
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [editCatNameState, setEditCatNameState] = useState('');
  const [editCatDescState, setEditCatDescState] = useState('');

  // Preview States
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);

  const handleProductSort = (key: keyof Product) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const itemsPerPage = 10;

  const handleCategorySort = (key: keyof Category) => {
    if (catSortKey === key) {
      setCatSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCatSortKey(key);
      setCatSortOrder('asc');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditProductId(null);
    setAddProductName('');
    setAddProductPrice('');
    setAddProductQty('');
    setAddProductWeight('');
    setAddProductDesc('');
    setAddProductImage('');
    setAddProductCategory('');
    setAddProductSeller('');
    setProductStatus('pending');
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addProductCategory || !addProductSeller) {
      alert("Please select both a category and a seller.");
      return;
    }

    try {
      const productData = {
        name: addProductName,
        price: parseFloat(addProductPrice) || 0,
        stock_quantity: parseInt(addProductQty) || 0,
        weight_grams: parseFloat(addProductWeight) || 0,
        description: addProductDesc,
        image_url: addProductImage || null,
        category_id: addProductCategory,
        seller_id: addProductSeller,
        is_combo: false,
        is_approved: productStatus === 'approved'
      };

      let response;
      if (isEditing && editProductId) {
        response = await onUpdateProduct(editProductId, productData);
      } else {
        response = await onCreateProduct(productData);
      }

      if (response) {
        alert(isEditing ? "Product updated successfully!" : "Product created successfully!");
        handleCancelEdit();
      } else {
        alert("Operation failed. Please check the console for details.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`Error saving product: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    await onUpdateCategory(selectedCategory.id, editCatNameState, editCatDescState);
    setShowEditCatModal(false);
    setSelectedCategory(null);
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

  const totalProductPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((currentProductPage - 1) * itemsPerPage, currentProductPage * itemsPerPage);

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

  const totalCategoryPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const paginatedCategories = sortedCategories.slice((currentCategoryPage - 1) * itemsPerPage, currentCategoryPage * itemsPerPage);

  const SortIndicator = ({ k }: { k: keyof Product }) => {
    if (sortKey !== k) return <span className="ml-1 text-zinc-400 text-[10px] select-none">⇅</span>;
    return sortOrder === 'asc' ? <span className="ml-1 text-primary text-[10px] select-none">▲</span> : <span className="ml-1 text-primary text-[10px] select-none">▼</span>;
  };

  const CatSortIndicator = ({ k }: { k: keyof Category }) => {
    if (catSortKey !== k) return <span className="ml-1 text-zinc-400 text-[10px] select-none">⇅</span>;
    return catSortOrder === 'asc' ? <span className="ml-1 text-primary text-[10px] select-none">▲</span> : <span className="ml-1 text-primary text-[10px] select-none">▼</span>;
  };

  const getPaddedImages = (product: Product | null) => {
    if (!product) return [];
    let imgs: string[] = [];
    try {
      if (typeof (product as any).images === 'string') imgs = JSON.parse((product as any).images);
      else if (Array.isArray((product as any).images)) imgs = [...(product as any).images];
    } catch (e) {}
    if (imgs.length === 0 && product.image_url) {
      if (product.image_url.includes(',')) {
        imgs = product.image_url.split(',').map(url => url.trim()).filter(url => url);
      } else {
        imgs.push(product.image_url);
      }
    }
    return imgs.length > 0 ? imgs : ['https://via.placeholder.com/150'];
  };


  const handleEditProductClick = (p: Product) => {
    setIsEditing(true);
    setEditProductId(p.id);
    setAddProductName(p.name);
    setAddProductPrice(p.price.toString());
    setAddProductQty(p.stock_quantity.toString());
    setAddProductWeight(p.weight_grams?.toString() || '');
    setAddProductDesc(p.description || '');
    setAddProductImage(getPaddedImages(p).join(', '));
    setAddProductCategory((p as any).category_id || categories.find(c => c.name === p.category_name)?.id || '');
    setAddProductSeller((p as any).seller_id || sellers.find(s => s.businessName === p.seller_name)?.id || '');
    setProductStatus(p.is_approved ? 'approved' : 'pending');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading">Product and Categories</h2>
          <p className="text-xs text-zinc-500 mt-1">Audit, edit, and update platform products and specialty categories.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tabs toggler */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => { setSubTab('products'); setSearchTerm(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === 'products' ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Products ({products.length})
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Product Form */}
          <div className="bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm h-fit">
            <h3 className="text-md font-bold mb-4 font-heading">{isEditing ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Product Name</label>
                <input
                  type="text"
                  value={addProductName}
                  onChange={(e) => setAddProductName(e.target.value)}
                  placeholder="e.g. Traditional Nagore Halwa"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-zinc-500 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={addProductPrice}
                    onChange={(e) => setAddProductPrice(e.target.value)}
                    placeholder="299"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-zinc-500 mb-1">Stock</label>
                  <input
                    type="number"
                    value={addProductQty}
                    onChange={(e) => setAddProductQty(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-zinc-500 mb-1">Weight (g)</label>
                  <input
                    type="number"
                    value={addProductWeight}
                    onChange={(e) => setAddProductWeight(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Product Image Files</label>
                <p className="text-[10px] text-zinc-400 mb-2">First file upload is the preview page image.</p>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          setIsUploading(true);
                          const url = await onUploadImage(files[0]);
                          setIsUploading(false);
                          if (url) {
                            setAddProductImage((prev) => {
                              const urls = prev ? prev.split(',') : ['', '', '', ''];
                              while (urls.length < 4) urls.push('');
                              urls[index] = url;
                              return urls.join(',');
                            });
                          }
                        }
                      }}
                      className="w-full text-xs text-zinc-500 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 bg-white dark:bg-zinc-950"
                    />
                  ))}
                </div>
                {isUploading && <p className="text-[10px] text-yellow-500 mt-1">Uploading to MinIO...</p>}
                {addProductImage && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {addProductImage.split(',').map((imgUrl, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <img src={imgUrl.trim() || 'https://placehold.co/150/png'} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Category</label>
                <select
                  value={addProductCategory}
                  onChange={(e) => setAddProductCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Seller / Merchant</label>
                <select
                  value={addProductSeller}
                  onChange={(e) => setAddProductSeller(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                  required
                >
                  <option value="">-- Select Seller --</option>
                  {sellers.length > 0 ? sellers.map(s => (
                    <option key={s.id} value={s.id}>{(s as any).business_name || s.businessName || `Seller #${s.id}`}</option>
                  )) : (
                    <option value="" disabled>No merchants available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Description</label>
                <textarea
                  value={addProductDesc}
                  onChange={(e) => setAddProductDesc(e.target.value)}
                  placeholder="Enter details..."
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={sellers.length === 0 || categories.length === 0}
                className="w-full bg-[#3f3b4c] dark:bg-[#ccc6dc] text-white dark:text-zinc-950 py-2.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Product
              </button>
              {sellers.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">No merchants available. Ensure there are approved sellers.</p>
              )}
            </form>
          </div>

          {/* Products List Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#110e16] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentProductPage(1);
                  }}
                  className="pl-8 pr-4 py-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="text-zinc-400 text-xs">
                Showing {paginatedProducts.length} (Total: {sortedProducts.length}) of {products.length} products
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
                      <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleProductSort('is_approved')}>Status <SortIndicator k="is_approved" /></th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p) => (
                      <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-3">
                          <img
                            src={getPaddedImages(p)[0]}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        </td>
                        <td 
                          className="py-3 font-bold text-[#3874ff] cursor-pointer hover:underline"
                          onClick={() => setPreviewProduct(p)}
                        >
                          {p.name}
                        </td>
                        <td className="py-3 font-mono font-bold text-primary">₹{Number(p.price).toLocaleString()}</td>
                        <td className="py-3 font-mono">{p.stock_quantity} units</td>
                        <td className="py-3">
                          <span className={p.is_approved === true ? "bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]" : p.is_approved === false ? "bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[10px]" : "bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]"}>
                            {p.is_approved === true ? 'Approved' : p.is_approved === false ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {p.is_approved !== true && (
                              <button
                                onClick={() => onApproveProduct(p.id, true)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-[10px] font-bold"
                              >
                                Approve
                              </button>
                            )}
                            {p.is_approved !== false && (
                              <button
                                onClick={() => {
                                  const reason = prompt("Enter rejection reason:");
                                  if (reason) {
                                    onApproveProduct(p.id, false, reason);
                                  } else if (reason === "") {
                                    alert("Rejection reason is required!");
                                  }
                                }}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded font-medium border border-red-200"
                              >
                                Reject
                              </button>
                            )}
                            <button
                                                            onClick={() => handleEditProductClick(p)}
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
              
              {totalProductPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-xs font-semibold text-zinc-500">
                  <span>Page {currentProductPage} of {totalProductPages}</span>
                  <div className="flex gap-2">
                    <button disabled={currentProductPage === 1} onClick={() => setCurrentProductPage(c => c - 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Prev</button>
                    <button disabled={currentProductPage === totalProductPages} onClick={() => setCurrentProductPage(c => c + 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm h-fit">
            <h3 className="text-md font-bold mb-4 font-heading">Add Category</h3>
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
                  onChange={(e) => {
                    setCatSearchTerm(e.target.value);
                    setCurrentCategoryPage(1);
                  }}
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
                    {paginatedCategories.map((cat) => (
                      <tr key={cat.id} className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">{cat.name}</td>
                        <td className="py-3 text-zinc-500">{cat.description || "No description provided."}</td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedCategory(cat);
                                setEditCatNameState(cat.name);
                                setEditCatDescState(cat.description || '');
                                setShowEditCatModal(true);
                              }}
                              className="bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-3 py-1.5 rounded text-[10px] font-bold hover:opacity-90"
                            >
                              Edit
                            </button>
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
                          </div>
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
              
              {totalCategoryPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-xs font-semibold text-zinc-500">
                  <span>Page {currentCategoryPage} of {totalCategoryPages}</span>
                  <div className="flex gap-2">
                    <button disabled={currentCategoryPage === 1} onClick={() => setCurrentCategoryPage(c => c - 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Prev</button>
                    <button disabled={currentCategoryPage === totalCategoryPages} onClick={() => setCurrentCategoryPage(c => c + 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {showEditCatModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold font-heading mb-4">Edit Specialty Category</h3>
            <form onSubmit={handleEditCategorySubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Category Name</label>
                <input
                  type="text"
                  value={editCatNameState}
                  onChange={(e) => setEditCatNameState(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Description</label>
                <textarea
                  value={editCatDescState}
                  onChange={(e) => setEditCatDescState(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditCatModal(false); setSelectedCategory(null); }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Product Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold font-heading text-lg flex items-center gap-2">
                <span className="text-xl">📦</span> Product Details
              </h3>
              <button 
                onClick={() => setPreviewProduct(null)}
                className="w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex gap-6 mb-6">
                <div className="w-32 flex flex-col gap-2">
                  <img 
                    src={getPaddedImages(previewProduct)[0]} 
                    alt={previewProduct.name}
                    className="w-32 h-32 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700"
                  />
                  <div className="flex gap-2">
                    {(() => {
                      let parsed = [];
                      try {
                        if (typeof previewProduct.images === 'string') parsed = JSON.parse(previewProduct.images);
                        else if (Array.isArray(previewProduct.images)) parsed = previewProduct.images;
                      } catch (e) {}
                      let imgs = [...parsed];
                      if (imgs.length === 0 && previewProduct.image_url) imgs.push(previewProduct.image_url);
                      return imgs.slice(0, 4).map((img, idx) => (
                        <img key={idx} src={img} className="w-8 h-8 object-cover rounded border border-zinc-200 dark:border-zinc-700" />
                      ));
                    })()}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-1">{previewProduct.name}</h4>
                  <div className="text-2xl font-mono text-primary font-bold mb-2">₹{previewProduct.price}</div>
                  <div className="flex gap-4 text-sm mb-2">
                    <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                      <span>Stock:</span>
                      <strong className="text-zinc-900 dark:text-white">{previewProduct.stock_quantity} units</strong>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                      <span>Weight:</span>
                      <strong className="text-zinc-900 dark:text-white">{previewProduct.weight_grams}g</strong>
                    </div>
                  </div>
                  {previewProduct.category_name && (
                    <div className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold rounded">
                      Category: {previewProduct.category_name}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h5 className="font-bold text-sm mb-2 text-zinc-500 uppercase tracking-wider">Description</h5>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  {previewProduct.description || 'No description provided.'}
                </p>
              </div>

              {(() => {
                const seller = sellers.find(s => s.id === previewProduct.seller_id);
                return (
                  <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                    <span>Sold by:</span>
                    <strong className="text-zinc-900 dark:text-white">{seller ? (seller.businessName || (seller as any).owner || (seller as any).user_name) : 'Unknown Merchant'}</strong>
                  </div>
                );
              })()}

              <div className="mt-6">
                <h5 className="font-bold text-sm mb-2 text-zinc-500 uppercase tracking-wider">Additional Images</h5>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {getPaddedImages(previewProduct).map((img: string, idx: number) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`${previewProduct.name} ${idx + 1}`} 
                      className="w-24 h-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Preview Modal */}
      {previewCategory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold font-heading text-lg">Category Details</h3>
              <button 
                onClick={() => setPreviewCategory(null)}
                className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-300 transition-colors flex justify-center items-center font-bold"
              >✕</button>
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold mb-2">{previewCategory.name}</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{previewCategory.description || 'No description available.'}</p>
              <div className="text-xs text-zinc-500">
                Created on: {new Date(previewCategory.created_at || '').toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};