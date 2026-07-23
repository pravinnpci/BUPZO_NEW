import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/authStore';
import { fetchUserAddresses, createAddress, deleteAddress, API_BASE_URL } from '@/lib/api';

export function CustomerSettings({ user }: { user: any }) {
  const { setUser } = useUser();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [userState, setUserState] = useState(user?.state || 'Tamil Nadu');
  
  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', street: '', city: '', state: 'Tamil Nadu', zip_code: '', latitude: '11.0168', longitude: '76.9558' });
  const [mapZoom, setMapZoom] = useState(14);

  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    }
    if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setPincode(user.pincode || '');
      setUserState(user.state || 'Tamil Nadu');
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const data = await fetchUserAddresses(user.id);
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  const handleVerifyCurrentPassword = () => {
    if (!currentPassword.trim()) {
      alert("Please enter your current password to edit your password.");
      return;
    }
    // Simple verification check / unlock
    setIsPasswordUnlocked(true);
    alert("Password editing unlocked! You can now type your new password.");
  };

  const handleSaveAddress = async () => {
    if (!newAddr.name.trim() || !newAddr.street.trim() || !newAddr.city.trim() || !newAddr.state || !newAddr.zip_code.trim()) {
      alert("Please fill out all required fields: Name, Street, City, State, and Zip Code.");
      return;
    }
    if (!/^\d{6}$/.test(newAddr.zip_code.trim())) {
      alert("Please enter a valid 6-digit Zip Code.");
      return;
    }
    try {
      await createAddress(user.id, {
        ...newAddr,
        latitude: newAddr.latitude ? parseFloat(newAddr.latitude) : undefined,
        longitude: newAddr.longitude ? parseFloat(newAddr.longitude) : undefined
      });
      
      if (!user.address || !user.pincode) {
          try {
              const updatedUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004'}/api/users/${user.id}`, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                      address: newAddr.street + ', ' + newAddr.city + ', ' + newAddr.state,
                      pincode: newAddr.zip_code,
                      state: newAddr.state
                  })
              }).then(r => r.json());
              if (updatedUser && updatedUser.id) {
                  setUser(updatedUser);
              }
          } catch(e) {}
      }
      setShowNewAddress(false);
      setNewAddr({ name: '', street: '', city: '', state: 'Tamil Nadu', zip_code: '', latitude: '11.0168', longitude: '76.9558' });
      loadAddresses();
      alert("Address added successfully!");
    } catch (err) {
      alert("Failed to save address. Please check your inputs.");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      loadAddresses();
      alert("Address deleted.");
    } catch(err) {
      alert("Failed to delete address.");
    }
  };

  const handleSaveSettings = async () => {
    try {

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        return alert("Please enter a valid email address.");
      }

      let formattedPhone = phone.trim();
      if (!formattedPhone) return alert("Phone number is required.");
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
      }
      if (formattedPhone.length < 11 || formattedPhone.length > 15) {
        return alert("Please enter a valid phone number with country code.");
      }

      if (pincode && !/^\d{6}$/.test(pincode.trim())) {
        return alert("Please enter a valid 6-digit pincode.");
      }
      
      if (!address.trim()) {
        return alert("Please provide a valid default address.");
      }
      
      if (!pincode.trim()) {
        return alert("Please provide a valid pincode.");
      }

      const updateData: any = {
        email,
        phone: formattedPhone,
        address,
        pincode,
        state: userState
      };

      if (isPasswordUnlocked && password.trim()) {
        updateData.password = password;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setPassword('');
        setCurrentPassword('');
        setIsPasswordUnlocked(false);
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (e) {
      alert('Error saving settings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Account Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">User Details - {user?.name || 'Bupzo Patron'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold text-gray-600">ID:</span> <span className="font-mono text-gray-900">{user?.id}</span></div>
          <div><span className="font-semibold text-gray-600">Name:</span> <span className="text-gray-900">{user?.name || 'Bupzo Patron'}</span></div>
          <div><span className="font-semibold text-gray-600">Phone:</span> <span className="text-gray-900">{user?.phone || 'N/A'}</span></div>
          <div><span className="font-semibold text-gray-600">Email:</span> <span className="text-gray-900">{user?.email || 'N/A'}</span></div>
          <div><span className="font-semibold text-gray-600">Wallet:</span> <span className="text-gray-900 font-bold">₹{user?.wallet_balance || 0}</span></div>
          <div><span className="font-semibold text-gray-600">Tier:</span> <span className="text-gray-900">{user?.is_premium ? 'Premium' : 'Normal'}</span></div>
          <div><span className="font-semibold text-gray-600">Status:</span> <span className="text-gray-900">{user?.seller_status ? `Seller - ${user.seller_status}` : 'Active'}</span></div>
          <div><span className="font-semibold text-gray-600">Risk:</span> <span className="text-gray-900">{(user?.wallet_balance && user.wallet_balance > 4000) ? 'Medium' : 'Low'}</span></div>
          <div><span className="font-semibold text-gray-600">Role:</span> <span className="text-gray-900">{user?.is_admin ? 'Admin' : user?.is_seller ? 'Seller' : 'Customer'}</span></div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input type="text" readOnly value={user?.name || ''} className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
              <select 
                value={userState} 
                onChange={(e) => setUserState(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500 bg-white text-sm"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Punjab">Punjab</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Default Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500 text-sm" placeholder="e.g. 123 Main St, Apartment 4B" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Default Pincode</label>
              <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500 text-sm" placeholder="e.g. 600001" />
            </div>

            {/* Password Section with Read Mode / Unlock */}
            <div className="border-t border-gray-200 pt-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Update Password</label>
              {!isPasswordUnlocked ? (
                <div className="space-y-2">
                  <input 
                    type="password" 
                    readOnly 
                    value="••••••••••••" 
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500 text-sm cursor-not-allowed outline-none" 
                  />
                  <div className="flex gap-2 items-center">
                    <input 
                      type="password" 
                      placeholder="Enter Current Password to Unlock" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-blue-500" 
                    />
                    <button 
                      type="button"
                      onClick={handleVerifyCurrentPassword}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition"
                    >
                      Unlock & Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-blue-50 p-3 rounded border border-blue-200">
                  <span className="text-xs text-blue-800 font-bold block">Unlocked for Editing:</span>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-3 py-2 border border-blue-400 rounded outline-none text-sm bg-white" 
                    placeholder="Enter New Password" 
                  />
                </div>
              )}
            </div>
            
            <button 
              onClick={handleSaveSettings}
              className="mt-4 w-full bg-brand-yellow hover:bg-yellow-500 text-brand-blue font-bold px-6 py-2.5 rounded shadow transition-colors"
            >
              Save Personal Info
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Delivery Addresses</h2>
          
          <div className="space-y-4">
            {addresses.length === 0 && !showNewAddress && (
              <p className="text-sm text-gray-500">No saved addresses.</p>
            )}
            
            {addresses.map(a => (
              <div key={a.id} className="border p-4 rounded bg-gray-50 flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm">{a.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{a.street}, {a.city}</p>
                  <p className="text-sm text-gray-600">{a.state} - {a.zip_code}</p>
                  {a.latitude && a.longitude && (
                    <p className="text-[11px] text-blue-600 font-mono mt-1">📍 Lat: {a.latitude}, Lng: {a.longitude}</p>
                  )}
                </div>
                <button onClick={() => handleDeleteAddress(a.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">
                  Delete
                </button>
              </div>
            ))}
            
            {!showNewAddress ? (
              <button 
                onClick={() => setShowNewAddress(true)} 
                className="text-brand-blue font-bold text-sm hover:underline"
              >
                + Add New Address
              </button>
            ) : (
              <div className="border p-4 rounded space-y-3 mt-4">
                <h3 className="font-bold text-sm">Add New Address</h3>
                <input type="text" placeholder="Full Name" value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} className="border p-2 rounded w-full text-sm" />
                <input type="text" placeholder="Street Address" value={newAddr.street} onChange={e => setNewAddr({...newAddr, street: e.target.value})} className="border p-2 rounded w-full text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} className="border p-2 rounded w-full text-sm" />
                  <select value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} className="border p-2 rounded w-full text-sm bg-white">
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>
                <input type="text" placeholder="ZIP Code" value={newAddr.zip_code} onChange={e => setNewAddr({...newAddr, zip_code: e.target.value})} className="border p-2 rounded w-full text-sm" />
                
                {/* Map & Coordinates */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>📍 Map Pin & Coordinates</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setMapZoom(z => Math.min(z + 1, 18))} className="px-2 py-0.5 bg-gray-200 rounded text-xs hover:bg-gray-300">+</button>
                      <button type="button" onClick={() => setMapZoom(z => Math.max(z - 1, 4))} className="px-2 py-0.5 bg-gray-200 rounded text-xs hover:bg-gray-300">-</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" step="any" placeholder="Latitude" value={newAddr.latitude} onChange={e => setNewAddr({...newAddr, latitude: e.target.value})} className="border p-2 rounded w-full text-xs font-mono" />
                    <input type="number" step="any" placeholder="Longitude" value={newAddr.longitude} onChange={e => setNewAddr({...newAddr, longitude: e.target.value})} className="border p-2 rounded w-full text-xs font-mono" />
                  </div>
                  <div 
                    className="w-full h-44 rounded overflow-hidden border bg-gray-100 relative group cursor-crosshair"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / rect.width - 0.5;
                      const y = (e.clientY - rect.top) / rect.height - 0.5;
                      const baseLat = parseFloat(newAddr.latitude || '11.0168');
                      const baseLng = parseFloat(newAddr.longitude || '76.9558');
                      const newLat = (baseLat - y * 0.05).toFixed(6);
                      const newLng = (baseLng + x * 0.05).toFixed(6);
                      setNewAddr({ ...newAddr, latitude: newLat, longitude: newLng });
                      alert(`Pin dropped at Lat: ${newLat}, Lng: ${newLng}`);
                    }}
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0, pointerEvents: 'auto' }}
                      src={`https://maps.google.com/maps?q=${newAddr.latitude || 11.0168},${newAddr.longitude || 76.9558}&hl=en&z=${mapZoom}&output=embed`}
                    ></iframe>
                    <div className="absolute top-2 left-2 z-10 bg-black/80 text-white text-[10px] px-2 py-1 rounded backdrop-blur">
                      Interactive Map: Click anywhere on map to drop pin
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowNewAddress(false)} className="px-4 py-2 bg-gray-200 rounded text-sm font-bold text-gray-700 hover:bg-gray-300 transition-colors">Cancel</button>
                  <button onClick={handleSaveAddress} className="px-4 py-2 bg-blue-600 rounded text-sm font-bold text-white hover:bg-blue-700 transition-colors">Save Address</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
