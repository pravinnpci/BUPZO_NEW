"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mock Data
const initialUsers = [
  { id: "USR-10293", name: "Ravi Kumar", phone: "+919876543210", email: "ravi@gmail.com", wallet: 450, tier: "Premium", status: "Active", risk: "Low" },
  { id: "USR-10294", name: "Anitha Pandian", phone: "+918876543210", email: "anitha@gmail.com", wallet: 50, tier: "Normal", status: "Active", risk: "Low" },
  { id: "USR-10295", name: "Karthik Ganesan", phone: "+917876543210", email: "karthik@gmail.com", wallet: 1200, tier: "Premium", status: "Active", risk: "Medium" },
  { id: "USR-10296", name: "Subhashini M.", phone: "+916876543210", email: "subha@gmail.com", wallet: 0, tier: "Normal", status: "Suspended", risk: "High" }
];

const initialSellers = [
  { id: "SEL-1029", businessName: "Nagore Halwa Palace", owner: "Mohamed R.", status: "Pending KYC", commission: 8, date: "2026-06-25", rating: 4.8 },
  { id: "SEL-8402", businessName: "ToyKingdom Pvt Ltd", owner: "Subash C.", status: "Pending KYC", commission: 10, date: "2026-06-26", rating: 4.2 },
  { id: "SEL-5541", businessName: "Siva Ceramics & Crafts", owner: "Sivakumar P.", status: "Approved", commission: 6, date: "2026-05-12", rating: 4.9 },
  { id: "SEL-3392", businessName: "Alpha Electronics", owner: "Arun K.", status: "Approved", commission: 9, date: "2026-06-01", rating: 3.9 }
];

const initialPayouts = [
  { id: "PAY-9921", sellerId: "SEL-5541", amount: 4250.00, balance: 12400.50, date: "2026-06-26 14:30", status: "Pending" },
  { id: "PAY-8832", sellerId: "SEL-3392", amount: 890.00, balance: 950.00, date: "2026-06-26 11:15", status: "Pending" }
];

