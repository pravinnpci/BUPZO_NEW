const fs = require('fs');
const file = 'bupzo-admin/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states for edit user modal
content = content.replace(
  "  const [editUserName, setEditUserName] = useState('');",
  "  const [editUserName, setEditUserName] = useState('');\n  const [editUserStatus, setEditUserStatus] = useState('Active');\n  const [editUserAddress, setEditUserAddress] = useState('');\n  const [editUserPincode, setEditUserPincode] = useState('');\n  const [editUserPassword, setEditUserPassword] = useState('');"
);

// 2. Update openEditUserModal
content = content.replace(
  "    setNewUserWallet(user.wallet.toString());",
  "    setNewUserWallet(user.wallet.toString());\n    setEditUserStatus(user.status || 'Active');\n    setEditUserAddress(user.address || '');\n    setEditUserPincode(user.pincode || '');\n    setEditUserPassword('');"
);

// 3. Update handleEditUserSubmit JSON body
content = content.replace(
  "          wallet_balance: parseFloat(newUserWallet) || 0\n        })",
  "          wallet_balance: parseFloat(newUserWallet) || 0,\n          status: editUserStatus,\n          address: editUserAddress || null,\n          pincode: editUserPincode || null,\n          password: editUserPassword || null\n        })"
);

// 4. Update the EditUserModal UI
const editModalUI = `
                <div>
                  <label className="block mb-1 text-zinc-500">Wallet Balance (₹)</label>
                  <input type="number" value={newUserWallet} onChange={(e) => setNewUserWallet(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-zinc-500">Status</label>
                  <select value={editUserStatus} onChange={(e) => setEditUserStatus(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-zinc-500">New Password (Leave blank to keep)</label>
                  <input type="password" value={editUserPassword} onChange={(e) => setEditUserPassword(e.target.value)} placeholder="New Password" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-zinc-500">Delivery Address</label>
                <textarea value={editUserAddress} onChange={(e) => setEditUserAddress(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors" rows={2} />
              </div>
              <div>
                <label className="block mb-1 text-zinc-500">Pincode</label>
                <input type="text" value={editUserPincode} onChange={(e) => setEditUserPincode(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>`;

content = content.replace(
  "                <div>\n                  <label className=\"block mb-1 text-zinc-500\">Wallet Balance (₹)</label>\n                  <input type=\"number\" value={newUserWallet} onChange={(e) => setNewUserWallet(e.target.value)} className=\"w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors\" />\n                </div>\n              </div>",
  editModalUI
);

fs.writeFileSync(file, content);
