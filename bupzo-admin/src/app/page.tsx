"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminUsers } from '@/components/AdminUsers';
import { AdminProducts } from '@/components/AdminProducts';
import { AdminSellers } from '@/components/AdminSellers';

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

export default function AdminMainPage() {
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
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('');
  const [voucherSortKey, setVoucherSortKey] = useState<string>('');
  const [voucherSortOrder, setVoucherSortOrder] = useState<'asc' | 'desc'>('asc');
  // Wallet Transactions States
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [walletSearchTerm, setWalletSearchTerm] = useState('');
  const [walletSortKey, setWalletSortKey] = useState<string>('');
  const [walletSortOrder, setWalletSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedWalletTx, setSelectedWalletTx] = useState<any>(null);
  const [showEditWalletModal, setShowEditWalletModal] = useState(false);
  const [editWalletAmount, setEditWalletAmount] = useState('');
  const [editWalletDesc, setEditWalletDesc] = useState('');
  const [editWalletType, setEditWalletType] = useState('REFERRAL');

  // Products & Categories States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
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

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [isSidebarReduced, setIsSidebarReduced] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean | null>(null);

  // Set mount state
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Check login and theme
  useEffect(() => {
    if (!hasMounted) return;

    let loggedIn = false;
    let savedTheme = false;
    try {
      loggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
      savedTheme = localStorage.getItem('adminDarkMode') === 'true';
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
    setIsAdminLoggedIn(loggedIn);
    setIsLoading(false);
    setDarkMode(savedTheme);
  }, [hasMounted]);

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

  const refreshAllAdminData = async () => {
    try {
      let sellersData: any[] = [];
      try {
        const sellersResp = await fetch(`${API_URL}/api/sellers/`);
        if (sellersResp.ok) {
          sellersData = await sellersResp.json();
          if (Array.isArray(sellersData) && sellersData.length > 0) {
            setSellers(sellersData.map((s: any) => ({
              id: s.id,
              user_id: s.user_id,
              businessName: s.business_name,
              owner: `Seller Account`,
              status: s.status === 'PENDING' ? 'Pending KYC' : s.status === 'APPROVED' ? 'Approved' : 'Rejected',
              commission: s.commission_rate,
              date: new Date(s.created_at).toLocaleDateString(),
              rating: 4.5,
              kyc_details: s.kyc_details
            })));
          }
        }
      } catch (e) {
        console.warn("Failed to fetch sellers:", e);
      }

      let usersData: any[] = [];
      try {
        const usersResp = await fetch(`${API_URL}/api/users/`);
        if (usersResp.ok) {
          usersData = await usersResp.json();
          if (Array.isArray(usersData) && usersData.length > 0) {
            setUsers(usersData.map((u: any) => ({
              id: u.id,
              name: u.name || 'Bupzo Patron',
              phone: u.phone,
              email: u.email || 'N/A',
              wallet: u.wallet_balance,
              tier: u.is_premium ? 'Premium' : 'Normal',
              status: 'Active',
              risk: parseFloat(u.wallet_balance) > 4000 ? 'Medium' : 'Low',
              isSeller: u.is_seller === true,
              isAdmin: u.is_admin === true,
            })));
          }
        }
      } catch (e) {
        console.warn("Failed to fetch users:", e);
      }


      try {
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
      } catch (e) {
        console.warn("Failed to fetch payouts:", e);
      }

      let couponsData: any[] = [];
      try {
        const couponsResp = await fetch(`${API_URL}/api/coupons/`);
        if (couponsResp.ok) {
          couponsData = await couponsResp.json();
          setCoupons(couponsData);
        }
      } catch (e) {
        console.warn("Failed to fetch coupons:", e);
      }

      try {
        const productsResp = await fetch(`${API_URL}/api/products/`);
        if (productsResp.ok) {
          const productsData = await productsResp.json();
          setProducts(productsData);
        }
      } catch (e) {
        console.warn("Failed to fetch products:", e);
      }

      try {
        const categoriesResp = await fetch(`${API_URL}/api/categories/`);
        if (categoriesResp.ok) {
          const categoriesData = await categoriesResp.json();
          setCategories(categoriesData);
        }
      } catch (e) {
        console.warn("Failed to fetch categories:", e);
      }

      // Fetch disputes from DB
      try {
        const disputesResp = await fetch(`${API_URL}/api/disputes/`);
        if (disputesResp.ok) {
          const disputesData = await disputesResp.json();
          if (Array.isArray(disputesData)) {
            setDisputes(disputesData);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch disputes:", e);
      }

      // Fetch notifications from DB
      try {
        const notifsResp = await fetch(`${API_URL}/api/notifications/`);
        if (notifsResp.ok) {
          const notifsData = await notifsResp.json();
          if (Array.isArray(notifsData)) {
            setNotifications(notifsData);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch notifications:", e);
      }

      // Fetch all wallet transactions from DB
      try {
        const walletResp = await fetch(`${API_URL}/api/wallet/transactions/`);
        if (walletResp.ok) {
          const walletData = await walletResp.json();
          if (Array.isArray(walletData)) {
            setWalletTransactions(walletData);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch wallet transactions:", e);
      }

    } catch (err) {
      console.warn("refreshAllAdminData error:", err);
    }
  };

  // Fetch live backend data on load
  useEffect(() => {
    if (!hasMounted || isLoading) return;
    refreshAllAdminData();
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
            name: u.name || 'Bupzo Patron',
            phone: u.phone,
            email: u.email || 'N/A',
            wallet: u.wallet_balance,
            tier: u.is_premium ? 'Premium' : 'Normal',
            status: 'Active',
            risk: parseFloat(u.wallet_balance) > 4000 ? 'Medium' : 'Low',
            isSeller: u.is_seller === true,
            isAdmin: u.is_admin === true,
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
        await refreshAllAdminData();
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
        await refreshAllAdminData();
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
        await refreshAllAdminData();
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
        await refreshAllAdminData();
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
        alert("Merchant KYC approved successfully!");
        await refreshAllAdminData();
        
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
            risk: parseFloat(u.wallet_balance) > 4000 ? 'Medium' : 'Low',
            isSeller: u.is_seller === true,
            isAdmin: u.is_admin === true
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
              risk: (parseFloat(newUserWallet) || 0) > 4000 ? 'Medium' : 'Low',
              isSeller: false,
              isAdmin: false
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
          risk: (parseFloat(newUserWallet) || 0) > 4000 ? 'Medium' : 'Low',
          isSeller: false,
          isAdmin: false
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

  const handleDeleteUser = async (userId: string) => {
    try {
      if (userId.startsWith('USR-')) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert("User deleted locally.");
        return;
      }
      const resp = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        alert("User deleted successfully!");
        refreshAllAdminData();
      } else {
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert("Deleted locally.");
      }
    } catch (e) {
      console.error(e);
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert("Offline Mode: User deleted locally.");
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
        await refreshAllAdminData();
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

  const handleDeleteProduct = async (productId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        alert("Product deleted successfully!");
        refreshAllAdminData();
      } else {
        setProducts(prev => prev.filter(p => p.id !== productId));
        alert("Deleted locally.");
      }
    } catch (e) {
      console.error(e);
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert("Offline Mode: Product deleted locally.");
    }
  };

  const handleDeleteVoucher = async (couponId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/coupons/${couponId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        alert("Voucher deleted successfully!");
        refreshAllAdminData();
      } else {
        setCoupons(prev => prev.filter(c => c.id !== couponId));
        alert("Deleted locally.");
      }
    } catch (e) {
      console.error(e);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      alert("Offline Mode: Voucher deleted locally.");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        alert("Category deleted successfully!");
        refreshAllAdminData();
      } else {
        alert("Failed to delete category.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting category");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${API_URL}/api/categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, description: newCatDesc })
      });
      if (resp.ok) {
        alert("Category created successfully!");
        setNewCatName('');
        setNewCatDesc('');
        refreshAllAdminData();
      } else {
        alert("Failed to create category.");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating category");
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      const resp = await fetch(`${API_URL}/api/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (resp.ok) {
        alert("Product created successfully!");
        refreshAllAdminData();
      } else {
        const errorData = await resp.json();
        alert(`Failed to create product: ${errorData.detail || 'Server error'}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error creating product on backend.");
    }
  };

  const handleGeneralImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await fetch(`${API_URL}/api/upload/`, {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.url;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const handleUpdateCategory = async (catId: string, name: string, description: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      if (resp.ok) {
        alert("Category updated successfully!");
        refreshAllAdminData();
      } else {
        alert("Failed to update category.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating category");
    }
  };

  const handleUpdateSeller = async (sellerId: string, businessName: string, commission: number, status: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/sellers/${sellerId}?business_name=${encodeURIComponent(businessName)}&commission_rate=${commission}&status=${encodeURIComponent(status)}`, {
        method: 'PUT'
      });
      if (resp.ok) {
        alert("Seller updated successfully!");
        refreshAllAdminData();
      } else {
        alert("Failed to update seller.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating seller");
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/sellers/${sellerId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        alert("Seller deleted successfully!");
        refreshAllAdminData();
      } else {
        alert("Failed to delete seller.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting seller");
    }
  };

  const handleCreateSeller = async (sellerData: any) => {
    try {
      const resp = await fetch(`${API_URL}/api/sellers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerData)
      });
      if (resp.ok) {
        alert("Merchant registered successfully!");
        refreshAllAdminData();
      } else {
        const errorData = await resp.json();
        alert(`Failed to register merchant: ${errorData.detail || 'Server error'}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error registering merchant");
    }
  };

  const handleDeleteWalletTx = async (txId: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/wallet/transactions/${txId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        alert("Wallet transaction deleted successfully!");
        refreshAllAdminData();
      } else {
        alert("Failed to delete wallet transaction.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting wallet transaction");
    }
  };

  const handleEditWalletTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletTx) return;
    try {
      const resp = await fetch(`${API_URL}/api/wallet/transactions/${selectedWalletTx.id}?amount=${parseFloat(editWalletAmount)}&description=${encodeURIComponent(editWalletDesc)}&type=${encodeURIComponent(editWalletType)}`, {
        method: 'PUT'
      });
      if (resp.ok) {
        alert("Wallet transaction updated successfully!");
        setShowEditWalletModal(false);
        setSelectedWalletTx(null);
        refreshAllAdminData();
      } else {
        alert("Failed to update wallet transaction.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating wallet transaction");
    }
  };

  // Preloader / SSR Hydration Shield
  if (!hasMounted || isLoading || isAdminLoggedIn === null) {
    return (
      <div className="min-h-screen bg-[#fff8f4] dark:bg-[#0c0b11] flex items-center justify-center font-sans text-xs font-bold text-[#A6808C] dark:text-[#ccc6dc]">
        Verifying Security Authority...
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#D6CFCB] dark:bg-[#0c0b11] text-[#565264] dark:text-zinc-100 flex items-center justify-center font-sans p-6 w-full">
        <div className="bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <img src="/Bupzo-logo.png" alt="Bupzo Logo" className="w-16 h-16 mx-auto object-contain rounded-xl" />
            <div>
              <h1 className="text-2xl font-bold font-heading text-[#565264] dark:text-[#f3f4f6]">Super Admin Console</h1>
              <p className="text-xs text-zinc-400 font-sans">Restricted access control for Bupzo system operations</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-semibold">
              <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1.5 font-heading">Admin Registration Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                id="admin-phone-input"
                className="w-full p-3.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-charcoal font-mono"
              />
            </div>
            <div className="text-xs font-semibold">
              <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1.5 font-heading">Secure Passcode / OTP</label>
              <input
                type="text"
                placeholder="123456"
                id="admin-otp-input"
                className="w-full p-3.5 text-xs text-center tracking-widest bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-charcoal font-mono"
              />
            </div>
            <button
              onClick={() => {
                const phoneEl = document.getElementById('admin-phone-input') as HTMLInputElement;
                const otpEl = document.getElementById('admin-otp-input') as HTMLInputElement;
                if (!phoneEl?.value || !otpEl?.value) {
                  alert('Please fill out all fields.');
                  return;
                }
                if ((phoneEl.value === '+919876543210' || phoneEl.value === '9876543210') && otpEl.value === '123456') {
                  localStorage.setItem('isAdminLoggedIn', 'true');
                  setIsAdminLoggedIn(true);
                  refreshAllAdminData();
                } else {
                  alert('Access Denied: Only registered admin credentials allowed.');
                }
              }}
              className="w-full bg-[#3f3b4c] dark:bg-zinc-800 text-white py-3 rounded-xl hover:bg-opacity-90 font-bold text-xs transition active:scale-95 shadow"
            >
              Verify Authority &amp; Confirm Identity
            </button>
          </div>

          <div className="text-center font-bold text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
            Demo Credentials: +919876543210 | PIN: 123456
          </div>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Command Center';
      case 'users': return 'User Directory';
      case 'products': return 'Products Catalog';
      case 'merchants': return 'Merchant Directory';
      case 'financials': return 'Wallet & Audit Logs';
      case 'logistics': return 'Logistics Integrations';
      case 'disputes': return 'Dispute & Anomaly Center';
      case 'whatsapp': return 'WhatsApp Marketing';
      case 'vouchers': return 'Promo Vouchers';
      case 'health': return 'System Health Telemetry';
      default: return 'Phoenix Telemetry';
    }
  };

  // Filter & Sort Coupons
  const filteredCoupons = coupons.filter((cp: any) => {
    const s = voucherSearchTerm.toLowerCase();
    return (
      (cp.code || '').toLowerCase().includes(s) ||
      (cp.status || '').toLowerCase().includes(s) ||
      (cp.id || '').toLowerCase().includes(s)
    );
  });

  const sortedCoupons = [...filteredCoupons].sort((a: any, b: any) => {
    if (!voucherSortKey) return 0;
    let aVal = a[voucherSortKey];
    let bVal = b[voucherSortKey];

    if (voucherSortKey === 'discount_percent' || voucherSortKey === 'min_order_value') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }

    if (aVal < bVal) return voucherSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return voucherSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleVoucherSort = (key: string) => {
    if (voucherSortKey === key) {
      setVoucherSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setVoucherSortKey(key);
      setVoucherSortOrder('asc');
    }
  };

  // Filter & Sort Wallet Transactions
  const filteredWalletTransactions = walletTransactions.filter((tx: any) => {
    const s = walletSearchTerm.toLowerCase();
    return (
      (tx.description || '').toLowerCase().includes(s) ||
      (tx.type || '').toLowerCase().includes(s) ||
      (tx.user_id || '').toLowerCase().includes(s) ||
      (tx.id || '').toLowerCase().includes(s)
    );
  });

  const sortedWalletTransactions = [...filteredWalletTransactions].sort((a: any, b: any) => {
    if (!walletSortKey) return 0;
    let aVal = a[walletSortKey];
    let bVal = b[walletSortKey];

    if (walletSortKey === 'amount') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }

    if (aVal < bVal) return walletSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return walletSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleWalletSort = (key: string) => {
    if (walletSortKey === key) {
      setWalletSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setWalletSortKey(key);
      setWalletSortOrder('asc');
    }
  };

  return (
    <div className={`${!hasMounted ? 'bg-[#f9fbfd] text-[#141824]' : (darkMode ? 'dark bg-[#0f111a] text-[#e3e6ed]' : 'bg-[#f9fbfd] text-[#141824]')} min-h-screen font-sans transition-colors duration-300 flex overflow-hidden w-full`}>
      
      {/* Sidebar Navigation */}
      {isAdminSidebarOpen && (
        <div 
          onClick={() => setIsAdminSidebarOpen(false)}
          className="fixed inset-0 bg-on-surface/20 z-40 transition-opacity backdrop-blur-xs"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 ${isSidebarReduced ? 'md:w-20' : 'md:w-[280px]'} w-[280px] z-50 shadow-lg bg-surface flex flex-col h-full py-6 px-4 border-r border-outline-variant transition-all duration-300 ease-in-out transform ${isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-extrabold text-primary tracking-tight">
            {isSidebarReduced ? 'BUP' : 'BUPZO ADMIN'}
          </h2>
          <button 
            onClick={() => setIsAdminSidebarOpen(false)}
            className="text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full flex items-center justify-center transition-colors md:hidden"
            title="Close navigation"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4">
          <ul className="flex flex-col gap-1">
            <li>
              <button 
                onClick={() => { setActiveTab('dashboard'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'dashboard' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="Dashboard"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Dashboard</span>}
              </button>
            </li>
            
            <li>
              <button 
                onClick={() => { setActiveTab('users'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'users' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="User Directory"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'users' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">User Directory</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('products'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'products' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="Products Catalog"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'products' ? "'FILL' 1" : "'FILL' 0" }}>inventory</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Products Catalog</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('merchants'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'merchants' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="Merchant Directory"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'merchants' ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Merchant Directory</span>}
              </button>
            </li>
            
            <li>
              <button 
                onClick={() => { setActiveTab('financials'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'financials' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="Wallet & Audits"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'financials' ? "'FILL' 1" : "'FILL' 0" }}>account_balance_wallet</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Wallet & Audits</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('logistics'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'logistics' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="Logistics API"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'logistics' ? "'FILL' 1" : "'FILL' 0" }}>local_shipping</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Logistics API</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('disputes'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'disputes' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="AI Fraud Center"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'disputes' ? "'FILL' 1" : "'FILL' 0" }}>gavel</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">AI Fraud Center</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('whatsapp'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'whatsapp' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="Marketing Blaster"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'whatsapp' ? "'FILL' 1" : "'FILL' 0" }}>campaign</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Marketing Blaster</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('vouchers'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'vouchers' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="Promo Vouchers"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'vouchers' ? "'FILL' 1" : "'FILL' 0" }}>local_activity</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Promo Vouchers</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('health'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'health' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                title="System Telemetry"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'health' ? "'FILL' 1" : "'FILL' 0" }}>monitoring</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">System Telemetry</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className="pt-4 border-t border-[#e8e1dd] dark:border-[#2f2b3b] mt-auto space-y-1">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-3 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg font-semibold`}
            title={!hasMounted ? 'Switch to Dark Mode' : (darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
          >
            <span>{!hasMounted ? '🌙' : (darkMode ? '☀️' : '🌙')}</span>
            {!isSidebarReduced && <span>{!hasMounted ? 'Dark Mode' : (darkMode ? 'Light Mode' : 'Dark Mode')}</span>}
          </button>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('isAdminLoggedIn');
                setIsAdminLoggedIn(false);
              }
            }}
            className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-semibold`}
            title="Logout Console"
          >
            <span>🔒</span>
            {!isSidebarReduced && <span>Logout Console</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#e8e1dd] dark:border-[#2f2b3b] bg-white/80 dark:bg-[#15131b]/80 backdrop-blur-xl flex items-center justify-between px-8 transition-colors duration-300">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsAdminSidebarOpen(true);
                } else {
                  const val = !isSidebarReduced;
                  setIsSidebarReduced(val);
                  try {
                    localStorage.setItem('admin_sidebar_reduced', val.toString());
                  } catch (e) {}
                }
              }}
              className="text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center mr-2"
              title="Toggle Sidebar"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary font-heading">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Icon & Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#141824] border border-[#e8e1dd] dark:border-[#222834] rounded-2xl shadow-xl z-50 p-4 space-y-3 text-xs text-zinc-900 dark:text-zinc-100">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-bold">Notifications ({notifications.filter(n => !n.read).length})</span>
                    <button 
                      onClick={async () => {
                        for (const n of notifications) {
                          try {
                            await fetch(`${API_URL}/api/notifications/${n.id}/read`, { method: 'POST' });
                          } catch (e) {}
                        }
                        refreshAllAdminData();
                      }}
                      className="text-[#3874ff] hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.filter(n => !n.read).map((n) => (
                      <div 
                        key={n.id}
                        onClick={async () => {
                          try {
                            await fetch(`${API_URL}/api/notifications/${n.id}/read`, { method: 'POST' });
                          } catch (e) {
                            console.warn("Failed to mark notification as read:", e);
                          }
                          if (n.targetTab) {
                            setActiveTab(n.targetTab);
                          }
                          setShowNotificationsDropdown(false);
                          refreshAllAdminData();
                        }}
                        className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 hover:bg-[#3874ff]/5 dark:hover:bg-[#3874ff]/5 border border-transparent hover:border-[#3874ff]/20 cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-[11px] text-[#3874ff]">{n.title}</span>
                          <span className="text-[9px] text-zinc-400 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-normal">{n.body}</p>
                      </div>
                    ))}
                    {notifications.filter(n => !n.read).length === 0 && (
                      <div className="py-8 text-center text-zinc-400 font-medium">No new notifications. All clear!</div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
            <AdminDashboard />
          )}

          {/* TAB 2: USER DIRECTORY */}
          {activeTab === 'users' && (
            <AdminUsers 
              users={users}
              openEditUserModal={openEditUserModal}
              setShowAddUserModal={setShowAddUserModal}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* TAB 3: MERCHANT DIRECTORY */}
          {activeTab === 'merchants' && (
            <AdminSellers 
              sellers={sellers}
              onDeleteSeller={handleDeleteSeller}
              onUpdateSeller={handleUpdateSeller}
              onCreateSeller={handleCreateSeller}
            />
          )}

          {/* TAB 4: WALLLETS & AUDITS */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* Upper row: Grid with Manual Override (col-span-2) and Payouts Queue (col-span-1) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
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

              {/* Lower row: Full width Wallet Transactions Log */}
              <div className="bg-white dark:bg-[#15131b] p-6 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] space-y-4 flex flex-col gap-4">
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#110e16] p-4 rounded-xl border border-zinc-250 dark:border-zinc-800">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
                    <input
                      type="text"
                      placeholder="Search wallet logs..."
                      value={walletSearchTerm}
                      onChange={(e) => setWalletSearchTerm(e.target.value)}
                      className="pl-8 pr-4 py-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="text-zinc-400 text-xs">
                    Showing {sortedWalletTransactions.length} of {walletTransactions.length} records
                  </div>
                </div>

                <h3 className="text-md font-bold font-heading">Wallet Transactions Log</h3>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs font-semibold min-w-[800px]">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none">
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('id')}>
                          Tx ID {walletSortKey === 'id' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('user_id')}>
                          User ID {walletSortKey === 'user_id' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('amount')}>
                          Amount {walletSortKey === 'amount' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('type')}>
                          Type {walletSortKey === 'type' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5">Description</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedWalletTransactions.map((tx: any) => (
                        <tr key={tx.id} className="border-b border-zinc-150 dark:border-zinc-900">
                          <td className="py-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">{tx.id.substring(0,8)}...</td>
                          <td className="py-3 font-mono text-zinc-500">{tx.user_id.substring(0,8)}...</td>
                          <td className={`py-3 font-mono font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ₹{tx.amount}
                          </td>
                          <td className="py-3 font-semibold">{tx.type}</td>
                          <td className="py-3 text-zinc-600 dark:text-zinc-400">{tx.description}</td>
                          <td className="py-3 text-zinc-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => {
                                  setSelectedWalletTx(tx);
                                  setEditWalletAmount(tx.amount.toString());
                                  setEditWalletDesc(tx.description || '');
                                  setEditWalletType(tx.type);
                                  setShowEditWalletModal(true);
                                }}
                                className="bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-2 py-1 rounded text-[10px] font-bold hover:opacity-90"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete transaction "${tx.id}"?`)) {
                                    handleDeleteWalletTx(tx.id);
                                  }
                                }}
                                className="bg-red-500 hover:bg-red-655 text-white px-2 py-1 rounded text-[10px] font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {sortedWalletTransactions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-zinc-400">No transactions recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                 {disputes.map((d: any) => (
                  <div key={d.id} className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{d.id}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${d.risk > 70 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>Risk: {d.risk}%</span>
                    </div>
                    <p className="text-zinc-500">{d.desc || d.description}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">Customer: {d.customer} | Seller: {d.seller}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className={`px-2 py-0.5 rounded font-bold ${d.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{d.status}</span>
                      {d.status !== 'Resolved' && (
                        <button
                          onClick={async () => {
                            try {
                              const resp = await fetch(`${API_URL}/api/disputes/${d.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'Resolved' })
                              });
                              if (resp.ok) {
                                alert(`Dispute ${d.id} marked as Resolved!`);
                                refreshAllAdminData();
                              }
                            } catch (e) {
                              alert("Failed to resolve dispute");
                            }
                          }}
                          className="px-3 py-1 bg-[#3874ff] text-white rounded hover:bg-opacity-90 font-bold active:scale-95 transition"
                        >
                          Resolve Dispute
                        </button>
                      )}
                    </div>
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
            <AdminProducts 
              products={products}
              categories={categories}
              sellers={sellers}
              setSelectedProduct={setSelectedProduct}
              setEditProductName={setEditProductName}
              setEditProductPrice={setEditProductPrice}
              setEditProductQty={setEditProductQty}
              setEditProductDesc={setEditProductDesc}
              setEditProductImage={setEditProductImage}
              setShowEditProductModal={setShowEditProductModal}
              onDeleteProduct={handleDeleteProduct}
              onDeleteCategory={handleDeleteCategory}
              newCatName={newCatName}
              setNewCatName={setNewCatName}
              newCatDesc={newCatDesc}
              setNewCatDesc={setNewCatDesc}
              onCreateCategory={handleCreateCategory}
              onCreateProduct={handleCreateProduct}
              onUpdateCategory={handleUpdateCategory}
              onUploadImage={handleGeneralImageUpload}
            />
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
                <div className="lg:col-span-2 bg-white dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#110e16] p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
                      <input
                        type="text"
                        placeholder="Search coupons..."
                        value={voucherSearchTerm}
                        onChange={(e) => setVoucherSearchTerm(e.target.value)}
                        className="pl-8 pr-4 py-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div className="text-zinc-400 text-xs">
                      Showing {sortedCoupons.length} of {coupons.length} coupons
                    </div>
                  </div>

                  <h3 className="text-md font-bold font-heading">Systemwide Active Coupons</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none">
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('code')}>
                            Code {voucherSortKey === 'code' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('discount_percent')}>
                            Discount {voucherSortKey === 'discount_percent' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('min_order_value')}>
                            Min Order {voucherSortKey === 'min_order_value' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('expiry_date')}>
                            Expiry Date {voucherSortKey === 'expiry_date' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('is_premium_only')}>
                            Premium Only {voucherSortKey === 'is_premium_only' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('status')}>
                            Status {voucherSortKey === 'status' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCoupons.map((cp: any) => (
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
                                <button 
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete coupon "${cp.code}"?`)) {
                                      handleDeleteVoucher(cp.id);
                                    }
                                  }}
                                  className="bg-red-500 hover:bg-red-650 text-white px-2 py-1 rounded text-[10px] font-bold"
                                >
                                  Delete
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

      {/* EDIT WALLET TRANSACTION MODAL */}
      {showEditWalletModal && selectedWalletTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold font-heading mb-4">Edit Wallet Transaction</h3>
            <form onSubmit={handleEditWalletTxSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editWalletAmount} 
                  onChange={(e) => setEditWalletAmount(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Type</label>
                <select
                  value={editWalletType}
                  onChange={(e) => setEditWalletType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                >
                  <option value="REFERRAL">REFERRAL</option>
                  <option value="PURCHASE">PURCHASE</option>
                  <option value="TOPUP">TOPUP</option>
                  <option value="REFUND">REFUND</option>
                  <option value="ADMIN_ADJUSTMENT">ADMIN_ADJUSTMENT</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Description</label>
                <textarea 
                  value={editWalletDesc} 
                  onChange={(e) => setEditWalletDesc(e.target.value)} 
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowEditWalletModal(false); setSelectedWalletTx(null); }}
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
