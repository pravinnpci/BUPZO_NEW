const fs = require('fs');
let code = fs.readFileSync('bupzo-admin/src/components/AdminSellers.tsx', 'utf8');

code = code.replace(
    'owner?: string;\n  kyc_details?: any;',
    'owner?: string;\n  owner_email?: string;\n  owner_phone?: string;\n  kyc_details?: any;'
);

fs.writeFileSync('bupzo-admin/src/components/AdminSellers.tsx', code);
console.log("Added owner_email and owner_phone to Seller interface in AdminSellers.tsx");
