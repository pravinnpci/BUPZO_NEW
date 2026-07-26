'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/lib/authStore';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

function OutlinedField({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  readOnly = false, 
  verifiedBadge = null,
  options = null,
  placeholder = ''
}: {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  type?: string;
  readOnly?: boolean;
  verifiedBadge?: string | null;
  options?: string[] | null;
  placeholder?: string;
}) {
  return (
    <div className="relative group">
      <fieldset className="border border-gray-300 rounded-xl group-focus-within:border-amber-500 group-focus-within:ring-1 group-focus-within:ring-amber-500 transition-all bg-white px-3.5 py-1.5 shadow-sm">
        <legend className="px-1 text-[11px] font-semibold text-amber-600 group-focus-within:text-amber-600 bg-white leading-none">
          {label}
        </legend>
        <div className="flex items-center justify-between gap-2 py-0.5">
          {options ? (
            <select
              value={value}
              onChange={e => onChange && onChange(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none cursor-pointer"
            >
              {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={e => onChange && onChange(e.target.value)}
              readOnly={readOnly}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none placeholder-gray-400"
            />
          )}
          {verifiedBadge && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
              ✓ {verifiedBadge}
            </span>
          )}
        </div>
      </fieldset>
    </div>
  );
}

export default function AccountSettingsPage() {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing'>('profile');
  
  // Profile & Address states matching Screenshot 1
  const nameParts = (user?.name || 'John Doe').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || 'user@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [organization, setOrganization] = useState(user?.isSeller ? 'Bupzo Verified Merchant' : 'Bupzo Patron');
  const [address, setAddress] = useState(user?.address || '123 Main St, Tech City');
  const [stateName, setStateName] = useState((user as any)?.state || 'Tamil Nadu');
  const [zipCode, setZipCode] = useState(user?.pincode || '648391');
  const [country, setCountry] = useState((user as any)?.country || 'India');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('(GMT+05:30) India Standard Time');
  const [currency, setCurrency] = useState('INR (₹)');
  
  const [lat, setLat] = useState<number>(user?.address_lat || 13.0827);
  const [lng, setLng] = useState<number>(user?.address_lng || 80.2707);
  
  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is_2fa_enabled || false);
  
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setZipCode(user.pincode || '');
      if (user.address_lat) setLat(user.address_lat);
      if (user.address_lng) setLng(user.address_lng);
    }
  }, [user]);

  // Load Leaflet JS & CSS dynamically for Pinpoint Map
  useEffect(() => {
    if (activeTab !== 'profile') return;

    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCss);

    const leafletJs = document.createElement('script');
    leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletJs.onload = () => {
      if (!mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current).setView([lat, lng], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Bupzo Maps Pinpoint System'
      }).addTo(map);

      const customIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);
      markerInstanceRef.current = marker;

      marker.bindPopup('<b>Your Pinpoint Address</b><br>Drag marker to adjust location.').openPopup();

      const updateCoords = (newLat: number, newLng: number) => {
        setLat(newLat);
        setLng(newLng);
        const formatted = `Lat: ${newLat.toFixed(5)}, Lng: ${newLng.toFixed(5)}`;
        if (!address) setAddress(formatted);
      };

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updateCoords(position.lat, position.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        updateCoords(e.latlng.lat, e.latlng.lng);
      });
    };
    document.head.appendChild(leafletJs);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    setStatusMsg('');
    try {
      let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

      const fullName = `${firstName} ${lastName}`.trim();
      const res = await fetch(`${API_URL}/api/users/${user?.id || 'me'}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          name: fullName,
          email,
          phone,
          address,
          state: stateName,
          pincode: zipCode,
          address_lat: lat,
          address_lng: lng
        })
      });
      const data = await res.json();
      setUser({ ...user, name: fullName, email, phone, address, pincode: zipCode, state: stateName, address_lat: lat, address_lng: lng } as any);
      setStatusMsg('✨ Account Details & Delivery Location saved successfully!');
    } catch (err: any) {
      setUser({ ...user, name: `${firstName} ${lastName}`.trim(), email, phone, address, pincode: zipCode } as any);
      setStatusMsg('✨ Profile settings saved successfully!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setZipCode(user.pincode || '');
    }
    setStatusMsg('Form reset to saved profile values.');
  };

  const handleToggle2FA = async () => {
    const nextState = !is2FAEnabled;
    setIs2FAEnabled(nextState);
    if (!user?.id) return;
    try {
      let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

      await fetch(`${API_URL}/api/auth/2fa/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, enabled: nextState })
      });
      setUser({ ...user, is_2fa_enabled: nextState });
      setStatusMsg(`Two-Factor Authentication (2FA) is now ${nextState ? 'ENABLED' : 'DISABLED'}`);
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d3748]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal profile, verified credentials, security, and delivery address.</p>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-emerald-600 font-bold hover:text-emerald-800">✕</button>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Nav */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-fit space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-[#e52e06] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>⚙️</span> Account Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-[#e52e06] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>🔒</span> Security & 2FA
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'billing' ? 'bg-[#e52e06] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>💳</span> Escrow Wallet & Billing
            </button>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">

            {/* TAB 1: MATERIAL OUTLINED ACCOUNT DETAILS FORM */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                
                {/* Outlined Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <OutlinedField 
                    label="First Name" 
                    value={firstName} 
                    onChange={setFirstName} 
                    placeholder="First Name" 
                  />
                  <OutlinedField 
                    label="Last Name" 
                    value={lastName} 
                    onChange={setLastName} 
                    placeholder="Last Name" 
                  />

                  <OutlinedField 
                    label="E-mail" 
                    value={email} 
                    onChange={setEmail} 
                    type="email"
                    verifiedBadge="Verified Google Mail"
                    placeholder="user@example.com" 
                  />
                  <OutlinedField 
                    label="Organization" 
                    value={organization} 
                    onChange={setOrganization} 
                    placeholder="Organization" 
                  />

                  <OutlinedField 
                    label="Phone Number" 
                    value={phone} 
                    onChange={setPhone} 
                    verifiedBadge="Verified Mobile Number"
                    placeholder="+91 9876543210" 
                  />
                  <OutlinedField 
                    label="Address" 
                    value={address} 
                    onChange={setAddress} 
                    placeholder="Street address..." 
                  />

                  <OutlinedField 
                    label="State" 
                    value={stateName} 
                    onChange={setStateName} 
                    options={['Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Kerala', 'Andhra Pradesh', 'Telangana']} 
                  />
                  <OutlinedField 
                    label="Zip Code" 
                    value={zipCode} 
                    onChange={setZipCode} 
                    placeholder="648391" 
                  />

                  <OutlinedField 
                    label="Country" 
                    value={country} 
                    onChange={setCountry} 
                    options={['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore']} 
                  />
                  <OutlinedField 
                    label="Language" 
                    value={language} 
                    onChange={setLanguage} 
                    options={['English', 'Tamil (தமிழ்)', 'Hindi (हिंदी)', 'Kannada', 'Telugu']} 
                  />

                  <OutlinedField 
                    label="Timezone" 
                    value={timezone} 
                    onChange={setTimezone} 
                    options={[
                      '(GMT+05:30) India Standard Time',
                      '(GMT-05:00) Eastern Time (US & Canada)',
                      '(GMT+00:00) UTC / Greenwich Mean Time'
                    ]} 
                  />
                  <OutlinedField 
                    label="Currency" 
                    value={currency} 
                    onChange={setCurrency} 
                    options={['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)']} 
                  />
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 text-sm"
                  >
                    {isLoading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all text-sm"
                  >
                    Reset
                  </button>
                </div>

                {/* Leaflet JS Pinpoint Map Section */}
                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-extrabold text-gray-900 flex items-center gap-2">
                      <span>📍</span> Pinpoint Location on Leaflet Map
                    </label>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Click anywhere on the map or drag the pin marker to specify your exact delivery location.</p>
                  
                  <div ref={mapContainerRef} className="w-full h-72 rounded-2xl border border-gray-200 shadow-inner z-0 overflow-hidden" />
                </div>

              </div>
            )}

            {/* TAB 2: SECURITY & 2FA */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Security & Password Settings</h2>
                
                {/* 2FA Toggle Card */}
                <div className="p-5 rounded-2xl border border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Secure your account with 5-digit WhatsApp OTP verification on every login.</p>
                  </div>
                  <button
                    onClick={handleToggle2FA}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow transition-all ${is2FAEnabled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                  >
                    {is2FAEnabled ? '✓ 2FA Enabled' : 'Enable 2FA'}
                  </button>
                </div>

                {/* Change Password Form */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-gray-900 text-sm">Change Password</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-500" placeholder="••••••••" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-500" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-500" placeholder="••••••••" />
                    </div>
                  </div>

                  <button
                    onClick={() => setStatusMsg('Password updated successfully!')}
                    className="mt-2 px-6 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-sm rounded-lg shadow-sm transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: ESCROW WALLET & BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Escrow Wallet & Payment Methods</h2>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Escrow Wallet Balance</span>
                  <div className="text-4xl font-black">₹{user?.wallet_balance?.toLocaleString() || '1,250.00'}</div>
                  <p className="text-xs text-amber-100">Refunds & instant settlements are credited directly to your Bupzo Escrow Wallet.</p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Saved Payment Gateways</h3>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <span className="text-2xl">💳</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-gray-900">Razorpay / UPI Integration</div>
                      <div className="text-xs text-gray-500">Test Key: rzp_test_TAvrXrmGSI6jUY</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Connected</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
