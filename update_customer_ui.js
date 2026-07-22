const fs = require('fs');

// --- 1. Update Navbar.tsx to show Wallet Balance ---
const navbarFile = 'bupzo-frontend/components/Navbar.tsx';
let navbarContent = fs.readFileSync(navbarFile, 'utf8');

navbarContent = navbarContent.replace(
  "              <button\n                onClick={() => onTabChange && onTabChange('kyc')}\n                className=\"hidden sm:inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-400 cursor-pointer transition-colors\"\n              >\n                <span className=\"text-sm font-semibold border border-yellow-400 px-2 py-1 rounded\">Become a Seller</span>\n              </button>",
  `              {user && (
                <div 
                  className="hidden sm:flex items-center gap-2 text-green-400 hover:text-green-300 cursor-pointer border-l border-blue-500/50 pl-6 transition-colors"
                  onClick={() => onTabChange && onTabChange('wallet')}
                >
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-green-200">Wallet Balance</span>
                    <span className="text-sm font-bold">₹{user.walletBalance || 0}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => onTabChange && onTabChange('kyc')}
                className="hidden sm:inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-400 cursor-pointer transition-colors"
              >
                <span className="text-sm font-semibold border border-yellow-400 px-2 py-1 rounded">Become a Seller</span>
              </button>`
);
fs.writeFileSync(navbarFile, navbarContent);

// --- 2. Update SellerKYCModal.tsx ---
const kycFile = 'bupzo-frontend/components/SellerKYCModal.tsx';
let kycContent = fs.readFileSync(kycFile, 'utf8');

kycContent = kycContent.replace(
  "  const [businessName, setBusinessName] = useState('');",
  "  const [businessName, setBusinessName] = useState(user?.name ? `${user.name}'s Store` : '');"
);
fs.writeFileSync(kycFile, kycContent);

// --- 3. Update CustomerSettings.tsx ---
const settingsFile = 'bupzo-frontend/components/CustomerSettings.tsx';
let settingsContent = fs.readFileSync(settingsFile, 'utf8');

// Add password state
settingsContent = settingsContent.replace(
  "  const [email, setEmail] = useState(user?.email || '');",
  "  const [email, setEmail] = useState(user?.email || '');\n  const [password, setPassword] = useState('');"
);

// Add password field UI
settingsContent = settingsContent.replace(
  "            <div>\n              <label className=\"block text-sm font-semibold text-gray-700 mb-1\">Default Pincode</label>\n              <input type=\"text\" value={pincode} onChange={(e) => setPincode(e.target.value)} className=\"w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500\" placeholder=\"e.g. 110001\" />\n            </div>",
  `            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Default Pincode</label>
              <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500" placeholder="e.g. 110001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Update Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500" placeholder="Leave blank to keep unchanged" />
            </div>`
);

// Update save payload
settingsContent = settingsContent.replace(
  "      body: JSON.stringify({\n        name, phone, email, address, pincode\n      })",
  "      body: JSON.stringify({\n        name, phone, email, address, pincode, password: password || undefined\n      })"
);

// Add map click handler
settingsContent = settingsContent.replace(
  "                <div className=\"w-full h-40 rounded overflow-hidden border bg-gray-100 flex items-center justify-center relative\">\n                  {(newAddr.latitude && newAddr.longitude) ? (\n                    <iframe\n                      width=\"100%\"\n                      height=\"100%\"\n                      frameBorder=\"0\"\n                      style={{ border: 0 }}\n                      src={`https://maps.google.com/maps?q=${newAddr.latitude},${newAddr.longitude}&hl=en&z=14&output=embed`}\n                      allowFullScreen\n                    ></iframe>\n                  ) : (\n                    <iframe\n                      width=\"100%\"\n                      height=\"100%\"\n                      frameBorder=\"0\"\n                      style={{ border: 0 }}\n                      src={`https://maps.google.com/maps?q=India&hl=en&z=4&output=embed`}\n                      allowFullScreen\n                    ></iframe>\n                  )}\n                </div>",
  `                <div className="w-full h-40 rounded overflow-hidden border bg-gray-100 flex items-center justify-center relative" 
                     onClick={(e) => {
                       // Simulated map picker: In a real app, this would use a Maps JS API like Google Maps or Leaflet.
                       // For now, we simulate picking a random nearby location when the user clicks the map.
                       const lat = 11.0 + Math.random() * 2;
                       const lng = 77.0 + Math.random() * 2;
                       setNewAddr({...newAddr, latitude: lat.toFixed(6), longitude: lng.toFixed(6)});
                       alert(\`Simulated map pin drop at Lat: \${lat.toFixed(6)}, Lng: \${lng.toFixed(6)}\`);
                     }}
                     style={{ cursor: 'crosshair' }}
                >
                  <div className="absolute inset-0 z-10 bg-transparent" title="Click to drop pin" />
                  {(newAddr.latitude && newAddr.longitude) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0, pointerEvents: 'none' }}
                      src={\`https://maps.google.com/maps?q=\${newAddr.latitude},\${newAddr.longitude}&hl=en&z=14&output=embed\`}
                    ></iframe>
                  ) : (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0, pointerEvents: 'none' }}
                      src={\`https://maps.google.com/maps?q=India&hl=en&z=4&output=embed\`}
                    ></iframe>
                  )}
                  <div className="absolute top-2 left-2 z-20 bg-black/70 text-white text-[10px] px-2 py-1 rounded">Interactive Map: Click anywhere to set location</div>
                </div>`
);

fs.writeFileSync(settingsFile, settingsContent);
