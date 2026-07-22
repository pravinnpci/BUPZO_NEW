const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/CartModal.tsx', 'utf8');

code = code.replace(
    "appliedPromo: string | null;",
    "appliedPromo: any;"
);

code = code.replace(
    "const discount = appliedPromo === 'WELCOME10' ? cartTotal * 0.1 : 0;",
    "const discount = appliedPromo?.discount_amount ? appliedPromo.discount_amount : (appliedPromo?.discount_percentage ? (cartTotal * appliedPromo.discount_percentage / 100) : 0);"
);

code = code.replace(
    "<span>Discount ({appliedPromo})</span>",
    "<span>Discount ({appliedPromo?.code || 'Promo'})</span>"
);

fs.writeFileSync('bupzo-frontend/components/CartModal.tsx', code);
console.log("Fixed CartModal.tsx appliedPromo");
