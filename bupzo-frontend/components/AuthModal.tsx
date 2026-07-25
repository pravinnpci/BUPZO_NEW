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
      if (!name.trim()) return setMessage('⚠️ Full Name is required');
      
      const cleanPhone = phone.trim();
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return setMessage('⚠️ Phone number must be exactly 10 numeric digits (e.g. 9876543210)');
      }

      if (username.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username.trim())) {
          return setMessage('⚠️ Please enter a valid email address (e.g. name@domain.com)');
        }
      }

      if (!password || password.length < 6) return setMessage('⚠️ Password must be at least 6 characters');

      setIsLoading(true);
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
        apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
        const checkRes = await fetch(`${apiUrl}/api/auth/check-exists?email=${encodeURIComponent(username.trim())}&phone=${encodeURIComponent(cleanPhone)}`);
        const checkData = await checkRes.json();
        if (checkData.exists_email || checkData.exists_phone || checkData.exists) {
          setMessage('⚠️ This Email / Phone number is already registered in Bupzo! Please login.');
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn("DB check error:", e);
      } finally {
        setIsLoading(false);
      }

      setMode('verify-otp');
      return;
    }

    // mode === 'verify-otp'
    const fullOtp = otp.join('');
    if (fullOtp.length < 5) return setMessage('⚠️ Please enter the 5-digit OTP');
    
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
      {/* Materialize Split-Screen Cover Layout Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose} 
          className="fixed top-6 right-6 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 text-gray-700 dark:text-gray-200 font-bold z-50 transition-colors"
        >
          ✕
        </button>

        {/* Main Split Container */}
        <div className="w-full max-w-5xl bg-white dark:bg-[#141824] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[620px] border border-gray-100 dark:border-gray-800 my-auto">
          
          {/* LEFT COLUMN: Materialize Cover Video & Stat Overlay (50% Width) */}
          <div className="w-full md:w-1/2 bg-[#f4f5fa] dark:bg-[#0f111a] p-8 flex flex-col justify-between relative overflow-hidden hidden md:flex border-r border-gray-100 dark:border-gray-800">
            {/* Background Bupzo Branding Video / Promo Visual */}
            <div className="absolute inset-0 z-0 opacity-85">
              <video 
                src="/bupzo-gif.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            </div>

            {/* Top Brand Logo */}
            <div className="relative z-10 flex items-center gap-3">
              <img src="/Bupzo-logo.png" alt="Bupzo" className="h-10 object-contain drop-shadow" />
            </div>

            {/* Materialize Floating Stat Badges */}
            <div className="relative z-10 space-y-4 my-auto">
              <div className="flex gap-4">
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 flex-1 transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">🛍️</div>
                    <div>
                      <p className="text-xl font-black text-gray-900 dark:text-white">155k</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 flex-1 transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold text-lg">👥</div>
                    <div>
                      <p className="text-xl font-black text-gray-900 dark:text-white">2,856</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Customers</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 max-w-xs ml-auto transform translate-x-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">📈</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">$38.5k</p>
                      <p className="text-[9px] text-gray-400">Escrow Volume</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded">+62%</span>
                </div>
              </div>
            </div>

            {/* Bottom Hero Tagline */}
            <div className="relative z-10 text-white space-y-1">
              <h3 className="text-lg font-bold">Next-Gen AI Multi-Vendor Marketplace</h3>
              <p className="text-xs text-gray-200">Powered by PostgreSQL pgvector & Razorpay Escrow</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Materialize Auth Cover Form (50% Width) */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-[#141824]">
            
            {/* Header Brand */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/Bupzo-logo.png" alt="Bupzo Logo" className="h-8 object-contain md:hidden" />
              </div>
            </div>

            {mode === 'verify-otp' ? (
              <div className="animate-fade-in space-y-6">
                <button onClick={() => setMode('register')} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                  <span>←</span> Back to Register
                </button>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Two-Step Verification 💬</h2>
                  <p className="text-xs text-gray-500 mt-1">We sent a 5-digit verification code to <span className="font-bold text-gray-900 dark:text-gray-200">{phone}</span></p>
                </div>
                
                {renderOtpInputs()}
                
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full bg-[#635BFF] hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code & Sign In'}
                </button>
              </div>
            ) : (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {mode === 'login' ? 'Welcome to Bupzo! 👋' : mode === 'register' ? 'Adventure Starts Here 🚀' : 'Forgot Password? 🔒'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {mode === 'login' 
                      ? 'Please sign-in to your account and start your shopping adventure' 
                      : mode === 'register' 
                      ? 'Make your marketplace account and start buying and selling' 
                      : 'Enter your email ID or phone number to reset password'}
                  </p>
                </div>

                {message && (
                  <div className={`p-3 rounded-xl text-xs font-bold border ${message.includes('success') || message.includes('Successful') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {message}
                  </div>
                )}

                <div className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-indigo-600 bg-gray-50 dark:bg-gray-900 text-sm font-medium transition-colors" 
                        placeholder="john.doe" 
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email ID or Phone No</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-indigo-600 bg-gray-50 dark:bg-gray-900 text-sm font-medium transition-colors" 
                      placeholder="admin@bupzo.com or +91 98765 43210" 
                    />
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold text-xs">+91</span>
                        <input 
                          type="text" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          className="w-full px-4 py-3 rounded-r-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-indigo-600 bg-gray-50 dark:bg-gray-900 text-sm font-medium transition-colors" 
                          placeholder="9876543210" 
                        />
                      </div>
                    </div>
                  )}

                  {(mode === 'login' || mode === 'register') && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Password</label>
                        {mode === 'login' && (
                          <button onClick={() => setMode('forgot')} className="text-xs font-bold text-indigo-600 hover:underline">
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-indigo-600 bg-gray-50 dark:bg-gray-900 text-sm font-medium transition-colors" 
                          placeholder="••••••••" 
                        />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          👁️
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'login' && (
                  <div className="flex items-center">
                    <input type="checkbox" id="remember" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                    <label htmlFor="remember" className="ml-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Remember Me</label>
                  </div>
                )}

                <button
                  onClick={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgotPassword}
                  disabled={isLoading}
                  className="w-full bg-[#635BFF] hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </button>

                {(mode === 'login' || mode === 'register') && (
                  <>
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                      <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">or</span>
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                    </div>

                    <div className="flex justify-center">
                      <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                    </div>
                  </>
                )}

                <div className="text-center text-xs font-semibold text-gray-500 pt-2">
                  {mode === 'login' ? (
                    <>New on our platform? <button onClick={() => setMode('register')} className="text-indigo-600 font-bold hover:underline ml-1">Create an account</button></>
                  ) : (
                    <>Already have an account? <button onClick={() => setMode('login')} className="text-indigo-600 font-bold hover:underline ml-1">Sign in instead</button></>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
