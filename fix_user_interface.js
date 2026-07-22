const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/lib/authStore.ts', 'utf8');

code = code.replace(
    '  avatar_url?: string;',
    `  avatar_url?: string;
  is_premium?: boolean;
  signup_platform?: string;
  wallet_balance?: number;
  created_at?: string;
  is_seller?: boolean;
  is_admin?: boolean;
  seller_status?: string;`
);

fs.writeFileSync('bupzo-frontend/lib/authStore.ts', code);
console.log("Added snake_case properties to User interface in authStore.ts");
