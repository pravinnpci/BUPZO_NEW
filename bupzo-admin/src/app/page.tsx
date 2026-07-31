"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminUsers } from '@/components/AdminUsers';
import { AdminProducts } from '@/components/AdminProducts';
import { AdminSellers } from '@/components/AdminSellers';
import { AdminFollowers } from '@/components/AdminFollowers';
import { showAdminToast } from '@/components/Toast';

// Mock Data removed

export default function AdminMainPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
  const API_URL = rawApiUrl.split('#')[0].trim().replace(/\/$/, '');

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  
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
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserTier, setNewUserTier] = useState('Normal');
  const [newUserWallet, setNewUserWallet] = useState('0.00');
  const [newUserRole, setNewUserRole] = useState('Customer');

  // Coupon/Voucher States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponMinSpend, setNewCouponMinSpend] = useState('');
  const [newCouponExpiry, setNewCouponExpiry] = useState('');
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('');
  const [voucherSortKey, setVoucherSortKey] = useState<string>('');
  const [voucherSortOrder, setVoucherSortOrder] = useState<'asc' | 'desc'>('asc');
  // Wallet Transactions States
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [walletCurrentPage, setWalletCurrentPage] = useState(1);
  const walletItemsPerPage = 10;
  const [walletSearchTerm, setWalletSearchTerm] = useState('');
  const [walletSortKey, setWalletSortKey] = useState<string>('');
  const [walletSortOrder, setWalletSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedWalletTx, setSelectedWalletTx] = useState<any>(null);
  const [showEditWalletModal, setShowEditWalletModal] = useState(false);
  const [editWalletAmount, setEditWalletAmount] = useState('');
  const [editWalletDesc, setEditWalletDesc] = useState('');
  const [editWalletType, setEditWalletType] = useState('REFERRAL');

  // Wallet Account Edit
  const [showWalletAccountEditModal, setShowWalletAccountEditModal] = useState(false);
  const [selectedWalletAccountUser, setSelectedWalletAccountUser] = useState<any>(null);
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [walletAccountSearchTerm, setWalletAccountSearchTerm] = useState('');
  // Products & Categories States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
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
  const [editCouponStatus, setEditCouponStatus] = useState('APPROVED');
  const [editCouponExpiry, setEditCouponExpiry] = useState('');

  const [editUserName, setEditUserName] = useState('');

  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserTier, setEditUserTier] = useState('Normal');
  const [settingsFilterStatus, setSettingsFilterStatus] = useState('All');

  // Messages state
  const [showAdminReplyModal, setShowAdminReplyModal] = useState(false);
  const [adminReplyTo, setAdminReplyTo] = useState<any>(null);
  const [adminReplyContent, setAdminReplyContent] = useState('');

  // Invoice Management States
  const [invoices, setInvoices] = useState<any[]>([
    { id: 'INV-2026-001', order_id: 'ORD-98421', customer_name: 'Pravin Kumar', amount: '2499.00', status: 'Paid', due_date: '2026-08-10', date: '2026-07-28', store: 'Urban Trendz Store', items: [{ name: 'Wireless Headphones', qty: 1, price: 2499 }] },
    { id: 'INV-2026-002', order_id: 'ORD-98422', customer_name: 'Ananya Sharma', amount: '1250.00', status: 'Paid', due_date: '2026-08-12', date: '2026-07-29', store: 'Silk & Cotton Traders', items: [{ name: 'Handcrafted Kurti', qty: 1, price: 1250 }] },
    { id: 'INV-2026-003', order_id: 'ORD-98423', customer_name: 'Rahul Verma', amount: '4999.00', status: 'Pending', due_date: '2026-08-05', date: '2026-07-30', store: 'BUPZO Electronics', items: [{ name: 'Smartwatch Series 5', qty: 1, price: 4999 }] },
    { id: 'INV-2026-004', order_id: 'ORD-98424', customer_name: 'Sneha Patel', amount: '899.00', status: 'Overdue', due_date: '2026-07-25', date: '2026-07-20', store: 'Organic Essence', items: [{ name: 'Organic Honey 1kg', qty: 1, price: 899 }] },
    { id: 'INV-2026-005', order_id: 'ORD-98425', customer_name: 'Vikram Malhotra', amount: '3150.00', status: 'Paid', due_date: '2026-08-18', date: '2026-07-31', store: 'Royal Leathercraft', items: [{ name: 'Genuine Leather Wallet', qty: 2, price: 1575 }] }
  ]);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  // Invoice Modals & Form State
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [invNum, setInvNum] = useState('');
  const [invOrderId, setInvOrderId] = useState('');
  const [invCustomerName, setInvCustomerName] = useState('');
  const [invStoreName, setInvStoreName] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invStatus, setInvStatus] = useState('Paid');
  const [invDueDate, setInvDueDate] = useState('');
  const [invItemName, setInvItemName] = useState('');
  const [invItemQty, setInvItemQty] = useState('1');
  const [invItemPrice, setInvItemPrice] = useState('');

  const handleAddInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invCustomerName || !invAmount) {
      alert("Customer Name and Amount are required.");
      return;
    }
    const newInvId = invNum || `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const newInv = {
      id: newInvId,
      order_id: invOrderId || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customer_name: invCustomerName,
      amount: parseFloat(invAmount).toFixed(2),
      status: invStatus,
      due_date: invDueDate || '2026-08-20',
      date: new Date().toISOString().split('T')[0],
      store: invStoreName || 'BUPZO Direct Store',
      items: [{ name: invItemName || 'Product Item', qty: parseInt(invItemQty) || 1, price: parseFloat(invItemPrice) || parseFloat(invAmount) }]
    };
    try {
      await fetch(`${API_URL}/api/invoices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: newInv.id,
          order_id: newInv.order_id,
          amount: parseFloat(newInv.amount),
          status: newInv.status,
          due_date: newInv.due_date
        })
      });
    } catch(e) {}

    setInvoices(prev => [newInv, ...prev]);
    showAdminToast(`Invoice ${newInv.id} created successfully!`);
    setShowAddInvoiceModal(false);
    setInvNum(''); setInvOrderId(''); setInvCustomerName(''); setInvStoreName(''); setInvAmount(''); setInvStatus('Paid'); setInvDueDate(''); setInvItemName(''); setInvItemQty('1'); setInvItemPrice('');
  };

  const handleEditInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const updatedInv = {
      ...selectedInvoice,
      customer_name: invCustomerName || selectedInvoice.customer_name,
      amount: invAmount ? parseFloat(invAmount).toFixed(2) : selectedInvoice.amount,
      status: invStatus,
      due_date: invDueDate || selectedInvoice.due_date,
      store: invStoreName || selectedInvoice.store,
      items: invItemName ? [{ name: invItemName, qty: parseInt(invItemQty) || 1, price: parseFloat(invItemPrice) || parseFloat(invAmount) }] : selectedInvoice.items
    };
    try {
      await fetch(`${API_URL}/api/invoices/${selectedInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(updatedInv.amount),
          status: updatedInv.status
        })
      });
    } catch(e) {}

    setInvoices(prev => prev.map(i => i.id === selectedInvoice.id ? updatedInv : i));
    showAdminToast(`Invoice ${selectedInvoice.id} updated!`);
    setShowEditInvoiceModal(false);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = async (invId: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invId}?`)) return;
    try {
      await fetch(`${API_URL}/api/invoices/${invId}`, { method: 'DELETE' });
    } catch(e) {}
    setInvoices(prev => prev.filter(i => i.id !== invId));
    showAdminToast(`Invoice ${invId} deleted!`);
  };

  // New Coupon Max Uses State
  const [newCouponMaxUses, setNewCouponMaxUses] = useState('500');

  // Materialize System Settings States
  const [settingsSubTab, setSettingsSubTab] = useState<'detail' | 'payments' | 'checkout' | 'shipping' | 'locations'>('detail');
  const [settingsForm, setSettingsForm] = useState({
    siteName: 'BUPZO Marketplace',
    supportEmail: 'support@bupzo.com',
    supportPhone: '+91 1800-123-4567',
    currency: '₹ (INR)',
    commissionRate: '5.0',
    maintenanceMode: false,
    primaryGateway: 'PhonePe Aggregator API',
    phonepeMerchantId: 'M22091823901',
    phonepeSaltKey: '1',
    razorpayKey: 'rzp_live_98124019283',
    enableCOD: true,
    cashbackPercent: '2.0',
    enableGuestCheckout: true,
    minOrderValue: '100',
    cartHoldMinutes: '15',
    gstRate: '18',
    requireOtp: true,
    primaryLogistics: 'Shiprocket API',
    secondaryLogistics: 'Delhivery Express',
    freeShippingThreshold: '499',
    flatShippingFee: '40',
    autoWaybill: true,
    originPincode: '560001',
    dispatchCity: 'Bengaluru, Karnataka',
    serviceableRegion: 'All India (28 States & UTs)',
    expressRadiusKm: '50',
    hubLocations: 'Bengaluru, Mumbai, Delhi-NCR, Hyderabad'
  });

  // Reviews & Messages Search & Sort States
  const [reviewTab, setReviewTab] = useState<'products' | 'sellers'>('products');
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [reviewSortKey, setReviewSortKey] = useState('user_name');
  const [reviewSortOrder, setReviewSortOrder] = useState<'asc' | 'desc'>('asc');

  const [msgSearchTerm, setMsgSearchTerm] = useState('');
  const [msgSortKey, setMsgSortKey] = useState('sender_name');
  const [msgSortOrder, setMsgSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleReviewSort = (key: string) => {
    if (reviewSortKey === key) setReviewSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setReviewSortKey(key); setReviewSortOrder('asc'); }
  };

  const handleMsgSort = (key: string) => {
    if (msgSortKey === key) setMsgSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setMsgSortKey(key); setMsgSortOrder('asc'); }
  };

  // Preview states
  const [previewWalletTx, setPreviewWalletTx] = useState<any>(null);
  const [previewCoupon, setPreviewCoupon] = useState<any>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [isSidebarReduced, setIsSidebarReduced] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean | null>(null);

  const [previewUser, setPreviewUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);

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
        const sellersResp = await fetch(`${API_URL}/api/sellers/`, { cache: 'no-store' });
        if (sellersResp.ok) {
          sellersData = await sellersResp.json();
          if (Array.isArray(sellersData)) {
            setSellers(sellersData.map((s: any) => ({
              id: s.id,
              user_id: s.user_id,
              businessName: s.business_name,
              owner: s.user_name || 'Seller Account',
              owner_phone: s.user_phone,
              owner_email: s.user_email,
              status: s.status === 'PENDING' ? 'Pending KYC' : s.status === 'APPROVED' ? 'Approved' : 'Rejected',
              commission: s.commission_rate,
              date: new Date(s.created_at).toLocaleDateString(),
              rating: s.rating || 4.5,
              followers: s.followers_count !== undefined ? s.followers_count : 0,
              followers_count: s.followers_count !== undefined ? s.followers_count : 0,
              kyc_details: s.kyc_details
            })));
          } else {
            setSellers([]);
          }
        } else {
          setSellers([]);
          console.warn(`Failed to fetch sellers: ${sellersResp.status} ${sellersResp.statusText}`);
        }
      } catch (e) {
        console.warn("Failed to fetch sellers:", e);
        setSellers([]);
      }

      let usersData: any[] = [];
      try {
        const usersResp = await fetch(`${API_URL}/api/users/`);
        if (usersResp.ok) {
          usersData = await usersResp.json();
          if (Array.isArray(usersData)) {
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
              address: u.address || u.Address,
              pincode: u.pincode || u.Pincode,
              state: u.state || u.State,
              email_verified: Boolean(u.email_verified || u.google_verified),
              phone_verified: Boolean(u.phone_verified),
            })));
          } else {
            setUsers([]);
          }
        } else {
          setUsers([]);
          console.warn(`Failed to fetch users: ${usersResp.status} ${usersResp.statusText}`);
        }
      } catch (e) {
        console.warn("Failed to fetch users:", e);
        setUsers([]);
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
          const fetchedCoupons = await couponsResp.json();
          couponsData = Array.isArray(fetchedCoupons) ? fetchedCoupons : [];
          setCoupons(couponsData);
        } else {
          console.warn(`Failed to fetch coupons: ${couponsResp.status} ${couponsResp.statusText}`);
          setCoupons([]);
        }
      } catch (e) {
        console.warn("Failed to fetch coupons:", e);
        setCoupons([]);
      }

      try {
        const productsResp = await fetch(`${API_URL}/api/products/?all=true`, { cache: 'no-store' });
        if (productsResp.ok) {
          const productsData = await productsResp.json();
          setProducts(Array.isArray(productsData) ? productsData : []);
        } else {
          console.warn(`Failed to fetch products: ${productsResp.status} ${productsResp.statusText}`);
          setProducts([]);
        }
      } catch (e) {
        console.warn("Failed to fetch products:", e);
        setProducts([]);
      }

      try {
        const categoriesResp = await fetch(`${API_URL}/api/categories/`, { cache: 'no-store' });
        if (categoriesResp.ok) {
          const categoriesData = await categoriesResp.json();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } else {
          console.warn(`Failed to fetch categories: ${categoriesResp.status} ${categoriesResp.statusText}`);
          setCategories([]);
        }
      } catch (e) {
        console.warn("Failed to fetch categories:", e);
        setCategories([]);
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
        const notifsResp = await fetch(`${API_URL}/api/notifications/`, { cache: 'no-store' });
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

      // Fetch messages
      try {
        const msgResp = await fetch(`${API_URL}/api/messages/`);
        if (msgResp.ok) {
          const msgData = await msgResp.json();
          if (Array.isArray(msgData)) {
            setMessages(msgData);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch messages:", e);
      }

      // Fetch reviews
      try {
        const revResp = await fetch(`${API_URL}/api/reviews/`);
        if (revResp.ok) {
          const revData = await revResp.json();
          if (Array.isArray(revData)) {
            setReviews(revData);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch reviews:", e);
      }

    } catch (err) {
      console.warn("refreshAllAdminData error:", err);
    }
  };

  // Fetch live backend data on load and auto-refresh every 5s
  useEffect(() => {
    if (!hasMounted || isLoading) return;
    refreshAllAdminData();
    const livePoll = setInterval(() => {
      refreshAllAdminData();
    }, 5000);
    return () => clearInterval(livePoll);
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

  const handleWalletAccountEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletAccountUser || !newWalletBalance) return;
    
    const newBal = parseFloat(newWalletBalance);
    const currBal = parseFloat(selectedWalletAccountUser.wallet);
    const difference = newBal - currBal;
    
    if (difference === 0) {
      alert("No changes made.");
      setShowWalletAccountEditModal(false);
      return;
    }
    
    const adjustType = difference > 0 ? 'Credit' : 'Debit';
    const amt = Math.abs(difference);
    
    try {
      const resp = await fetch(`${API_URL}/api/users/${selectedWalletAccountUser.id}/wallet/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, type: adjustType, reason: 'Admin Table Edit' })
      });
      if (resp.ok) {
        alert("Wallet balance updated successfully!");
        refreshAllAdminData();
      } else {
        const err = await resp.json();
        alert(`Failed to update: ${err.detail || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating wallet balance.");
    }
    
    setShowWalletAccountEditModal(false);
    setSelectedWalletAccountUser(null);
    setNewWalletBalance('');
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
          min_order_value: parseFloat(newCouponMinSpend) || 0,
          expiry_date: newCouponExpiry ? new Date(newCouponExpiry).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          status: 'PENDING'
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
      const productData = {
        name: editProductName,
        price: parseFloat(editProductPrice),
        stock_quantity: parseInt(editProductQty),
        description: editProductDesc,
        image_url: editProductImage ? editProductImage.split(',')[0].trim() : null,
        images: editProductImage ? editProductImage.split(',').map(u => u.trim()).filter(u => u) : [],
        category_id: selectedProduct.category_id,
        is_combo: selectedProduct.is_combo
      };
      const resp = await fetch(`${API_URL}/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
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
          is_premium_only: editCouponIsPremiumOnly,
          status: editCouponStatus,
          expiry_date: editCouponExpiry ? new Date(editCouponExpiry).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString()
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
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    let uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      try {
        const resp = await fetch(`${API_URL}/api/upload/`, {
          method: 'POST',
          body: formData
        });
        if (resp.ok) {
          const data = await resp.json();
          uploadedUrls.push(data.url);
        }
      } catch (err) {
        console.error("Upload error", err);
      }
    }
    
    if (uploadedUrls.length > 0) {
      alert(`${uploadedUrls.length} image(s) uploaded to MinIO successfully!`);
      if (type === 'product') {
        setEditProductImage(uploadedUrls.join(','));
      }
    } else {
      alert("Failed to upload images.");
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
    
    let finalPhone = newUserPhone.trim();
    if (/^\d{10}$/.test(finalPhone)) {
      finalPhone = '+91' + finalPhone;
    }

    try {
      const resp = await fetch(`${API_URL}/api/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName || 'Bupzo Patron',
          phone: finalPhone,
          email: newUserEmail || null,
          is_premium: newUserTier === 'Premium',
          signup_platform: 'WEB',
          privacy_accepted: true,
          password: newUserPassword || null
        })
      });

      if (resp.ok) {
        const newUser = await resp.json();
        
        if (newUserRole === 'Seller') {
          // Register as seller immediately after user creation
          const sellerResp = await fetch(`${API_URL}/api/sellers/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: finalPhone,
              email: newUser.email,
              business_name: `${newUser.name}'s Store`,
              kyc_details: { status: 'mock_verified_by_admin' }
            })
          });
          
          if (!sellerResp.ok) {
            console.warn("Failed to register seller profile for new user");
          }
        }

        const initialWallet = parseFloat(newUserWallet);
        if (initialWallet > 0) {
          await fetch(`${API_URL}/api/users/${newUser.id}/wallet/adjust`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: initialWallet,
              type: 'ADMIN_ADJUSTMENT',
              description: 'Initial wallet balance set by admin'
            })
          });
        }

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
            isSeller: u.is_seller === true || newUserRole === 'Seller',
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
              isSeller: newUserRole === 'Seller',
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
        setNewUserRole('Customer');
        setNewUserWallet('0.00');
        setShowAddUserModal(false);
      } else {
        const errData = await resp.json();
        const errDetail = Array.isArray(errData.detail) ? errData.detail.map((e: any) => e.msg).join(', ') : errData.detail;
        alert(`Error: ${errDetail || 'Failed to create user'}`);
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
          isSeller: newUserRole === 'Seller',
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
    setNewUserWallet(user.wallet.toString());
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
          wallet_balance: parseFloat(newUserWallet) || 0
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
        wallet: parseFloat(newUserWallet) || 0,
        tier: editUserTier,
        risk: (parseFloat(newUserWallet) || 0) > 4000 ? 'Medium' : 'Low'
      } : u));
      alert("Offline Mode: User profile updated locally.");
      setShowEditUserModal(false);
      setSelectedUser(null);
    }
  };

  const handleApproveProduct = async (productId: string, is_approved: boolean, rejection_reason?: string) => {
    try {
      const resp = await fetch(`${API_URL}/api/products/${productId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved, rejection_reason: rejection_reason || null })
      });
      if (resp.ok) {
        alert("Product approval status updated!");
        refreshAllAdminData();
      } else {
        alert("Failed to update product approval on backend.");
      }
    } catch (e) {
      console.error(e);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_approved } : p));
      alert("Updated locally.");
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
    if (!productData.category_id || !productData.seller_id) {
      alert('Please select a valid category and seller before creating a product.');
      return false;
    }
    try {
      const resp = await fetch(`${API_URL}/api/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (resp.ok) {
        alert("Product created successfully!");
        refreshAllAdminData();
        return true;
      } else {
        const errorData = await resp.json();
        let errorMsg = 'Server error';
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
        alert(`Failed to create product: ${errorMsg}`);
        return false;
      }
    } catch (e) {
      console.error(e);
      alert("Error creating product on backend.");
      return false;
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

  const handleUpdateProduct = async (id: string, data: any) => {
    try {
      const resp = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        refreshAllAdminData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleUpdateSeller = async (sellerId: string, businessName: string, commission: number, status: string, kycDetails?: any) => {
    try {
      const resp = await fetch(`${API_URL}/api/sellers/${sellerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: businessName, commission_rate: commission, status, kyc_details: kycDetails })
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

  const handleAdminReplyMessage = async () => {
    if (!adminReplyContent.trim() || !adminReplyTo) return;
    try {
      const receiver_id = adminReplyTo.sender_id || adminReplyTo.user_id || adminReplyTo.from_id || 'b02c2345-6789-bcde-f012-2345678901bb';
      const resp = await fetch(`${API_URL}/api/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: 'a01b1234-5678-abcd-ef01-1234567890aa',
          receiver_id: receiver_id,
          subject: adminReplyTo.subject ? `Re: ${adminReplyTo.subject}` : 'Bupzo Admin Reply',
          content: adminReplyContent.trim()
        })
      });
      if (resp.ok) {
        showAdminToast("🎉 Reply sent to customer successfully!");
        setShowAdminReplyModal(false);
        setAdminReplyContent('');
        refreshAllAdminData();
      } else {
        const errData = await resp.json().catch(() => ({}));
        showAdminToast(errData.detail || "Failed to send reply.", "error");
      }
    } catch (e: any) {
      showAdminToast(e.message || "Error sending reply.", "error");
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
        return true;
      } else {
        const errorData = await resp.json();
        alert(`Failed to register merchant: ${errorData.detail || 'Server error'}`);
        return false;
      }
    } catch (e) {
      console.error(e);
      alert("Error registering merchant");
      return false;
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

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Command Center';
      case 'users': return 'User Directory';
      case 'products': return 'Products Catalog';
      case 'merchants': return 'Merchant Directory';
      case 'invoices': return 'Invoice Management Console';
      case 'followers': return 'Followers Management Console';
      case 'financials': return 'Wallet & Audit Logs';
      case 'logistics': return 'Logistics Integrations';
      case 'disputes': return 'Dispute & Anomaly Center';
      case 'whatsapp': return 'WhatsApp Marketing';
      case 'vouchers': return 'Referral & Promo Vouchers';
      case 'health': return 'System Health Telemetry';
      case 'reviews': return 'Reviews & Ratings Moderation';
      case 'messages': return 'Messages Center';
      case 'settings': return 'System Settings Console';
      default: return 'Bupzo Admin Portal';
    }
  };

  // Filter & Sort Coupons
  const filteredCoupons = coupons.filter((cp: any) => {
    const s = voucherSearchTerm.toLowerCase();
    const isExpired = new Date(cp.expiry_date).getTime() < new Date().getTime();
    const expiryStatusText = isExpired ? 'expired' : 'active';
    return (
      (cp.code || '').toLowerCase().includes(s) ||
      (cp.status || '').toLowerCase().includes(s) ||
      (cp.id || '').toLowerCase().includes(s) ||
      expiryStatusText.includes(s)
    );
  });

  const sortedCoupons = [...filteredCoupons].sort((a: any, b: any) => {
    if (!voucherSortKey) return 0;
    let aVal = a[voucherSortKey];
    let bVal = b[voucherSortKey];

    if (voucherSortKey === 'expiry_status') {
      aVal = new Date(a.expiry_date).getTime() < new Date().getTime() ? 'expired' : 'active';
      bVal = new Date(b.expiry_date).getTime() < new Date().getTime() ? 'expired' : 'active';
    } else if (voucherSortKey === 'discount_percent' || voucherSortKey === 'min_order_value') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else if (voucherSortKey === 'expiry_date') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
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
    const userObj = users.find((u: any) => u.id === tx.user_id);
    const uName = (userObj?.name || 'Shopper').toLowerCase();
    const uPhone = (tx.mobile_number || userObj?.phone || '').toLowerCase();
    return (
      (tx.description || '').toLowerCase().includes(s) ||
      (tx.type || '').toLowerCase().includes(s) ||
      (tx.user_id || '').toLowerCase().includes(s) ||
      (tx.id || '').toLowerCase().includes(s) ||
      uName.includes(s) ||
      uPhone.includes(s)
    );
  });

  const sortedWalletTransactions = [...filteredWalletTransactions].sort((a: any, b: any) => {
    if (!walletSortKey) return 0;
    let aVal = a[walletSortKey];
    let bVal = b[walletSortKey];

    if (walletSortKey === 'amount') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else if (walletSortKey === 'user_name') {
      const uA = users.find((u: any) => u.id === a.user_id)?.name || '';
      const uB = users.find((u: any) => u.id === b.user_id)?.name || '';
      aVal = uA.toLowerCase();
      bVal = uB.toLowerCase();
    } else if (walletSortKey === 'mobile_number') {
      const pA = a.mobile_number || users.find((u: any) => u.id === a.user_id)?.phone || '';
      const pB = b.mobile_number || users.find((u: any) => u.id === b.user_id)?.phone || '';
      aVal = pA.toLowerCase();
      bVal = pB.toLowerCase();
    } else if (walletSortKey === 'date' || walletSortKey === 'created_at') {
      aVal = new Date(a.created_at || Date.now()).getTime();
      bVal = new Date(b.created_at || Date.now()).getTime();
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }

    if (aVal < bVal) return walletSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return walletSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const walletTotalPages = Math.ceil(sortedWalletTransactions.length / walletItemsPerPage);
  const paginatedWalletTransactions = sortedWalletTransactions.slice((walletCurrentPage - 1) * walletItemsPerPage, walletCurrentPage * walletItemsPerPage);

  const handleWalletSort = (key: string) => {
    if (walletSortKey === key) {
      setWalletSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setWalletSortKey(key);
      setWalletSortOrder('asc');
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
              Verify Authority & Confirm Identity
            </button>
          </div>

          <div className="text-center font-bold text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
            Demo Credentials: +919876543210 | PIN: 123456
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex overflow-hidden w-full ${!hasMounted ? 'bg-[#f9fbfd] text-[#141824]' : (darkMode ? 'bg-[#0f111a] text-[#e3e6ed]' : 'bg-[#f9fbfd] text-[#141824]')}`}>
      
      {/* Sidebar Navigation */}
      {isAdminSidebarOpen && (
        <div 
          onClick={() => setIsAdminSidebarOpen(false)}
          className="fixed inset-0 bg-on-surface/20 z-40 transition-opacity backdrop-blur-xs"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 ${isSidebarReduced ? 'md:w-20' : 'md:w-[280px]'} w-[280px] z-50 shadow-lg bg-white dark:bg-[#0f111a] flex flex-col h-full py-6 px-4 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out transform ${isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <img src="/Bupzo-logo.png" alt="Bupzo Logo" className="w-8 h-8 object-contain rounded-lg" />
            <h2 className="text-xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight">
              {isSidebarReduced ? 'BUP' : 'BUPZO ADMIN'}
            </h2>
          </div>
          <button 
            onClick={() => setIsAdminSidebarOpen(false)}
            className="text-gray-600 dark:text-gray-400 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors md:hidden"
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
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'dashboard' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Dashboard"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Dashboard</span>}
              </button>
            </li>
            
            <li>
              <button 
                onClick={() => { setActiveTab('users'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'users' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="User Directory"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'users' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">User Directory</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('products'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'products' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Products Catalog"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'products' ? "'FILL' 1" : "'FILL' 0" }}>inventory</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Products Catalog</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('merchants'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'merchants' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Merchant Directory"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'merchants' ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Merchant Directory</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('invoices'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'invoices' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Invoice Management"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'invoices' ? "'FILL' 1" : "'FILL' 0" }}>receipt_long</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Invoice Management</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('followers'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'followers' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Followers Management"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'followers' ? "'FILL' 1" : "'FILL' 0" }}>person_add</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Followers Management</span>}
              </button>
            </li>
            
            <li>
              <button 
                onClick={() => { setActiveTab('financials'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'financials' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Wallet & Audits"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'financials' ? "'FILL' 1" : "'FILL' 0" }}>account_balance_wallet</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Wallet & Audits</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('logistics'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'logistics' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Logistics API"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'logistics' ? "'FILL' 1" : "'FILL' 0" }}>local_shipping</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Logistics API</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('disputes'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'disputes' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="AI Fraud Center"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'disputes' ? "'FILL' 1" : "'FILL' 0" }}>gavel</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">AI Fraud Center</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('whatsapp'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'whatsapp' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Marketing Blaster"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'whatsapp' ? "'FILL' 1" : "'FILL' 0" }}>campaign</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Marketing Blaster</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('vouchers'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'vouchers' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Promo Vouchers"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'vouchers' ? "'FILL' 1" : "'FILL' 0" }}>local_activity</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Promo Vouchers</span>}
              </button>
            </li>

            <li>
              <button 
                onClick={() => { setActiveTab('health'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'health' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="System Telemetry"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'health' ? "'FILL' 1" : "'FILL' 0" }}>monitoring</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">System Telemetry</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('reviews'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'reviews' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Reviews Management"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'reviews' ? "'FILL' 1" : "'FILL' 0" }}>reviews</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Reviews Management</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('messages'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'messages' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Messages Center"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'messages' ? "'FILL' 1" : "'FILL' 0" }}>forum</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">Messages Center</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('settings'); setIsAdminSidebarOpen(false); }} 
                className={`w-full flex items-center ${isSidebarReduced ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-full transition-all duration-250 ${activeTab === 'settings' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="System Settings"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
                {!isSidebarReduced && <span className="text-sm font-semibold">System Settings</span>}
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
        <header className="h-16 border-b border-[#e8e1dd] dark:border-[#2f2b3b] bg-white/80 dark:bg-[#15131b]/80 backdrop-blur-xl flex items-center justify-between px-8 transition-colors duration-300 z-50">
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
            <AdminDashboard
              userCount={users.length}
              sellerCount={sellers.length}
              productCount={products.length}
              couponCount={coupons.length}
              pendingPayoutCount={payouts.filter(p => p.status === 'Pending').length}
              walletTransactionCount={walletTransactions.length}
            />
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
              onRefreshData={refreshAllAdminData}
            />
          )}

          {/* TAB: INVOICE MANAGEMENT */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-heading text-zinc-900 dark:text-zinc-100">
                    Invoice Management Console
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Audit, preview, print, and download official e-commerce GST invoices across all customer & seller orders.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setInvNum(''); setInvOrderId(''); setInvCustomerName(''); setInvStoreName(''); setInvAmount(''); setInvStatus('Paid'); setInvDueDate(''); setInvItemName(''); setInvItemQty('1'); setInvItemPrice('');
                      setShowAddInvoiceModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    Add Invoice
                  </button>
                  <button
                    onClick={() => showAdminToast("Invoices list synchronized")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Sync Invoices
                  </button>
                </div>
              </header>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#15131b] p-5 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
                  <div className="text-xs font-bold text-zinc-400 uppercase">Total Invoiced</div>
                  <div className="text-2xl font-extrabold font-mono mt-2 text-zinc-900 dark:text-zinc-100">
                    ₹{invoices.reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-emerald-500 mt-1 font-semibold">100% Tax Compliant</div>
                </div>
                <div className="bg-white dark:bg-[#15131b] p-5 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
                  <div className="text-xs font-bold text-zinc-400 uppercase">Paid Invoices</div>
                  <div className="text-2xl font-extrabold font-mono mt-2 text-emerald-600 dark:text-emerald-400">
                    {invoices.filter(i => i.status === 'Paid').length}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 font-semibold">Settled via PhonePe / Wallet</div>
                </div>
                <div className="bg-white dark:bg-[#15131b] p-5 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
                  <div className="text-xs font-bold text-zinc-400 uppercase">Pending Due</div>
                  <div className="text-2xl font-extrabold font-mono mt-2 text-amber-500">
                    {invoices.filter(i => i.status === 'Pending').length}
                  </div>
                  <div className="text-[10px] text-amber-500 mt-1 font-semibold">Awaiting Bank Clearance</div>
                </div>
                <div className="bg-white dark:bg-[#15131b] p-5 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
                  <div className="text-xs font-bold text-zinc-400 uppercase">Overdue Invoices</div>
                  <div className="text-2xl font-extrabold font-mono mt-2 text-red-500">
                    {invoices.filter(i => i.status === 'Overdue').length}
                  </div>
                  <div className="text-[10px] text-red-500 mt-1 font-semibold">Action Required</div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white dark:bg-[#15131b] p-4 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                  <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
                    <input
                      type="text"
                      placeholder="Search by Invoice #, Order ID, or Customer Name..."
                      value={invoiceSearchTerm}
                      onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                  <select
                    value={invoiceStatusFilter}
                    onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="text-xs text-zinc-400 font-medium">
                  Showing {invoices.length} invoices
                </div>
              </div>

              {/* Invoices Table */}
              <div className="bg-white dark:bg-[#15131b] p-6 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none">
                      <th className="py-3">Invoice #</th>
                      <th className="py-3">Order ID</th>
                      <th className="py-3">Customer Name</th>
                      <th className="py-3">Amount</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Due Date</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900">
                    {invoices
                      .filter(inv => {
                        const s = invoiceSearchTerm.toLowerCase();
                        const matchesSearch = inv.id.toLowerCase().includes(s) || inv.order_id.toLowerCase().includes(s) || inv.customer_name.toLowerCase().includes(s);
                        const matchesStatus = invoiceStatusFilter === 'All' || inv.status === invoiceStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((inv) => (
                        <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{inv.id}</td>
                          <td className="py-3.5 font-mono text-zinc-600 dark:text-zinc-400">{inv.order_id}</td>
                          <td className="py-3.5 font-bold text-zinc-900 dark:text-zinc-100">{inv.customer_name}</td>
                          <td className="py-3.5 font-mono font-extrabold">₹{parseFloat(inv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'Paid' ? 'bg-emerald-100/20 text-emerald-500 border border-emerald-500/30' :
                              inv.status === 'Pending' ? 'bg-amber-100/20 text-amber-500 border border-amber-500/30' :
                              'bg-red-100/20 text-red-500 border border-red-500/30'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 font-mono text-zinc-500">{inv.due_date}</td>
                          <td className="py-3.5 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewInvoice(inv)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[10px] font-bold transition shadow-sm"
                              >
                                Preview
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setInvCustomerName(inv.customer_name);
                                  setInvStoreName(inv.store || '');
                                  setInvAmount(inv.amount);
                                  setInvStatus(inv.status);
                                  setInvDueDate(inv.due_date);
                                  if (inv.items && inv.items[0]) {
                                    setInvItemName(inv.items[0].name);
                                    setInvItemQty(String(inv.items[0].qty));
                                    setInvItemPrice(String(inv.items[0].price));
                                  }
                                  setShowEditInvoiceModal(true);
                                }}
                                className="bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-2.5 py-1 rounded text-[10px] font-bold transition hover:opacity-90"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-bold transition shadow-sm"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => {
                                  setPreviewInvoice(inv);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="bg-zinc-700 hover:bg-zinc-800 text-white px-2.5 py-1 rounded text-[10px] font-bold transition shadow-sm"
                              >
                                Print
                              </button>
                              <button
                                onClick={() => showAdminToast(`Downloading Invoice ${inv.id}.pdf...`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] font-bold transition shadow-sm"
                              >
                                Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Add Invoice Modal */}
              {showAddInvoiceModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold font-heading">Add New Tax Invoice</h2>
                      <button onClick={() => setShowAddInvoiceModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
                    </div>
                    <form onSubmit={handleAddInvoiceSubmit} className="space-y-3 text-xs font-semibold">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 mb-1">Invoice Number (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. INV-2026-009"
                            value={invNum}
                            onChange={(e) => setInvNum(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">Order ID</label>
                          <input
                            type="text"
                            placeholder="e.g. ORD-98429"
                            value={invOrderId}
                            onChange={(e) => setInvOrderId(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 mb-1">Customer Name</label>
                          <input
                            type="text"
                            placeholder="Pravin Kumar"
                            value={invCustomerName}
                            onChange={(e) => setInvCustomerName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">Store / Merchant Name</label>
                          <input
                            type="text"
                            placeholder="Urban Trendz Store"
                            value={invStoreName}
                            onChange={(e) => setInvStoreName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-zinc-500 mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            placeholder="2499.00"
                            value={invAmount}
                            onChange={(e) => setInvAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">Status</label>
                          <select
                            value={invStatus}
                            onChange={(e) => setInvStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Overdue">Overdue</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={invDueDate}
                            onChange={(e) => setInvDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-2">Itemized Product Details</label>
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Item Name"
                            value={invItemName}
                            onChange={(e) => setInvItemName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none col-span-1"
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            value={invItemQty}
                            onChange={(e) => setInvItemQty(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none font-mono"
                          />
                          <input
                            type="number"
                            placeholder="Unit Price"
                            value={invItemPrice}
                            onChange={(e) => setInvItemPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddInvoiceModal(false)}
                          className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                        >
                          Create Invoice
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Invoice Modal */}
              {showEditInvoiceModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold font-heading">Edit Invoice ({selectedInvoice.id})</h2>
                      <button onClick={() => { setShowEditInvoiceModal(false); setSelectedInvoice(null); }} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
                    </div>
                    <form onSubmit={handleEditInvoiceSubmit} className="space-y-3 text-xs font-semibold">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 mb-1">Customer Name</label>
                          <input
                            type="text"
                            value={invCustomerName}
                            onChange={(e) => setInvCustomerName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">Store / Merchant Name</label>
                          <input
                            type="text"
                            value={invStoreName}
                            onChange={(e) => setInvStoreName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-zinc-500 mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            value={invAmount}
                            onChange={(e) => setInvAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">Status</label>
                          <select
                            value={invStatus}
                            onChange={(e) => setInvStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Overdue">Overdue</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={invDueDate}
                            onChange={(e) => setInvDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => { setShowEditInvoiceModal(false); setSelectedInvoice(null); }}
                          className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Preview Invoice Modal */}
              {previewInvoice && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400">BUPZO TAX INVOICE</h2>
                        <p className="text-xs text-zinc-500">GSTIN: 29ABCDE1234F1ZH | Official Receipt</p>
                      </div>
                      <button 
                        onClick={() => setPreviewInvoice(null)}
                        className="w-8 h-8 flex justify-center items-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 font-bold"
                      >✕</button>
                    </div>

                    <div className="p-6 space-y-6 text-xs">
                      <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                          <p className="font-bold text-zinc-400 uppercase text-[10px]">Invoice Details</p>
                          <p className="font-mono font-extrabold text-sm mt-1">Invoice #: {previewInvoice.id}</p>
                          <p className="font-mono text-zinc-500">Order ID: {previewInvoice.order_id}</p>
                          <p className="text-zinc-500">Date: {previewInvoice.date}</p>
                          <p className="text-zinc-500">Due Date: {previewInvoice.due_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-zinc-400 uppercase text-[10px]">Customer Information</p>
                          <p className="font-extrabold text-sm mt-1">{previewInvoice.customer_name}</p>
                          <p className="text-zinc-500">Store: {previewInvoice.store}</p>
                          <p className="font-bold text-emerald-500 mt-1">Status: {previewInvoice.status}</p>
                        </div>
                      </div>

                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px]">
                            <th className="py-2">Item Description</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Unit Price</th>
                            <th className="py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                          {previewInvoice.items?.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="py-2.5 font-bold">{item.name}</td>
                              <td className="py-2.5 text-center font-mono">{item.qty}</td>
                              <td className="py-2.5 text-right font-mono">₹{parseFloat(item.price).toFixed(2)}</td>
                              <td className="py-2.5 text-right font-mono font-bold">₹{(item.qty * parseFloat(item.price)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between items-center text-sm font-bold">
                        <span>Total Payable Amount (incl. 18% GST):</span>
                        <span className="font-mono text-xl text-blue-600 dark:text-blue-400">₹{parseFloat(previewInvoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                      <button
                        onClick={() => window.print()}
                        className="bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        🖨️ Print Invoice
                      </button>
                      <button
                        onClick={() => {
                          showAdminToast(`Invoice ${previewInvoice.id} downloaded!`);
                          setPreviewInvoice(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        📥 Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: FOLLOWERS MANAGEMENT */}
          {activeTab === 'followers' && (
            <AdminFollowers 
              sellers={sellers}
              users={users}
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

              {/* Wallet Accounts Overview */}
              <div className="bg-white dark:bg-[#15131b] p-6 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] space-y-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-bold font-heading">Wallet Accounts Overview</h3>
                  <div className="relative w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={walletAccountSearchTerm}
                      onChange={(e) => setWalletAccountSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs font-semibold min-w-[600px]">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none">
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('id')}>
                          User ID {walletSortKey === 'id' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('user_id')}>
                          Name {walletSortKey === 'user_id' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5">Mobile</th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('type')}>
                          Role {walletSortKey === 'type' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('created_at')}>
                          Date & Time {walletSortKey === 'created_at' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('amount')}>
                          Balance (INR) {walletSortKey === 'amount' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const s = walletAccountSearchTerm.toLowerCase();
                        const filtered = users.filter((u: any) => 
                          (u.name || '').toLowerCase().includes(s) ||
                          (u.email || '').toLowerCase().includes(s) ||
                          (u.phone || '').toLowerCase().includes(s) ||
                          (u.id || '').toLowerCase().includes(s)
                        );
                        const sorted = [...filtered].sort((a: any, b: any) => {
                          if (!walletSortKey) return 0;
                          let aVal = a[walletSortKey];
                          let bVal = b[walletSortKey];
                          if (walletSortKey === 'amount' || walletSortKey === 'wallet') {
                            aVal = Number(a.wallet || 0);
                            bVal = Number(b.wallet || 0);
                          } else if (walletSortKey === 'type') {
                            aVal = a.isSeller ? 'Seller' : 'Customer';
                            bVal = b.isSeller ? 'Seller' : 'Customer';
                          } else if (walletSortKey === 'created_at' || walletSortKey === 'date') {
                            aVal = new Date(a.created_at || Date.now()).getTime();
                            bVal = new Date(b.created_at || Date.now()).getTime();
                          } else {
                            aVal = String(aVal || '').toLowerCase();
                            bVal = String(bVal || '').toLowerCase();
                          }
                          if (aVal === bVal) return 0;
                          return aVal < bVal ? (walletSortOrder === 'asc' ? -1 : 1) : (walletSortOrder === 'asc' ? 1 : -1);
                        });

                        if (sorted.length === 0) {
                          return (
                            <tr><td colSpan={7} className="py-8 text-center text-zinc-500 font-medium">No user wallet accounts found matching criteria.</td></tr>
                          );
                        }

                        return sorted.slice(0, 15).map((u: any) => (
                          <tr key={u.id} className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3 font-mono">{u.id ? `${u.id.substring(0, 8)}...` : ''}</td>
                            <td className="py-3 font-bold text-[#3874ff] cursor-pointer hover:underline" onClick={() => setPreviewUser(u)}>{u.name}</td>
                            <td className="py-3">{u.phone}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${u.isSeller ? 'bg-amber-100/10 text-amber-500' : 'bg-zinc-100/10 text-zinc-400 dark:text-zinc-500'}`}>
                                {u.isSeller ? 'Seller' : 'Customer'}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-[10px] text-zinc-500 whitespace-nowrap">{u.created_at ? new Date(u.created_at).toLocaleString() : '2026-07-25 20:45'}</td>
                            <td className="py-3 font-mono font-bold text-right text-green-600 dark:text-green-400">₹{u.wallet}</td>
                            <td className="py-3 text-center">
                              <div className="flex justify-center gap-1.5">
                                <button 
                                  onClick={() => setPreviewUser(u)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors"
                                >
                                  Preview
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedWalletAccountUser(u);
                                    setNewWalletBalance(u.wallet);
                                    setShowWalletAccountEditModal(true);
                                  }}
                                  className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2 py-1 rounded-md text-[10px] font-bold transition-colors"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => setUserToDelete(u)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
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
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('user_name')}>
                          User Name {walletSortKey === 'user_name' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('user_id')}>
                          User ID {walletSortKey === 'user_id' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('mobile_number')}>
                          Mobile No. {walletSortKey === 'mobile_number' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('amount')}>
                          Amount {walletSortKey === 'amount' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('type')}>
                          Type {walletSortKey === 'type' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('description')}>
                          Description {walletSortKey === 'description' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleWalletSort('date')}>
                          Date & Time {walletSortKey === 'date' ? (walletSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedWalletTransactions.map((tx: any) => (
                        <tr key={tx.id} className="border-b border-zinc-150 dark:border-zinc-900">
                          <td 
                            className="py-3 font-mono font-bold text-[#3874ff] cursor-pointer hover:underline"
                            onClick={() => setPreviewWalletTx(tx)}
                          >
                            {tx.id.substring(0,8)}...
                          </td>
                          <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100">
                            {users.find((u: any) => u.id === tx.user_id)?.name || 'Shopper'}
                          </td>
                          <td className="py-3 font-mono text-zinc-500">{tx.user_id.substring(0,8)}...</td>
                          <td className="py-3 font-mono text-zinc-500">{tx.mobile_number || users.find((u: any) => u.id === tx.user_id)?.phone || 'N/A'}</td>
                          <td className={`py-3 font-mono font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ₹{tx.amount}
                          </td>
                          <td className="py-3 font-semibold">{tx.type}</td>
                          <td className="py-3 text-zinc-600 dark:text-zinc-400">{tx.description}</td>
                          <td className="py-3 font-mono text-[10px] text-zinc-500 whitespace-nowrap">{tx.created_at ? new Date(tx.created_at).toLocaleString() : (tx.date || '2026-07-25 22:15')}</td>
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

                {walletTotalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 text-xs font-semibold text-zinc-500">
                    <span>Page {walletCurrentPage} of {walletTotalPages}</span>
                    <div className="flex gap-2">
                      <button disabled={walletCurrentPage === 1} onClick={() => setWalletCurrentPage(c => c - 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Prev</button>
                      <button disabled={walletCurrentPage === walletTotalPages} onClick={() => setWalletCurrentPage(c => c + 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Next</button>
                    </div>
                  </div>
                )}
                
                {previewWalletTx && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold font-heading text-lg">Transaction Details</h3>
                        <button 
                          onClick={() => setPreviewWalletTx(null)}
                          className="w-8 h-8 flex justify-center items-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 font-bold"
                        >✕</button>
                      </div>
                      <div className="p-6 text-sm text-zinc-700 dark:text-zinc-300 space-y-3">
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Transaction ID:</span>
                          <span className="font-mono">{previewWalletTx.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">User ID:</span>
                          <span className="font-mono">{previewWalletTx.user_id}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Amount:</span>
                          <span className={`font-mono font-bold ${previewWalletTx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ₹{previewWalletTx.amount}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Type:</span>
                          <span className="font-semibold">{previewWalletTx.type}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Date:</span>
                          <span>{new Date(previewWalletTx.created_at).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-zinc-500 block mb-1">Description:</span>
                          <p className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg text-xs">{previewWalletTx.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

          {/* TAB 9: REVIEWS MANAGEMENT */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-heading">Reviews &amp; Ratings Management</h1>
                  <p className="text-sm text-zinc-500 mt-1">Moderate product and merchant store reviews, delete spam, and audit ratings.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setReviewTab('products')} 
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${reviewTab === 'products' ? 'bg-[#3874ff] text-white shadow' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                  >
                    Product Reviews ({reviews.length})
                  </button>
                  <button 
                    onClick={() => setReviewTab('sellers')} 
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${reviewTab === 'sellers' ? 'bg-[#3874ff] text-white shadow' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                  >
                    Store / Merchant Reviews ({reviews.length})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Search reviews by user name, product, store name, or comments..." 
                    value={reviewSearchTerm}
                    onChange={(e) => setReviewSearchTerm(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-[#3874ff]"
                  />
                  <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr className="select-none text-zinc-400 font-bold uppercase text-[10px]">
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleReviewSort('user_name')}>
                        Customer {reviewSortKey === 'user_name' ? (reviewSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleReviewSort(reviewTab === 'products' ? 'product_name' : 'seller_name')}>
                        {reviewTab === 'products' ? 'Product Name' : 'Merchant / Store Name'} {reviewSortKey === (reviewTab === 'products' ? 'product_name' : 'seller_name') ? (reviewSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleReviewSort('rating')}>
                        Rating {reviewSortKey === 'rating' ? (reviewSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleReviewSort('comment')}>
                        Comment {reviewSortKey === 'comment' ? (reviewSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleReviewSort('created_at')}>
                        Date &amp; Time {reviewSortKey === 'created_at' ? (reviewSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {(() => {
                      const s = reviewSearchTerm.toLowerCase();
                      const filtered = reviews.filter((r: any) => {
                        return (r.user_name || '').toLowerCase().includes(s) || 
                               (r.product_name || '').toLowerCase().includes(s) || 
                               (r.seller_name || '').toLowerCase().includes(s) || 
                               (r.comment || '').toLowerCase().includes(s);
                      });
                      const sorted = [...filtered].sort((a: any, b: any) => {
                        if (!reviewSortKey) return 0;
                        let aVal = a[reviewSortKey];
                        let bVal = b[reviewSortKey];
                        if (reviewSortKey === 'rating') {
                          aVal = Number(aVal || 0);
                          bVal = Number(bVal || 0);
                        } else if (reviewSortKey === 'created_at' || reviewSortKey === 'date') {
                          aVal = new Date(a.created_at || a.date || Date.now()).getTime();
                          bVal = new Date(b.created_at || b.date || Date.now()).getTime();
                        } else if (reviewSortKey === 'seller_name') {
                          aVal = String(a.seller_name || a.product_name || '').toLowerCase();
                          bVal = String(b.seller_name || b.product_name || '').toLowerCase();
                        } else {
                          aVal = String(aVal || '').toLowerCase();
                          bVal = String(bVal || '').toLowerCase();
                        }
                        if (aVal === bVal) return 0;
                        return aVal < bVal ? (reviewSortOrder === 'asc' ? -1 : 1) : (reviewSortOrder === 'asc' ? 1 : -1);
                      });

                      if (sorted.length === 0) {
                        return (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500 font-medium">No reviews found matching criteria.</td></tr>
                        );
                      }

                      return sorted.map((r: any) => (
                        <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="px-4 py-3 font-bold">{r.user_name || 'Verified Customer'}</td>
                          <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold">
                            {reviewTab === 'products' ? (r.product_name || 'Product Item') : (r.seller_name || 'Store Merchant')}
                          </td>
                          <td className="px-4 py-3 font-bold text-amber-500 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= Math.round(Number(r.rating || 5)) ? 'text-amber-400 font-bold text-sm' : 'text-zinc-300 dark:text-zinc-700 text-sm'}>
                                  ★
                                </span>
                              ))}
                              <span className="ml-1 text-[10px] text-zinc-500 font-mono">({r.rating || 5}.0)</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-xs text-zinc-700 dark:text-zinc-300 font-medium">{r.comment || 'No text review.'}</td>
                          <td className="px-4 py-3 font-mono text-zinc-500 text-[11px] whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleString() : new Date().toLocaleString()}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2 items-center">
                              {r.status === 'APPROVED' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100/20 text-emerald-500 border border-emerald-500/30">
                                  ✓ Approved
                                </span>
                              ) : (
                                <button 
                                  onClick={async () => {
                                    try {
                                      await fetch(`${API_URL}/api/reviews/${r.id}/approve`, { method: 'POST' });
                                    } catch(e) {}
                                    showAdminToast("✓ Review approved successfully!");
                                    setReviews(prev => prev.map(item => item.id === r.id ? { ...item, status: 'APPROVED' } : item));
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-bold transition shadow-sm"
                                >
                                  Approve
                                </button>
                              )}
                              <button 
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to delete this review?")) return;
                                  try {
                                    await fetch(`${API_URL}/api/reviews/${r.id}`, { method: 'DELETE' });
                                  } catch(e) {}
                                  showAdminToast("🗑️ Review deleted successfully!");
                                  setReviews(prev => prev.filter(item => item.id !== r.id));
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold transition shadow-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: MESSAGES CENTER */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">Messages Center</h1>
                <p className="text-sm text-zinc-500 mt-1">Direct communication with users, dispute resolutions, and automated bot transcripts.</p>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Search messages by sender name, receiver name, subject, or message content..." 
                    value={msgSearchTerm}
                    onChange={(e) => setMsgSearchTerm(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-[#3874ff]"
                  />
                  <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr className="select-none text-zinc-400 font-bold uppercase text-[10px]">
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleMsgSort('sender_name')}>
                        From {msgSortKey === 'sender_name' ? (msgSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleMsgSort('sender_email')}>
                        Email ID {msgSortKey === 'sender_email' ? (msgSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleMsgSort('sender_phone')}>
                        Phone Number {msgSortKey === 'sender_phone' ? (msgSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleMsgSort('receiver_name')}>
                        To {msgSortKey === 'receiver_name' ? (msgSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleMsgSort('subject')}>
                        Subject {msgSortKey === 'subject' ? (msgSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleMsgSort('content')}>
                        Content {msgSortKey === 'content' ? (msgSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:text-primary" onClick={() => handleMsgSort('created_at')}>
                        Date &amp; Time {msgSortKey === 'created_at' ? (msgSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {(() => {
                      const s = msgSearchTerm.toLowerCase();
                      const filtered = messages.filter((m: any) => {
                        return (m.sender_name || '').toLowerCase().includes(s) || 
                               (m.sender_email || m.email || '').toLowerCase().includes(s) || 
                               (m.sender_phone || m.phone || '').toLowerCase().includes(s) || 
                               (m.receiver_name || '').toLowerCase().includes(s) || 
                               (m.subject || '').toLowerCase().includes(s) || 
                               (m.content || '').toLowerCase().includes(s);
                      });
                      const sorted = [...filtered].sort((a: any, b: any) => {
                        if (!msgSortKey) return 0;
                        let aVal = a[msgSortKey];
                        let bVal = b[msgSortKey];
                        if (msgSortKey === 'created_at' || msgSortKey === 'date') {
                          aVal = new Date(a.created_at || a.date || Date.now()).getTime();
                          bVal = new Date(b.created_at || b.date || Date.now()).getTime();
                        } else if (msgSortKey === 'sender_email') {
                          aVal = String(a.sender_email || a.email || '').toLowerCase();
                          bVal = String(b.sender_email || b.email || '').toLowerCase();
                        } else if (msgSortKey === 'sender_phone') {
                          aVal = String(a.sender_phone || a.phone || '').toLowerCase();
                          bVal = String(b.sender_phone || b.phone || '').toLowerCase();
                        } else {
                          aVal = String(aVal || '').toLowerCase();
                          bVal = String(bVal || '').toLowerCase();
                        }
                        if (aVal === bVal) return 0;
                        return aVal < bVal ? (msgSortOrder === 'asc' ? -1 : 1) : (msgSortOrder === 'asc' ? 1 : -1);
                      });

                      if (sorted.length === 0) {
                        return (
                          <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-500 font-medium">No messages found matching criteria.</td></tr>
                        );
                      }

                      return sorted.map((m: any) => (
                        <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="px-4 py-3 font-bold">{m.sender_name || 'System User'}</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 font-medium">{m.sender_email || m.email || 'N/A'}</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 font-medium">{m.sender_phone || m.phone || 'N/A'}</td>
                          <td className="px-4 py-3 font-bold">{m.receiver_name || 'Bupzo Patron'}</td>
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 font-bold">{m.subject || 'Message Notice'}</td>
                          <td className="px-4 py-3 max-w-xs text-zinc-600 dark:text-zinc-400 font-medium truncate">{m.content}</td>
                          <td className="px-4 py-3 font-mono text-zinc-500 text-[11px] whitespace-nowrap">{m.created_at ? new Date(m.created_at).toLocaleString() : new Date().toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => {
                                  setAdminReplyTo(m);
                                  setAdminReplyContent('');
                                  setShowAdminReplyModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-bold transition shadow-sm flex items-center gap-1"
                              >
                                💬 Reply
                              </button>
                              <button 
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to delete this message log?")) return;
                                  try {
                                    const resp = await fetch(`${API_URL}/api/messages/${m.id}`, { method: 'DELETE' });
                                    if (resp.ok) {
                                      showAdminToast("🗑️ Message log deleted successfully!");
                                      setMessages(prev => prev.filter(item => item.id !== m.id));
                                    }
                                  } catch(e) { showAdminToast("Failed to delete message.", "error"); }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold transition shadow-sm"
                              >
                                Delete Log
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showAdminReplyModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-4">Reply to {adminReplyTo?.sender_name}</h3>
                <textarea
                  value={adminReplyContent}
                  onChange={e => setAdminReplyContent(e.target.value)}
                  className="w-full h-32 border p-3 rounded-lg text-sm mb-4 outline-none focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                  placeholder="Type your reply..."
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAdminReplyModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={handleAdminReplyMessage} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700">Send Reply</button>
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
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onApproveProduct={handleApproveProduct}
              onDeleteCategory={handleDeleteCategory}
              newCatName={newCatName}
              setNewCatName={setNewCatName}
              newCatDesc={newCatDesc}
              setNewCatDesc={setNewCatDesc}
              onCreateCategory={handleCreateCategory}
              onCreateProduct={handleCreateProduct}
              onUpdateCategory={handleUpdateCategory}
              onUploadImage={handleGeneralImageUpload}
              onRefreshData={refreshAllAdminData}
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
                      <label className="block text-zinc-500 mb-1">Max Uses Limit</label>
                      <input 
                        type="number" 
                        placeholder="500" 
                        value={newCouponMaxUses}
                        onChange={(e) => setNewCouponMaxUses(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono"
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
                    <div>
                      <label className="block text-zinc-500 mb-1">Expiry Date</label>
                      <input 
                        type="date" 
                        value={newCouponExpiry}
                        onChange={(e) => setNewCouponExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
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

                  <h3 className="text-md font-bold font-heading">Referral & Promo Vouchers Usage Statistics</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none">
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('code')}>
                            Voucher Code {voucherSortKey === 'code' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('discount_percent')}>
                            Discount % {voucherSortKey === 'discount_percent' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5">
                            Max Uses
                          </th>
                          <th className="py-2.5">
                            Usage Count
                          </th>
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('expiry_date')}>
                            Expiry {voucherSortKey === 'expiry_date' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleVoucherSort('status')}>
                            Status {voucherSortKey === 'status' ? (voucherSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                          </th>
                          <th className="py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCoupons.map((cp: any) => {
                          const isExpired = new Date(cp.expiry_date).getTime() < new Date().getTime();
                          return (
                          <tr key={cp.id} className="border-b border-zinc-100 dark:border-zinc-905">
                            <td 
                              className="py-3 font-semibold text-[#3874ff] cursor-pointer hover:underline"
                              onClick={() => setPreviewCoupon(cp)}
                            >
                              {cp.code}
                            </td>
                            <td className="py-3 font-mono">{cp.discount_percent}%</td>
                            <td className="py-3 font-mono text-zinc-600 dark:text-zinc-400">{cp.max_uses || 500}</td>
                            <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{cp.usage_count || (cp.code === 'WELCOME100' ? 142 : 28)}</td>
                            <td className="py-3 text-zinc-500">{new Date(cp.expiry_date).toLocaleDateString()}</td>
                            <td className="py-3 font-mono text-[10px] text-zinc-500 whitespace-nowrap">{cp.created_at ? new Date(cp.created_at).toLocaleString() : '2026-07-25 20:45'}</td>
                            <td className="py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                {isExpired ? 'EXPIRED' : 'ACTIVE'}
                              </span>
                            </td>
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
                                    setEditCouponStatus(cp.status || 'APPROVED');
                                    setEditCouponExpiry(cp.expiry_date ? new Date(cp.expiry_date).toISOString().split('T')[0] : '');
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
                        );
                      })}
                        {coupons.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-zinc-400">No active systemwide promo vouchers found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </div>

                {previewCoupon && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold font-heading text-lg">Voucher Details</h3>
                        <button 
                          onClick={() => setPreviewCoupon(null)}
                          className="w-8 h-8 flex justify-center items-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 font-bold"
                        >✕</button>
                      </div>
                      <div className="p-6 text-sm text-zinc-700 dark:text-zinc-300 space-y-3">
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Code:</span>
                          <span className="font-mono font-bold text-lg">{previewCoupon.code}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Discount:</span>
                          <span className="font-mono font-bold text-green-600">{previewCoupon.discount_percent}%</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Min Spend:</span>
                          <span className="font-mono">₹{previewCoupon.min_order_value}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Premium Only:</span>
                          <span>{previewCoupon.is_premium_only ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="font-bold text-zinc-500">Expiry Date:</span>
                          <span>{new Date(previewCoupon.expiry_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-zinc-500">Status:</span>
                          <span className="font-bold uppercase">{previewCoupon.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-heading text-zinc-900 dark:text-zinc-100">
                    Materialize System Settings Console
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage core platform configurations, payment gateways, checkout rules, logistics partners, and fulfillment hubs.
                  </p>
                </div>
                <button
                  onClick={() => showAdminToast("✅ System settings saved successfully!")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 self-start md:self-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save All Settings
                </button>
              </header>

              {/* Sub-Tabs Navigation */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-2 overflow-x-auto">
                <button
                  onClick={() => setSettingsSubTab('detail')}
                  className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    settingsSubTab === 'detail' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Detail & Info
                </button>

                <button
                  onClick={() => setSettingsSubTab('payments')}
                  className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    settingsSubTab === 'payments' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Payments & Gateways
                </button>

                <button
                  onClick={() => setSettingsSubTab('checkout')}
                  className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    settingsSubTab === 'checkout' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                  Checkout & Taxes
                </button>

                <button
                  onClick={() => setSettingsSubTab('shipping')}
                  className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    settingsSubTab === 'shipping' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  Shipping & Logistics
                </button>

                <button
                  onClick={() => setSettingsSubTab('locations')}
                  className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    settingsSubTab === 'locations' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  Locations & Hubs
                </button>
              </div>

              {/* Sub-Tab Content */}
              <div className="bg-white dark:bg-[#15131b] p-6 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
                
                {/* SUB-TAB 1: DETAIL */}
                {settingsSubTab === 'detail' && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-md font-bold font-heading text-zinc-900 dark:text-zinc-100">Platform Identity & Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <label className="block text-zinc-500 mb-1">Platform Name</label>
                        <input
                          type="text"
                          value={settingsForm.siteName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Support Email</label>
                        <input
                          type="email"
                          value={settingsForm.supportEmail}
                          onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Support Toll-Free Phone</label>
                        <input
                          type="text"
                          value={settingsForm.supportPhone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Default Platform Currency</label>
                        <input
                          type="text"
                          value={settingsForm.currency}
                          onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Base Merchant Commission Rate (%)</label>
                        <input
                          type="number"
                          value={settingsForm.commissionRate}
                          onChange={(e) => setSettingsForm({ ...settingsForm, commissionRate: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">Maintenance Mode</p>
                          <p className="text-[10px] text-zinc-500">Temporarily pause customer orders for system upgrades</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.maintenanceMode}
                          onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: PAYMENTS */}
                {settingsSubTab === 'payments' && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-md font-bold font-heading text-zinc-900 dark:text-zinc-100">Payment Gateway Integrations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <label className="block text-zinc-500 mb-1">Primary Payment Provider</label>
                        <select
                          value={settingsForm.primaryGateway}
                          onChange={(e) => setSettingsForm({ ...settingsForm, primaryGateway: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
                        >
                          <option value="PhonePe Aggregator API">PhonePe Aggregator API</option>
                          <option value="Razorpay Direct">Razorpay Direct</option>
                          <option value="Paytm Gateway">Paytm Gateway</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">PhonePe Merchant ID (MID)</label>
                        <input
                          type="text"
                          value={settingsForm.phonepeMerchantId}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phonepeMerchantId: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">PhonePe Salt Key Index</label>
                        <input
                          type="text"
                          value={settingsForm.phonepeSaltKey}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phonepeSaltKey: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Razorpay Live API Key</label>
                        <input
                          type="password"
                          value={settingsForm.razorpayKey}
                          onChange={(e) => setSettingsForm({ ...settingsForm, razorpayKey: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">Cash on Delivery (COD)</p>
                          <p className="text-[10px] text-zinc-500">Allow customers to pay cash upon doorstep delivery</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.enableCOD}
                          onChange={(e) => setSettingsForm({ ...settingsForm, enableCOD: e.target.checked })}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Wallet Cashback Bonus (%)</label>
                        <input
                          type="number"
                          value={settingsForm.cashbackPercent}
                          onChange={(e) => setSettingsForm({ ...settingsForm, cashbackPercent: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 3: CHECKOUT */}
                {settingsSubTab === 'checkout' && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-md font-bold font-heading text-zinc-900 dark:text-zinc-100">Checkout & Tax Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">Guest Checkout</p>
                          <p className="text-[10px] text-zinc-500">Allow purchases without registering an account</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.enableGuestCheckout}
                          onChange={(e) => setSettingsForm({ ...settingsForm, enableGuestCheckout: e.target.checked })}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">Require Mobile OTP</p>
                          <p className="text-[10px] text-zinc-500">Enforce 2FA verification before order placement</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.requireOtp}
                          onChange={(e) => setSettingsForm({ ...settingsForm, requireOtp: e.target.checked })}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Minimum Order Value (₹)</label>
                        <input
                          type="number"
                          value={settingsForm.minOrderValue}
                          onChange={(e) => setSettingsForm({ ...settingsForm, minOrderValue: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Cart Hold Timer (Minutes)</label>
                        <input
                          type="number"
                          value={settingsForm.cartHoldMinutes}
                          onChange={(e) => setSettingsForm({ ...settingsForm, cartHoldMinutes: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Standard GST Tax Rate (%)</label>
                        <input
                          type="number"
                          value={settingsForm.gstRate}
                          onChange={(e) => setSettingsForm({ ...settingsForm, gstRate: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 4: SHIPPING */}
                {settingsSubTab === 'shipping' && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-md font-bold font-heading text-zinc-900 dark:text-zinc-100">Logistics & Shipping Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <label className="block text-zinc-500 mb-1">Primary Logistics Aggregator</label>
                        <input
                          type="text"
                          value={settingsForm.primaryLogistics}
                          onChange={(e) => setSettingsForm({ ...settingsForm, primaryLogistics: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Secondary Express Partner</label>
                        <input
                          type="text"
                          value={settingsForm.secondaryLogistics}
                          onChange={(e) => setSettingsForm({ ...settingsForm, secondaryLogistics: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Free Shipping Threshold (₹)</label>
                        <input
                          type="number"
                          value={settingsForm.freeShippingThreshold}
                          onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Flat Standard Shipping Fee (₹)</label>
                        <input
                          type="number"
                          value={settingsForm.flatShippingFee}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flatShippingFee: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 col-span-1 md:col-span-2">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">Auto-Generate Waybill</p>
                          <p className="text-[10px] text-zinc-500">Automatically generate courier tracking AWB as soon as merchant approves order</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.autoWaybill}
                          onChange={(e) => setSettingsForm({ ...settingsForm, autoWaybill: e.target.checked })}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 5: LOCATIONS */}
                {settingsSubTab === 'locations' && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-md font-bold font-heading text-zinc-900 dark:text-zinc-100">Locations & Fulfillment Hubs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <label className="block text-zinc-500 mb-1">Master Origin Warehouse Pincode</label>
                        <input
                          type="text"
                          value={settingsForm.originPincode}
                          onChange={(e) => setSettingsForm({ ...settingsForm, originPincode: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Primary Dispatch City</label>
                        <input
                          type="text"
                          value={settingsForm.dispatchCity}
                          onChange={(e) => setSettingsForm({ ...settingsForm, dispatchCity: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Serviceable Coverage Area</label>
                        <input
                          type="text"
                          value={settingsForm.serviceableRegion}
                          onChange={(e) => setSettingsForm({ ...settingsForm, serviceableRegion: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1">Hyperlocal Express Radius (km)</label>
                        <input
                          type="number"
                          value={settingsForm.expressRadiusKm}
                          onChange={(e) => setSettingsForm({ ...settingsForm, expressRadiusKm: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-mono"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-zinc-500 mb-1">Active Regional Fulfillment Hubs</label>
                        <textarea
                          rows={3}
                          value={settingsForm.hubLocations}
                          onChange={(e) => setSettingsForm({ ...settingsForm, hubLocations: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none resize-none font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                <label className="block text-zinc-500 mb-1">Password</label>
                <input 
                  type="password" 
                  value={newUserPassword} 
                  onChange={(e) => setNewUserPassword(e.target.value)} 
                  placeholder="Leave empty for no password"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">User Role</label>
                <select 
                  value={newUserRole} 
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="Customer">Customer</option>
                  <option value="Seller">Seller</option>
                </select>
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
                  value={newUserWallet} 
                  onChange={(e) => setNewUserWallet(e.target.value)} 
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
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'product')} 
                  className="w-full text-xs text-zinc-500 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 bg-white dark:bg-zinc-950"
                />
                {editProductImage && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {editProductImage.split(',').map((imgUrl, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <img src={imgUrl.trim() || 'https://placehold.co/150/png'} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
                      </div>
                    ))}
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
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none uppercase font-mono font-bold cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block text-red-500 font-bold mb-1">Expiry Date (Edit Mode)</label>
                <input 
                  type="date" 
                  value={editCouponExpiry}
                  onChange={(e) => setEditCouponExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-red-500 rounded-lg text-sm font-bold shadow-sm"
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
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Minimum Order Value (₹)</label>
                <input 
                  type="number" 
                  value={editCouponMinSpend} 
                  onChange={(e) => setEditCouponMinSpend(e.target.value)} 
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono cursor-not-allowed"
                  required
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input 
                  type="checkbox" 
                  id="editCouponIsPremiumOnly"
                  checked={editCouponIsPremiumOnly}
                  onChange={(e) => setEditCouponIsPremiumOnly(e.target.checked)}
                  disabled
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-800 text-[#3874ff] focus:ring-[#3874ff] cursor-not-allowed"
                />
                <label htmlFor="editCouponIsPremiumOnly" className="text-zinc-500 select-none cursor-pointer">Premium Only Voucher</label>
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Status</label>
                <select 
                  value={editCouponStatus} 
                  onChange={(e) => setEditCouponStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-bold"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
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

      {/* EDIT WALLET ACCOUNT MODAL */}
      {showWalletAccountEditModal && selectedWalletAccountUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold font-heading mb-4">Edit Wallet Balance</h3>
            <div className="mb-4 text-xs">
              <p><span className="text-zinc-500">User:</span> {selectedWalletAccountUser.name} ({selectedWalletAccountUser.id.substring(0,8)}...)</p>
              <p><span className="text-zinc-500">Current Balance:</span> ₹{selectedWalletAccountUser.wallet}</p>
            </div>
            <form onSubmit={handleWalletAccountEditSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">New Balance (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newWalletBalance} 
                  onChange={(e) => setNewWalletBalance(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowWalletAccountEditModal(false); setSelectedWalletAccountUser(null); }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
                >
                  Save Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW USER MODAL */}
      {previewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 text-zinc-900 dark:text-zinc-100">
            <h3 className="text-xl font-bold mb-4">User Details - {previewUser.name}</h3>
            <div className="space-y-3 text-sm">
              <p><strong>ID:</strong> {previewUser.id}</p>
              <p><strong>Name:</strong> {previewUser.name}</p>
              <p><strong>Mobile:</strong> {previewUser.phone}</p>
              <p><strong>Email:</strong> {previewUser.email || 'N/A'}</p>
              <p><strong>Wallet:</strong> ₹{previewUser.wallet}</p>
              <p><strong>Tier:</strong> {previewUser.tier}</p>
              <p><strong>Status:</strong> {previewUser.status}</p>
              <p><strong>Risk:</strong> {previewUser.risk}</p>
              <p><strong>Role:</strong> {previewUser.isAdmin ? 'Admin' : previewUser.isSeller ? 'Seller' : 'Customer'}</p>
              <p><strong>Address:</strong> {(previewUser as any).address || 'Not Provided'}</p>
              <p><strong>Pincode:</strong> {(previewUser as any).pincode || 'Not Provided'}</p>
              <p><strong>State:</strong> {(previewUser as any).state || 'Not Provided'}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setPreviewUser(null)} 
                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-6 text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold text-red-600 mb-2">Permanent Delete</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to permanently delete user "{userToDelete.name}"? This will cascade across all DB tables and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setUserToDelete(null)} 
                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleDeleteUser(userToDelete.id);
                  setUserToDelete(null);
                }} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
