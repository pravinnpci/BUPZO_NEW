'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSendOtp = () => {
    if (!phoneNumber) {
      setMessage('Please enter a phone number.');
      return;
    }

    if (phoneNumber === '+919876543210' || phoneNumber === '9876543210') {
      setMessage('Admin account matched. Enter verification OTP: 123456');
      setStep('otp');
    } else {
      setMessage('Access Denied: Only registered admin numbers are allowed access.');
    }
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      setMessage('Access Granted! Redirecting to Command Center...');
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAdminLoggedIn', 'true');
      }
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } else {
      setMessage('Invalid credentials. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-dust-grey dark:bg-[#0c0b11] text-charcoal dark:text-zinc-100 flex items-center justify-center font-sans p-6">
      <div className="bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6">
        
        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <img src="/Bupzo-logo.png" alt="Bupzo Logo" className="w-16 h-16 mx-auto object-contain rounded-xl" />
          <div>
            <h1 className="text-2xl font-bold font-heading">Super Admin Console</h1>
            <p className="text-xs text-zinc-400">Restricted access control for Bupzo system operations</p>
          </div>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1.5 font-heading">Admin Registration Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-charcoal font-mono"
              />
            </div>
            <button
              onClick={handleSendOtp}
              className="w-full bg-[#3f3b4c] dark:bg-zinc-800 text-white py-3 rounded-xl hover:bg-opacity-90 font-bold text-xs transition active:scale-95"
            >
              Verify Authority
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1.5 font-heading">Secure Passcode</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3.5 text-xs text-center tracking-widest bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-charcoal font-mono"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-[#3f3b4c] dark:bg-zinc-800 text-white py-3 rounded-xl hover:bg-opacity-90 font-bold text-xs transition active:scale-95"
            >
              Confirm Identity
            </button>
          </div>
        )}

        {message && (
          <div className={`text-center font-semibold text-[11px] py-2.5 px-3 rounded-xl ${message.includes('Granted') || message.includes('matched') ? 'bg-green-100/10 text-green-500' : 'bg-red-100/10 text-red-500'}`}>
            {message}
          </div>
        )}

        {/* Admin Credential Help Box */}
        <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Default Admin Credentials:</p>
          <p className="text-[10px] text-zinc-500 font-mono">Phone: <span className="text-charcoal dark:text-white font-bold">+919876543210</span></p>
          <p className="text-[10px] text-zinc-500 font-mono">OTP: <span className="text-charcoal dark:text-white font-bold">123456</span></p>
        </div>

      </div>
    </div>
  );
}
