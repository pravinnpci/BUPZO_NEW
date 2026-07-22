const fs = require('fs');
const file = 'bupzo-frontend/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the floating button container
content = content.replace(/<div className="fixed top-4 right-4 z-\[100\] flex items-center gap-2">[\s\S]*?<\/div>/g, '');

// Also remove `bg-brand-gray-light` background for main content wrapper to ensure crisp white Sprylo layout
content = content.replace('className="w-full min-h-screen transition-all duration-300 bg-brand-gray-light"', 'className="w-full min-h-screen transition-all duration-300 bg-white"');

fs.writeFileSync(file, content);
console.log('Floating buttons removed, wrapper updated');
