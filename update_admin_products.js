const fs = require('fs');
const file = 'bupzo-admin/src/components/AdminProducts.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update Props interface
content = content.replace(
  "  setEditProductImage: (val: string) => void;",
  "  setEditProductImage: (val: string) => void;\n  setEditProductCategory: (val: string) => void;\n  setEditProductSeller: (val: string) => void;\n  setEditProductWeight: (val: string) => void;"
);

// Update Component props destructuring
content = content.replace(
  "  setEditProductImage,\n  setShowEditProductModal,",
  "  setEditProductImage,\n  setEditProductCategory,\n  setEditProductSeller,\n  setEditProductWeight,\n  setShowEditProductModal,"
);

// Update Edit button onClick
const editButtonCode = `                              onClick={() => {
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

content = content.replace(
  /onClick=\{\(\) => \{\s*setSelectedProduct\(p\);\s*setEditProductName\(p\.name\);\s*setEditProductPrice\(p\.price\.toString\(\)\);\s*setEditProductQty\(p\.stock_quantity\.toString\(\)\);\s*setEditProductDesc\(p\.description \|\| ''\);\s*setEditProductImage\(p\.image_url \|\| ''\);\s*setShowEditProductModal\(true\);\s*\}\}/,
  editButtonCode
);

fs.writeFileSync(file, content);
console.log("AdminProducts.tsx updated");
