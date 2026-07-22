const fs = require('fs');

// --- 1. Update AdminProducts.tsx ---
const adminProductsFile = 'bupzo-admin/src/components/AdminProducts.tsx';
let adminProductsContent = fs.readFileSync(adminProductsFile, 'utf8');

adminProductsContent = adminProductsContent.replace(
  "                      <button \n                        onClick={() => onApproveProduct(p.id, !p.is_approved)}\n                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${p.is_approved ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}\n                      >\n                        {p.is_approved ? 'Disapprove' : 'Approve'}\n                      </button>",
  `                      <button 
                        onClick={() => onApproveProduct(p.id, true)}
                        className={\`px-2.5 py-1 rounded text-[10px] font-bold \${p.is_approved ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}\`}
                        disabled={p.is_approved}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => onApproveProduct(p.id, false)}
                        className={\`px-2.5 py-1 rounded text-[10px] font-bold \${!p.is_approved ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}\`}
                        disabled={!p.is_approved}
                      >
                        Reject
                      </button>`
);

fs.writeFileSync(adminProductsFile, adminProductsContent);

// --- 2. Update page.tsx Edit Product Modal ---
const pageFile = 'bupzo-admin/src/app/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

// The Edit product modal has a title: <h3 className="text-xl font-bold mb-4 font-heading">Edit Product</h3>
pageContent = pageContent.replace(
  "<h3 className=\"text-xl font-bold mb-4 font-heading\">Edit Product</h3>",
  "<h3 className=\"text-xl font-bold mb-1 font-heading\">Edit Product</h3>\n            <p className=\"text-sm text-zinc-500 mb-4\">Merchant: <span className=\"font-bold text-primary\">{selectedProduct.store_name || 'Unknown Store'}</span></p>"
);

fs.writeFileSync(pageFile, pageContent);
