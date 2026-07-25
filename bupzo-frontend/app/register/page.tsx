'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/authStore';

export default function MultiStepRegisterPage() {
  const router = useRouter();
  const { setUser, setTokens } = useUser();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1: Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Personal & Role
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');

  // Step 3: Location
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep1 = () => {
    if (!name.trim()) return setMessage('Full Name is required');
    if (!email.trim()) return setMessage('Email address is required');
    if (!password || password.length < 6) return setMessage('Password must be at least 6 characters');
    setMessage('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!phone.trim() || phone.length < 10) return setMessage('Valid 10-digit phone number is required');
    setMessage('');
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!address.trim()) return setMessage('Address is required');
    setIsLoading(true);
    setMessage('');
    try {
      let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          address,
          pincode,
          is_seller: role === 'seller'
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');

      setTokens(data.access_token, data.access_token);
      setUser(data.user);
      setMessage('Registration successful! Redirecting...');
      setTimeout(() => router.push(role === 'seller' ? '/?seller=true' : '/'), 1200);
    } catch (err: any) {
      setMessage(err.message || 'Error completing multi-step registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl border border-gray-100 p-8 md:p-12">
        
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#3874ff] text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-3 shadow-lg">
            B
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Multi-Step Registration</h1>
          <p className="text-xs text-gray-500 mt-1">Materialize Admin Template Multi-step Registration Wizard</p>
        </div>

        {/* Step Wizard Indicator */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
          <div className={`flex items-center gap-2 font-bold text-xs ${step >= 1 ? 'text-[#3874ff]' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-[#3874ff] text-white' : 'bg-gray-100 text-gray-500'}`}>1</span>
            Account
          </div>
          <div className="h-0.5 flex-1 bg-gray-200 mx-3" />
          <div className={`flex items-center gap-2 font-bold text-xs ${step >= 2 ? 'text-[#3874ff]' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-[#3874ff] text-white' : 'bg-gray-100 text-gray-500'}`}>2</span>
            Personal &amp; Role
          </div>
          <div className="h-0.5 flex-1 bg-gray-200 mx-3" />
          <div className={`flex items-center gap-2 font-bold text-xs ${step >= 3 ? 'text-[#3874ff]' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step >= 3 ? 'bg-[#3874ff] text-white' : 'bg-gray-100 text-gray-500'}`}>3</span>
            Location &amp; Pinpoint
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-xl text-xs font-bold ${message.includes('successful') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message}
          </div>
        )}

        {/* STEP 1: Account Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]" placeholder="Enter Full Name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]" placeholder="Enter Email" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]" placeholder="Min 6 characters" />
            </div>
            <button onClick={handleNextStep1} className="w-full py-3.5 bg-[#3874ff] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4">
              Continue to Step 2 →
            </button>
          </div>
        )}

        {/* STEP 2: Personal & Role */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Account Type</label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-4 rounded-2xl border font-bold text-xs text-center transition-all ${role === 'customer' ? 'border-[#3874ff] bg-blue-50 text-[#3874ff] shadow-sm' : 'border-gray-200 text-gray-600'}`}
                >
                  <span className="text-xl block mb-1">🛒</span> Customer Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`p-4 rounded-2xl border font-bold text-xs text-center transition-all ${role === 'seller' ? 'border-[#3874ff] bg-blue-50 text-[#3874ff] shadow-sm' : 'border-gray-200 text-gray-600'}`}
                >
                  <span className="text-xl block mb-1">🏪</span> Merchant Seller
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50">
                ← Back
              </button>
              <button onClick={handleNextStep2} className="flex-1 py-3.5 bg-[#3874ff] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md">
                Continue to Step 3 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Location & Pinpoint Setup */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]" placeholder="Enter door no, street, city..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
              <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]" placeholder="Enter 6-digit pincode" />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50">
                ← Back
              </button>
              <button onClick={handleFinalSubmit} disabled={isLoading} className="flex-1 py-3.5 bg-[#3874ff] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50">
                {isLoading ? 'Creating Account...' : 'Complete Registration ✓'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs font-semibold text-gray-500 border-t border-gray-100 pt-6">
          Already have an account? <Link href="/login" className="text-[#3874ff] font-bold hover:underline">Log in</Link>
        </div>

      </div>
    </div>
  );
}
