'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TwoFactorPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify2FA = () => {
    const full = code.join('');
    if (full.length < 6) return setMessage('Please enter 6-digit security code');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMessage('2FA Security Check Passed! Logging into Bupzo.');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100 p-8 md:p-10 text-center">
        
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          🛡️
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900">Two-Step Verification</h1>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Materialize 2FA Cover Check: Enter the 6-digit code from your authenticator app or SMS.
        </p>

        {message && (
          <div className="mb-6 p-3.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {message}
          </div>
        )}

        <div className="flex gap-2 justify-center mb-6">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`2fa-${idx}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => {
                const val = e.target.value;
                const newCode = [...code];
                newCode[idx] = val;
                setCode(newCode);
                if (val && idx < 5) {
                  const next = document.getElementById(`2fa-${idx + 1}`);
                  if (next) next.focus();
                }
              }}
              className="w-11 h-12 text-center text-lg font-black border border-gray-200 rounded-xl outline-none focus:border-[#3874ff] bg-gray-50 focus:bg-white"
            />
          ))}
        </div>

        <button
          onClick={handleVerify2FA}
          disabled={isLoading}
          className="w-full py-3.5 bg-[#3874ff] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Verifying 2FA...' : 'Authenticate & Continue →'}
        </button>

        <div className="mt-6 text-xs text-gray-400 font-bold">
          <Link href="/login" className="hover:text-gray-600">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
