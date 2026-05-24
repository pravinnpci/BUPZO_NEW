"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRequestOTP = async () => {
    if (!phone) {
      setError('Please enter a valid phone number');
      return;
    }
    try {
      console.log('Requesting OTP for phone:', phone);
      setStep('otp');
    } catch (err) {
      setError('Failed to request OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    try {
      console.log('Verifying OTP:', otp);
      router.push('/');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 space-y-8 bg-white dark:bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dusty-mauve">Welcome Back</h1>
          <p className="text-dim-grey dark:text-dust-grey">Login to your BUPZO account</p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-dim-grey dark:text-dust-grey">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder="+91 12345 67890"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dusty-mauve"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleRequestOTP}
              className="w-full bg-dusty-mauve hover:bg-opacity-90 text-white py-2 px-4 rounded-lg font-medium transition-opacity"
            >
              Request OTP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-dim-grey dark:text-dust-grey">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dusty-mauve"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleVerifyOTP}
              className="w-full bg-dusty-mauve hover:bg-opacity-90 text-white py-2 px-4 rounded-lg font-medium transition-opacity"
            >
              Verify OTP
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full border border-dusty-mauve text-dusty-mauve py-2 px-4 rounded-lg font-medium hover:bg-dusty-mauve hover:text-white transition-colors"
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}