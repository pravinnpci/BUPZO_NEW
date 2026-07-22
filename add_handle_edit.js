const fs = require('fs');
let code = fs.readFileSync('bupzo-admin/src/components/AdminProducts.tsx', 'utf8');

const insertCode = `
  const handleEditProductClick = (p: Product) => {
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
  };
`;

code = code.replace(
    '  return (',
    insertCode + '\n  return ('
);

fs.writeFileSync('bupzo-admin/src/components/AdminProducts.tsx', code);
console.log("Added handleEditProductClick to AdminProducts.tsx");
