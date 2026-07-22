const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/lib/authStore.ts', 'utf8');

code = code.replace(
    '  pincode?: string;',
    '  pincode?: string;\n  avatar_url?: string;'
);

fs.writeFileSync('bupzo-frontend/lib/authStore.ts', code);
console.log("Added avatar_url to User interface in authStore.ts");
