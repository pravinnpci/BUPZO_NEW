const fs = require('fs');
let code = fs.readFileSync('bupzo-admin/src/components/AdminProducts.tsx', 'utf8');

const brokenCode = `  const filteredProducts = products.filter(p => {
    const s = searchTerm.toLowerCase();
  
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

  return (
      (p.name || '').toLowerCase().includes(s) ||`;

const fixedCode = `  const filteredProducts = products.filter(p => {
    const s = searchTerm.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(s) ||`;

code = code.replace(brokenCode, fixedCode);

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
    '  return (\n    <div className="space-y-6">',
    insertCode + '\n  return (\n    <div className="space-y-6">'
);

fs.writeFileSync('bupzo-admin/src/components/AdminProducts.tsx', code);
console.log("Fixed handleEditProductClick location");
