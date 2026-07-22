const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/ProductPreviewModal.tsx', 'utf8');

code = code.replace(
    /catch\s*\(\s*e\s*\)\s*\{\s*alert\("Failed to upload image"\);\s*return;\s*\}/g,
    `catch (e: any) {
      console.error("Upload error details:", e);
      alert("Failed to upload image: " + (e.message || String(e)));
      return;
    }`
);

fs.writeFileSync('bupzo-frontend/components/ProductPreviewModal.tsx', code);
console.log("Updated ProductPreviewModal.tsx error handling");
