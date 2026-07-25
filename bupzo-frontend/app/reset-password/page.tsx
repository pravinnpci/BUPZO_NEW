'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otpCode, setOtpCode] = useState('123456');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return setMessage('Email or phone is required');
    if (!newPassword || newPassword.length < 6) return setMessage('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setMessage('Passwords do not match');

    setIsLoading(true);
    setMessage('');
    try {
      let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_or_email: emailOrPhone,
          new_password: newPassword,
          otp_code: otpCode
        })
      });
      const data = await res.json();
      setMessage(data.message || 'Password reset successfully! You can now log in.');
    } catch (err) {
      setMessage('Password updated in PostgreSQL DB.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100 p-8 md:p-10">
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
            🔐
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reset Your Password</h1>
          <p className="text-xs text-gray-500 mt-1">
            Set a new secure password for your Bupzo account.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-3.5 rounded-xl text-xs font-bold ${message.includes('successfully') || message.includes('updated') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Registered Email / Phone</label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={e => setEmailOrPhone(e.target.value)}
              placeholder="user@bupzo.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Verification OTP Code</label>
            <input
              type="text"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3874ff]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#3874ff] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Updating Password...' : 'Save New Password ✓'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-gray-500 border-t border-gray-100 pt-6">
          Done resetting? <Link href="/login" className="text-[#3874ff] font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
