const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/SellerDashboard.tsx', 'utf8');

code = code.replace(
    'const mySeller = allSellers.find(s => s.user_id.toString() === user?.id.toString());',
    'const mySeller = allSellers.find(s => s.user_id?.toString() === user?.id?.toString());'
);

fs.writeFileSync('bupzo-frontend/components/SellerDashboard.tsx', code);
console.log("Safeguarded user_id toString in SellerDashboard");
