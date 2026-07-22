const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/app/page.tsx', 'utf8');

code = code.replace(
    'handleAddToCart={(p) => handleAddToCart(products.find(x => x.id === p.id) || p)}',
    'handleAddToCart={(p: any) => handleAddToCart(products.find((x: any) => x.id === p.id) || p)}'
);

code = code.replace(
    'onProductClick={(p) => {',
    'onProductClick={(p: any) => {'
);

code = code.replace(
    'const realProduct = products.find(x => x.id === p.id) || p;',
    'const realProduct = products.find((x: any) => x.id === p.id) || p;'
);

fs.writeFileSync('bupzo-frontend/app/page.tsx', code);
console.log("Fixed TS errors in page.tsx");
