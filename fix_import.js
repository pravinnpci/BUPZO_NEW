const fs = require('fs');

let content = fs.readFileSync('bupzo-frontend/components/ProductPreviewModal.tsx', 'utf8');

content = content.replace(
    `import { Product, API_BASE_URL } from '@/lib/api';`,
    `import { Product, API_BASE_URL, uploadImage } from '@/lib/api';`
);

fs.writeFileSync('bupzo-frontend/components/ProductPreviewModal.tsx', content);
console.log("Fixed missing uploadImage import");
