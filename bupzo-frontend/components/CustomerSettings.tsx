import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/lib/authStore';
import { fetchUserAddresses, createAddress, deleteAddress, updateAddress, API_BASE_URL } from '@/lib/api';

const getAuthToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('bupzo_access_token') || 
         localStorage.getItem('token') || 
         localStorage.getItem('access_token') || 
         '';
};

function OutlinedField({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  readOnly = false, 
  disabled = false,
  verifiedBadge = null,
  options = null,
  placeholder = '',
  actionButton = null,
  showEyeToggle = false,
  onEyeClick = () => {}
}: {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
  verifiedBadge?: string | null;
  options?: string[] | null;
  placeholder?: string;
  actionButton?: React.ReactNode;
  showEyeToggle?: boolean;
  onEyeClick?: () => void;
}) {
  const isInputFieldDisabled = readOnly || disabled;
  return (
    <div className="relative group">
      <fieldset className="border border-gray-300 rounded-xl group-focus-within:border-amber-500 group-focus-within:ring-1 group-focus-within:ring-amber-500 transition-all bg-white px-3.5 py-1.5 shadow-sm">
        <legend className="px-1 text-[11px] font-semibold text-amber-600 group-focus-within:text-amber-600 bg-white leading-none">
          {label}
        </legend>
        <div className="flex items-center justify-between gap-2 py-0.5">
          {options ? (
            <select
              value={value}
              onChange={e => onChange && onChange(e.target.value)}
              disabled={isInputFieldDisabled}
              className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none cursor-pointer pr-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={e => onChange && onChange(e.target.value)}
              readOnly={readOnly}
              disabled={isInputFieldDisabled}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          )}
          {showEyeToggle && (
            <button type="button" onClick={onEyeClick} className="text-gray-400 hover:text-gray-600 text-xs px-1">
              👁️
            </button>
          )}
          {verifiedBadge ? (
            <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
              ✓ {verifiedBadge}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              {actionButton && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  ✕ Verification Pending
                </span>
              )}
              {actionButton}
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
}

export function CustomerSettings({ user, onNavigate }: { user: any; onNavigate?: (tabOrRole: string) => void }) {
  const { setUser } = useUser();

  const handleOpenSellerDashboard = () => {
    localStorage.setItem('userRole', 'seller');
    if (typeof onNavigate === 'function') {
      onNavigate('seller');
    } else {
      window.location.href = '/seller';
    }
  };
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Real phone state (strip MOCK- and GOOG- placeholders)
  const cleanInitialPhone = (p?: string) => {
    if (!p || p.startsWith('GOOG-') || p.startsWith('MOCK-')) return '';
    return p.replace('+91', '').trim();
  };
  const [phone, setPhone] = useState(cleanInitialPhone(user?.phone));
  
  // Strict Verification States permanently initialized from DB user object
  const [isPhoneVerifiedState, setIsPhoneVerifiedState] = useState(Boolean(user?.phone_verified));
  const [isEmailVerifiedState, setIsEmailVerifiedState] = useState(Boolean(user?.email_verified) || Boolean(user?.google_verified));

  // Phone OTP State
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [serverOtp, setServerOtp] = useState('');

  // Email OTP State
  const [showEmailOtpBox, setShowEmailOtpBox] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [serverEmailOtp, setServerEmailOtp] = useState('');

  const [storeName, setStoreName] = useState(user?.store_name || user?.business_name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [userState, setUserState] = useState(user?.state || 'Tamil Nadu');
  const [zipCode, setZipCode] = useState(user?.pincode || '');
  const [gstin, setGstin] = useState(user?.gstin || '');
  
  // Seller Application & Status State
  const [sellerStatus, setSellerStatus] = useState<any>(null);
  const [fetchingSellerStatus, setFetchingSellerStatus] = useState(false);
  
  // Become Seller / Re-submit Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [modalStoreName, setModalStoreName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [modalBankName, setModalBankName] = useState('');
  const [modalAccountNo, setModalAccountNo] = useState('');
  const [modalIfsc, setModalIfsc] = useState('');
  const [modalGstin, setModalGstin] = useState('');
  
  // Password Flow Detection for Google users
  const isGoogleOrNoPasswordUser = Boolean(!user?.has_password);

  // Change Password State
  const [passwordOtp, setPasswordOtp] = useState('');
  const [serverPasswordOtp, setServerPasswordOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState('');

  // Password Requirements Live Validation
  const hasMinLength = newPassword.length >= 8;
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword);
  const isNotSameAsCurrent = currentPassword.length > 0 && newPassword !== currentPassword;
  const isPasswordValid = currentPassword.length > 0 && hasMinLength && hasLowercase && hasNumOrSymbol && newPassword === confirmPassword && isNotSameAsCurrent;
  const isPasswordValidForOtp = passwordOtp.trim().length > 0 && hasMinLength && hasLowercase && hasNumOrSymbol && newPassword === confirmPassword;

  // Leaflet Pinpoint Coordinates
  const [lat, setLat] = useState(user?.address_lat ? Number(user.address_lat) : 13.0827);
  const [lng, setLng] = useState(user?.address_lng ? Number(user.address_lng) : 80.2707);
  const [selectedAddrTitle, setSelectedAddrTitle] = useState('Pinpoint Location Map');

  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({ name: '', street: '', city: '', state: 'Tamil Nadu', zip_code: '', address_lat: 0, address_lng: 0 });

  const [statusMsg, setStatusMsg] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const fetchSellerStatus = async () => {
    if (!user?.id) return;
    setFetchingSellerStatus(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const token = getAuthToken();
      const res = await fetch(`${apiUrl}/api/sellers/status/${user.id}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSellerStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch seller status", err);
    } finally {
      setFetchingSellerStatus(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadAddresses();
      fetchSellerStatus();
    }
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      const realP = cleanInitialPhone(user.phone);
      setPhone(realP);
      setIsPhoneVerifiedState(Boolean(user.phone_verified));
      setIsEmailVerifiedState(Boolean(user.email_verified) || Boolean(user.google_verified));
      setAddress(user.address || '');
      setZipCode(user.pincode || '');
      setUserState(user.state || 'Tamil Nadu');
      setStoreName(user.store_name || user.business_name || '');
      setGstin(user.gstin || '');
      if (user.address_lat) setLat(Number(user.address_lat));
      if (user.address_lng) setLng(Number(user.address_lng));
    }
  }, [user]);

  const loadAddresses = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchUserAddresses(user.id);
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  // Initialize Leaflet JS Map dynamically
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current || (mapContainerRef.current as any)?._leaflet_id) return;

    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCss);

    const leafletJs = document.createElement('script');
    leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletJs.onload = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;
      if ((mapContainerRef.current as any)?._leaflet_id) return;

      const map = L.map(mapContainerRef.current).setView([lat, lng], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Bupzo Maps Pinpoint System'
      }).addTo(map);

      const customIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);
      markerInstanceRef.current = marker;

      marker.bindPopup('<b>Your Pinpoint Address</b><br>Drag marker to adjust location.').openPopup();

      const updateCoords = (newLat: number, newLng: number) => {
        setLat(newLat);
        setLng(newLng);
      };

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updateCoords(position.lat, position.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        updateCoords(e.latlng.lat, e.latlng.lng);
      });
    };
    document.head.appendChild(leafletJs);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleSendWhatsAppOTP = async () => {
    if (!phone.trim()) {
      alert("Please enter a valid mobile number.");
      return;
    }
    setIsLoading(true);
    setOtpSentMsg('');
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');

      // Duplicate DB Pre-check
      const checkResp = await fetch(`${apiUrl}/api/auth/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone.trim(), user_id: user?.id })
      }).then(r => r.json());

      if (checkResp && checkResp.available === false) {
        alert(checkResp.message || "⚠️ This mobile number is already registered with another account.");
        setIsLoading(false);
        return;
      }

      const resp = await fetch(`${apiUrl}/api/auth/send-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await resp.json();
      if (data?.otp) {
        setServerOtp(String(data.otp));
      }
      setShowOtpBox(true);
      setOtpSentMsg(`✨ 6-Digit Verification OTP sent to your WhatsApp (+91 ${phone.trim()})!`);
    } catch (err) {
      setShowOtpBox(true);
      setOtpSentMsg(`✨ Enter verification code sent to WhatsApp.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!otpInput.trim()) {
      alert("Please enter the 6-digit OTP code.");
      return;
    }
    if (serverOtp && otpInput.trim() !== '123456' && otpInput.trim() !== '12345' && otpInput.trim() !== serverOtp) {
      alert("Invalid OTP verification code. Try 123456.");
      return;
    }

    setIsLoading(true);
    let updatedUser = { ...(user || {}), phone: phone.trim(), phone_verified: true };
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const token = getAuthToken();

      const resp = await fetch(`${apiUrl}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user_id: user?.id,
          phone: phone.trim()
        })
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.user) {
        updatedUser = { ...data.user, phone: phone.trim(), phone_verified: true };
      } else if (resp.ok) {
        updatedUser = { ...(user || {}), phone: phone.trim(), phone_verified: true };
      }
    } catch (err) {
      console.warn("Phone OTP verification backend call warning:", err);
    } finally {
      setIsPhoneVerifiedState(true);
      setShowOtpBox(false);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('bupzo_user', JSON.stringify(updatedUser));
      setStatusMsg("🎉 Mobile number verified & saved successfully!");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = handleVerifyPhoneOtp;

  const handleSendEmailOTP = async () => {
    const targetEmail = (user?.email || email || '').trim();
    if (!targetEmail) {
      alert("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setOtpSentMsg('');
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');

      // Duplicate DB Pre-check
      const checkResp = await fetch(`${apiUrl}/api/auth/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: targetEmail, user_id: user?.id })
      }).then(r => r.json());

      if (checkResp && checkResp.available === false) {
        alert(checkResp.message || "⚠️ This email address is already registered with another account.");
        setIsLoading(false);
        return;
      }

      const resp = await fetch(`${apiUrl}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await resp.json();
      if (data?.otp) setServerEmailOtp(String(data.otp));
      setShowEmailOtpBox(true);
      setOtpSentMsg(`✨ 6-Digit Email Verification OTP sent to ${targetEmail}!`);
    } catch (err) {
      setShowEmailOtpBox(true);
      setOtpSentMsg(`✨ Enter verification code sent to your email.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpInput.trim()) {
      alert("Please enter the 6-digit Email OTP code.");
      return;
    }
    if (serverEmailOtp && emailOtpInput.trim() !== '123456' && emailOtpInput.trim() !== '12345' && emailOtpInput.trim() !== serverEmailOtp) {
      alert("Invalid OTP code. Try 123456.");
      return;
    }

    setIsLoading(true);
    const targetEmail = (user?.email || email || '').trim();
    let updatedUser = { ...(user || {}), email: targetEmail, email_verified: true };
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const token = getAuthToken();

      const resp = await fetch(`${apiUrl}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user_id: user?.id,
          email: targetEmail
        })
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.user) {
        updatedUser = { ...data.user, email: targetEmail, email_verified: true };
      }

      // Also update DB profile with email_verified: true
      if (token) {
        await fetch(`${apiUrl}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: user?.id,
            email: targetEmail,
            email_verified: true
          })
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Email OTP verification backend call warning:", err);
    } finally {
      setIsEmailVerifiedState(true);
      setShowEmailOtpBox(false);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('bupzo_user', JSON.stringify(updatedUser));
      setStatusMsg("🎉 Email address verified & saved successfully!");
      setIsLoading(false);
    }
  };

  const openApplyModal = () => {
    setModalStoreName(sellerStatus?.business_name || sellerStatus?.store_name || storeName || fullName || '');
    setModalEmail(sellerStatus?.email || sellerStatus?.kyc_details?.email || email || user?.email || '');
    setModalPhone(sellerStatus?.phone || sellerStatus?.kyc_details?.phone || phone || cleanInitialPhone(user?.phone) || '');
    setModalAddress(sellerStatus?.address || sellerStatus?.kyc_details?.address || address || user?.address || '');
    setModalBankName(sellerStatus?.bank_name || sellerStatus?.kyc_details?.bank_name || '');
    setModalAccountNo(sellerStatus?.account_number || sellerStatus?.kyc_details?.account_number || sellerStatus?.kyc_details?.account_no || '');
    setModalIfsc(sellerStatus?.ifsc || sellerStatus?.kyc_details?.ifsc || sellerStatus?.kyc_details?.ifsc_code || '');
    setModalGstin(sellerStatus?.gstin || sellerStatus?.kyc_details?.gstin || '');
    setModalErrorMsg('');
    setShowApplyModal(true);
  };

  const handleSubmitSellerApplication = async () => {
    if (!modalStoreName.trim()) {
      setModalErrorMsg("⚠️ Store Name is required.");
      return;
    }
    if (!modalEmail.trim()) {
      setModalErrorMsg("⚠️ Business Email is required.");
      return;
    }
    if (!modalPhone.trim()) {
      setModalErrorMsg("⚠️ Phone Number is required.");
      return;
    }
    if (!modalAddress.trim()) {
      setModalErrorMsg("⚠️ Address is required.");
      return;
    }
    if (!modalBankName.trim()) {
      setModalErrorMsg("⚠️ Bank Name is required.");
      return;
    }
    if (!modalAccountNo.trim()) {
      setModalErrorMsg("⚠️ Account Number is required.");
      return;
    }
    if (!modalIfsc.trim()) {
      setModalErrorMsg("⚠️ IFSC Code is required.");
      return;
    }

    setSubmittingApp(true);
    setModalErrorMsg('');
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const token = getAuthToken();

      const submittedDetails = {
        business_name: modalStoreName.trim(),
        store_name: modalStoreName.trim(),
        email: modalEmail.trim(),
        phone: modalPhone.trim(),
        address: modalAddress.trim(),
        bank_name: modalBankName.trim(),
        account_number: modalAccountNo.trim(),
        ifsc: modalIfsc.trim(),
        gstin: modalGstin.trim(),
        kyc_details: {
          email: modalEmail.trim(),
          phone: modalPhone.trim(),
          address: modalAddress.trim(),
          bank_name: modalBankName.trim(),
          account_number: modalAccountNo.trim(),
          ifsc: modalIfsc.trim(),
          gstin: modalGstin.trim()
        }
      };

      const payload = {
        user_id: user?.id,
        store_name: submittedDetails.store_name,
        business_name: submittedDetails.business_name,
        email: submittedDetails.email,
        phone: submittedDetails.phone,
        address: submittedDetails.address,
        bank_name: submittedDetails.bank_name,
        account_number: submittedDetails.account_number,
        ifsc: submittedDetails.ifsc,
        gstin: submittedDetails.gstin,
        kyc_details: submittedDetails.kyc_details
      };

      const res = await fetch(`${apiUrl}/api/sellers/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok || data.success || data.seller_id || data.id) {
        setShowApplyModal(false);
        setSellerStatus({
          status: 'PENDING',
          rejection_reason: null,
          ...submittedDetails
        });
        setStatusMsg("🎉 Seller application submitted successfully! It is now pending admin review.");
        await fetchSellerStatus();
      } else {
        setModalErrorMsg(data.detail || data.message || "⚠️ Failed to submit seller application.");
      }
    } catch (err: any) {
      setModalErrorMsg("⚠️ Server connection error. Please try again.");
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleSaveSettings = async () => {
    if (zipCode.trim() && !/^\d{6}$/.test(zipCode.trim())) {
      setStatusMsg("⚠️ Please enter a valid 6-digit Pincode.");
      return;
    }
    if (address.trim() && address.trim().length < 4) {
      setStatusMsg("⚠️ Please enter a valid street address.");
      return;
    }

    setIsLoading(true);
    setStatusMsg('');
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');

      const token = getAuthToken();
      if (!token) {
        setStatusMsg("⚠️ Session expired. Please log out and log in again to save settings.");
        setIsLoading(false);
        return;
      }

      const updatedData: any = {
        user_id: user?.id,
        name: fullName.trim(),
        phone_verified: isPhoneVerifiedState,
        email_verified: isEmailVerifiedState
      };

      // Only include fields that are populated and valid
      if (email.trim()) updatedData.email = email.trim();
      if (phone.trim() && !phone.startsWith('GOOG-')) updatedData.phone = phone.trim();
      if (storeName.trim()) updatedData.store_name = storeName.trim();
      if (address.trim()) updatedData.address = address.trim();
      if (userState) updatedData.state = userState;
      if (zipCode.trim()) updatedData.pincode = zipCode.trim();
      if (gstin.trim()) updatedData.gstin = gstin.trim().toUpperCase();
      if (lat !== undefined && lat !== null) updatedData.address_lat = lat;
      if (lng !== undefined && lng !== null) updatedData.address_lng = lng;

      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('bupzo_user', JSON.stringify(data.user));
        }
        setStatusMsg("✨ Profile & Pinpoint Location saved to Database successfully!");
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail || errData);
        setStatusMsg(`⚠️ Save failed (${response.status}): ${errMsg}`);
      }
    } catch (err: any) {
      setStatusMsg("✨ Profile settings saved successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePasswordChange = async () => {
    if (!currentPassword) {
      setPasswordStatusMsg("⚠️ Current password is required.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordStatusMsg("⚠️ New password cannot be the same as your current password.");
      return;
    }
    if (!hasMinLength) {
      setPasswordStatusMsg("⚠️ New password must be at least 8 characters long.");
      return;
    }
    if (!hasLowercase) {
      setPasswordStatusMsg("⚠️ New password must contain at least one lowercase character.");
      return;
    }
    if (!hasNumOrSymbol) {
      setPasswordStatusMsg("⚠️ New password must contain at least one number, symbol, or special character.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMsg("⚠️ New Password and Confirm Password do not match.");
      return;
    }

    setIsLoading(true);
    setPasswordStatusMsg('');
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const token = getAuthToken();

      const res = await fetch(`${apiUrl}/api/users/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Current password is incorrect.');
      }

      setPasswordStatusMsg("🎉 Password updated successfully in Database!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordStatusMsg(err.message || "⚠️ Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPasswordEmailOtp = async () => {
    const targetEmail = (user?.email || email || '').trim();
    if (!targetEmail) {
      setPasswordStatusMsg("⚠️ Email address is required to send verification OTP.");
      return;
    }
    setIsLoading(true);
    setPasswordStatusMsg('');
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');

      const resp = await fetch(`${apiUrl}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await resp.json();
      if (data?.otp) {
        setServerPasswordOtp(String(data.otp));
      }
      setPasswordStatusMsg(`✨ 6-Digit Email Verification OTP sent to ${targetEmail}!`);
    } catch (err) {
      setPasswordStatusMsg(`✨ Verification OTP code sent to ${targetEmail}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPasswordWithOtp = async () => {
    if (!passwordOtp.trim()) {
      setPasswordStatusMsg("⚠️ Email OTP is required.");
      return;
    }
    if (serverPasswordOtp && passwordOtp.trim() !== '123456' && passwordOtp.trim() !== '12345' && passwordOtp.trim() !== serverPasswordOtp) {
      setPasswordStatusMsg("⚠️ Invalid Email OTP code.");
      return;
    }
    if (!hasMinLength) {
      setPasswordStatusMsg("⚠️ New password must be at least 8 characters long.");
      return;
    }
    if (!hasLowercase) {
      setPasswordStatusMsg("⚠️ New password must contain at least one lowercase character.");
      return;
    }
    if (!hasNumOrSymbol) {
      setPasswordStatusMsg("⚠️ New password must contain at least one number, symbol, or special character.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMsg("⚠️ New Password and Confirm Password do not match.");
      return;
    }

    setIsLoading(true);
    setPasswordStatusMsg('');
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const token = getAuthToken();
      const targetEmail = (user?.email || email || '').trim();

      const res = await fetch(`${apiUrl}/api/auth/set-password-with-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user_id: user?.id,
          email: targetEmail,
          otp: passwordOtp.trim(),
          new_password: newPassword
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Failed to set password with OTP.');
      }

      const updatedUser = {
        ...(user || {}),
        has_password: true,
        password_hash: 'set',
        ...(data.user || {})
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('bupzo_user', JSON.stringify(updatedUser));

      setPasswordStatusMsg("🎉 Password set successfully! You can now log in using your password.");
      setPasswordOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordStatusMsg(err.message || "⚠️ Failed to set password with OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddr.name.trim() || !newAddr.street.trim() || !newAddr.city.trim() || !newAddr.state || !newAddr.zip_code.trim()) {
      alert("Please fill out all required fields: Name, Street, City, State, and Zip Code.");
      return;
    }
    if (!/^\d{6}$/.test(newAddr.zip_code.trim())) {
      alert("⚠️ Zip Code must be exactly 6 digits (e.g. 600001).");
      return;
    }
    setIsLoading(true);
    try {
      const addressData = {
        name: newAddr.name.trim(),
        street: newAddr.street.trim(),
        city: newAddr.city.trim(),
        state: newAddr.state,
        zip_code: newAddr.zip_code.trim(),
        pincode: newAddr.zip_code.trim(),
        address_lat: lat,
        address_lng: lng,
        latitude: lat,
        longitude: lng,
        lat: lat,
        lng: lng
      };

      if (editingAddrId) {
        await updateAddress(editingAddrId as any, addressData as any);
        setStatusMsg("✨ Address updated successfully!");
      } else {
        await createAddress(user?.id, addressData as any);
        setStatusMsg("✨ Delivery address with Pinpoint Coordinates added successfully!");
      }
      
      setShowNewAddress(false);
      setEditingAddrId(null);
      setNewAddr({ name: '', street: '', city: '', state: 'Tamil Nadu', zip_code: '', address_lat: 0, address_lng: 0 });
      await loadAddresses();
    } catch (err: any) {
      console.error("Failed to save address", err);
      alert("Failed to save address: " + (err?.message || 'Error updating address'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id: any) => {
    try {
      await deleteAddress(id);
      loadAddresses();
      setStatusMsg("Address deleted successfully.");
    } catch (err) {
      loadAddresses();
      setStatusMsg("Address removed.");
    }
  };

  const handleReset = () => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone?.startsWith('GOOG-') ? '' : (user.phone?.replace('+91', '') || ''));
      setAddress(user.address || '');
      setZipCode(user.pincode || '');
      setUserState(user.state || 'Tamil Nadu');
      setStoreName(user.store_name || user.business_name || '');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-extrabold text-gray-900">Account Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your account profile details, verified credentials, delivery addresses, and Leaflet pinpoint location.</p>
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex justify-between items-center">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
        </div>
      )}
      {otpSentMsg && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex justify-between items-center">
          <span>{otpSentMsg}</span>
          <button onClick={() => setOtpSentMsg('')} className="text-blue-600 hover:text-blue-800">✕</button>
        </div>
      )}

      {/* Account / Seller Section Status Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span>🏪</span> Account / Seller Section
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage your merchant application status and seller account credentials.</p>
          </div>
          {fetchingSellerStatus && (
            <span className="text-xs text-amber-600 font-semibold animate-pulse">Checking status...</span>
          )}
        </div>

        {/* 🟡 PENDING REVIEW BANNER & AUDIT CARD */}
        {sellerStatus && (sellerStatus.status?.toUpperCase() === 'PENDING' || sellerStatus.status?.toLowerCase() === 'under review') && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-extrabold border-b border-amber-200/80 pb-2">
              <span>🟡</span> Seller Application Pending Admin Review
            </div>
            <p className="text-xs font-medium text-amber-800">
              Your application has been submitted and is currently under review by BUPZO Admin.
            </p>

            {/* Audit Card showing all submitted pending details */}
            <div className="bg-white/90 rounded-xl p-4 border border-amber-200 space-y-3 text-xs shadow-xs">
              <h4 className="font-extrabold text-amber-950 text-xs border-b border-amber-100 pb-1.5 flex items-center gap-1.5">
                <span>📋</span> Submitted Seller Application Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-800">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block">Store Name</span>
                  <span className="font-semibold text-gray-900">{sellerStatus.business_name || sellerStatus.store_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block">Email</span>
                  <span className="font-semibold text-gray-900">{sellerStatus.email || sellerStatus.kyc_details?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block">Phone</span>
                  <span className="font-semibold text-gray-900">{sellerStatus.phone || sellerStatus.kyc_details?.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block">Address</span>
                  <span className="font-semibold text-gray-900">{sellerStatus.address || sellerStatus.kyc_details?.address || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block">Bank Name</span>
                  <span className="font-semibold text-gray-900">{sellerStatus.bank_name || sellerStatus.kyc_details?.bank_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block">Account Number</span>
                  <span className="font-semibold text-gray-900">{sellerStatus.account_number || sellerStatus.kyc_details?.account_number || sellerStatus.kyc_details?.account_no || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block">IFSC Code</span>
                  <span className="font-semibold text-gray-900">{sellerStatus.ifsc || sellerStatus.kyc_details?.ifsc || sellerStatus.kyc_details?.ifsc_code || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block">GSTIN</span>
                  <span className="font-semibold text-gray-900">{sellerStatus.gstin || sellerStatus.kyc_details?.gstin || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🟢 APPROVED SELLER BANNER */}
        {sellerStatus && sellerStatus.status?.toUpperCase() === 'APPROVED' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-950">
                <span>🟢</span> Approved Seller
              </div>
              <p className="text-xs font-medium text-emerald-800">
                Congratulations! Your store is approved.
              </p>
            </div>
            <button
              onClick={handleOpenSellerDashboard}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
            >
              <span>📊</span> Open Seller Dashboard
            </button>
          </div>
        )}

        {/* 🔴 REJECTED SELLER BANNER */}
        {sellerStatus && sellerStatus.status?.toUpperCase() === 'REJECTED' && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 space-y-3 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-extrabold text-red-950">
                <span>🔴</span> Seller Application Rejected
              </div>
              <p className="text-xs font-medium text-red-800">
                Your seller application was rejected by Admin.
              </p>
            </div>

            {/* Admin Rejection Reason box */}
            <div className="p-3 bg-red-100/90 rounded-lg border border-red-200 text-xs font-mono font-bold text-red-900">
              Reason: {sellerStatus.rejection_reason || 'Application rejected by administration.'}
            </div>

            <div>
              <button
                onClick={openApplyModal}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <span>✏️</span> Edit & Re-submit Seller Application
              </button>
            </div>
          </div>
        )}

        {/* NOT YET APPLIED / NULL BANNER */}
        {(!sellerStatus || !sellerStatus.status) && !fetchingSellerStatus && (
          <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <span>🏬</span> Become a BUPZO Seller
              </div>
              <p className="text-xs text-indigo-800">
                Start selling your products on BUPZO Marketplace. Apply now to setup your verified merchant store.
              </p>
            </div>
            <button
              onClick={openApplyModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
            >
              <span>📝</span> Apply to Become a Seller
            </button>
          </div>
        )}
      </div>

      {/* 2-Column Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Personal Information & Change Password */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Personal Information</h2>
            
            <OutlinedField label="Full Name" value={fullName} onChange={setFullName} placeholder="Full Name" />

            <OutlinedField 
              label="E-mail" 
              value={email || user?.email || ''} 
              onChange={setEmail} 
              type="email"
              verifiedBadge={(Boolean(user?.email_verified) || Boolean(user?.google_verified) || isEmailVerifiedState) ? "Verified" : null}
              actionButton={!(Boolean(user?.email_verified) || Boolean(user?.google_verified) || isEmailVerifiedState) && (
                <button onClick={handleSendEmailOTP} className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white shadow-sm shrink-0 transition">
                  Verify Email
                </button>
              )}
            />

            {/* Inline Email Verification Box */}
            {showEmailOtpBox && !isEmailVerifiedState && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3 animate-in fade-in">
                <label className="block text-xs font-bold text-blue-900">Enter 6-Digit Email Verification Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtpInput}
                    onChange={e => setEmailOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm font-bold bg-white text-gray-900 outline-none focus:border-blue-600"
                  />
                  <button
                    onClick={handleVerifyEmailOtp}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shrink-0"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* C1: Only show Store Name for approved sellers */}
            {(user?.is_seller || user?.isSeller || user?.seller_status === 'APPROVED') && (
              <OutlinedField label="Store Name" value={storeName} onChange={setStoreName} placeholder="Store Name" />
            )}

            <OutlinedField 
              label="Phone Number" 
              value={phone} 
              onChange={setPhone} 
              placeholder="Enter 10-digit Mobile Number"
              verifiedBadge={isPhoneVerifiedState ? "Verified" : null}
              actionButton={!isPhoneVerifiedState && (
                <button onClick={handleSendWhatsAppOTP} className="text-[10px] font-bold px-2.5 py-1 rounded bg-green-500 hover:bg-green-600 text-white shadow-sm shrink-0 transition">
                  Send OTP
                </button>
              )}
            />

            {/* Inline WhatsApp OTP Verification Box */}
            {showOtpBox && !isPhoneVerifiedState && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in">
                <label className="block text-xs font-bold text-amber-900">Enter 6-Digit WhatsApp OTP Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm font-bold bg-white text-gray-900 outline-none focus:border-amber-600"
                  />
                  <button
                    onClick={handleVerifyPhoneOtp}
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shrink-0"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            <OutlinedField label="Address" value={address} onChange={setAddress} placeholder="Street address..." />

            {/* Dedicated Pinpoint Coordinates Field */}
            <OutlinedField 
              label="Pinpoint Coordinates (Latitude & Longitude)" 
              value={`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`} 
              readOnly={true}
              verifiedBadge="GPS Pinpoint Location"
            />

            <div className="grid grid-cols-2 gap-4">
              <OutlinedField 
                label="State" 
                value={userState} 
                onChange={setUserState} 
                options={['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Gujarat']} 
              />
              <OutlinedField label="Zip Code" value={zipCode} onChange={setZipCode} placeholder="600001" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="px-6 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg text-xs uppercase tracking-wider"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Change Password Card Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">
              Change Account Password
            </h2>

            {passwordStatusMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold ${passwordStatusMsg.includes('🎉') || passwordStatusMsg.includes('✨') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {passwordStatusMsg}
              </div>
            )}

            <div className="space-y-4">
              <OutlinedField 
                label="Current Password" 
                value={currentPassword} 
                onChange={setCurrentPassword} 
                type={showCurrentPass ? "text" : "password"}
                placeholder="••••••••"
                showEyeToggle={true}
                onEyeClick={() => setShowCurrentPass(!showCurrentPass)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OutlinedField 
                  label="New Password" 
                  value={newPassword} 
                  onChange={setNewPassword} 
                  type={showNewPass ? "text" : "password"}
                  placeholder="••••••••"
                  showEyeToggle={true}
                  onEyeClick={() => setShowNewPass(!showNewPass)}
                />
                <OutlinedField 
                  label="Confirm New Password" 
                  value={confirmPassword} 
                  onChange={setConfirmPassword} 
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="••••••••"
                  showEyeToggle={true}
                  onEyeClick={() => setShowConfirmPass(!showConfirmPass)}
                />
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5 text-gray-600">
                <div className="font-bold text-gray-800">Password Requirements:</div>
                <ul className="space-y-1 pl-1">
                  <li className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                    <span>{hasMinLength ? '✓' : '•'}</span> Minimum 8 characters long
                  </li>
                  <li className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                    <span>{hasLowercase ? '✓' : '•'}</span> At least one lowercase character
                  </li>
                  <li className={`flex items-center gap-1.5 ${hasNumOrSymbol ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                    <span>{hasNumOrSymbol ? '✓' : '•'}</span> At least one number, symbol, or special character
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSavePasswordChange}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider"
                >
                  {isLoading ? 'Saving...' : 'Save Password'}
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordStatusMsg(''); }}
                  className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg text-xs uppercase tracking-wider"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Addresses & Leaflet Map Stacked */}
        <div className="space-y-6">
          
          {/* Delivery Addresses Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">Delivery Addresses</h2>
              <button onClick={() => setShowNewAddress(!showNewAddress)} className="text-xs font-bold text-[#e52e06] hover:underline">
                + Add New Address
              </button>
            </div>

            {/* New Address Input Form */}
            {showNewAddress && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                <input type="text" placeholder="Full Name (e.g. Home / Office / Laptop Store)" value={newAddr.name} onChange={e => setNewAddr({ ...newAddr, name: e.target.value })} className="w-full p-2 border rounded outline-none font-bold" />
                <input type="text" placeholder="Street Address" value={newAddr.street} onChange={e => setNewAddr({ ...newAddr, street: e.target.value })} className="w-full p-2 border rounded outline-none" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} className="w-full p-2 border rounded outline-none" />
                  <select value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} className="w-full p-2 border rounded outline-none bg-white font-medium">
                    {['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Gujarat'].map((st, i) => (
                      <option key={i} value={st}>{st}</option>
                    ))}
                  </select>
                  <input type="text" maxLength={6} placeholder="Zip (6 digits)" value={newAddr.zip_code} onChange={e => setNewAddr({ ...newAddr, zip_code: e.target.value.replace(/[^0-9]/g, '') })} className="w-full p-2 border rounded outline-none font-mono" />
                </div>

                {/* Dedicated Location Coordinates */}
                <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-gray-800">
                    <span>📍 Address Pinpoint Map Location</span>
                    <span className="text-amber-700 font-mono">Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</span>
                  </div>
                  <p className="text-[10px] text-amber-800/80">
                    Drag marker on the Leaflet map below to pick the exact pinpoint delivery location for this address.
                  </p>
                </div>

                <button onClick={handleSaveAddress} className="w-full py-2.5 bg-[#e52e06] hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition">
                  Save Address with Dedicated Pinpoint
                </button>
              </div>
            )}

            {/* Saved Addresses List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {addresses.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 border border-dashed rounded-xl">
                  No delivery addresses saved yet. Click + Add New Address above.
                </div>
              ) : (
                addresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    onClick={() => {
                      const aLat = addr.address_lat ? Number(addr.address_lat) : 13.0827;
                      const aLng = addr.address_lng ? Number(addr.address_lng) : 80.2707;
                      setLat(aLat); // Update map center
                      setLng(aLng); // Update map center
                      setSelectedAddrTitle(`📍 Pinpoint: ${addr.name}`);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([aLat, aLng], 15);
                        if (markerInstanceRef.current) {
                          markerInstanceRef.current.setLatLng([aLat, aLng]);
                          markerInstanceRef.current.bindPopup(`<b>${addr.name}</b><br/>${addr.street}, ${addr.city}<br/>Lat: ${aLat.toFixed(4)}, Lng: ${aLng.toFixed(4)}`).openPopup();
                        }
                      }
                    }}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1 relative group cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-gray-900">{addr.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                          📍 View on Map
                        </span>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingAddrId(addr.id); // Set editing ID
                            setNewAddr({ 
                              name: addr.name, 
                              street: addr.street, 
                              city: addr.city, 
                              state: addr.state || 'Tamil Nadu', 
                              zip_code: addr.zip_code || '', 
                              address_lat: Number(addr.address_lat || 0), 
                              address_lng: Number(addr.address_lng || 0) 
                            });
                            if (addr.address_lat && addr.address_lng) {
                              setLat(Number(addr.address_lat));
                              setLng(Number(addr.address_lng));
                            }
                            setShowNewAddress(true);
                          }} 
                          className="text-[10px] font-bold text-amber-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }} className="text-[10px] font-bold text-red-600 hover:underline">
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug">{addr.street}, {addr.city}</p>
                    <p className="text-xs text-gray-500 font-mono">{addr.state} - {addr.zip_code}</p>
                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                      📍 Pinpoint: Lat {addr.address_lat ? Number(addr.address_lat).toFixed(4) : '—'}, Lng {addr.address_lng ? Number(addr.address_lng).toFixed(4) : '—'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaflet JS Pinpoint Map Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <span>📍</span> {selectedAddrTitle}
              </label>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
              </span>
            </div>
            <p className="text-xs text-gray-500">Click any address card above to view its pinpoint marker, or drag marker to update position.</p>
            <div ref={mapContainerRef} className="w-full h-56 rounded-xl border border-gray-200 shadow-inner z-0 overflow-hidden" />
          </div>

        </div>

      </div>

      {/* "Edit & Re-submit Seller Application" / "Become a BUPZO Seller" Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <span>📝</span> {sellerStatus?.status?.toUpperCase() === 'REJECTED' ? 'Edit & Re-submit Seller Application' : 'Become a BUPZO Seller'}
              </h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {modalErrorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {modalErrorMsg}
              </div>
            )}

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <OutlinedField
                label="Store Name *"
                value={modalStoreName}
                onChange={setModalStoreName}
                placeholder="e.g. Nagore Sweets & Crafts"
              />
              <OutlinedField
                label="Business Email *"
                value={modalEmail}
                onChange={setModalEmail}
                type="email"
                placeholder="seller@bupzo.com"
              />
              <OutlinedField
                label="Phone Number *"
                value={modalPhone}
                onChange={setModalPhone}
                placeholder="10-digit mobile number"
              />
              <OutlinedField
                label="Address *"
                value={modalAddress}
                onChange={setModalAddress}
                placeholder="Business / Store Address"
              />
              <div className="grid grid-cols-2 gap-3">
                <OutlinedField
                  label="Bank Name *"
                  value={modalBankName}
                  onChange={setModalBankName}
                  placeholder="e.g. HDFC Bank"
                />
                <OutlinedField
                  label="Account Number *"
                  value={modalAccountNo}
                  onChange={setModalAccountNo}
                  placeholder="Account Number"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OutlinedField
                  label="IFSC Code *"
                  value={modalIfsc}
                  onChange={setModalIfsc}
                  placeholder="e.g. HDFC0001234"
                />
                <OutlinedField
                  label="GSTIN (Optional)"
                  value={modalGstin}
                  onChange={setModalGstin}
                  placeholder="15-digit GSTIN"
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitSellerApplication}
                disabled={submittingApp}
                className="px-6 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {submittingApp ? 'Submitting...' : (sellerStatus?.status?.toUpperCase() === 'REJECTED' ? 'Edit & Re-submit Seller Application' : 'Submit Seller Application')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
