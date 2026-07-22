const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/Navbar.tsx', 'utf8');

code = code.replace(/user\?\.is_seller/g, 'user?.isSeller');

fs.writeFileSync('bupzo-frontend/components/Navbar.tsx', code);
console.log("Fixed is_seller in Navbar.tsx");
