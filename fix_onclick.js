const fs = require('fs');
let code = fs.readFileSync('bupzo-admin/src/components/AdminProducts.tsx', 'utf8');

const oldOnClick = `onClick={() => {
                                setSelectedProduct(p);
                                setEditProductName(p.name);
                                setEditProductPrice(p.price.toString());
                                setEditProductQty(p.stock_quantity.toString());
                                setEditProductDesc(p.description || '');
                                setEditProductImage(p.image_url || '');
                                setEditProductCategory(p.category_id || '');
                                setEditProductSeller(p.seller_id || '');
                                setEditProductWeight(p.weight_grams ? p.weight_grams.toString() : '');
                                setShowEditProductModal(true);
                              }}`;

const newOnClick = `onClick={() => handleEditProductClick(p)}`;

code = code.replace(oldOnClick, newOnClick);

// There is another issue: setSelectedProduct is missing because it was removed from props.
// I will just remove the setSelectedProduct call from AdminProducts since we don't need it.
code = code.replace(/setSelectedProduct: \(p: Product\) => void;/, '');
code = code.replace(/setSelectedProduct,/, '');

fs.writeFileSync('bupzo-admin/src/components/AdminProducts.tsx', code);
console.log("Fixed AdminProducts.tsx onClick handler");
