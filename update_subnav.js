const fs = require('fs');
const file = 'bupzo-frontend/components/Navbar.tsx';
let content = fs.readFileSync(file, 'utf8');

const subNavbarCode = `
      {/* Sub-Navbar for Categories */}
      <div className="w-full bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 h-10 flex items-center gap-8 overflow-x-auto whitespace-nowrap">
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 transition-colors flex items-center gap-1">Shop All Categories ▾</Link>
          <Link href="#" className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors">BupzoPass</Link>
          <Link href="#" className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors border-b-2 border-red-600 h-full flex items-center pt-[2px]">Today's Deals</Link>
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 transition-colors">New to Bupzo</Link>
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 transition-colors">Top Brands</Link>
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 transition-colors">Clearance</Link>
        </div>
      </div>
`;

content = content.replace('</nav>', '</nav>' + subNavbarCode);

fs.writeFileSync(file, content);
