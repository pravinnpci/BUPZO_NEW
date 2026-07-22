const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/SellerDashboard.tsx', 'utf8');

code = code.replace(
    /parseFloat\(user\.wallet_balance\)/g,
    'user.wallet_balance'
);

fs.writeFileSync('bupzo-frontend/components/SellerDashboard.tsx', code);
console.log("Fixed parseFloat in SellerDashboard.tsx");
