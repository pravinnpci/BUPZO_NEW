const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/app/shop/[id]/page.tsx', 'utf8');

code = code.replace(
    /router\.push\('\/\?tab=' \+ t\)/g,
    "window.location.href = '/?tab=' + t"
);
code = code.replace(
    /router\.push\('\/'\)/g,
    "window.location.href = '/'"
);

fs.writeFileSync('bupzo-frontend/app/shop/[id]/page.tsx', code);
console.log("Fixed router.push to window.location.href in shop page");
