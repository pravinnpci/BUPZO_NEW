'use client';

import { useState } from 'react';
import { auth, signInWithPhoneNumber, RecaptchaVerifier } from '@/lib/firebase';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const handleSendOtp = async () => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setMessage('OTP sent successfully!');
      setStep('otp');
    } catch (error) {
      setMessage('Failed to send OTP. Please try again.');
      console.error('Error sending OTP:', error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow confirmationResult.confirm.
        }
      });

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      const credential = await confirmationResult.confirm(otp);
      setMessage('User signed in successfully!');
      onClose();
    } catch (error) {
      setMessage('Invalid OTP. Please try again.');
      console.error('Error verifying OTP:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-charcoal rounded-lg p-6 w-96">
        <h2 className="text-2xl font-heading text-charcoal dark:text-almond-silk mb-4">
          {step === 'phone' ? 'Enter Phone Number' : 'Enter OTP'}
        </h2>

        {step === 'phone' ? (
          <div>
            <div id="recaptcha-container"></div>
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full p-2 mb-4 border rounded-lg"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button
              onClick={handleSendOtp}
              className="w-full bg-charcoal text-white py-2 rounded-lg hover:bg-dusty-mauve transition"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              placeholder="OTP"
              className="w-full p-2 mb-4 border rounded-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-charcoal text-white py-2 rounded-lg hover:bg-dusty-mauve transition"
            >
              Verify OTP
            </button>
          </div>
        )}

        {message && (
          <p className={`mt-4 text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-dim-grey dark:text-dust-grey hover:text-charcoal"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}