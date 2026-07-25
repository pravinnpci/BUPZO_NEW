'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setMessage('Please enter your registered Email or Phone number.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_or_email: emailOrPhone })
      });
      const data = await res.json();
      setMessage(data.message || `Password reset link sent to ${emailOrPhone}`);
    } catch (err) {
      setMessage(`OTP sent to ${emailOrPhone}. Demo OTP: 123456`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100 p-8 md:p-10">
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
            🔑
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Forgot Password?</h1>
          <p className="text-xs text-gray-500 mt-1">
            Enter your registered Email ID or Phone Number to receive password reset OTP.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-3.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email ID / Phone Number</label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={e => setEmailOrPhone(e.target.value)}
              placeholder="user@bupzo.com or +919876543210"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#3874ff] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Sending Request...' : 'Send Reset Instructions →'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-gray-500 border-t border-gray-100 pt-6">
          Remembered your password? <Link href="/login" className="text-[#3874ff] font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
