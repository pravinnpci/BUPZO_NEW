const fs = require('fs');

let pageCode = fs.readFileSync('bupzo-admin/src/app/page.tsx', 'utf8');
let adminProductsCode = fs.readFileSync('bupzo-admin/src/components/AdminProducts.tsx', 'utf8');

// 1. Modify page.tsx
pageCode = pageCode.replace(
    'const handleCreateProduct = async (productData: any) => {',
    `const handleUpdateProduct = async (id: string, productData: any) => {
    try {
      const resp = await fetch(\`\${API_URL}/api/products/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (resp.ok) {
        await refreshAllAdminData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleCreateProduct = async (productData: any) => {`
);

pageCode = pageCode.replace(
    /setEditProductName=\{setEditProductName\}[\s\S]*?setShowEditProductModal=\{setShowEditProductModal\}/g,
    'onUpdateProduct={handleUpdateProduct}'
);

// Remove the modal code in page.tsx if possible. Actually, just leaving it dead code is fine, but we can remove it.
// We will just let it be to avoid regex matching issues, we just don't pass the props.


// 2. Modify AdminProducts.tsx
adminProductsCode = adminProductsCode.replace(
    /setEditProductName: \(val: string\) => void;[\s\S]*?setShowEditProductModal: \(show: boolean\) => void;/g,
    'onUpdateProduct: (id: string, productData: any) => Promise<boolean>;'
);

adminProductsCode = adminProductsCode.replace(
    /setEditProductName,[\s\S]*?setShowEditProductModal,/g,
    'onUpdateProduct,'
);

adminProductsCode = adminProductsCode.replace(
    'const [addProductSeller, setAddProductSeller] = useState(\'\');',
    `const [addProductSeller, setAddProductSeller] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productStatus, setProductStatus] = useState<string>('pending');`
);

const oldHandleAddProductSubmit = `const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addProductCategory || !addProductSeller) {
      alert("Please select both a category and a seller.");
      return;
    }

    try {
      const productData = {
        name: addProductName,
        price: parseFloat(addProductPrice),
        stock_quantity: parseInt(addProductQty),
        weight_grams: parseFloat(addProductWeight),
        description: addProductDesc,
        image_url: addProductImage || null,
        category_id: addProductCategory,
        seller_id: addProductSeller,
        is_combo: false
      };

      const response = await onCreateProduct(productData);
      if (response) {
        alert("Product created successfully!");
        // Reset Form
        setAddProductName('');
        setAddProductPrice('');
        setAddProductQty('');
        setAddProductWeight('');
        setAddProductDesc('');
        setAddProductImage('');
        setAddProductCategory('');
        setAddProductSeller('');
      } else {
        alert("Failed to create product. Please check the console for details.");
        console.error("Product creation failed:", response);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert(\`Error creating product: \${error instanceof Error ? error.message : String(error)}\`);
    }
  };`;

const newHandleAddProductSubmit = `const handleCancelEdit = () => {
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
      alert(\`Error saving product: \${error instanceof Error ? error.message : String(error)}\`);
    }
  };`;

adminProductsCode = adminProductsCode.replace(oldHandleAddProductSubmit, newHandleAddProductSubmit);

const oldHandleEditProductClick = `const handleEditProductClick = (p: Product) => {
    setSelectedProduct(p);
    setEditProductName(p.name);
    setEditProductPrice(p.price.toString());
    setEditProductQty(p.stock_quantity.toString());
    setEditProductDesc(p.description || '');
    setEditProductImage(getPaddedImages(p).join(', '));
    setEditProductWeight(p.weight_grams?.toString() || '');
    setEditProductCategory(categories.find(c => c.name === p.category_name)?.id || '');
    setEditProductSeller(sellers.find(s => s.businessName === p.seller_name)?.id || '');
    setShowEditProductModal(true);
  };`;

const newHandleEditProductClick = `const handleEditProductClick = (p: Product) => {
    setIsEditing(true);
    setEditProductId(p.id);
    setAddProductName(p.name);
    setAddProductPrice(p.price.toString());
    setAddProductQty(p.stock_quantity.toString());
    setAddProductWeight(p.weight_grams?.toString() || '');
    setAddProductDesc(p.description || '');
    setAddProductImage(getPaddedImages(p).join(', '));
    setAddProductCategory(categories.find(c => c.name === p.category_name)?.id || '');
    setAddProductSeller(sellers.find(s => s.businessName === p.seller_name)?.id || '');
    setProductStatus(p.is_approved ? 'approved' : 'pending');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`;

adminProductsCode = adminProductsCode.replace(oldHandleEditProductClick, newHandleEditProductClick);

const oldTitle = '<h3 className="text-md font-bold mb-4 font-heading">Add Product</h3>';
const newTitle = '<h3 className="text-md font-bold mb-4 font-heading">{isEditing ? "Edit Product" : "Add Product"}</h3>';
adminProductsCode = adminProductsCode.replace(oldTitle, newTitle);

const oldStatusFields = `              <div>
                <label className="block text-zinc-500 mb-1">Description</label>
                <textarea
                  value={addProductDesc}
                  onChange={(e) => setAddProductDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                  required
                />
              </div>`;

const newStatusFields = `              <div>
                <label className="block text-zinc-500 mb-1">Description</label>
                <textarea
                  value={addProductDesc}
                  onChange={(e) => setAddProductDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Status</label>
                <select
                  value={productStatus}
                  onChange={(e) => setProductStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>`;

adminProductsCode = adminProductsCode.replace(oldStatusFields, newStatusFields);

const oldSubmitBtn = `<button
                type="submit"
                className="w-full py-2.5 bg-charcoal text-white rounded-xl hover:bg-opacity-90 font-bold"
              >
                Create Product
              </button>`;
const newSubmitBtn = `<div className="flex gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-opacity-90 font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-charcoal text-white rounded-xl hover:bg-opacity-90 font-bold"
                >
                  {isEditing ? "Save Changes" : "Create Product"}
                </button>
              </div>`;

adminProductsCode = adminProductsCode.replace(oldSubmitBtn, newSubmitBtn);


fs.writeFileSync('bupzo-admin/src/app/page.tsx', pageCode);
fs.writeFileSync('bupzo-admin/src/components/AdminProducts.tsx', adminProductsCode);

console.log("Updated UI for AdminProducts");
