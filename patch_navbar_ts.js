const fs = require('fs');

let content = fs.readFileSync('bupzo-frontend/components/Navbar.tsx', 'utf8');

// Replace the previous patch code if it had errors, or just do it clean
content = content.replace(`window.googleTranslateElementInit`, `(window as any).googleTranslateElementInit`);
content = content.replace(`new window.google.translate.TranslateElement`, `new (window as any).google.translate.TranslateElement`);

fs.writeFileSync('bupzo-frontend/components/Navbar.tsx', content);
console.log("TypeScript issues fixed in Navbar.tsx");