const initialDisputes = [
  { id: "DISP-10482", customer: "Meera S.", seller: "Nagore Halwa Palace", amount: 2499, risk: 82, status: "Under Review", desc: "Mismatched shipping address + high quantity order of premium Halwa." },
  { id: "DISP-10480", customer: "Anitha P.", seller: "Siva Ceramics & Crafts", amount: 899, risk: 15, status: "Resolved", desc: "Minor crack in ceramic base, refund completed to wallet." },
  { id: "DISP-10485", customer: "Ravi K.", seller: "Alpha Electronics", amount: 5120, risk: 65, status: "Under Review", desc: "Third transaction failure follow-up." }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';

  // Data states (fallback to mock)
  const [users, setUsers] = useState(initialUsers);
  const [sellers, setSellers] = useState(initialSellers);
  const [payouts, setPayouts] = useState(initialPayouts);
  const [disputes, setDisputes] = useState(initialDisputes);
  
  // Interactive adjustment state
  const [adjustId, setAdjustId] = useState('');
  const [adjustType, setAdjustType] = useState('Credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [auditLogs, setAuditLogs] = useState([
    { time: "08:30:12", user: "Admin (Sys)", action: "System Health Telemetry Active", details: "All APIs operational" },
    { time: "08:15:00", user: "Admin (Sys)", action: "Commission split verified", details: "Auto-split active on PhonePe aggregator" }
  ]);

  // Live Telemetry simulation
  const [telemetryLogs, setTelemetryLogs] = useState([
    { time: "08:42:51", type: "DB", msg: "PostgreSQL connected on port 5435. Current pool usage: 2/15." },
    { time: "08:42:53", type: "REDIS", msg: "Upstash Redis cache ping: 8ms. Rate limiter sliding windows synchronized." },
    { time: "08:43:01", type: "API", msg: "FastAPI request successfully resolved: GET /api/users/ (200 OK - 12ms)" }
  ]);

  // WhatsApp Marketing campaign state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignTemplate, setCampaignTemplate] = useState('BUPZO Welcome Offer');
  const [campaignProgress, setCampaignProgress] = useState(0);
  const [isBlasting, setIsBlasting] = useState(false);

  // User Management Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Forms states
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserTier, setNewUserTier] = useState('Normal');
  const [newUserWallet, setNewUserWallet] = useState('0.00');

  // Coupon/Voucher States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponMinSpend, setNewCouponMinSpend] = useState('');

  // Products States
  const [products, setProducts] = useState<any[]>([]);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductQty, setEditProductQty] = useState('');
  const [editProductDesc, setEditProductDesc] = useState('');
  const [editProductImage, setEditProductImage] = useState('');

  // Coupon Edit States
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [editCouponCode, setEditCouponCode] = useState('');
  const [editCouponDiscount, setEditCouponDiscount] = useState('');
  const [editCouponMinSpend, setEditCouponMinSpend] = useState('');
  const [editCouponIsPremiumOnly, setEditCouponIsPremiumOnly] = useState(false);

  const [newUserName, setNewUserName] = useState('');
  const [editUserName, setEditUserName] = useState('');

  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserTier, setEditUserTier] = useState('Normal');
  const [editUserWallet, setEditUserWallet] = useState('0.00');

  // Set mount state
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Check login and theme
  useEffect(() => {
    if (!hasMounted) return;

    const loggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }

    const savedTheme = localStorage.getItem('adminDarkMode') === 'true';
    setDarkMode(savedTheme);
  }, [hasMounted, router]);

  // Dark mode classList toggle
  useEffect(() => {
    if (!hasMounted) return;

    localStorage.setItem('adminDarkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, hasMounted]);

  // Fetch live backend data
  useEffect(() => {
    if (!hasMounted || isLoading) return;

    async function loadLiveAdminData() {
      try {
        const usersResp = await fetch(`${API_URL}/api/users/`);
        if (usersResp.ok) {
          const usersData = await usersResp.json();
          if (Array.isArray(usersData) && usersData.length > 0) {
            setUsers(usersData.map((u: any) => ({
              id: u.id,
              name: u.name || 'Bupzo Patron',
              phone: u.phone,
              email: u.email || 'N/A',
              wallet: u.wallet_balance,
              tier: u.is_premium ? 'Premium' : 'Normal',
              status: 'Active',
              risk: parseFloat(u.wallet_balance) > 4000 ? 'Medium' : 'Low'
            })));
          }
        }

        const sellersResp = await fetch(`${API_URL}/api/sellers/`);
        if (sellersResp.ok) {
          const sellersData = await sellersResp.json();
          if (Array.isArray(sellersData) && sellersData.length > 0) {
            setSellers(sellersData.map((s: any) => ({
              id: s.id,
              businessName: s.business_name,
              owner: `Seller Account`,
              status: s.status === 'PENDING' ? 'Pending KYC' : s.status === 'APPROVED' ? 'Approved' : 'Rejected',
              commission: s.commission_rate,
              date: new Date(s.created_at).toLocaleDateString(),
              rating: 4.5
            })));
          }
        }

        const payoutsResp = await fetch(`${API_URL}/api/payouts/`);
        if (payoutsResp.ok) {
          const payoutsData = await payoutsResp.json();
          if (Array.isArray(payoutsData) && payoutsData.length > 0) {
            setPayouts(payoutsData.map((p: any) => ({
              id: p.id,
              sellerId: p.seller_id,
              amount: p.amount,
              balance: p.amount,
              date: new Date(p.request_date).toLocaleString(),
              status: p.status === 'PENDING' ? 'Pending' : 'Approved'
            })));
          }
        }

        // Fetch coupons
        try {
          const couponsResp = await fetch(`${API_URL}/api/coupons/`);
          if (couponsResp.ok) {
            const couponsData = await couponsResp.json();
            setCoupons(couponsData);
          }
        } catch (e) {
          console.error("Failed to load coupons in admin:", e);
        }

        // Fetch products
        try {
          const productsResp = await fetch(`${API_URL}/api/products/`);
          if (productsResp.ok) {
            const productsData = await productsResp.json();
            setProducts(productsData);
          }
        } catch (e) {
          console.error("Failed to load products in admin:", e);
        }
      } catch (err) {
        console.error("Live admin data load error:", err);
      }
    }

    loadLiveAdminData();
  }, [hasMounted, isLoading]);

  // Telemetry log simulation loop
  useEffect(() => {
    if (!hasMounted) return;
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const logs = [
        { time: timestamp, type: "API", msg: "GET /api/products/ resolved (200 OK - 18ms)" },
        { time: timestamp, type: "DB", msg: "MinIO bucket 'bupzo-assets' check: connection stable (0.01% quota)" },
        { time: timestamp, type: "SYS", msg: "Active user websocket connections: 1,429 sessions online" },
        { time: timestamp, type: "LOGISTICS", msg: "Shiprocket API check: 42ms. Delhivery API check: 112ms." }
      ];
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setTelemetryLogs(prev => [randomLog, ...prev.slice(0, 8)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [hasMounted]);

  // Wallet Overwrite Action
  const handleWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustId || !adjustAmount) {
      alert("Please fill in Target ID and Amount.");
      return;
    }
    
    const amt = parseFloat(adjustAmount);
    
    try {
      const resp = await fetch(`${API_URL}/api/users/${adjustId}/wallet/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, type: adjustType, reason: adjustReason || 'Manual Admin Overwrite' })
      });
      
      if (resp.ok) {
        const data = await resp.json();
        alert(`Wallet successfully updated. New Balance: ₹${data.new_balance}`);
        
        // Refresh users
        const usersResp = await fetch(`${API_URL}/api/users/`);
        if (usersResp.ok) {
          const usersData = await usersResp.json();
          setUsers(usersData.map((u: any) => ({
            id: u.id,
            phone: u.phone,
            email: u.email || 'N/A',
            wallet: u.wallet_balance,
            tier: u.is_premium ? 'Premium' : 'Normal',
            status: 'Active',
            risk: parseFloat(u.wallet_balance) > 4000 ? 'Medium' : 'Low'
          })));
        }

        const newLog = {
          time: new Date().toLocaleTimeString(),
          user: "Super Admin",
          action: `Wallet ${adjustType}`,
          details: `${adjustType}ed ${adjustId} with ₹${amt}. Reason: ${adjustReason || 'Manual Overwrite'}`
        };
        setAuditLogs(prev => [newLog, ...prev]);
      } else {
        const errData = await resp.json();
        alert(`Error: ${errData.detail || 'Failed to update wallet'}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback local logic
      const userIndex = users.findIndex(u => u.id === adjustId);
      if (userIndex !== -1) {
        const updated = [...users];
        const change = adjustType === 'Credit' ? amt : -amt;
        updated[userIndex].wallet += change;
        setUsers(updated);
        
        const newLog = {
          time: new Date().toLocaleTimeString(),
          user: "Super Admin (Offline)",
          action: `Wallet ${adjustType}`,
          details: `${adjustType}ed ${adjustId} with ₹${amt}. Reason: ${adjustReason || 'Manual Overwrite'}`
        };
        setAuditLogs(prev => [newLog, ...prev]);
        alert(`Offline Mode: Local wallet updated by ₹${change}.`);
      } else {
        alert("Target Account ID not found.");
      }
    }
    setAdjustId('');
    setAdjustAmount('');
    setAdjustReason('');
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) {
      alert("Please fill in code and discount percentage.");
      return;
    }
    try {
      const resp = await fetch(`${API_URL}/api/coupons/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode,
          discount_percent: parseFloat(newCouponDiscount),
          is_premium_only: false,
          min_order_value: parseFloat(newCouponMinSpend) || 100.0,
          expiry_date: new Date(Date.now() + 86400000 * 30).toISOString()
        })
      });
      if (resp.ok) {
        const cp = await resp.json();
        alert(`Voucher "${cp.code}" created successfully!`);
        setCoupons(prev => [cp, ...prev]);
        setNewCouponCode('');
        setNewCouponDiscount('');
        setNewCouponMinSpend('');
      } else {
        alert("Failed to create coupon on backend.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting backend server.");
    }
  };

  const handleApproveVoucher = async (couponId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      if (resp.ok) {
        alert("Voucher approved successfully!");
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status: 'APPROVED' } : c));
      } else {
        alert("Failed to approve voucher.");
      }
    } catch (err) {
      console.error(err);
      alert("Offline Mode: locally approved voucher.");
      setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status: 'APPROVED' } : c));
    }
  };

  const handleRejectVoucher = async (couponId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (resp.ok) {
        alert("Voucher rejected successfully!");
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status: 'REJECTED' } : c));
      } else {
        alert("Failed to reject voucher.");
      }
    } catch (err) {
      console.error(err);
      alert("Offline Mode: locally rejected voucher.");
      setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status: 'REJECTED' } : c));
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const resp = await fetch(`${API_URL}/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editProductName,
          price: parseFloat(editProductPrice),
          stock_quantity: parseInt(editProductQty),
          description: editProductDesc,
          image_url: editProductImage
        })
      });
      if (resp.ok) {
        const prod = await resp.json();
        alert(`Product "${prod.name}" updated successfully!`);
        setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
        setShowEditProductModal(false);
        setSelectedProduct(null);
      } else {
        alert("Failed to update product.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting backend server.");
    }
  };

  const handleEditCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoupon) return;
    try {
      const resp = await fetch(`${API_URL}/api/coupons/${selectedCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editCouponCode,
          discount_percent: parseFloat(editCouponDiscount),
          min_order_value: parseFloat(editCouponMinSpend),
          is_premium_only: editCouponIsPremiumOnly
        })
      });
      if (resp.ok) {
        const cp = await resp.json();
        alert(`Voucher "${cp.code}" updated successfully!`);
        setCoupons(prev => prev.map(c => c.id === cp.id ? cp : c));
        setShowEditCouponModal(false);
        setSelectedCoupon(null);
      } else {
        alert("Failed to update coupon.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting backend server.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'seller') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const resp = await fetch(`${API_URL}/api/upload/`, {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        const data = await resp.json();
        alert("Image uploaded to MinIO successfully!");
        if (type === 'product') {
          setEditProductImage(data.url);
        }
      } else {
        alert("Failed to upload image to MinIO.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image.");
    }
  };

  // Merchant KYC approval Action
  const handleApproveKYC = async (sellerId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/sellers/${sellerId}/approve`, {
        method: 'POST'
      });
      if (resp.ok) {
        setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: 'Approved' } : s));
        alert("Merchant KYC approved successfully!");
        
        const newLog = {
          time: new Date().toLocaleTimeString(),
          user: "Super Admin",
          action: "KYC Approved",
          details: `Approved seller profile for ${sellerId}`
        };
        setAuditLogs(prev => [newLog, ...prev]);
      } else {
        alert("Failed to approve merchant.");
      }
    } catch (err) {
      console.error(err);
      setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: 'Approved' } : s));
      alert("Offline Mode: Seller locally approved.");
    }
  };

  // Disburse payout Action
  const handlePayout = async (payoutId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/payouts/${payoutId}/approve`, {
        method: 'POST'
      });
      if (resp.ok) {
        setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'Approved' } : p));
        alert("Payout processed successfully!");
        
        const payout = payouts.find(p => p.id === payoutId);
        const newLog = {
          time: new Date().toLocaleTimeString(),
          user: "Super Admin",
          action: "Payout Disbursed",
          details: `Disbursed ₹${payout?.amount} to seller ${payout?.sellerId} via Connected Wallet Router`
        };
        setAuditLogs(prev => [newLog, ...prev]);
      } else {
        alert("Failed to process payout.");
      }
    } catch (err) {
      console.error(err);
      setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'Approved' } : p));
      alert("Offline Mode: Payout locally approved.");
    }
  };

  // Send campaign broadcast Action
  const startWhatsAppBlast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle) {
      alert("Please enter a campaign title.");
      return;
    }
    setIsBlasting(true);
    setCampaignProgress(0);
    
    const interval = setInterval(() => {
      setCampaignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBlasting(false);
          alert("WhatsApp Campaign blasted successfully to all active sellers & users!");
          
          const newLog = {
            time: new Date().toLocaleTimeString(),
            user: "MarketingAgent",
            action: "WhatsApp Blast Complete",
            details: `Campaign: ${campaignTitle} sent using Template: ${campaignTemplate}`
          };
          setAuditLogs(logs => [newLog, ...logs]);
          setCampaignTitle('');
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Add User Form Action
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserPhone) {
      alert("Phone number is required.");
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName || 'Bupzo Patron',
          phone: newUserPhone,
          email: newUserEmail || null,
          is_premium: newUserTier === 'Premium',
          signup_platform: 'WEB',
          privacy_accepted: true
        })
      });

      if (resp.ok) {
        const newUser = await resp.json();
        alert("User created successfully!");
        
        // Refresh users
        const usersResp = await fetch(`${API_URL}/api/users/`);
        if (usersResp.ok) {
          const usersData = await usersResp.json();
          setUsers(usersData.map((u: any) => ({
            id: u.id,
            name: u.name || 'Bupzo Patron',
            phone: u.phone,
            email: u.email || 'N/A',
            wallet: u.wallet_balance,
            tier: u.is_premium ? 'Premium' : 'Normal',
            status: 'Active',
            risk: parseFloat(u.wallet_balance) > 4000 ? 'Medium' : 'Low'
          })));
        } else {
          // Local fallback
          setUsers(prev => [
            {
              id: newUser.id,
              name: newUser.name || newUserName || 'Bupzo Patron',
              phone: newUser.phone,
              email: newUser.email || 'N/A',
              wallet: parseFloat(newUserWallet) || 0,
              tier: newUser.is_premium ? 'Premium' : 'Normal',
              status: 'Active',
              risk: (parseFloat(newUserWallet) || 0) > 4000 ? 'Medium' : 'Low'
            },
            ...prev
          ]);
        }

        // Reset and close
        setNewUserName('');
        setNewUserPhone('');
        setNewUserEmail('');
        setNewUserTier('Normal');
        setNewUserWallet('0.00');
        setShowAddUserModal(false);
      } else {
        const errData = await resp.json();
        alert(`Error: ${errData.detail || 'Failed to create user'}`);
      }
    } catch (err) {
      console.error(err);
      // Local fallback
      const offlineId = 'USR-' + Math.floor(Math.random() * 900000 + 100000);
      setUsers(prev => [
        {
          id: offlineId,
          name: newUserName || 'Bupzo Patron',
          phone: newUserPhone,
          email: newUserEmail || 'N/A',
          wallet: parseFloat(newUserWallet) || 0,
          tier: newUserTier,
          status: 'Active',
          risk: (parseFloat(newUserWallet) || 0) > 4000 ? 'Medium' : 'Low'
        },
        ...prev
      ]);
      alert("Offline Mode: User created locally.");
      setNewUserPhone('');
      setNewUserEmail('');
      setNewUserTier('Normal');
      setNewUserWallet('0.00');
      setShowAddUserModal(false);
    }
  };

  const openEditUserModal = (user: any) => {
    setSelectedUser(user);
    setEditUserName(user.name || '');
    setEditUserPhone(user.phone);
    setEditUserEmail(user.email === 'N/A' ? '' : user.email);
    setEditUserTier(user.tier);
    setEditUserWallet(user.wallet.toString());
    setShowEditUserModal(true);
  };

  // Edit User Form Action
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const resp = await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editUserName,
          phone: editUserPhone,
          email: editUserEmail || null,
          is_premium: editUserTier === 'Premium',
          wallet_balance: parseFloat(editUserWallet) || 0
        })
      });

      if (resp.ok) {
        alert("User updated successfully!");
        
        // Refresh users
        const usersResp = await fetch(`${API_URL}/api/users/`);
        if (usersResp.ok) {
          const usersData = await usersResp.json();
          setUsers(usersData.map((u: any) => ({
            id: u.id,
            name: u.name || 'Bupzo Patron',
            phone: u.phone,
            email: u.email || 'N/A',
            wallet: u.wallet_balance,
            tier: u.is_premium ? 'Premium' : 'Normal',
            status: 'Active',
            risk: parseFloat(u.wallet_balance) > 4000 ? 'Medium' : 'Low'
          })));
        } else {
          // Local fallback
          setUsers(prev => prev.map(u => u.id === selectedUser.id ? {
            ...u,
            name: editUserName,
            phone: editUserPhone,
            email: editUserEmail || 'N/A',
            wallet: parseFloat(editUserWallet) || 0,
            tier: editUserTier,
            risk: (parseFloat(editUserWallet) || 0) > 4000 ? 'Medium' : 'Low'
          } : u));
        }

        setShowEditUserModal(false);
        setSelectedUser(null);
      } else {
        const errData = await resp.json();
        alert(`Error: ${errData.detail || 'Failed to update user'}`);
      }
    } catch (err) {
      console.error(err);
      // Local fallback
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? {
        ...u,
        name: editUserName,
        phone: editUserPhone,
        email: editUserEmail || 'N/A',
        wallet: parseFloat(editUserWallet) || 0,
        tier: editUserTier,
        risk: (parseFloat(editUserWallet) || 0) > 4000 ? 'Medium' : 'Low'
      } : u));
      alert("Offline Mode: User profile updated locally.");
      setShowEditUserModal(false);
      setSelectedUser(null);
    }
  };

  // Preloader / SSR Hydration Shield
  if (!hasMounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#fff8f4] dark:bg-[#0c0b11] flex items-center justify-center font-sans text-xs font-bold text-[#A6808C] dark:text-[#ccc6dc]">
        Verifying Security Authority...
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'dark bg-[#0f111a] text-[#e3e6ed]' : 'bg-[#f9fbfd] text-[#141824]'} min-h-screen font-sans transition-colors duration-300 flex overflow-hidden w-full`}>
      
      {/* Sidebar Navigation */}
      <aside className="w-[280px] bg-white dark:bg-[#141824] border-r border-[#e3e6ed] dark:border-[#222834] flex flex-col p-6 z-50 h-screen transition-colors duration-300">
        <div className="mb-8 px-4 flex items-center gap-3">
          <img src="/Bupzo-logo.png" alt="BUPZO Logo" className="w-10 h-10 object-contain rounded" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#3874ff] font-heading">BUPZO</h1>
            <p className="text-[10px] text-[#525b75] dark:text-[#9fa6bc] uppercase tracking-wider font-semibold">Phoenix Pro Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'dashboard' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('users')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'users' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            User Directory
          </button>

          <button 
            onClick={() => setActiveTab('products')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'products' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            Products Catalog
          </button>

          <button 
            onClick={() => setActiveTab('kyc')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'kyc' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            Seller KYC
          </button>
          <button 
            onClick={() => setActiveTab('financials')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'financials' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            Wallet & Audits
          </button>

          <button 
            onClick={() => setActiveTab('logistics')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'logistics' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            Logistics API
          </button>

          <button 
            onClick={() => setActiveTab('disputes')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'disputes' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            AI Fraud Center
          </button>

          <button 
            onClick={() => setActiveTab('whatsapp')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'whatsapp' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            Marketing Blaster
          </button>

          <button 
            onClick={() => setActiveTab('vouchers')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'vouchers' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            Promo Vouchers
          </button>

          <button 
            onClick={() => setActiveTab('health')} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 transition-all text-xs font-bold ${activeTab === 'health' ? 'border-[#3874ff] bg-[#3874ff]/10 text-[#3874ff]' : 'border-transparent text-[#525b75] dark:text-[#9fa6bc] hover:bg-[#3874ff]/5 hover:text-[#3874ff]'}`}
          >
            System Telemetry
          </button>
        </nav>

        <div className="pt-4 border-t border-[#e8e1dd] dark:border-[#2f2b3b] mt-auto space-y-1">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg font-semibold"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('isAdminLoggedIn');
                router.push('/login');
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-bold transition-all"
          >
            🔒 Logout Console
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#e8e1dd] dark:border-[#2f2b3b] bg-white/80 dark:bg-[#15131b]/80 backdrop-blur-xl flex items-center justify-between px-8 transition-colors duration-300">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#3f3b4c] dark:text-[#ccc6dc] font-heading">Phoenix Telemetry</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold">Admin Console</p>
              <p className="text-[10px] text-[#32D74B] font-mono flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 bg-[#32D74B] rounded-full animate-ping"></span> Live Status
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable Panel Area */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">Global Command Center</h1>
                <p className="text-sm text-zinc-500 mt-1">Real-time telemetry and network oversight for BUPZO operations.</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-36">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Orders</span>
                  <div>
                    <span className="text-3xl font-extrabold font-heading">1,42,837</span>
                    <p className="text-[10px] text-[#32D74B] font-semibold mt-1">↑ 12% today</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-36">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">GMV Today</span>
                  <div>
                    <span className="text-3xl font-extrabold font-heading">₹38.4L</span>
                    <p className="text-[10px] text-[#32D74B] font-semibold mt-1">↑ 8.2% vs yesterday</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-36">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Sellers</span>
                  <div>
                    <span className="text-3xl font-extrabold font-heading">4,219</span>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1">23 pending KYC</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-36">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Fraud Flags</span>
                  <div>
                    <span className="text-3xl font-extrabold font-heading text-red-500">12</span>
                    <p className="text-[10px] text-red-500 font-semibold mt-1">↑ 3 new alerts</p>
                  </div>
                </div>
              </div>

              {/* GMV Graph & Tabular Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Graph Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal dark:text-[#f3f4f6]">GMV Sales Trend (Past 7 Days)</h3>
                        <p className="text-[10px] text-zinc-400">Total gross merchandise value synchronized across gateways.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#A6808C] rounded-full"></span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">ZAR (R) Volume</span>
                      </div>
                    </div>

                    {/* Area Graph using SVG */}
                    <div className="relative h-64 w-full">
                      <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A6808C" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#A6808C" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal Grid lines */}
                        <line x1="50" y1="40" x2="560" y2="40" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
                        <line x1="50" y1="90" x2="560" y2="90" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
                        <line x1="50" y1="140" x2="560" y2="140" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
                        <line x1="50" y1="190" x2="560" y2="190" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
                        
                        {/* Axis Labels */}
                        <text x="20" y="45" className="text-[10px] fill-zinc-400 font-mono">50K</text>
                        <text x="20" y="95" className="text-[10px] fill-zinc-400 font-mono">30K</text>
                        <text x="20" y="145" className="text-[10px] fill-zinc-400 font-mono">15K</text>
                        <text x="20" y="195" className="text-[10px] fill-zinc-400 font-mono">0</text>
                        
                        {/* Area Path */}
                        <path d="M 50,190 Q 120,130 190,110 T 330,60 T 470,120 T 560,40 L 560,190 Z" fill="url(#chartGradient)" />
                        
                        {/* Line Path */}
                        <path d="M 50,190 Q 120,130 190,110 T 330,60 T 470,120 T 560,40" fill="none" stroke="#A6808C" strokeWidth="3" />
                        
                        {/* Data Points */}
                        <circle cx="50" cy="190" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="130" cy="142" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="212" cy="105" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="330" cy="60" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="438" cy="100" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="560" cy="40" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                        
                        {/* Day labels */}
                        <text x="45" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Mon</text>
                        <text x="125" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Tue</text>
                        <text x="207" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Wed</text>
                        <text x="325" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Thu</text>
                        <text x="433" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Fri</text>
                        <text x="548" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Sat</text>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Logistics SLA Distribution Tracker */}
                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-charcoal dark:text-[#f3f4f6]">Logistics SLA Breakdown</h3>
                    <p className="text-[10px] text-zinc-400 mb-6">Delivery times aggregated across carriers.</p>
                    
                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>Delhivery Express (1-3 Days)</span>
                          <span className="font-mono">82%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-charcoal dark:bg-almond-silk" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>Shiprocket Smart-Route (2-4 Days)</span>
                          <span className="font-mono">91%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#A6808C]" style={{ width: '91%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>NimbusPost Air Courier (1-2 Days)</span>
                          <span className="font-mono">68%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#CCB7AE]" style={{ width: '68%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono">
                    Routing Optimization: Auto-balancing active
                  </div>
                </div>

              </div>

              {/* Tabular Orders Registry */}
              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal dark:text-[#f3f4f6]">Recent Transactions Registry</h3>
                    <p className="text-[10px] text-zinc-400">Ledger audit of orders synced from checkout aggregators.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#e8e1dd] dark:border-zinc-800 text-zinc-400 uppercase font-bold text-[9px] tracking-widest">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Courier SLA</th>
                        <th className="pb-3">Gateway</th>
                        <th className="pb-3">Total Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                        <td className="py-3 font-mono font-bold">BUP-99283</td>
                        <td className="py-3">Ravi K.</td>
                        <td className="py-3 font-mono">Delhivery SLA</td>
                        <td className="py-3">Stitch Money</td>
                        <td className="py-3 font-mono">R598.00</td>
                        <td className="py-3"><span className="bg-yellow-100/10 text-yellow-500 font-bold px-2 py-0.5 rounded text-[10px]">Pending</span></td>
                      </tr>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                        <td className="py-3 font-mono font-bold">BUP-99280</td>
                        <td className="py-3">Meera S.</td>
                        <td className="py-3 font-mono">Shiprocket SLA</td>
                        <td className="py-3">Stitch Money</td>
                        <td className="py-3 font-mono">R399.00</td>
                        <td className="py-3"><span className="bg-blue-100/10 text-blue-500 font-bold px-2 py-0.5 rounded text-[10px]">Processing</span></td>
                      </tr>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                        <td className="py-3 font-mono font-bold">BUP-99275</td>
                        <td className="py-3">Anitha P.</td>
                        <td className="py-3 font-mono">NimbusPost SLA</td>
                        <td className="py-3">Stripe Wallet</td>
                        <td className="py-3 font-mono">R799.00</td>
                        <td className="py-3"><span className="bg-indigo-100/10 text-indigo-500 font-bold px-2 py-0.5 rounded text-[10px]">Dispatched</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-mono font-bold">BUP-99270</td>
                        <td className="py-3">Karthik G.</td>
                        <td className="py-3 font-mono">Delhivery SLA</td>
                        <td className="py-3">Razorpay</td>
                        <td className="py-3 font-mono">R1,299.00</td>
                        <td className="py-3"><span className="bg-green-100/10 text-green-500 font-bold px-2 py-0.5 rounded text-[10px]">Delivered</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold font-heading">Platform User Directory</h1>
                  <p className="text-sm text-zinc-500 mt-1">Audit active profiles, wallet balances, and risk scores.</p>
                </div>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-charcoal dark:bg-zinc-200 text-white dark:text-zinc-950 px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span> Add User
                </button>
              </div>

              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400">
                      <th className="py-2">User ID</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Phone</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Wallet</th>
                      <th className="py-2">Tier</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Risk</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-3 font-mono">{u.id}</td>
                        <td className="py-3 font-semibold text-[#3874ff]">{u.name || 'Bupzo Patron'}</td>
                        <td className="py-3">{u.phone}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3 font-mono font-bold">₹{u.wallet}</td>
                        <td className="py-3">{u.tier}</td>
                        <td className="py-3">{u.status}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${u.risk === 'Low' ? 'bg-green-100 text-green-700' : u.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {u.risk}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => openEditUserModal(u)}
                            className="bg-[#3f3b4c] hover:bg-opacity-95 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2 py-1 rounded font-bold text-[10px]"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SELLER KYC */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">KYC Verification Queue</h1>
                <p className="text-sm text-zinc-500 mt-1">Review business credentials, licenses, and approve vendors.</p>
              </div>

              <div className="space-y-4">
                {sellers.filter(s => s.status === 'Pending KYC').map(s => (
                  <div key={s.id} className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-sm">{s.businessName}</h4>
                      <p className="text-zinc-500 mt-1">Owner: {s.owner} | Applied: {s.date}</p>
                    </div>
                    <button 
                      onClick={() => handleApproveKYC(s.id)}
                      className="bg-charcoal text-white px-3 py-1.5 rounded hover:bg-opacity-90 font-bold"
                    >
                      Approve Merchant
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WALLLETS & AUDITS */}
          {activeTab === 'financials' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Manual Wallet Adjustment Override</h3>
                  <form onSubmit={handleWalletAdjustment} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 font-bold uppercase mb-1">Target Account ID (User or Seller)</label>
                      <input 
                        type="text" 
                        value={adjustId} 
                        onChange={(e) => setAdjustId(e.target.value)} 
                        placeholder="USR-10293" 
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none font-mono" 
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-zinc-400 font-bold uppercase mb-1">Type</label>
                        <select 
                          value={adjustType} 
                          onChange={(e) => setAdjustType(e.target.value)} 
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none"
                        >
                          <option>Credit</option>
                          <option>Debit</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-zinc-400 font-bold uppercase mb-1">Amount (INR)</label>
                        <input 
                          type="number" 
                          value={adjustAmount} 
                          onChange={(e) => setAdjustAmount(e.target.value)} 
                          placeholder="250" 
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none font-mono" 
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-charcoal text-white py-2 rounded-lg font-bold">Apply Override</button>
                  </form>
                </div>
              </div>

              {/* Payouts queue */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Pending Seller Payouts</h3>
                  <div className="space-y-4">
                    {payouts.filter(p => p.status === 'Pending').map(p => (
                      <div key={p.id} className="border-b pb-3 text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{p.id}</span>
                          <span>₹{p.amount}</span>
                        </div>
                        <p className="text-zinc-500 text-[10px]">Seller: {p.sellerId}</p>
                        <button 
                          onClick={() => handlePayout(p.id)}
                          className="bg-charcoal text-white px-2 py-1 rounded text-[10px] font-bold"
                        >
                          Release Funds
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LOGISTICS API */}
          {activeTab === 'logistics' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">Smart Carrier Routing Engine</h1>
                <p className="text-sm text-zinc-500 mt-1">Multi-routing comparison logic based on pincode efficiency metrics.</p>
              </div>

              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] space-y-4 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">Shiprocket Hub</span>
                  <span className="text-green-500 font-bold">98.4% uptime</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">Delhivery API</span>
                  <span className="text-green-500 font-bold">96.1% uptime</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">NimbusPost Hub</span>
                  <span className="text-green-500 font-bold">99.1% uptime</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AI FRAUD CENTER */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">AI Dispute &amp; Anomaly Center</h1>
                <p className="text-sm text-zinc-500 mt-1">Real-time risk scoring and payment holding portal.</p>
              </div>

              <div className="space-y-4">
                {disputes.map(d => (
                  <div key={d.id} className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{d.id}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${d.risk > 70 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>Risk: {d.risk}%</span>
                    </div>
                    <p className="text-zinc-500">{d.desc}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">Customer: {d.customer} | Seller: {d.seller}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: MARKETING BLASTER */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">WhatsApp Marketing Blaster</h1>
                <p className="text-sm text-zinc-500 mt-1">Broadcast Meta-approved message templates to select customer cohorts.</p>
              </div>

              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] max-w-xl">
                <form onSubmit={startWhatsAppBlast} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-bold uppercase mb-1">Campaign Title</label>
                    <input 
                      type="text" 
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      placeholder="e.g. Nagore Halwa Special Offer" 
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold uppercase mb-1">Template Select (Approved by Meta)</label>
                    <select 
                      value={campaignTemplate}
                      onChange={(e) => setCampaignTemplate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none"
                    >
                      <option>BUPZO Welcome Offer</option>
                      <option>Festival Discount Alert</option>
                      <option>Seller Restock Notification</option>
                    </select>
                  </div>

                  {isBlasting && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-400">
                        <span>Blasting templates...</span>
                        <span>{campaignProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${campaignProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full bg-charcoal text-white py-2 rounded-lg font-bold disabled:opacity-50" disabled={isBlasting}>Send Broadcast</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: SYSTEM TELEMETRY */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">System Health &amp; Telemetry</h1>
                <p className="text-sm text-zinc-500 mt-1">Track asyncpg db connection pools, Redis latency, and API Gateway status.</p>
              </div>

              {/* Logger */}
              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] space-y-4">
                <h3 className="font-bold text-sm">Live API Gateway logs (FastAPI backend on port 8004)</h3>
                <div className="bg-zinc-950 text-green-400 p-4 rounded-lg font-mono text-xs space-y-2 h-64 overflow-y-auto scrollbar-hide">
                  {telemetryLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-zinc-500">[{log.time}]</span>
                      <span className="font-bold text-[#007AFF]">{log.type}</span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* TAB: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <header>
                <h2 className="text-2xl font-bold font-heading">Products Catalog</h2>
                <p className="text-xs text-zinc-500 mt-1">Audit, edit, and update merchant sweet inventories and catalogs.</p>
              </header>

              <div className="bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5">Image</th>
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Price</th>
                        <th className="py-2.5">Stock</th>
                        <th className="py-2.5">Weight (g)</th>
                        <th className="py-2.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p: any) => (
                        <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                          <td className="py-3">
                            <img 
                              src={p.image_url || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"} 
                              alt={p.name} 
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          </td>
                          <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">{p.name}</td>
                          <td className="py-3 font-mono">₹{p.price}</td>
                          <td className="py-3 font-mono">{p.stock_quantity} units</td>
                          <td className="py-3 font-mono">{p.weight_grams}g</td>
                          <td className="py-3">
                            <button 
                              onClick={() => {
                                setSelectedProduct(p);
                                setEditProductName(p.name);
                                setEditProductPrice(p.price.toString());
                                setEditProductQty(p.stock_quantity.toString());
                                setEditProductDesc(p.description || '');
                                setEditProductImage(p.image_url || '');
                                setShowEditProductModal(true);
                              }}
                              className="bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-2.5 py-1 rounded text-[10px] font-bold hover:opacity-90"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-zinc-400">No products found in platform catalog.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROMO VOUCHERS */}
          {activeTab === 'vouchers' && (
            <div className="space-y-6">
              <header>
                <h2 className="text-2xl font-bold font-heading">Promo Vouchers Console</h2>
                <p className="text-xs text-zinc-500 mt-1">Configure and release sitewide discount vouchers and loyalty coupon rewards.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form to create voucher */}
                <div className="bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm h-fit">
                  <h3 className="text-md font-bold mb-4 font-heading">Generate New Voucher</h3>
                  <form onSubmit={handleAddCoupon} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-zinc-500 mb-1">Coupon/Voucher Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. FESTIVE25" 
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 mb-1">Discount Percentage (%)</label>
                      <input 
                        type="number" 
                        min="1"
                        max="100"
                        placeholder="25" 
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 mb-1">Minimum Order Value (₹)</label>
                      <input 
                        type="number" 
                        placeholder="300" 
                        value={newCouponMinSpend}
                        onChange={(e) => setNewCouponMinSpend(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-[#3f3b4c] dark:bg-[#ccc6dc] text-white dark:text-zinc-950 py-2.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-xs"
                    >
                      Issue Voucher
                    </button>
                  </form>
                </div>

                {/* Vouchers directory list */}
                <div className="lg:col-span-2 bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm">
                  <h3 className="text-md font-bold mb-4 font-heading">Systemwide Active Coupons</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5">Code</th>
                          <th className="py-2.5">Discount</th>
                          <th className="py-2.5">Min Order</th>
                          <th className="py-2.5">Expiry Date</th>
                          <th className="py-2.5">Premium Only</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((cp: any) => (
                          <tr key={cp.id} className="border-b border-zinc-100 dark:border-zinc-905">
                            <td className="py-3 font-bold font-mono text-sm text-zinc-800 dark:text-zinc-200">{cp.code}</td>
                            <td className="py-3 font-mono">{cp.discount_percent}%</td>
                            <td className="py-3 font-mono">₹{cp.min_order_value}</td>
                            <td className="py-3 text-zinc-500">{new Date(cp.expiry_date).toLocaleDateString()}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${cp.is_premium_only ? 'bg-amber-100/10 text-amber-500' : 'bg-green-100/10 text-green-500'}`}>
                                {cp.is_premium_only ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${cp.status === 'PENDING' ? 'bg-yellow-100/10 text-yellow-500' : cp.status === 'REJECTED' ? 'bg-red-100/10 text-red-500' : 'bg-green-100/10 text-green-500'}`}>
                                {cp.status || 'APPROVED'}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedCoupon(cp);
                                    setEditCouponCode(cp.code);
                                    setEditCouponDiscount(cp.discount_percent.toString());
                                    setEditCouponMinSpend(cp.min_order_value.toString());
                                    setEditCouponIsPremiumOnly(cp.is_premium_only);
                                    setShowEditCouponModal(true);
                                  }}
                                  className="bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-2 py-1 rounded text-[10px] font-bold hover:opacity-90"
                                >
                                  Edit
                                </button>
                                {cp.status === 'PENDING' && (
                                  <>
                                    <button 
                                      onClick={() => handleApproveVoucher(cp.id)}
                                      className="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-opacity-95 transition-all"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleRejectVoucher(cp.id)}
                                      className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-opacity-95 transition-all"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {coupons.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-zinc-400">No active systemwide promo vouchers found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold font-heading mb-4">Add Platform User</h3>
            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)} 
                  placeholder="Ravi Kumar"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Phone Number (Required)</label>
                <input 
                  type="text" 
                  value={newUserPhone} 
                  onChange={(e) => setNewUserPhone(e.target.value)} 
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newUserEmail} 
                  onChange={(e) => setNewUserEmail(e.target.value)} 
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Membership Tier</label>
                <select 
                  value={newUserTier} 
                  onChange={(e) => setNewUserTier(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="Normal">Normal Customer</option>
                  <option value="Premium">Premium Member</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Initial Wallet Balance (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newUserWallet} 
                  onChange={(e) => setNewUserWallet(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold font-heading mb-4">Edit Platform User</h3>
            <form onSubmit={handleEditUserSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">User ID</label>
                <input 
                  type="text" 
                  value={selectedUser.id} 
                  disabled
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 font-mono outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editUserName} 
                  onChange={(e) => setEditUserName(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Phone Number (Required)</label>
                <input 
                  type="text" 
                  value={editUserPhone} 
                  onChange={(e) => setEditUserPhone(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editUserEmail} 
                  onChange={(e) => setEditUserEmail(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Membership Tier</label>
                <select 
                  value={editUserTier} 
                  onChange={(e) => setEditUserTier(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="Normal">Normal Customer</option>
                  <option value="Premium">Premium Member</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Wallet Balance (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editUserWallet} 
                  onChange={(e) => setEditUserWallet(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowEditUserModal(false); setSelectedUser(null); }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT PRODUCT MODAL */}
      {showEditProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold font-heading mb-4">Edit Product Inventory</h3>
            <form onSubmit={handleEditProductSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={editProductName} 
                  onChange={(e) => setEditProductName(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editProductPrice} 
                  onChange={(e) => setEditProductPrice(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Stock Quantity</label>
                <input 
                  type="number" 
                  value={editProductQty} 
                  onChange={(e) => setEditProductQty(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Description</label>
                <textarea 
                  value={editProductDesc} 
                  onChange={(e) => setEditProductDesc(e.target.value)} 
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Product Image URL (Upload to MinIO)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'product')} 
                  className="w-full text-xs text-zinc-500 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 bg-white dark:bg-zinc-950"
                />
                {editProductImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={editProductImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
                    <span className="text-[10px] text-zinc-500 truncate max-w-[200px]">{editProductImage}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowEditProductModal(false); setSelectedProduct(null); }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COUPON MODAL */}
      {showEditCouponModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold font-heading mb-4">Edit Promo Voucher</h3>
            <form onSubmit={handleEditCouponSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Coupon/Voucher Code</label>
                <input 
                  type="text" 
                  value={editCouponCode} 
                  onChange={(e) => setEditCouponCode(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none uppercase font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={editCouponDiscount} 
                  onChange={(e) => setEditCouponDiscount(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Minimum Order Value (₹)</label>
                <input 
                  type="number" 
                  value={editCouponMinSpend} 
                  onChange={(e) => setEditCouponMinSpend(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono"
                  required
                />
              </div>
              <div className="flex items-center gap-2 py-1">
                <input 
                  type="checkbox" 
                  id="editCouponIsPremiumOnly"
                  checked={editCouponIsPremiumOnly}
                  onChange={(e) => setEditCouponIsPremiumOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-800 text-[#3874ff] focus:ring-[#3874ff] cursor-pointer"
                />
                <label htmlFor="editCouponIsPremiumOnly" className="text-zinc-500 select-none cursor-pointer">Premium Only Voucher</label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowEditCouponModal(false); setSelectedCoupon(null); }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL FOOTER */}
    </div>
  );
}
