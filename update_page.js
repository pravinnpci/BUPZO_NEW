const fs = require('fs');
const file = 'bupzo-admin/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add states
content = content.replace(
  "const [editProductImage, setEditProductImage] = useState('');",
  "const [editProductImage, setEditProductImage] = useState('');\n  const [editProductCategory, setEditProductCategory] = useState('');\n  const [editProductSeller, setEditProductSeller] = useState('');\n  const [editProductWeight, setEditProductWeight] = useState('');"
);

// Update productData in handleEditProductSubmit
content = content.replace(
  "image_url: editProductImage ? editProductImage.split(',')[0].trim() : null,\n        images: editProductImage ? editProductImage.split(',').map(u => u.trim()).filter(u => u) : [],",
  "image_url: editProductImage ? editProductImage.split(',')[0].trim() : null,\n        images: editProductImage ? editProductImage.split(',').map(u => u.trim()).filter(u => u) : [],\n        category_id: editProductCategory || undefined,\n        seller_id: editProductSeller || undefined,\n        weight_grams: editProductWeight ? parseFloat(editProductWeight) : undefined,"
);

// Add to modal
const modalFields = `
              <div>
                <label className="block text-zinc-500 mb-1">Weight (g)</label>
                <input 
                  type="number" 
                  value={editProductWeight} 
                  onChange={(e) => setEditProductWeight(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Category</label>
                <select
                  value={editProductCategory}
                  onChange={(e) => setEditProductCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Seller</label>
                <select
                  value={editProductSeller}
                  onChange={(e) => setEditProductSeller(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                >
                  <option value="">-- Select Seller --</option>
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>{(s as any).business_name || s.businessName || \`Seller #\${s.id}\`}</option>
                  ))}
                </select>
              </div>
`;

content = content.replace(
  "<div>\n                <label className=\"block text-zinc-500 mb-1\">Product Image URL (Upload to MinIO)</label>",
  modalFields + "\n              <div>\n                <label className=\"block text-zinc-500 mb-1\">Product Image URL (Upload to MinIO)</label>"
);

fs.writeFileSync(file, content);
console.log("page.tsx updated");
