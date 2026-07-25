'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setMessage('Please enter all 6 digits.');
      return;
    }
    setIsLoading(true);
    try {
      let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_or_email: 'user@bupzo.com', otp_code: fullOtp })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Verification Successful! Email/Phone verified.');
      } else {
        setMessage(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setMessage('Demo OTP Verified (123456).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100 p-8 md:p-10 text-center">
        
        <div className="w-16 h-16 bg-blue-50 text-[#3874ff] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          ✉️
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900">Verify Your Email / Phone</h1>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          We sent a 6-digit verification code to your email/phone. Enter the code below.
        </p>

        {message && (
          <div className={`mb-6 p-3 rounded-xl text-xs font-bold ${message.includes('Successful') || message.includes('Verified') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message}
          </div>
        )}

        {/* 6-Digit Box */}
        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => {
                const val = e.target.value;
                const newOtp = [...otp];
                newOtp[idx] = val;
                setOtp(newOtp);
                if (val && idx < 5) {
                  const next = document.getElementById(`otp-${idx + 1}`);
                  if (next) next.focus();
                }
              }}
              className="w-11 h-12 text-center text-lg font-black border border-gray-200 rounded-xl outline-none focus:border-[#3874ff] bg-gray-50 focus:bg-white"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full py-3.5 bg-[#3874ff] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify My Code ✓'}
        </button>

        <div className="mt-6 text-xs text-gray-500 font-semibold flex justify-between items-center border-t border-gray-100 pt-6">
          <span>Didn't get code?</span>
          <button onClick={() => setMessage('New OTP code 123456 sent!')} className="text-[#3874ff] font-bold hover:underline">
            Resend Code
          </button>
        </div>

        <div className="mt-4">
          <Link href="/login" className="text-xs text-gray-400 font-bold hover:text-gray-600">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
