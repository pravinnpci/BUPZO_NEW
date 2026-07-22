const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/CustomerWallet.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('bupzo-frontend/components/CustomerWallet.tsx', code);
console.log("Fixed syntax error in CustomerWallet.tsx");
