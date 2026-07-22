const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/CartModal.tsx', 'utf8');

code = code.replace(
    'const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);',
    'const cartTotal = cart.reduce((sum, item) => sum + ((item.product.price || 0) * item.quantity), 0);'
);

code = code.replace(
    '<p className="text-[#e52e06] font-extrabold text-sm">₹{item.product.price.toLocaleString()}</p>',
    '<p className="text-[#e52e06] font-extrabold text-sm">₹{(item.product.price || 0).toLocaleString()}</p>'
);

fs.writeFileSync('bupzo-frontend/components/CartModal.tsx', code);
console.log("Fixed CartModal.tsx");
