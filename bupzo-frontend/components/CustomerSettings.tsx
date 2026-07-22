import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/authStore';
import { fetchUserAddresses, createAddress, deleteAddress, API_BASE_URL } from '@/lib/api';

export function CustomerSettings({ user }: { user: any }) {
  const { setUser } = useUser();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  
  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', street: '', city: '', state: '', zip_code: '', latitude: '', longitude: '' });

  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    }
    if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setPincode(user.pincode || '');
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
                      pincode: newAddr.zip_code
                  })
              }).then(r => r.json());
              if (updatedUser && updatedUser.id) {
                  setUser(updatedUser);
              }
          } catch(e) {}
      }
      setShowNewAddress(false);
      setNewAddr({ name: '', street: '', city: '', state: '', zip_code: '', latitude: '', longitude: '' });
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

      const response = await fetch(`${API_BASE_URL}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone: formattedPhone,
          address,
          pincode
        })
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Default Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500" placeholder="e.g. 123 Main St, Apartment 4B" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Default Pincode</label>
              <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500" placeholder="e.g. 110001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Update Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500" placeholder="Leave blank to keep unchanged" />
            </div>
            
            <button 
              onClick={handleSaveSettings}
              className="mt-4 w-full bg-brand-yellow hover:bg-yellow-500 text-brand-blue font-bold px-6 py-2 rounded shadow transition-colors"
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
                    <option value="">Select State</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
                <input type="text" placeholder="ZIP Code" value={newAddr.zip_code} onChange={e => setNewAddr({...newAddr, zip_code: e.target.value})} className="border p-2 rounded w-full text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="any" placeholder="Latitude" value={newAddr.latitude} onChange={e => setNewAddr({...newAddr, latitude: e.target.value})} className="border p-2 rounded w-full text-sm" />
                  <input type="number" step="any" placeholder="Longitude" value={newAddr.longitude} onChange={e => setNewAddr({...newAddr, longitude: e.target.value})} className="border p-2 rounded w-full text-sm" />
                </div>
                <div className="w-full h-40 rounded overflow-hidden border bg-gray-100 flex items-center justify-center relative" 
                     onClick={(e) => {
                       // Simulated map picker: In a real app, this would use a Maps JS API like Google Maps or Leaflet.
                       // For now, we simulate picking a random nearby location when the user clicks the map.
                       const lat = 11.0 + Math.random() * 2;
                       const lng = 77.0 + Math.random() * 2;
                       setNewAddr({...newAddr, latitude: lat.toFixed(6), longitude: lng.toFixed(6)});
                       alert(`Simulated map pin drop at Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
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
                      src={`https://maps.google.com/maps?q=${newAddr.latitude},${newAddr.longitude}&hl=en&z=14&output=embed`}
                    ></iframe>
                  ) : (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0, pointerEvents: 'none' }}
                      src={`https://maps.google.com/maps?q=India&hl=en&z=4&output=embed`}
                    ></iframe>
                  )}
                  <div className="absolute top-2 left-2 z-20 bg-black/70 text-white text-[10px] px-2 py-1 rounded">Interactive Map: Click anywhere to set location</div>
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
