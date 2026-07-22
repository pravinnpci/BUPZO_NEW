const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/SellerDashboard.tsx', 'utf8');
code += '\n}\n';
fs.writeFileSync('bupzo-frontend/components/SellerDashboard.tsx', code);
console.log("Added missing closing brace");
