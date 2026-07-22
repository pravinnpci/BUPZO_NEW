const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/Navbar.tsx', 'utf8');

// Replace hidden lg:flex with flex overflow-x-auto
code = code.replace(
    'className="hidden lg:flex items-center gap-6 font-bold text-[13px] uppercase text-gray-700 tracking-wide"',
    'className="flex overflow-x-auto whitespace-nowrap items-center gap-6 font-bold text-[13px] uppercase text-gray-700 tracking-wide pb-2 lg:pb-0 scrollbar-hide"'
);

// Also remove hidden lg:flex from the parent container if necessary
code = code.replace(
    '<div className="flex-1 max-w-2xl hidden lg:flex border-2 border-[#e52e06] rounded-full overflow-hidden items-center h-12 relative">',
    '<div className="flex-1 max-w-2xl hidden md:flex border-2 border-[#e52e06] rounded-full overflow-hidden items-center h-12 relative">'
);

fs.writeFileSync('bupzo-frontend/components/Navbar.tsx', code);
console.log("Updated Navbar.tsx for mobile");
