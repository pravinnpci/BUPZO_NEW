const fs = require('fs');
const file = 'bupzo-frontend/components/ProfileSettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const [password, setPassword] = useState('');",
  `const [password, setPassword] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      const uploadResp = await fetch(\`\${API_URL}/api/upload\`, {
        method: 'POST',
        body: formData,
      });
      if (uploadResp.ok) {
        const { url } = await uploadResp.json();
        const updateResp = await fetch(\`\${API_URL}/api/users/\${user?.id}\`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ avatar_url: url })
        });
        if (updateResp.ok) {
           setUser({ ...user!, avatar_url: url });
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setAvatarUploading(false);
    }
  };`
);

content = content.replace(
  `<img src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user?.id || 'default'}\`} alt="Avatar" className="w-full h-full object-cover" />`,
  `<img src={user?.avatar_url || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user?.id || 'default'}\`} alt="Avatar" className="w-full h-full object-cover" />`
);

content = content.replace(
  `<div className="flex gap-2 mb-2">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" className="w-8 h-8 rounded-full border bg-gray-100" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" className="w-8 h-8 rounded-full border bg-gray-100" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=3" className="w-8 h-8 rounded-full border bg-gray-100" />
                <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full ml-auto hover:bg-blue-700">Upload</button>
              </div>`,
  `<div className="flex gap-2 mb-2">
                <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <label htmlFor="avatarUpload" className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full ml-auto hover:bg-blue-700 cursor-pointer">
                  {avatarUploading ? 'Uploading...' : 'Upload Image'}
                </label>
              </div>`
);

// Replace Department and Biography Summary with User Details
const detailsBlock = `
          {/* Details Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Wallet</p>
              <p className="font-bold text-gray-800">₹{user?.wallet_balance?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Tier</p>
              <p className="font-bold text-blue-600">{user?.is_premium ? 'Premium' : 'Normal'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Status</p>
              <p className="font-bold text-emerald-600">{user?.seller_status === 'APPROVED' ? 'Active' : (user?.is_seller ? 'Pending' : 'Active')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Role</p>
              <p className="font-bold text-amber-600">{user?.is_admin ? 'Admin' : (user?.is_seller ? 'Seller' : 'Customer')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Risk</p>
              <p className="font-bold text-green-600">Low</p>
            </div>
          </div>
`;

content = content.replace(
  `{/* Details Section */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Department / Unit</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-medium text-gray-700 shadow-sm appearance-none">
              <option>Customer</option>
              <option>Seller / Merchant</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Biography Summary</label>
            <textarea rows={2} value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-medium text-gray-700 shadow-sm resize-none"></textarea>
          </div>`,
  detailsBlock
);

fs.writeFileSync(file, content);
console.log('ProfileSettingsModal.tsx updated');
