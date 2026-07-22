const fs = require('fs');

let content = fs.readFileSync('bupzo-frontend/components/Navbar.tsx', 'utf8');

// Fix TypeScript error for gSelect.value
content = content.replace(
    `let gSelect = document.querySelector('.goog-te-combo');`,
    `let gSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;`
);

fs.writeFileSync('bupzo-frontend/components/Navbar.tsx', content);
console.log("Fixed gSelect HTMLSelectElement cast");
