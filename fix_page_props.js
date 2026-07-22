const fs = require('fs');
let code = fs.readFileSync('bupzo-admin/src/app/page.tsx', 'utf8');

code = code.replace(/setSelectedProduct=\{setSelectedProduct\}/g, '');

fs.writeFileSync('bupzo-admin/src/app/page.tsx', code);
console.log("Removed setSelectedProduct from AdminProducts in page.tsx");
