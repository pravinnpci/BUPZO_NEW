'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/authStore';
import { auth } from '@/lib/firebase';
import { signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { loginUser } from '@/lib/api';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify-otp'>('login');
  const [loginMethod, setLoginMethod] = useState<'google' | 'phone'>('phone');
  
  // Form states
  const [username, setUsername] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // For registration
  const [otp, setOtp] = useState(['', '', '', '', '']); // Array for 5-digit OTP
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setTokens } = useUser();
  const [referralId, setReferralId] = useState<string | null>(null);

  useEffect(() => {
    setMessage('');
  }, [mode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralId(ref);
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage('Username and password are required');
      return;
    }
    setIsLoading(true);
    try {
      const data = await loginUser({ username, password });
      setTokens(data.access_token, data.access_token);
      setUser(data.user);
      setMessage('Login successful!');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setMessage(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (mode === 'register') {
      if (!name.trim()) return setMessage('Full Name is required');
      if (!phone.trim() || phone.length < 10) return setMessage('Valid 10-digit phone number is required');
      if (!password || password.length < 6) return setMessage('Password must be at least 6 characters');
      setMode('verify-otp');
      return;
    }

    // mode === 'verify-otp'
    const fullOtp = otp.join('');
    if (fullOtp.length < 5) return setMessage('Please enter the 5-digit OTP');
    
    setIsLoading(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, name, email: username })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');
      
      setTokens(data.access_token, data.access_token);
      setUser(data.user);
      setMessage('Registration successful!');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setMessage(err.message || 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!username) {
      setMessage('Please enter your email to reset password.');
      return;
    }
    setIsLoading(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username })
      });
      const data = await response.json();
      if (!response.ok) {
         const errorMsg = typeof data.detail === 'string' ? data.detail : 'Error sending reset link.';
         throw new Error(errorMsg);
      }
      setMessage(data.message || 'Reset link sent if email exists.');
      setTimeout(() => setMode('login'), 2000);
    } catch (err: any) {
      setMessage('Error sending reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const token = credentialResponse.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const { email, name } = payload;
      
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, google_token: token })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Google Auth Failed');
      
      setTokens(data.access_token, data.access_token);
      setUser(data.user);
      setMessage('Google Login Successful!');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setMessage(err.message || 'Google login error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage('Google login failed');
  };

  const renderOtpInputs = () => (
    <div className="flex gap-2 justify-between mb-2">
      {otp.map((digit, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => {
            const newOtp = [...otp];
            newOtp[i] = e.target.value;
            setOtp(newOtp);
            if (e.target.value && i < 4) {
              const nextInput = document.getElementById(`otp-${i + 1}`);
              if (nextInput) nextInput.focus();
            }
          }}
          id={`otp-${i}`}
          className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg outline-none focus:border-indigo-600 transition-colors"
        />
      ))}
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com'}>
      {/* Shiprocket-style Full Screen Layout */}
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F3F4F9] overflow-y-auto" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}>
        
        {/* Top Logo */}
        <div className="absolute top-10 flex items-center justify-center gap-3 select-none">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
             <span className="text-white font-black text-2xl">B</span>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Bupzo</span>
        </div>

        {/* Floating Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 text-gray-600 font-bold z-10 transition-colors">
          ✕
        </button>

        {/* Main Card */}
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10 mt-16 relative z-10 border border-gray-100">
          
          {mode === 'verify-otp' ? (
            <div className="animate-fade-in">
              <button onClick={() => setMode('register')} className="text-sm font-semibold text-indigo-600 flex items-center gap-1 mb-6 hover:underline">
                <span>&lt;</span> Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">OTP Verification</h2>
              <p className="text-sm text-gray-600 mb-6 font-medium">Enter OTP sent to <span className="text-gray-900 font-bold">{phone}</span></p>
              
              {renderOtpInputs()}
              
              <div className="flex justify-end mb-8">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  00:24
                </span>
              </div>

              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full bg-gray-400 text-white py-4 rounded-xl font-bold text-lg shadow hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify My Phone'}
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                {mode === 'login' ? 'Login To Bupzo Using' : mode === 'register' ? 'Sign Up For Bupzo' : 'Reset Your Password'}
              </h2>

              {/* Login Method Tabs */}
              {mode === 'login' && (
                <div className="flex gap-3 mb-6">
                  <button onClick={() => setLoginMethod('google')} className={`flex-1 py-2.5 rounded-lg border font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${loginMethod === 'google' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <span className="w-4 h-4 bg-[url('https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg')] bg-cover"></span> Google
                  </button>
                  <button onClick={() => setLoginMethod('phone')} className={`flex-1 py-2.5 rounded-lg border font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${loginMethod === 'phone' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    📱 Phone No
                  </button>
                </div>
              )}

              {mode === 'login' && (
                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-dashed border-gray-300"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold">or</span>
                  <div className="flex-grow border-t border-dashed border-gray-300"></div>
                </div>
              )}

              {message && (
                <div className={`mb-6 p-3 rounded-lg text-sm font-semibold border ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-indigo-600 transition-colors bg-gray-50 focus:bg-white" placeholder="Enter Full Name" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{mode === 'register' ? 'Email ID (Optional)' : 'Email ID / Phone'}</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-indigo-600 transition-colors bg-gray-50 focus:bg-white" placeholder="Enter your Email ID" />
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-500 font-bold text-sm">+91</span>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-r-lg border border-gray-300 outline-none focus:border-indigo-600 transition-colors bg-gray-50 focus:bg-white" placeholder="Enter Phone Number" />
                    </div>
                  </div>
                )}

                {(mode === 'login' || mode === 'register') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-indigo-600 transition-colors bg-gray-50 focus:bg-white" placeholder="Enter Password" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {mode === 'login' && (
                <div className="mt-4 mb-6">
                  <button onClick={() => setMode('forgot')} className="text-sm font-semibold text-indigo-600 hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                onClick={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgotPassword}
                disabled={isLoading}
                className="w-full mt-6 bg-[#635BFF] text-white py-4 rounded-xl hover:bg-indigo-700 font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : mode === 'login' ? 'Login' : mode === 'register' ? 'Sign Up' : 'Send Reset Link'}
              </button>
              
              {(mode === 'login' || mode === 'register') && (
                <div className="mt-6 pt-4 border-t border-gray-100 w-full flex flex-col items-center justify-center gap-3">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider bg-white px-2 -mt-7 relative z-10">OR</span>
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                </div>
              )}

              <div className="mt-8 text-center text-sm font-semibold text-gray-500">
                {mode === 'login' ? (
                  <>New to Bupzo? <button onClick={() => setMode('register')} className="text-indigo-600 hover:underline ml-1">Signup Now</button></>
                ) : mode === 'register' ? (
                  <>Already have an account? <button onClick={() => setMode('login')} className="text-indigo-600 hover:underline ml-1">Login</button></>
                ) : (
                  <>Remembered your password? <button onClick={() => setMode('login')} className="text-indigo-600 hover:underline ml-1">Login</button></>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
