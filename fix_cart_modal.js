const fs = require('fs');

let code = fs.readFileSync('bupzo-frontend/components/CartModal.tsx', 'utf8');

code = code.replace(
    'handleApplyPromo: () => void;',
    'handleApplyPromo: (e: any, cartTotal: number) => void;'
);

code = code.replace(
    'onClick={handleApplyPromo}',
    'onClick={(e) => handleApplyPromo(e, cartTotal)}'
);

fs.writeFileSync('bupzo-frontend/components/CartModal.tsx', code);
console.log("Fixed TS error in CartModal.tsx");
