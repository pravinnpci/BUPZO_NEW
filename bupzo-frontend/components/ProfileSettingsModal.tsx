import React, { useState } from 'react';
import { useUser } from '@/lib/authStore';

export function ProfileSettingsModal({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useUser();
  const [username, setUsername] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState('Customer');
  const [bio, setBio] = useState('Valued member of the Bupzo marketplace.');
  const [password, setPassword] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      const uploadResp = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (uploadResp.ok) {
        const { url } = await uploadResp.json();
        const updateResp = await fetch(`${API_URL}/api/users/${user?.id}`, {
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
  };
  
  // Location mapping
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [lat, setLat] = useState('11.0168');
  const [lng, setLng] = useState('76.9558');

  const handleSave = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      const payload: any = {
        name: username,
        email,
        address,
        pincode,
        phone: user?.phone
      };
      if (password) payload.password = password;

      const resp = await fetch(`${API_URL}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        alert("Settings Saved Successfully!");
        setUser({ ...user!, name: username, email, address, pincode });
        onClose();
      } else {
        alert("Failed to save settings.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving settings.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-blue-500 material-symbols-outlined font-bold text-xl">✨</span>
            <h2 className="font-bold text-gray-800 tracking-widest text-sm font-heading">PROFILE SETTINGS</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Top Section */}
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-gray-200 overflow-hidden shadow-sm mb-3">
                <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-4 pt-1">
              <div className="flex gap-2 mb-2">
                <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <label htmlFor="avatarUpload" className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full ml-auto hover:bg-blue-700 cursor-pointer">
                  {avatarUploading ? 'Uploading...' : 'Upload Image'}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-medium text-gray-700 shadow-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-medium text-gray-700 shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          
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


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Update Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-medium text-gray-700 shadow-sm" placeholder="Leave blank to keep unchanged" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Pincode</label>
              <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-medium text-gray-700 shadow-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block flex justify-between">
              <span>Delivery Address & Location</span>
              <span className="text-[10px] text-blue-500 lowercase normal-case">Click map to set pin</span>
            </label>
            <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-t-lg text-sm outline-none focus:border-blue-500 font-medium text-gray-700 shadow-sm resize-none mb-[-1px]"></textarea>
            
            <div className="w-full h-32 bg-gray-100 rounded-b-lg border border-gray-200 relative overflow-hidden cursor-crosshair shadow-sm"
                 onClick={() => {
                   const rLat = (11.0 + Math.random() * 2).toFixed(6);
                   const rLng = (77.0 + Math.random() * 2).toFixed(6);
                   setLat(rLat); setLng(rLng);
                   alert(`Location set to Lat: ${rLat}, Lng: ${rLng}`);
                 }}>
               <div className="absolute inset-0 z-10 bg-transparent" title="Click to drop pin" />
               <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0, pointerEvents: 'none' }}
                  src={`https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=14&output=embed`}
               ></iframe>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}
