/**
 * BUPZO - Auth Modal (Phone OTP Login)
 * Sleek UI for Phone OTP Authentication
 */
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { Phone, Lock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, role } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, nextIndex: number) => {
    if (e.key === 'Backspace' && !otp[index]) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      if (index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
      if (nextIndex < 4) {
        document.getElementById(`otp-${nextIndex}`)?.focus();
      }
    }
  };

  const { requestOTP, verifyOTP } = useAuthStore();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    setSuccess(false);

    try {
      const result = await requestOTP(phoneNumber);
      if (result.success) {
        setSuccess(true);
        setMessage('OTP sent successfully!');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    setSuccess(false);

    try {
      const enteredOtp = otp.join('');
      const result = await verifyOTP(phoneNumber, enteredOtp);
      if (result.success) {
        setSuccess(true);
        setMessage('Login successful!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Invalid OTP or phone number. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-charcoal rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dim-grey dark:hover:bg-dust-grey transition-colors"
          >
            <XCircle className="h-5 w-5 text-dim-grey dark:text-dust-grey" />
          </button>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-dusty-mauve mb-2">Welcome to BUPZO</h2>
          <p className="text-dim-grey dark:text-dust-grey">Enter your phone number to login</p>
        </div>

          {/* Phone Number Input */}
          <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-dim-grey dark:text-dust-grey">
              Phone Number
            </label>
            <div className="flex items-center border border-dim-grey dark:border-dust-grey rounded-lg overflow-hidden">
              <span className="bg-dim-grey dark:bg-dust-grey px-3 py-2 text-dim-grey dark:text-dust-grey">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your 10-digit phone number"
                className="flex-1 px-3 py-2 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-medium text-dim-grey dark:text-dust-grey">
              OTP
            </label>
            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e, index + 1)}
                  className="w-12 h-12 text-center border border-dim-grey dark:border-dust-grey rounded-lg focus:ring-2 focus:ring-dusty-mauve focus:border-transparent outline-none"
                />
              ))}
            </div>
            <p className="text-xs text-dim-grey dark:text-dust-grey mt-1">
              We'll send an OTP to your phone number
            </p>
          </div>

          {/* Request OTP Button */}
          <button
            type="submit"
            onClick={handleRequestOTP}
            disabled={isVerifying || !phoneNumber}
            className={cn(
              'w-full bg-dusty-mauve text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-opacity',
              'flex items-center justify-center',
              isVerifying || !phoneNumber ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            {isVerifying ? (
              <>
                <Lock className="mr-2 h-5 w-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Send OTP
              </>
            )}
          </button>

          {/* Verify OTP Button */}
          <button
            type="button"
            onClick={handleVerifyOTP}
            disabled={isVerifying || otp.some((digit) => digit === '')}
            className={cn(
              'w-full bg-dusty-mauve text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-opacity mt-4',
              'flex items-center justify-center',
              isVerifying || otp.some((digit) => digit === '') ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            {isVerifying ? (
              <>
                <Lock className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Verify OTP
              </>
            )}
          </button>

          {/* Error/Success Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-200">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Login Successful!
              </div>
            </div>
          )}
        </form>

        {/* Back to Home Button */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex items-center justify-center text-dusty-mauve hover:text-charcoal transition-colors',
              'dark:hover:text-almond-silk'
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}