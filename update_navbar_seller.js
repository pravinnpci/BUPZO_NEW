const fs = require('fs');
const file = 'bupzo-frontend/components/Navbar.tsx';
let content = fs.readFileSync(file, 'utf8');

const sellerButton = `
                    {user.isSeller && (
                      <button onClick={() => { setShowDropdown(false); if(onTabChange) onTabChange('seller-dashboard'); }} className="w-full text-left px-6 py-2.5 text-sm font-medium text-brand-blue hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                        <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        Seller Dashboard
                      </button>
                    )}
                    {!user.isSeller && (
                      <button onClick={() => { setShowDropdown(false); if(onTabChange) onTabChange('become-seller'); }} className="w-full text-left px-6 py-2.5 text-sm font-medium text-purple-600 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Become a Seller
                      </button>
                    )}
`;

content = content.replace('My Orders\n                    </button>', 'My Orders\n                    </button>' + sellerButton);

fs.writeFileSync(file, content);
