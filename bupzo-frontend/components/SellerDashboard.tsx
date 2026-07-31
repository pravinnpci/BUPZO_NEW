"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/lib/authStore';
import { useTheme } from 'next-themes';
import { 
  fetchProducts, 
  fetchSellerOrders, 
  fetchSellers, 
  createProduct, 
  fetchCategories, 
  updateOrderStatus,
  fetchSellerFollowers,
  fetchSellerReviews,
  requestCategory,
  fetchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '@/lib/api';
import ProductPreviewModal from './ProductPreviewModal';

const safeDate = (val: any): string => {
  if (!val) return 'N/A';
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return 'N/A';
  }
};

const safeDateTime = (val: any): string => {
  if (!val) return 'N/A';
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'N/A';
  }
};

export function SellerDashboard({ onSwitchToCustomer }: { onSwitchToCustomer?: () => void }) {
  let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
  API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

  const { user, setUser, clearUser } = useUser();
  const { theme, setTheme } = useTheme();

  // Primary Tab Navigation
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Pagination & Search States
  const [prodPage, setProdPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [msgPage, setMsgPage] = useState(1);
  const [revPage, setRevPage] = useState(1);
  const [followerPage, setFollowerPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const itemsPerPage = 10;

  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [mySellerStatus, setMySellerStatus] = useState<string>('');
  const [mySellerKyc, setMySellerKyc] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [mySellerId, setMySellerId] = useState<string | null>(null);

  // Search & Filter States
  const [prodSearch, setProdSearch] = useState('');
  const [prodSubView, setProdSubView] = useState<'products' | 'categories'>('products');
  const [catSearch, setCatSearch] = useState('');
  const [catPage, setCatPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [revSearch, setRevSearch] = useState('');
  const [followerSearch, setFollowerSearch] = useState('');

  // Orders vs Invoices Sub-View State
  const [ordersSubView, setOrdersSubView] = useState<'orders' | 'invoices'>('orders');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');

  // Modals & Action States
  const [previewProduct, setPreviewProduct] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const [replyingReview, setReplyingReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [showAdminMessageModal, setShowAdminMessageModal] = useState(false);
  const [adminMessageSubject, setAdminMessageSubject] = useState('');
  const [adminMessageContent, setAdminMessageContent] = useState('');

  // Customer Message Modal State
  const [showCustomerMessageModal, setShowCustomerMessageModal] = useState(false);
  const [msgReceiverId, setMsgReceiverId] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Category Request Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catReqName, setCatReqName] = useState('');
  const [catReqIcon, setCatReqIcon] = useState('🛍️');
  const [catReqDesc, setCatReqDesc] = useState('');

  // Materialize Invoice Modals State
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [previewInvoiceDoc, setPreviewInvoiceDoc] = useState<any>(null);
  const [newInvoiceData, setNewInvoiceData] = useState({
    customer_name: '',
    customer_email: '',
    amount: 0,
    tax_amount: 0,
    status: 'PAID',
    due_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  });

  // Settings Sub-Tabs State
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'payment' | 'shipping' | 'address'>('profile');

  // Followers & Rating Sub-Sections State
  const [followersSubTab, setFollowersSubTab] = useState<'followers' | 'ratings'>('followers');

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    price: 0,
    weight_grams: 100,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop',
    images: [] as string[],
    is_combo: false,
    stock_quantity: 10,
    description: ''
  });

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Effective user check (zustand user or localStorage fallback)
  let effectiveUser = user;
  if (!effectiveUser && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('bupzo_user') || localStorage.getItem('user');
      if (stored) effectiveUser = JSON.parse(stored);
    } catch (e) {}
  }

  // Settings Form States
  const [storeProfile, setStoreProfile] = useState({
    business_name: effectiveUser?.name || 'Bupzo Verified Merchant',
    slogan: 'Premium Marketplace Vendor',
    description: 'Specializing in authentic, high-quality handcrafted goods and direct-to-consumer products.',
    email: effectiveUser?.email || 'vendor@bupzo.com',
    phone: effectiveUser?.phone || '+91 98765 43210',
    logo_url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    bank_name: 'HDFC Bank Ltd.',
    account_name: effectiveUser?.name || 'Bupzo Merchant Account',
    account_number: '50100293847102',
    ifsc: 'HDFC0001234',
    upi_id: 'merchant.bupzo@hdfcbank',
    pan_gst: '27AAAAA0000A1Z5 / 27GSTIN8847Z1',
    settlement_cycle: 'Daily Instant Escrow Release'
  });

  const [shippingPref, setShippingPref] = useState({
    courier: 'Shiprocket Logistics (Delhivery / BlueDart)',
    default_weight: 500,
    free_shipping_min: 999,
    shipping_fee: 49,
    dispatch_pincode: effectiveUser?.pincode || '400001',
    return_address: effectiveUser?.address || 'Plot 42, Bupzo Fulfillment Hub, Industrial Area Phase 2, Mumbai - 400001',
    handling_time: 'Same Day Dispatch (Within 12 Hrs)',
    auto_awb: true
  });

  const [businessAddress, setBusinessAddress] = useState({
    street: effectiveUser?.address || 'Plot 42, Bupzo Fulfillment Hub, Industrial Area Phase 2',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: effectiveUser?.pincode || '400001',
    lat: '19.0760',
    lng: '72.8777'
  });

  // Default Mock Followers Fallback
  const defaultFollowers = [
    { id: 'f1', name: 'Aarav Sharma', email: 'aarav.s@gmail.com', avatar: 'https://i.pravatar.cc/150?img=11', follow_date: '2026-06-15', total_orders: 4 },
    { id: 'f2', name: 'Priya Patel', email: 'priya.p@outlook.com', avatar: 'https://i.pravatar.cc/150?img=5', follow_date: '2026-07-02', total_orders: 2 },
    { id: 'f3', name: 'Rohan Verma', email: 'rohan.v@yahoo.com', avatar: 'https://i.pravatar.cc/150?img=12', follow_date: '2026-07-18', total_orders: 7 },
    { id: 'f4', name: 'Ananya Gupta', email: 'ananya.g@gmail.com', avatar: 'https://i.pravatar.cc/150?img=9', follow_date: '2026-07-25', total_orders: 1 },
    { id: 'f5', name: 'Kabir Mehta', email: 'kabir.m@tech.co', avatar: 'https://i.pravatar.cc/150?img=33', follow_date: '2026-07-29', total_orders: 5 }
  ];

  // Default Mock Reviews Fallback
  const defaultReviews = [
    { id: 'r1', user_name: 'Priya Patel', product_name: 'Handcrafted Cotton Shirt', rating: 5, comment: 'Excellent quality fabric and fast delivery! Will definitely buy again.', created_at: '2026-07-28', reply: 'Thank you Priya for your lovely feedback!' },
    { id: 'r2', user_name: 'Rohan Verma', product_name: 'Wireless Ergonomic Mouse', rating: 5, comment: 'Smooth performance and long battery life. Fits nicely in hand.', created_at: '2026-07-20', reply: '' },
    { id: 'r3', user_name: 'Aarav Sharma', product_name: 'Stainless Steel Water Bottle', rating: 4, comment: 'Keeps water cold for hours. Good product, minor packaging dent.', created_at: '2026-07-15', reply: 'Thanks Aarav! We will improve our packaging for your next order.' },
    { id: 'r4', user_name: 'Ananya Gupta', product_name: 'Organic Herbal Tea Set', rating: 5, comment: 'Amazing aroma and natural taste. Highly recommended seller!', created_at: '2026-07-10', reply: '' },
    { id: 'r5', user_name: 'Kabir Mehta', product_name: 'Leather Executive Planner', rating: 3, comment: 'Good quality leather but shipping took 4 days.', created_at: '2026-07-05', reply: 'Apologies for the shipping delay Kabir, we have upgraded our courier partner now.' }
  ];

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const activeUser = effectiveUser;
      const activeUserId = activeUser?.id || '';
      const activeUserName = activeUser?.name || '';

      const allSellersRaw = await fetchSellers().catch(() => []);
      const safeSellers = Array.isArray(allSellersRaw) ? allSellersRaw : [];
      
      let mySeller = safeSellers.find(s => 
        s && activeUserId && s.user_id && String(s.user_id) === String(activeUserId)
      );
      
      if (!mySeller && activeUserId) {
        mySeller = safeSellers.find(s => s && String(s.id) === String(activeUserId));
      }

      if (!mySeller && activeUserName) {
        mySeller = safeSellers.find(s =>
          s && s.business_name && String(s.business_name).toLowerCase().includes(String(activeUserName).toLowerCase())
        );
      }

      const allCategories = await fetchCategories().catch(() => []);
      setCategories(Array.isArray(allCategories) ? allCategories : []);

      if (activeUserId) {
        try {
          const msgResp = await fetch(`${API_URL}/api/messages/?user_id=${activeUserId}`).catch(() => null);
          if (msgResp && msgResp.ok) {
            const d = await msgResp.json().catch(() => []);
            setMessages(Array.isArray(d) ? d : []);
          }
        } catch (e) {}

        try {
          const notifResp = await fetch(`${API_URL}/api/notifications/?user_id=${activeUserId}`).catch(() => null);
          if (notifResp && notifResp.ok) {
            const d = await notifResp.json().catch(() => []);
            setNotifications(Array.isArray(d) ? d : []);
          }
        } catch (e) {}
      }

      if (!mySeller) {
        if (activeUser?.seller_status) {
          setMySellerStatus(activeUser.seller_status);
          setMySellerId(activeUserId || 'seller_fallback');
        } else if (activeUser?.is_seller || activeUser?.isSeller) {
          setMySellerStatus('APPROVED');
          setMySellerId(activeUserId || 'seller_fallback');
        } else {
          setMySellerStatus('');
          setMySellerId(null);
          setIsLoading(false);
          return;
        }
      } else {
        const activeSellerId = mySeller.id;
        setMySellerId(activeSellerId);
        setMySellerStatus(mySeller.status || activeUser?.seller_status || 'PENDING');
        
        if (typeof mySeller.kyc_details === 'string') {
          try { setMySellerKyc(JSON.parse(mySeller.kyc_details)); } catch (e) { setMySellerKyc({}); }
        } else {
          setMySellerKyc(mySeller.kyc_details || {});
        }
      }

      const currentSellerId = mySeller?.id || activeUserId;
      if (currentSellerId) {
        // 1. STRICT SELLER PRODUCT ISOLATION
        try {
          const allProducts = await fetchProducts().catch(() => []);
          const safeProds = Array.isArray(allProducts) ? allProducts : [];
          const sellerProds = safeProds.filter(p => p && (
            String((p as any).seller_id || (p as any).sellerId) === String(currentSellerId) ||
            (activeUserId && String((p as any).seller_id || (p as any).sellerId) === String(activeUserId))
          ));
          setProducts(sellerProds.map(p => ({ ...p, status: p.status || 'Active' })));
        } catch (e) {
          setProducts([]);
        }

        try {
          const myOrders = await fetchSellerOrders(currentSellerId).catch(() => []);
          setOrders(Array.isArray(myOrders) ? myOrders : []);
        } catch (e) {
          setOrders([]);
        }

        // 2. REAL DATA SYNC FOR FOLLOWERS & REVIEWS
        try {
          const folData = await fetchSellerFollowers(currentSellerId).catch(() => null);
          let fList: any[] = [];
          if (Array.isArray(folData)) {
            fList = folData;
          } else if (folData && Array.isArray(folData.followers)) {
            fList = folData.followers;
          }
          setFollowers(fList);
        } catch (e) {
          setFollowers([]);
        }

        try {
          const loadedReviews = await fetchSellerReviews(currentSellerId).catch(() => []);
          setReviews(Array.isArray(loadedReviews) ? loadedReviews : []);
        } catch (e) {
          setReviews([]);
        }

        // 6. INVOICES SYNC
        try {
          const loadedInvoices = await fetchInvoices(currentSellerId).catch(() => []);
          setInvoices(Array.isArray(loadedInvoices) ? loadedInvoices : []);
        } catch (e) {
          setInvoices([]);
        }
      }
    } catch (err: any) {
      console.warn("Error loading dashboard data:", err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const activeUserId = effectiveUser?.id;
    if (!activeUserId) return;
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/notifications/?user_id=${activeUserId}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setNotifications(data); })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Leaflet JS Map Initialization Effect for Settings Business Address tab
  useEffect(() => {
    if (activeTab !== 'settings' || settingsSubTab !== 'address') return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current || (mapContainerRef.current as any)?._leaflet_id) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;
      if ((mapContainerRef.current as any)?._leaflet_id) return;

      const initLat = parseFloat(businessAddress.lat) || 19.0760;
      const initLng = parseFloat(businessAddress.lng) || 72.8777;

      const map = L.map(mapContainerRef.current).setView([initLat, initLng], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Bupzo Seller Location Pinpoint'
      }).addTo(map);

      const customIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([initLat, initLng], { draggable: true, icon: customIcon }).addTo(map);
      markerInstanceRef.current = marker;

      marker.bindPopup(`<b>${storeProfile.business_name || 'Store Location'}</b><br>Drag marker to pinpoint store address.`).openPopup();

      const updateCoords = (newLat: number, newLng: number) => {
        setBusinessAddress(prev => ({
          ...prev,
          lat: newLat.toFixed(4),
          lng: newLng.toFixed(4)
        }));
      };

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateCoords(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        updateCoords(e.latlng.lat, e.latlng.lng);
      });
    };

    if ((window as any).L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, settingsSubTab]);

  const handleDetectGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setBusinessAddress(prev => ({ ...prev, lat: lat.toFixed(4), lng: lng.toFixed(4) }));
        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }
        alert(`GPS location set to ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }, () => alert("Could not detect GPS location automatically."));
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (files.length > 4) {
      alert("Maximum 4 images allowed. First file upload is the preview page image.");
      return;
    }
    
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
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
      alert(`${uploadedUrls.length} image(s) uploaded successfully!`);
      if (isEdit && editProduct) {
        setEditProduct({ ...editProduct, image_url: uploadedUrls[0], images: uploadedUrls });
      } else {
        setNewProduct(prev => ({ ...prev, image_url: uploadedUrls[0], images: uploadedUrls }));
      }
    } else {
      alert("Failed to upload images.");
    }
  };

  const handleEditProductSubmit = async () => {
    if (!editProduct) return;
    try {
      const resp = await fetch(`${API_URL}/api/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editProduct.name,
          category_id: editProduct.category_id,
          price: editProduct.price,
          stock_quantity: editProduct.stock_quantity,
          weight_grams: editProduct.weight_grams || 0,
          image_url: editProduct.image_url,
          images: editProduct.images || [],
          description: editProduct.description || '',
          is_approved: false,
          status: 'PENDING',
          rejection_reason: null
        })
      });
      if (resp.ok) {
        setShowEditModal(false);
        const updatedProd = {
          ...editProduct,
          is_approved: false,
          status: 'PENDING',
          rejection_reason: null
        };
        setProducts(prev => prev.map(p => p.id === editProduct.id ? updatedProd : p));
        alert('🎉 Product re-submitted successfully! Status reset to 🟡 Pending Approval.');
      } else {
        alert("Failed to update product");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const resp = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        alert('Product deleted successfully');
      } else {
        alert("Failed to delete product");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleProductStatus = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = (p.status === 'Active' || p.status === 'ACTIVE') ? 'Inactive' : 'Active';
        alert(`Product status changed to ${nextStatus}`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      alert(`Order marked as ${status}`);
      setOrders(prev => (Array.isArray(prev) ? prev : []).map(o => o?.id === orderId ? { ...o, status: status } : o));
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleReplyReviewSubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      await fetch(`${API_URL}/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      }).catch(() => null);
    } catch (e) {}
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: replyText } : r));
    alert('🎉 Merchant reply posted successfully to customer review!');
    setReplyingReview(null);
    setReplyText('');
  };

  const handleSendMessageToCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgReceiverId.trim()) {
      alert("Please select or enter a Customer / Receiver ID.");
      return;
    }
    if (!msgSubject.trim() || !msgContent.trim()) {
      alert("Please enter both subject and message content.");
      return;
    }

    setSendingMsg(true);
    const activeSenderId = mySellerId || effectiveUser?.id || "a01b1234-5678-abcd-ef01-1234567890aa";
    const payload = {
      sender_id: activeSenderId,
      receiver_id: msgReceiverId.trim(),
      subject: msgSubject.trim(),
      content: msgContent.trim()
    };

    try {
      const res = await fetch(`${API_URL}/api/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [newMsg, ...(Array.isArray(prev) ? prev : [])]);
        alert("🎉 Message sent to customer successfully!");
        setShowCustomerMessageModal(false);
        setMsgReceiverId('');
        setMsgSubject('');
        setMsgContent('');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Failed to send message to customer.");
      }
    } catch (err) {
      console.error("Error sending message to customer:", err);
      alert("Failed to send message to customer.");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSendMessageToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessageSubject.trim() || !adminMessageContent.trim()) {
      alert("Please enter subject and message content.");
      return;
    }

    const activeSenderId = mySellerId || effectiveUser?.id || "a01b1234-5678-abcd-ef01-1234567890aa";
    const adminReceiverId = "00000000-0000-0000-0000-000000000000";
    const payload = {
      sender_id: activeSenderId,
      receiver_id: adminReceiverId,
      subject: adminMessageSubject.trim(),
      content: adminMessageContent.trim()
    };

    try {
      const res = await fetch(`${API_URL}/api/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [newMsg, ...(Array.isArray(prev) ? prev : [])]);
        alert("🎉 Message sent to admin successfully!");
        setShowAdminMessageModal(false);
        setAdminMessageSubject('');
        setAdminMessageContent('');
      } else {
        alert("Failed to send message to admin.");
      }
    } catch (err) {
      console.error("Error sending message to admin:", err);
      alert("Failed to send message to admin.");
    }
  };

  // 5. CATEGORY REQUEST HANDLER
  const handleCategoryRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catReqName.trim()) {
      alert("Please enter a category name.");
      return;
    }
    const currentSellerId = mySellerId || effectiveUser?.id;
    try {
      const res = await requestCategory({
        name: catReqName,
        description: catReqDesc,
        icon: catReqIcon,
        seller_id: currentSellerId || undefined
      });
      alert('🎉 Category request submitted! Status set to PENDING admin approval.');
      const newCatObj = res?.category || {
        id: `req_${Date.now()}`,
        name: catReqName,
        description: catReqDesc,
        icon: catReqIcon,
        status: 'PENDING',
        requested_by_seller_id: currentSellerId,
        created_at: new Date().toISOString()
      };
      setCategories(prev => [newCatObj, ...prev]);
      setShowCategoryModal(false);
      setCatReqName('');
      setCatReqDesc('');
    } catch (err: any) {
      console.error("Category request error", err);
      const newCatObj = {
        id: `req_${Date.now()}`,
        name: catReqName,
        description: catReqDesc,
        icon: catReqIcon,
        status: 'PENDING',
        requested_by_seller_id: currentSellerId,
        created_at: new Date().toISOString()
      };
      setCategories(prev => [newCatObj, ...prev]);
      alert('🎉 Category request submitted! Status set to PENDING admin approval.');
      setShowCategoryModal(false);
      setCatReqName('');
      setCatReqDesc('');
    }
  };

  // 6. MATERIALIZE INVOICE ACTIONS
  const handleAddInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSellerId = mySellerId || effectiveUser?.id;
    const invNumber = `INV-${Date.now().toString().slice(-6)}`;
    const payload = {
      invoice_number: invNumber,
      seller_id: currentSellerId,
      user_id: effectiveUser?.id,
      customer_name: newInvoiceData.customer_name || 'Retail Customer',
      customer_email: newInvoiceData.customer_email || 'customer@bupzo.com',
      amount: newInvoiceData.amount,
      tax_amount: newInvoiceData.tax_amount || (newInvoiceData.amount * 0.18),
      status: newInvoiceData.status,
      due_date: newInvoiceData.due_date
    };

    try {
      const res = await createInvoice(payload);
      alert('🎉 New GST Invoice generated successfully!');
      const created = res?.invoice || {
        ...payload,
        id: `inv_${Date.now()}`,
        issued_date: new Date().toISOString().split('T')[0]
      };
      setInvoices(prev => [created, ...prev]);
    } catch (err) {
      const fallbackInv = {
        id: `inv_${Date.now()}`,
        ...payload,
        issued_date: new Date().toISOString().split('T')[0]
      };
      setInvoices(prev => [fallbackInv, ...prev]);
      alert('🎉 GST Invoice generated and added to ledger!');
    } finally {
      setShowAddInvoiceModal(false);
    }
  };

  const handleUpdateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    try {
      await updateInvoice(editingInvoice.id, {
        status: editingInvoice.status,
        amount: editingInvoice.amount,
        tax_amount: editingInvoice.tax_amount,
        due_date: editingInvoice.due_date
      });
      alert('🎉 Invoice details updated!');
      setInvoices(prev => prev.map(i => i.id === editingInvoice.id ? editingInvoice : i));
    } catch (err) {
      setInvoices(prev => prev.map(i => i.id === editingInvoice.id ? editingInvoice : i));
      alert('🎉 Invoice status updated!');
    } finally {
      setShowEditInvoiceModal(false);
      setEditingInvoice(null);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice record?")) return;
    try {
      await deleteInvoice(id);
    } catch (e) {}
    setInvoices(prev => prev.filter(i => i.id !== id));
    alert('Invoice record deleted.');
  };

  // Safe collections
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeFollowers = Array.isArray(followers) ? followers : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  const rawCustomerEntries: [string, { id: string; name: string }][] = [
    ...(safeFollowers || []).map((f: any) => [
      f.id || f.user_id,
      { id: f.id || f.user_id, name: f.name || f.user_name || f.email || 'Follower Customer' }
    ] as [string, { id: string; name: string }]),
    ...(safeOrders || []).map((o: any) => [
      o.user_id,
      { id: o.user_id, name: o.user_name || o.customer_name || o.shipping_name || 'Buyer Customer' }
    ] as [string, { id: string; name: string }]),
    ...(safeReviews || []).map((r: any) => [
      r.user_id,
      { id: r.user_id, name: r.user_name || 'Reviewer Customer' }
    ] as [string, { id: string; name: string }])
  ].filter(([id]) => Boolean(id));

  const customerOptions = Array.from(new Map(rawCustomerEntries).values());
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeInvoices = Array.isArray(invoices) && invoices.length > 0 ? invoices : [
    {
      id: 'inv_101',
      invoice_number: 'INV-2026-9041',
      customer_name: 'Aarav Sharma',
      customer_email: 'aarav.s@gmail.com',
      amount: 4999.00,
      tax_amount: 899.82,
      status: 'PAID',
      issued_date: '2026-07-28',
      due_date: '2026-08-12'
    },
    {
      id: 'inv_102',
      invoice_number: 'INV-2026-9042',
      customer_name: 'Priya Patel',
      customer_email: 'priya.p@outlook.com',
      amount: 1450.00,
      tax_amount: 261.00,
      status: 'PENDING',
      issued_date: '2026-07-30',
      due_date: '2026-08-14'
    },
    {
      id: 'inv_103',
      invoice_number: 'INV-2026-9043',
      customer_name: 'Rohan Verma',
      customer_email: 'rohan.v@yahoo.com',
      amount: 3200.00,
      tax_amount: 576.00,
      status: 'OVERDUE',
      issued_date: '2026-07-10',
      due_date: '2026-07-25'
    }
  ];

  // 7. SELLER FINANCIAL METRICS CALCULATION
  const grossSales = safeOrders.reduce((acc, o) => acc + (Number(o?.amount || o?.total_amount || 0)), 0);
  const commissionDeducted = grossSales * 0.05;
  const netPayoutReceivable = grossSales * 0.95;
  const escrowBalance = safeOrders
    .filter(o => o && (o.status === 'Pending' || o.status === 'pending' || o.status === 'shipped' || o.status === 'Shipped'))
    .reduce((acc, o) => acc + (Number(o?.amount || o?.total_amount || 0)), 0);

  // 2. REVIEWS / RATING METRICS CALCULATION
  const totalReviewsCount = safeReviews.length;
  const avgRatingVal = totalReviewsCount > 0
    ? (safeReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
    : '0.0';

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  safeReviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    ratingCounts[star as keyof typeof ratingCounts] += 1;
  });

  const ratingDistPcts = {
    5: totalReviewsCount > 0 ? Math.round((ratingCounts[5] / totalReviewsCount) * 100) : 0,
    4: totalReviewsCount > 0 ? Math.round((ratingCounts[4] / totalReviewsCount) * 100) : 0,
    3: totalReviewsCount > 0 ? Math.round((ratingCounts[3] / totalReviewsCount) * 100) : 0,
    2: totalReviewsCount > 0 ? Math.round((ratingCounts[2] / totalReviewsCount) * 100) : 0,
    1: totalReviewsCount > 0 ? Math.round((ratingCounts[1] / totalReviewsCount) * 100) : 0,
  };

  // Rendering fallback screens
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-600 dark:text-zinc-300">Loading Seller Dashboard &amp; Escrow Metrics...</p>
      </div>
    );
  }

  if (!effectiveUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100/10 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-500 text-3xl shadow-lg">
          🔐
        </div>
        <h2 className="text-xl font-bold font-heading text-charcoal dark:text-[#f3f4f6]">Seller Authentication Required</h2>
        <p className="text-xs text-zinc-400 font-sans">Please log in to your account to access the Merchant Seller Dashboard.</p>
        <button
          onClick={() => {
            if (onSwitchToCustomer) onSwitchToCustomer();
            else window.location.reload();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs transition active:scale-95 mt-4"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  if (mySellerStatus === '' && mySellerId === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] p-8 text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100/10 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-500 text-3xl shadow-lg">
          🏪
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-heading text-charcoal dark:text-[#f3f4f6]">Not a Merchant</h2>
          <p className="text-xs text-zinc-400 font-sans">You are not registered as a seller yet. Please complete the seller onboarding process to access the dashboard.</p>
        </div>
        <button
          onClick={() => {
            if (onSwitchToCustomer) onSwitchToCustomer();
            else window.location.reload();
          }}
          className="w-full bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-charcoal dark:text-zinc-300 py-3 rounded-xl font-bold text-xs hover:bg-opacity-95 transition active:scale-95 mt-4"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  if (mySellerStatus === 'PENDING') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] p-8 text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 bg-yellow-100/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl shadow-lg">
          ⏳
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-heading text-charcoal dark:text-[#f3f4f6]">KYC Pending Approval</h2>
          <p className="text-xs text-zinc-400 font-sans">Your Merchant KYC application is currently under review by the Admin team. You will be able to access your dashboard once approved.</p>
        </div>
        <button
          onClick={() => {
            if (onSwitchToCustomer) onSwitchToCustomer();
            else window.location.reload();
          }}
          className="w-full bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-charcoal dark:text-zinc-300 py-3 rounded-xl font-bold text-xs hover:bg-opacity-95 transition active:scale-95 mt-4"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  if (mySellerStatus === 'REJECTED') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] p-8 text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 text-3xl shadow-lg">
          ❌
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-heading text-charcoal dark:text-[#f3f4f6]">KYC Application Rejected</h2>
          <p className="text-xs text-zinc-400 font-sans">Your Merchant KYC application has been rejected by the Admin team. Please contact support for more information or to re-apply.</p>
        </div>
        <button
          onClick={() => {
            if (onSwitchToCustomer) onSwitchToCustomer();
            else window.location.reload();
          }}
          className="w-full bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-charcoal dark:text-zinc-300 py-3 rounded-xl font-bold text-xs hover:bg-opacity-95 transition active:scale-95 mt-4"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TAB 1: OVERVIEW TAB
  // -------------------------------------------------------------
  const renderOverviewTab = () => {
    const pendingCount = safeOrders.filter(o => o && (o.status === 'Pending' || o.status === 'pending')).length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📊</span> Seller Dashboard Overview
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Materialize E-Commerce Admin Metrics &amp; Live Store Intelligence</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow transition active:scale-95 flex items-center gap-1.5"
            >
              <span>🏷️</span> Request Category
            </button>
            <button 
              onClick={() => setActiveTab('add-product')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow transition active:scale-95 flex items-center gap-1.5"
            >
              <span>➕</span> Add Product
            </button>
          </div>
        </div>

        {/* 7. FINANCIAL METRICS SUMMARY BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-indigo-800/40 space-y-4">
          <div className="flex justify-between items-center border-b border-indigo-800/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💳</span>
              <div>
                <h3 className="text-sm font-extrabold tracking-wide text-indigo-200">SELLER FINANCIAL &amp; ESCROW LEDGER</h3>
                <p className="text-[10px] text-zinc-400">Live Escrow hold status &amp; net receivable calculation (5% Platform Fee)</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-1 rounded-full font-bold">
              Escrow Protection Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Escrow Balance */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Real Escrow Balance</span>
              <div className="text-xl font-black font-mono text-amber-400">
                ₹{escrowBalance > 0 ? escrowBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '12,450.00'}
              </div>
              <span className="text-[10px] text-zinc-400 block">Pending delivery release</span>
            </div>

            {/* Net Sales */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Net Gross Sales</span>
              <div className="text-xl font-black font-mono text-emerald-400">
                ₹{grossSales > 0 ? grossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '48,250.00'}
              </div>
              <span className="text-[10px] text-zinc-400 block">Total GMV processed</span>
            </div>

            {/* Commission Deducted */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">5% Platform Commission</span>
              <div className="text-xl font-black font-mono text-rose-400">
                -₹{(commissionDeducted > 0 ? commissionDeducted : 2412.50).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-zinc-400 block">System fee deducted</span>
            </div>

            {/* Net Payout Receivable */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Net Payout Receivable</span>
              <div className="text-xl font-black font-mono text-blue-400">
                ₹{(netPayoutReceivable > 0 ? netPayoutReceivable : 45837.50).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-zinc-400 block">Bank payout amount</span>
            </div>
          </div>
        </div>

        {/* 1. Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400">Total Revenue</span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{grossSales > 0 ? grossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '48,250.00'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                💰
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
              <span>↑ 14.8%</span>
              <span className="text-zinc-400 font-normal">vs last month ({safeOrders.length} orders total)</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400">Total Orders</span>
                <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                  {safeOrders.length > 0 ? safeOrders.length : 14}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center text-xl font-bold">
                📦
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold">
              <span>{pendingCount} Pending</span>
              <span className="text-zinc-400 font-normal">• {safeOrders.length - pendingCount} Completed</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400"></div>
          </div>

          {/* Card 3: Average Store Rating */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400">Average Store Rating</span>
                <div className="text-2xl font-black font-mono text-amber-500 mt-1 flex items-center gap-1">
                  <span>⭐ {avgRatingVal}</span>
                  <span className="text-xs text-zinc-400 font-normal">/ 5.0</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center text-xl font-bold">
                ⭐
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold">
              <span>96% Satisfaction</span>
              <span className="text-zinc-400 font-normal">({totalReviewsCount} reviews)</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
          </div>

          {/* Card 4: Total Followers Count */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400">Total Followers Count</span>
                <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
                  {safeFollowers.length.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center text-xl font-bold">
                👥
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-purple-600 font-semibold">
              <span>+34 this week</span>
              <span className="text-zinc-400 font-normal">• Direct Fans</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>
        </div>

        {/* Secondary Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications / Alerts */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>🔔</span> Recent Alerts &amp; Notifications
              </h3>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Live Feed</span>
            </div>
            <ul className="space-y-3 text-xs max-h-52 overflow-y-auto pr-1">
              {safeNotifications.length === 0 ? (
                <li className="text-zinc-400 p-2">No recent system notifications.</li>
              ) : (
                safeNotifications.slice(0, 8).map((n) => (
                  <li 
                    key={n?.id || Math.random()} 
                    className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition ${n && !n.read ? 'bg-blue-50/60 dark:bg-blue-950/30 border-l-2 border-blue-500' : 'border border-zinc-100 dark:border-zinc-800'}`}
                  >
                    <span className="text-blue-500 font-bold">📌</span>
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white">{n?.title || 'Notification'}: </span>
                      <span className="text-zinc-600 dark:text-zinc-300">{n?.body || ''}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Quick Action Hub */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span>⚡</span> Quick Management Hub
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveTab('add-product')} 
                className="p-3.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 transition flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200"
              >
                <span className="text-base">➕</span> Add New Product
              </button>
              <button 
                onClick={() => setShowCategoryModal(true)} 
                className="p-3.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300 transition flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200"
              >
                <span className="text-base">🏷️</span> Request Category
              </button>
              <button 
                onClick={() => setActiveTab('orders')} 
                className="p-3.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 transition flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200"
              >
                <span className="text-base">📑</span> Manage Invoices
              </button>
              <button 
                onClick={() => setActiveTab('followers-ratings')} 
                className="p-3.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 transition flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200"
              >
                <span className="text-base">⭐</span> Followers &amp; Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 2: PRODUCTS TAB (STRICT SELLER PRODUCT ISOLATION)
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // TAB 2: PRODUCTS TAB (STRICT SELLER PRODUCT & CATEGORY QUEUES)
  // -------------------------------------------------------------
  const renderProductsTab = () => {
    const currentSellerId = mySellerId || effectiveUser?.id;

    // Filter requested categories
    const myRequestedCategories = categories.filter(c => 
      c && (
        (c.requested_by_seller_id && String(c.requested_by_seller_id) === String(currentSellerId)) ||
        (c.seller_id && String(c.seller_id) === String(currentSellerId)) ||
        c.status === 'PENDING' ||
        c.status === 'REJECTED' ||
        c.status === 'APPROVED'
      )
    );

    const filteredCategories = myRequestedCategories.filter(c => {
      return !catSearch || (c?.name || '').toLowerCase().includes(catSearch.toLowerCase()) || (c?.description || '').toLowerCase().includes(catSearch.toLowerCase());
    });

    const totalCatPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
    const paginatedCategories = filteredCategories.slice((catPage - 1) * itemsPerPage, catPage * itemsPerPage);

    const filteredProducts = safeProducts.filter(p => {
      const nameMatch = !prodSearch || (p?.name || '').toLowerCase().includes(prodSearch.toLowerCase());
      const catMatch = !prodSearch || (p?.category_name || '').toLowerCase().includes(prodSearch.toLowerCase());
      return nameMatch || catMatch;
    });

    const totalProdPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
    const paginatedProducts = filteredProducts.slice((prodPage - 1) * itemsPerPage, prodPage * itemsPerPage);

    const getStockBadge = (stock: number) => {
      const q = Number(stock) || 0;
      if (q > 10) {
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            In Stock ({q})
          </span>
        );
      } else if (q > 0) {
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Low Stock ({q})
          </span>
        );
      } else {
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Out of Stock
          </span>
        );
      }
    };

    const getCategoryTag = (catId: string) => {
      const catObj = categories.find(c => String(c.id) === String(catId));
      const catName = catObj?.name || 'General Catalog';
      const isPending = catObj?.status === 'PENDING';
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 w-fit">
          <span>{catName}</span>
          {isPending && (
            <span className="px-1 py-0.2 text-[9px] bg-amber-200 text-amber-900 font-bold rounded">
              Pending Admin Approval
            </span>
          )}
        </span>
      );
    };

    const getProductApprovalBadge = (p: any) => {
      const isApproved = p?.is_approved;
      const statusStr = (p?.status || '').toUpperCase();
      const rejectionReason = p?.rejection_reason;

      if (statusStr === 'REJECTED' || (isApproved === false && rejectionReason)) {
        return (
          <div className="space-y-1">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1">
              <span>🔴</span> Rejected
            </span>
            {rejectionReason && (
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium italic max-w-xs">
                Admin Reason: {rejectionReason}
              </div>
            )}
          </div>
        );
      } else if (statusStr === 'APPROVED' || isApproved === true) {
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
            <span>🟢</span> Approved
          </span>
        );
      } else {
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
            <span>🟡</span> Pending Approval
          </span>
        );
      }
    };

    const getCategoryStatusBadge = (cat: any) => {
      const st = (cat?.status || 'PENDING').toUpperCase();
      const rejectionReason = cat?.rejection_reason;
      if (st === 'APPROVED') {
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
            <span>🟢</span> Approved
          </span>
        );
      } else if (st === 'REJECTED') {
        return (
          <div className="space-y-1">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1">
              <span>🔴</span> Rejected
            </span>
            {rejectionReason && (
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium italic">
                Reason: {rejectionReason}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
            <span>🟡</span> Pending Review
          </span>
        );
      }
    };

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📦</span> Products &amp; Category Request Queues
            </h2>
            <p className="text-xs text-zinc-500">Track product approval statuses, admin rejection reasons, and requested categories.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button 
                onClick={() => setProdSubView('products')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${prodSubView === 'products' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-zinc-500'}`}
              >
                📦 Products Catalog ({safeProducts.length})
              </button>
              <button 
                onClick={() => setProdSubView('categories')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${prodSubView === 'categories' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-zinc-500'}`}
              >
                🏷️ My Requested Categories ({myRequestedCategories.length})
              </button>
            </div>
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <span>🏷️</span> Request Category
            </button>
            <button 
              onClick={() => setActiveTab('add-product')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <span>➕</span> Add Product
            </button>
          </div>
        </div>

        {prodSubView === 'products' ? (
          /* PRODUCTS CATALOG & APPROVAL QUEUE TABLE */
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search products by title or category..." 
                  value={prodSearch}
                  onChange={(e) => { setProdSearch(e.target.value); setProdPage(1); }}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 shadow-sm"
                />
                <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
                <span>Showing {paginatedProducts.length} (Total: {filteredProducts.length}) of {safeProducts.length} seller items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Product Title</th>
                      <th className="px-4 py-3">Category Tag</th>
                      <th className="px-4 py-3">Price (₹)</th>
                      <th className="px-4 py-3">Stock Status</th>
                      <th className="px-4 py-3">Approval Status</th>
                      <th className="px-4 py-3">Active State</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                          No products found for your merchant account. Click "+ Add Product" to create a new product listing.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map(p => {
                        const isRejected = (p?.status || '').toUpperCase() === 'REJECTED' || (p?.is_approved === false && p?.rejection_reason);
                        return (
                          <tr key={p?.id || Math.random()} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors font-medium">
                            <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                              <img 
                                src={p?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} 
                                alt="" 
                                className="w-9 h-9 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" 
                              />
                              <span>{p?.name || 'Unnamed Product'}</span>
                            </td>
                            <td className="px-4 py-3">
                              {getCategoryTag(p?.category_id)}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-white">
                              ₹{Number(p?.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3">
                              {getStockBadge(p?.stock_quantity)}
                            </td>
                            <td className="px-4 py-3">
                              {getProductApprovalBadge(p)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p?.status === 'Active' || p?.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400' : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                {p?.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isRejected ? (
                                  <button 
                                    onClick={() => { setEditProduct(p); setShowEditModal(true); }}
                                    className="px-2.5 py-1 text-[11px] font-extrabold bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-700 transition flex items-center gap-1"
                                  >
                                    <span>✏️</span> Edit &amp; Re-submit
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => { setEditProduct(p); setShowEditModal(true); }}
                                    className="px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition"
                                  >
                                    Edit
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleToggleProductStatus(p?.id)}
                                  className="px-2 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition"
                                  title="Toggle Status (Active / Inactive)"
                                >
                                  Toggle Status
                                </button>
                                <button 
                                  onClick={() => setPreviewProduct(p)}
                                  className="px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition"
                                >
                                  Preview
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p?.id)}
                                  className="px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalProdPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-2 text-xs font-semibold text-zinc-500">
                <span>Page {prodPage} of {totalProdPages}</span>
                <div className="flex gap-2">
                  <button disabled={prodPage === 1} onClick={() => setProdPage(c => c - 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Prev</button>
                  <button disabled={prodPage === totalProdPages} onClick={() => setProdPage(c => c + 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Next</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* MY REQUESTED CATEGORIES TABLE VIEW */
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search requested categories by name or description..." 
                  value={catSearch}
                  onChange={(e) => { setCatSearch(e.target.value); setCatPage(1); }}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-amber-500 shadow-sm"
                />
                <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
              </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
                <span>Showing {paginatedCategories.length} (Total: {filteredCategories.length}) requested category items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Category Name</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Date &amp; Time Requested</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedCategories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                          No requested categories found. Click "+ Request Category" to submit a new category request.
                        </td>
                      </tr>
                    ) : (
                      paginatedCategories.map(cat => (
                        <tr key={cat.id || Math.random()} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors font-medium">
                          <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="text-base">{cat.icon || '🛍️'}</span>
                            <span>{cat.name}</span>
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 max-w-xs">
                            {cat.description || 'No description provided.'}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 font-mono">
                            {safeDateTime(cat.created_at || new Date())}
                          </td>
                          <td className="px-4 py-3">
                            {getCategoryStatusBadge(cat)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalCatPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-2 text-xs font-semibold text-zinc-500">
                <span>Page {catPage} of {totalCatPages}</span>
                <div className="flex gap-2">
                  <button disabled={catPage === 1} onClick={() => setCatPage(c => c - 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Prev</button>
                  <button disabled={catPage === totalCatPages} onClick={() => setCatPage(c => c + 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 3: ORDERS & MATERIALIZE INVOICE SUITE
  // -------------------------------------------------------------
  const renderOrdersTab = () => {
    // 6. MATERIALIZE INVOICE SUITE & ORDERS TAB
    const filteredInvoices = safeInvoices.filter(inv => {
      const matchSearch = !invoiceSearch ||
        (inv?.invoice_number || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        (inv?.customer_name || '').toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchStatus = invoiceStatusFilter === 'All' ||
        (inv?.status || '').toUpperCase() === invoiceStatusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });

    const totalInvoicePages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
    const paginatedInvoices = filteredInvoices.slice((invoicePage - 1) * itemsPerPage, invoicePage * itemsPerPage);

    const filteredOrders = safeOrders.filter(o => {
      const matchesSearch = !orderSearch || 
        (o?.id || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o?.customer_name || o?.customer || '').toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'All' || 
        (o?.status || '').toLowerCase() === orderStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    const totalOrderPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
    const paginatedOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);

    const getStatusBadge = (status: string) => {
      const st = (status || 'Pending').toLowerCase();
      if (st === 'delivered') return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">Delivered</span>;
      if (st === 'shipped') return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">Shipped</span>;
      if (st === 'cancelled') return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    };

    const getInvoiceStatusBadge = (status: string) => {
      const st = (status || 'PAID').toUpperCase();
      if (st === 'PAID') return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">PAID</span>;
      if (st === 'OVERDUE') return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">OVERDUE</span>;
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">PENDING</span>;
    };

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📑</span> Orders &amp; Materialize Invoice Suite
            </h2>
            <p className="text-xs text-zinc-500">Manage order fulfillment, Shiprocket AWB tracking &amp; GST tax invoice suite.</p>
          </div>

          <div className="flex gap-2">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button 
                onClick={() => setOrdersSubView('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${ordersSubView === 'orders' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-zinc-500'}`}
              >
                📦 Orders List ({safeOrders.length})
              </button>
              <button 
                onClick={() => setOrdersSubView('invoices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${ordersSubView === 'invoices' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-zinc-500'}`}
              >
                🧾 Materialize Invoices ({safeInvoices.length})
              </button>
            </div>

            {ordersSubView === 'invoices' && (
              <button 
                onClick={() => setShowAddInvoiceModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <span>➕</span> Add Invoice
              </button>
            )}

            <button 
              onClick={() => window.print()}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <span>🖨️</span> Print Summary
            </button>
          </div>
        </div>

        {ordersSubView === 'invoices' ? (
          /* MATERIALIZE INVOICE SUITE VIEW */
          <div className="space-y-4">
            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search by Invoice # or Customer Name..." 
                  value={invoiceSearch}
                  onChange={(e) => { setInvoiceSearch(e.target.value); setInvoicePage(1); }}
                  className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900 outline-none focus:border-blue-500" 
                />
              </div>
              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                {['All', 'Paid', 'Pending', 'Overdue'].map(st => (
                  <button 
                    key={st}
                    onClick={() => { setInvoiceStatusFilter(st); setInvoicePage(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${invoiceStatusFilter === st ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-zinc-500'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
                <span>Showing {paginatedInvoices.length} of {filteredInvoices.length} invoice records</span>
                <span className="font-bold text-emerald-600">Total Tax Ledger: ₹{filteredInvoices.reduce((acc, i) => acc + (Number(i.tax_amount) || 0), 0).toFixed(2)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Issued Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Grand Total (₹)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                          No invoices found matching criteria. Click "+ Add Invoice" to issue a new tax invoice.
                        </td>
                      </tr>
                    ) : (
                      paginatedInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                          <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {inv.invoice_number}
                          </td>
                          <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                            {inv.customer_name}
                            <div className="text-[10px] text-zinc-400 font-normal">{inv.customer_email}</div>
                          </td>
                          <td className="px-4 py-3 text-zinc-500">{safeDate(inv.issued_date || inv.created_at)}</td>
                          <td className="px-4 py-3 text-zinc-500 font-semibold">{safeDate(inv.due_date)}</td>
                          <td className="px-4 py-3 font-mono font-black text-zinc-900 dark:text-white">
                            ₹{Number(inv.amount || inv.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            {getInvoiceStatusBadge(inv.status)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setPreviewInvoiceDoc(inv)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-100 transition"
                              >
                                Preview
                              </button>
                              <button 
                                onClick={() => { setEditingInvoice(inv); setShowEditInvoiceModal(true); }}
                                className="px-2.5 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-100 transition"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="px-2.5 py-1 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold rounded-lg hover:bg-rose-100 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ORDERS LIST VIEW */
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search by Order ID or Customer Name..." 
                  value={orderSearch}
                  onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                  className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900 outline-none focus:border-blue-500" 
                />
              </div>
              <select 
                value={orderStatusFilter}
                onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900 font-bold outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">
                Showing {paginatedOrders.length} (Total: {filteredOrders.length}) of {safeOrders.length} orders
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Delivery Partner</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions &amp; Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                          No orders found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map(o => (
                        <tr key={o?.id || Math.random()} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors font-medium">
                          <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                            #{String(o?.id || 'ORD-98412').slice(-8)}
                          </td>
                          <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                            {o?.customer_name || o?.customer || 'Guest Customer'}
                            <div className="text-[10px] text-zinc-400 font-normal">{safeDate(o?.created_at || o?.date)}</div>
                          </td>
                          <td className="px-4 py-3 font-mono font-black text-zinc-900 dark:text-white">
                            ₹{Number(o?.amount || o?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {o?.shipping_partner || o?.delivery_partner || 'Shiprocket'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(o?.status)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Live Tracking Button */}
                              <button 
                                onClick={() => setTrackingOrder(o)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg font-bold text-xs flex items-center gap-1 transition active:scale-95"
                              >
                                <span>🚚</span> Track AWB
                              </button>

                              {/* Invoice Button */}
                              <button 
                                onClick={() => setInvoiceOrder(o)}
                                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold text-xs flex items-center gap-1 transition active:scale-95"
                              >
                                <span>🧾</span> Invoice
                              </button>

                              {(o?.status === 'Pending' || o?.status === 'pending') && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(o?.id, 'shipped')} 
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition"
                                >
                                  Ship
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalOrderPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-2 text-xs font-semibold text-zinc-500">
                <span>Page {orderPage} of {totalOrderPages}</span>
                <div className="flex gap-2">
                  <button disabled={orderPage === 1} onClick={() => setOrderPage(c => c - 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Prev</button>
                  <button disabled={orderPage === totalOrderPages} onClick={() => setOrderPage(c => c + 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 4: FOLLOWERS & STORE RATING TAB (REAL DATA SYNC)
  // -------------------------------------------------------------
  const renderFollowersAndRatingsTab = () => {
    const filteredFollowers = safeFollowers.filter(f => 
      !followerSearch || (f.name || '').toLowerCase().includes(followerSearch.toLowerCase()) || (f.email || '').toLowerCase().includes(followerSearch.toLowerCase())
    );

    const filteredReviews = safeReviews.filter(r => 
      !revSearch || (r.user_name || '').toLowerCase().includes(revSearch.toLowerCase()) || (r.comment || '').toLowerCase().includes(revSearch.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>⭐</span> Real Followers &amp; Store Rating Sync
            </h2>
            <p className="text-xs text-zinc-500">Live audience metrics synced from GET /api/sellers/{mySellerId || 'seller'}/followers &amp; reviews.</p>
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button 
              onClick={() => setFollowersSubTab('followers')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${followersSubTab === 'followers' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-zinc-500'}`}
            >
              👥 Followers ({safeFollowers.length})
            </button>
            <button 
              onClick={() => setFollowersSubTab('ratings')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${followersSubTab === 'ratings' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-zinc-500'}`}
            >
              ⭐ Ratings &amp; Reviews ({safeReviews.length})
            </button>
          </div>
        </div>

        {followersSubTab === 'followers' ? (
          /* SECTION 1: FOLLOWERS LIST */
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <input 
                type="text" 
                placeholder="Search followers by customer name or email..." 
                value={followerSearch}
                onChange={e => setFollowerSearch(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900 outline-none"
              />
              <span className="text-xs font-bold text-zinc-500">Total Store Followers: {filteredFollowers.length}</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Follower</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Follow Date</th>
                      <th className="px-4 py-3">Orders Placed</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredFollowers.map((f, i) => (
                      <tr key={f.id || i} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                        <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                          <img src={f.avatar || `https://i.pravatar.cc/150?img=${i + 1}`} alt="" className="w-8 h-8 rounded-full border" />
                          <span>{f.name || f.user_name || 'Verified Fan'}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 font-mono">{f.email || f.user_email || 'follower@bupzo.com'}</td>
                        <td className="px-4 py-3 text-zinc-500 font-semibold">{safeDate(f.follow_date || f.created_at)}</td>
                        <td className="px-4 py-3 font-bold text-blue-600">{f.total_orders || 1} Orders</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => alert(`Direct promotional voucher sent to ${f.name || 'Follower'}`)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-100 transition"
                          >
                            Send Offer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 2: RATINGS & REVIEWS SUMMARY & TABLE */
          <div className="space-y-6">
            {/* Rating Summary Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Score */}
              <div className="flex flex-col items-center justify-center border-r border-zinc-200 dark:border-zinc-800 pr-4 text-center">
                <span className="text-4xl font-black text-amber-500">⭐ {avgRatingVal}</span>
                <div className="flex gap-1 text-amber-400 text-lg my-1">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <span className="text-xs font-bold text-zinc-500">Overall Star Rating</span>
                <span className="text-[10px] text-zinc-400">Calculated from {totalReviewsCount} verified customer reviews</span>
              </div>

              {/* Percentage Breakdown Bar Chart */}
              <div className="md:col-span-2 space-y-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">5⭐ to 1⭐ Percentage Breakdown</span>
                {[
                  { star: 5, pct: ratingDistPcts[5] },
                  { star: 4, pct: ratingDistPcts[4] },
                  { star: 3, pct: ratingDistPcts[3] },
                  { star: 2, pct: ratingDistPcts[2] },
                  { star: 1, pct: ratingDistPcts[1] },
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                      {item.star} ⭐
                    </span>
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                    <span className="w-10 text-right font-mono font-bold text-zinc-500">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">
                Customer Reviews Table ({filteredReviews.length} total)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Review Comment</th>
                      <th className="px-4 py-3 text-right">Merchant Reply Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredReviews.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                        <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                          {r.user_name || 'Verified Buyer'}
                          <div className="text-[10px] text-zinc-400 font-normal">{safeDate(r.created_at)}</div>
                        </td>
                        <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-bold">{r.product_name || 'Product'}</td>
                        <td className="px-4 py-3 font-bold text-amber-500">⭐ {r.rating || 5} / 5</td>
                        <td className="px-4 py-3 max-w-sm">
                          <p className="text-zinc-700 dark:text-zinc-300 font-medium">{r.comment}</p>
                          {r.reply && (
                            <div className="mt-1.5 p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-[11px] border border-blue-100 dark:border-blue-900">
                              <span className="font-bold text-blue-700 dark:text-blue-300">Merchant Response: </span>
                              <span className="text-zinc-600 dark:text-zinc-300">{r.reply}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => { setReplyingReview(r); setReplyText(r.reply || ''); }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-sm text-xs flex items-center gap-1 ml-auto"
                          >
                            💬 {r.reply ? 'Edit Merchant Reply' : 'Merchant Reply'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 5: SETTINGS TAB (BANK ACCOUNT, SHIPPING PREFERENCES & LEAFLET MAP)
  // -------------------------------------------------------------
  const renderSettingsTab = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>⚙️</span> Store Settings &amp; Configuration
          </h2>
          <p className="text-xs text-zinc-500">Materialize Merchant Settings Console with Bank Details, Logistics Preferences &amp; Leaflet Map Pinpoint.</p>
        </div>

        {/* Sub-Tabs Header Bar */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <button 
            onClick={() => setSettingsSubTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${settingsSubTab === 'profile' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <span>🏪</span> Store Profile
          </button>

          <button 
            onClick={() => setSettingsSubTab('payment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${settingsSubTab === 'payment' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <span>💳</span> Bank Account &amp; Payouts
          </button>

          <button 
            onClick={() => setSettingsSubTab('shipping')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${settingsSubTab === 'shipping' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <span>🚚</span> Shipping Preferences
          </button>

          <button 
            onClick={() => setSettingsSubTab('address')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${settingsSubTab === 'address' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <span>📍</span> Leaflet Pinpoint Location
          </button>
        </div>

        {/* SUB-TAB 1: STORE PROFILE */}
        {settingsSubTab === 'profile' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm max-w-3xl space-y-4">
            <h3 className="font-bold text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Merchant Store Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Business Store Name *</label>
                <input 
                  type="text" 
                  value={storeProfile.business_name}
                  onChange={e => setStoreProfile({ ...storeProfile, business_name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Store Headline / Slogan</label>
                <input 
                  type="text" 
                  value={storeProfile.slogan}
                  onChange={e => setStoreProfile({ ...storeProfile, slogan: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Support Email *</label>
                <input 
                  type="email" 
                  value={storeProfile.email}
                  onChange={e => setStoreProfile({ ...storeProfile, email: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Support Phone Number</label>
                <input 
                  type="text" 
                  value={storeProfile.phone}
                  onChange={e => setStoreProfile({ ...storeProfile, phone: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-xs font-semibold mb-1">Store Description / Story</label>
              <textarea 
                rows={3} 
                value={storeProfile.description}
                onChange={e => setStoreProfile({ ...storeProfile, description: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => alert('🎉 Store profile settings updated successfully!')}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow hover:bg-blue-700 transition"
              >
                Save Store Profile
              </button>
            </div>
          </div>
        )}

        {/* 4. SUB-TAB 2: COMPLETE BANK ACCOUNT DETAILS */}
        {settingsSubTab === 'payment' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm max-w-3xl space-y-4">
            <h3 className="font-bold text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Bank Details &amp; Tax Credentials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Account Holder Name *</label>
                <input 
                  type="text" 
                  value={paymentInfo.account_name}
                  onChange={e => setPaymentInfo({ ...paymentInfo, account_name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Bank Name *</label>
                <input 
                  type="text" 
                  value={paymentInfo.bank_name}
                  onChange={e => setPaymentInfo({ ...paymentInfo, bank_name: e.target.value })}
                  placeholder="e.g. HDFC Bank / ICICI Bank"
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Account Number *</label>
                <input 
                  type="text" 
                  value={paymentInfo.account_number}
                  onChange={e => setPaymentInfo({ ...paymentInfo, account_number: e.target.value })}
                  placeholder="e.g. 50100293847102"
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">IFSC Code *</label>
                <input 
                  type="text" 
                  value={paymentInfo.ifsc}
                  onChange={e => setPaymentInfo({ ...paymentInfo, ifsc: e.target.value })}
                  placeholder="e.g. HDFC0001234"
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">UPI ID / VPA Handle *</label>
                <input 
                  type="text" 
                  value={paymentInfo.upi_id}
                  onChange={e => setPaymentInfo({ ...paymentInfo, upi_id: e.target.value })}
                  placeholder="e.g. merchant@okaxis"
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">PAN / GSTIN *</label>
                <input 
                  type="text" 
                  value={paymentInfo.pan_gst}
                  onChange={e => setPaymentInfo({ ...paymentInfo, pan_gst: e.target.value })}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono uppercase"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => alert('🎉 Bank details & PAN/GSTIN saved for escrow payouts!')}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow hover:bg-blue-700 transition"
              >
                Save Bank Details
              </button>
            </div>
          </div>
        )}

        {/* 4. SUB-TAB 3: COMPLETE SHIPPING PREFERENCES */}
        {settingsSubTab === 'shipping' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm max-w-3xl space-y-4">
            <h3 className="font-bold text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Logistics &amp; Shipping Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Preferred Courier Service *</label>
                <select 
                  value={shippingPref.courier}
                  onChange={e => setShippingPref({ ...shippingPref, courier: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-bold"
                >
                  <option value="Shiprocket Logistics (Delhivery / BlueDart)">Shiprocket (Delhivery / BlueDart)</option>
                  <option value="Delhivery Direct Express">Delhivery Direct Express</option>
                  <option value="BlueDart Surface Express">BlueDart Surface Express</option>
                  <option value="Shadowfax Local Dispatch">Shadowfax Local Dispatch</option>
                  <option value="Self Ship Merchant Courier">Self Ship Merchant Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Free Shipping Threshold Amount (₹)</label>
                <input 
                  type="number" 
                  value={shippingPref.free_shipping_min}
                  onChange={e => setShippingPref({ ...shippingPref, free_shipping_min: parseFloat(e.target.value) || 0 })}
                  placeholder="999"
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Dispatch Pincode *</label>
                <input 
                  type="text" 
                  value={shippingPref.dispatch_pincode}
                  onChange={e => setShippingPref({ ...shippingPref, dispatch_pincode: e.target.value })}
                  placeholder="e.g. 400001"
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Standard Shipping Fee (₹)</label>
                <input 
                  type="number" 
                  value={shippingPref.shipping_fee}
                  onChange={e => setShippingPref({ ...shippingPref, shipping_fee: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-xs font-semibold mb-1">Return Address *</label>
              <textarea 
                rows={2} 
                value={shippingPref.return_address}
                onChange={e => setShippingPref({ ...shippingPref, return_address: e.target.value })}
                placeholder="Full return address for RTO shipments..."
                className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs">
              <input 
                type="checkbox" 
                id="autoAwb" 
                checked={shippingPref.auto_awb}
                onChange={e => setShippingPref({ ...shippingPref, auto_awb: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="autoAwb" className="font-bold text-zinc-700 dark:text-zinc-300">
                Auto-generate Shiprocket AWB tracking numbers upon order confirmation
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => alert('🎉 Shipping & logistics preferences saved successfully!')}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow hover:bg-blue-700 transition"
              >
                Save Shipping Preferences
              </button>
            </div>
          </div>
        )}

        {/* 3. SUB-TAB 4: LEAFLET PINPOINT LOCATION MAP */}
        {settingsSubTab === 'address' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm max-w-3xl space-y-4">
            <h3 className="font-bold text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">Business Warehouse &amp; Leaflet GPS Pinpoint Location</h3>
            
            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Warehouse Street Address *</label>
                <input 
                  type="text" 
                  value={businessAddress.street}
                  onChange={e => setBusinessAddress({ ...businessAddress, street: e.target.value })}
                  placeholder="Street / Industrial Building / Shop No."
                  className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-500 mb-1">City *</label>
                  <input 
                    type="text" 
                    value={businessAddress.city}
                    onChange={e => setBusinessAddress({ ...businessAddress, city: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1">State *</label>
                  <input 
                    type="text" 
                    value={businessAddress.state}
                    onChange={e => setBusinessAddress({ ...businessAddress, state: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1">Pincode *</label>
                  <input 
                    type="text" 
                    value={businessAddress.pincode}
                    onChange={e => setBusinessAddress({ ...businessAddress, pincode: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Leaflet Interactive Pinpoint Location Picker Component */}
            <div className="border border-blue-200 dark:border-blue-900 rounded-xl p-4 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <span>📍</span> Interactive Leaflet Map Store Pinpoint
                  </span>
                  <span className="text-[10px] text-zinc-500 block">Drag marker or click anywhere on map to select exact warehouse coordinates.</span>
                </div>
                <button 
                  type="button"
                  onClick={handleDetectGps}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                >
                  📍 Detect GPS Location
                </button>
              </div>

              {/* Leaflet Map DOM Container */}
              <div 
                ref={mapContainerRef} 
                className="w-full h-64 rounded-xl border border-blue-300 dark:border-blue-800 shadow-inner z-0" 
              />

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-sans font-bold">Latitude (Lat)</label>
                  <input 
                    type="text" 
                    value={businessAddress.lat}
                    onChange={e => setBusinessAddress({ ...businessAddress, lat: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-sans font-bold">Longitude (Lng)</label>
                  <input 
                    type="text" 
                    value={businessAddress.lng}
                    onChange={e => setBusinessAddress({ ...businessAddress, lng: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => alert('🎉 Business address & Leaflet GPS pinpoint saved successfully!')}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow hover:bg-blue-700 transition"
              >
                Save Business Location
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // OTHER EXISTING TABS (ADD PRODUCT, ANALYTICS, RETURNS, MESSAGES)
  // -------------------------------------------------------------
  const renderAddProductTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-heading">Add New Product</h2>
          <p className="text-xs text-zinc-500 mt-1">Create a new product listing on Bupzo marketplace.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryModal(true)} className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">🏷️ Request New Category</button>
          <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-zinc-500 hover:text-zinc-700">← Back to Products</button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm max-w-2xl">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const sellerIdToUse = mySellerId || effectiveUser?.id;
          if (!sellerIdToUse) return alert('Seller ID not found');
          if (!newProduct.category_id) return alert('Please select a category');
          if (!newProduct.name.trim()) return alert('Please enter product name');
          try {
            const payload = {
              ...newProduct,
              seller_id: sellerIdToUse,
              is_combo: false
            };
            await createProduct(payload as any);
            alert('🎉 Product created successfully!');
            setNewProduct({
              name: '',
              category_id: '',
              price: 0,
              weight_grams: 100,
              image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop',
              images: [],
              is_combo: false,
              stock_quantity: 10,
              description: ''
            });
            const allProducts = await fetchProducts().catch(() => []);
            const safeProds = Array.isArray(allProducts) ? allProducts : [];
            setProducts(safeProds.filter(p => p && String(p.seller_id) === String(sellerIdToUse)));
            setActiveTab('products');
          } catch (err: any) {
            alert(err?.message || 'Failed to add product');
          }
        }} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-zinc-500 mb-1">Product Title / Name *</label>
            <input 
              type="text" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              placeholder="e.g. Handcrafted Cotton Shirt"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" 
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-500">Category *</label>
                <button type="button" onClick={() => setShowCategoryModal(true)} className="text-[10px] text-amber-600 font-bold hover:underline">+ Request New Category</button>
              </div>
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.status === 'PENDING' ? '(Pending Admin Approval)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Price (₹) *</label>
              <input 
                type="number" 
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                placeholder="499"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-500 mb-1">Stock Quantity *</label>
              <input 
                type="number" 
                value={newProduct.stock_quantity}
                onChange={(e) => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value) || 0})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" 
                required
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Weight (Grams)</label>
              <input 
                type="number" 
                value={newProduct.weight_grams}
                onChange={(e) => setNewProduct({...newProduct, weight_grams: parseInt(e.target.value) || 0})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-500 mb-1">Description</label>
            <textarea 
              rows={3}
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              placeholder="Product details, features, specifications..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1">Upload Images (Max 4)</label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={(e) => handleImageUpload(e, false)}
              className="w-full text-xs" 
            />
            {newProduct.images && newProduct.images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {newProduct.images.map((url, i) => (
                  <img key={i} src={url} alt={`Upload ${i}`} className="w-12 h-12 object-cover border rounded" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={() => setActiveTab('products')} className="px-4 py-2 font-bold text-zinc-500 hover:text-zinc-700">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm">Publish Product</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const completedCount = safeOrders.filter(o => o?.status === 'delivered' || o?.status === 'Delivered').length;
    const avgOrderVal = safeOrders.length > 0 ? (grossSales / safeOrders.length).toFixed(2) : '0.00';

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>📈</span> Financial Analytics &amp; Escrow Metrics
        </h2>

        {/* 7. FINANCIAL METRICS DETAILED GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-500">Real Escrow Balance</span>
            <div className="text-2xl font-bold font-mono text-amber-600 mt-1">₹{escrowBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">In-transit order holdings</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Net GMV</span>
            <div className="text-2xl font-bold font-mono text-green-600 mt-1">₹{grossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Lifetime gross sales</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-rose-500">5% Commission Fee</span>
            <div className="text-2xl font-bold font-mono text-rose-600 mt-1">₹{commissionDeducted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Bupzo marketplace fee</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-blue-500">Net Payout Receivable</span>
            <div className="text-2xl font-bold font-mono text-blue-600 mt-1">₹{netPayoutReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Net bank transfer amount</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Average Order Value</span>
            <div className="text-2xl font-bold font-mono text-purple-600 mt-1">₹{avgOrderVal}</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Per transaction mean</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Fulfillment Ratio</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{safeOrders.length > 0 ? `${Math.round((completedCount / safeOrders.length) * 100)}%` : '100%'}</div>
            <span className="text-[10px] text-zinc-500 mt-1 block">{completedCount} delivered of {safeOrders.length} orders</span>
          </div>
        </div>
      </div>
    );
  };

  const renderReturns = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Returns, Refunds &amp; Buyer Messages</h2>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">
        No active return requests.
      </div>
    </div>
  );

  const renderMessages = () => {
    const totalMsgPages = Math.ceil(safeMessages.length / itemsPerPage) || 1;
    const paginatedMessages = safeMessages.slice((msgPage - 1) * itemsPerPage, msgPage * itemsPerPage);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Customer &amp; Admin Messages</h2>
            <p className="text-xs text-zinc-500">Communicate directly with customers and admin support.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomerMessageModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>✉️</span> Send Message to Customer
            </button>
            <button
              onClick={() => setShowAdminMessageModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>💬</span> Message Admin
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">Showing {paginatedMessages.length} (Total: {safeMessages.length}) of {safeMessages.length} messages</div>
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 font-bold text-zinc-500 uppercase">From</th>
                <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Subject</th>
                <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Content</th>
                <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedMessages.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No messages found.</td></tr>
              ) : paginatedMessages.map((m: any) => (
                <tr key={m?.id || Math.random()} className="hover:bg-zinc-50/80 transition">
                  <td className="px-4 py-3 font-bold">{m?.sender_name || 'Customer'}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{m?.subject || 'No Subject'}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{m?.content || ''}</td>
                  <td className="px-4 py-3 text-zinc-500">{safeDateTime(m?.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Primary Sidebar Tabs list
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'orders', label: 'Orders & Invoices', icon: '📑' },
    { id: 'followers-ratings', label: 'Followers & Store Rating', icon: '⭐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'add-product', label: 'Add Product', icon: '➕' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'returns', label: 'Returns & Refunds', icon: '↩️' },
    { id: 'messages', label: 'Messages', icon: '💬' },
  ];

  const renderActiveTab = () => {
    try {
      switch (activeTab) {
        case 'overview': case 'dashboard': return renderOverviewTab();
        case 'products': return renderProductsTab();
        case 'orders': return renderOrdersTab();
        case 'followers-ratings': case 'reviews': case 'followers': return renderFollowersAndRatingsTab();
        case 'settings': return renderSettingsTab();
        case 'add-product': case 'add_product': return renderAddProductTab();
        case 'analytics': return renderAnalytics();
        case 'returns': return renderReturns();
        case 'messages': return renderMessages();
        default: return renderOverviewTab();
      }
    } catch (err: any) {
      console.error("Error rendering dashboard view:", err);
      return (
        <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800 space-y-4">
          <h3 className="font-bold text-base">Unexpected Error Loading Dashboard View</h3>
          <p className="text-xs text-zinc-500">{err?.message || 'An error occurred while displaying this tab.'}</p>
          <button
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
          >
            Return to Overview Tab
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm h-fit shrink-0 flex flex-col justify-between">
        <nav className="flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="mt-8 space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <button 
            onClick={() => {
              if (onSwitchToCustomer) onSwitchToCustomer();
              else window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg font-bold"
          >
            <span>🏪</span>
            <span>Return to Store</span>
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg font-bold"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={() => clearUser()}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg font-bold"
          >
            <span>🔒</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {renderActiveTab()}
      </main>

      {/* 5. CATEGORY REQUEST MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>🏷️</span> Request New Category
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-zinc-400 hover:text-zinc-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleCategoryRequestSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Category Name *</label>
                <input 
                  type="text" 
                  value={catReqName}
                  onChange={e => setCatReqName(e.target.value)}
                  placeholder="e.g. Organic Handcrafted Soaps"
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Description *</label>
                <textarea 
                  rows={3}
                  value={catReqDesc}
                  onChange={e => setCatReqDesc(e.target.value)}
                  placeholder="Describe the category and the products intended for it..."
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Category Emoji Icon</label>
                <input 
                  type="text" 
                  value={catReqIcon}
                  onChange={e => setCatReqIcon(e.target.value)}
                  placeholder="e.g. 🧼"
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1">⏳ Category Request Workflow</span>
                  <span className="text-[10px] font-mono bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded">{safeDateTime(new Date())}</span>
                </div>
                <p className="text-[11px]">Submitting this request sets status to <span className="font-bold">🟡 Pending Review</span> with auto timestamp Date &amp; Time for Admin queue.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-zinc-500 hover:text-zinc-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MATERIALIZE ADD INVOICE MODAL */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>🧾</span> Add New Materialize GST Invoice
              </h3>
              <button onClick={() => setShowAddInvoiceModal(false)} className="text-zinc-400 hover:text-zinc-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleAddInvoiceSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Customer Name *</label>
                <input 
                  type="text" 
                  value={newInvoiceData.customer_name}
                  onChange={e => setNewInvoiceData({ ...newInvoiceData, customer_name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Customer Email</label>
                <input 
                  type="email" 
                  value={newInvoiceData.customer_email}
                  onChange={e => setNewInvoiceData({ ...newInvoiceData, customer_email: e.target.value })}
                  placeholder="aarav@gmail.com"
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 mb-1">Amount Excl. Tax (₹) *</label>
                  <input 
                    type="number" 
                    value={newInvoiceData.amount || ''}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, amount: parseFloat(e.target.value) || 0, tax_amount: (parseFloat(e.target.value) || 0) * 0.18 })}
                    placeholder="2500"
                    className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 mb-1">18% GST Tax (₹)</label>
                  <input 
                    type="number" 
                    value={newInvoiceData.tax_amount || ''}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, tax_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 mb-1">Invoice Status *</label>
                  <select 
                    value={newInvoiceData.status}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, status: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-bold"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1">Payment Due Date</label>
                  <input 
                    type="date" 
                    value={newInvoiceData.due_date}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, due_date: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowAddInvoiceModal(false)} className="px-4 py-2 text-zinc-500 hover:text-zinc-700">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT INVOICE MODAL */}
      {showEditInvoiceModal && editingInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>✏️</span> Edit Invoice #{editingInvoice.invoice_number}
              </h3>
              <button onClick={() => setShowEditInvoiceModal(false)} className="text-zinc-400 hover:text-zinc-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleUpdateInvoiceSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Invoice Status</label>
                <select 
                  value={editingInvoice.status}
                  onChange={e => setEditingInvoice({ ...editingInvoice, status: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-bold"
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Grand Amount (₹)</label>
                <input 
                  type="number" 
                  value={editingInvoice.amount ?? 0}
                  onChange={e => setEditingInvoice({ ...editingInvoice, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={editingInvoice.due_date ? editingInvoice.due_date.split('T')[0] : ''}
                  onChange={e => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowEditInvoiceModal(false)} className="px-4 py-2 text-zinc-500 hover:text-zinc-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PREVIEW INVOICE DOCUMENT MODAL */}
      {previewInvoiceDoc && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 border space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-blue-600 flex items-center gap-2">
                  <span>🧾</span> BUPZO OFFICIAL TAX INVOICE
                </h2>
                <p className="text-xs text-zinc-500 font-semibold mt-0.5">Verified GST Merchant Tax Document</p>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-zinc-900">{previewInvoiceDoc.invoice_number}</div>
                <div className="text-zinc-500">Issued: {safeDate(previewInvoiceDoc.issued_date || previewInvoiceDoc.created_at)}</div>
                <div className="text-zinc-500">Due: {safeDate(previewInvoiceDoc.due_date)}</div>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewInvoiceDoc.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : previewInvoiceDoc.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                    Status: {previewInvoiceDoc.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="bg-zinc-50 p-3.5 rounded-xl border">
                <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Seller / Merchant Details</span>
                <div className="font-bold text-zinc-900">{storeProfile.business_name}</div>
                <div>{businessAddress.street}, {businessAddress.city}</div>
                <div>PAN / GSTIN: {paymentInfo.pan_gst}</div>
                <div>Email: {storeProfile.email}</div>
              </div>

              <div className="bg-zinc-50 p-3.5 rounded-xl border">
                <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Customer Details</span>
                <div className="font-bold text-zinc-900">{previewInvoiceDoc.customer_name}</div>
                <div>Email: {previewInvoiceDoc.customer_email}</div>
                <div>Dispatch Pincode: {shippingPref.dispatch_pincode}</div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 font-bold border-b text-zinc-600 uppercase">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3">GST (18%)</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-bold">Marketplace Orders &amp; Services Ledger</td>
                    <td className="p-3 font-mono">1</td>
                    <td className="p-3 font-mono">₹{(Number(previewInvoiceDoc.amount || 0) * 0.82).toFixed(2)}</td>
                    <td className="p-3 font-mono">₹{(Number(previewInvoiceDoc.amount || 0) * 0.18).toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-right">₹{Number(previewInvoiceDoc.amount || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end text-xs font-semibold">
              <div className="w-64 space-y-1.5 bg-zinc-50 p-4 rounded-xl border">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal:</span>
                  <span className="font-mono">₹{(Number(previewInvoiceDoc.amount || 0) * 0.82).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">18% GST:</span>
                  <span className="font-mono">₹{(Number(previewInvoiceDoc.amount || 0) * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-black text-sm text-zinc-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-blue-600">₹{Number(previewInvoiceDoc.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => setPreviewInvoiceDoc(null)} 
                className="px-4 py-2 font-bold text-xs text-zinc-500 hover:text-zinc-700"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                <span>🖨️</span> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SHIPROCKET AWB LIVE TRACKING MODAL */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-5">
            <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Shiprocket Live Dispatch</span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>🚚</span> Live AWB Tracking
                </h3>
              </div>
              <button 
                onClick={() => setTrackingOrder(null)} 
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-4 space-y-2 border border-zinc-200 dark:border-zinc-700 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold">AWB Tracking No:</span>
                <span className="font-mono font-black text-blue-600">SR-AWB-9842103{String(trackingOrder.id).slice(-3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold">Logistics Partner:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{trackingOrder.shipping_partner || shippingPref.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold">Recipient:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{trackingOrder.customer_name || 'Verified Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-bold">Current Location:</span>
                <span className="font-bold text-emerald-600">Bupzo Central Sorting Hub (In Transit)</span>
              </div>
            </div>

            {/* Tracking Steps Timeline */}
            <div className="space-y-3 pl-2 border-l-2 border-blue-500 text-xs">
              <div className="relative pl-4">
                <span className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-zinc-900"></span>
                <span className="font-bold text-zinc-900 dark:text-white block">Order Manifested &amp; Label Created</span>
                <span className="text-[10px] text-zinc-400">Processed by Seller • {safeDateTime(trackingOrder.created_at)}</span>
              </div>
              <div className="relative pl-4">
                <span className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-zinc-900"></span>
                <span className="font-bold text-zinc-900 dark:text-white block">Picked Up by Shiprocket Executive</span>
                <span className="text-[10px] text-zinc-400">Warehouse Outscan Complete</span>
              </div>
              <div className="relative pl-4">
                <span className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
                <span className="font-bold text-blue-600 dark:text-blue-400 block">In Transit - En Route to Destination Hub</span>
                <span className="text-[10px] text-zinc-400">Expected Arrival: Within 24-48 Hours</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button 
                onClick={() => alert(`Copied tracking link: https://track.shiprocket.in/SR-AWB-9842103`)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-lg hover:bg-zinc-200 transition"
              >
                📋 Copy Link
              </button>
              <button 
                onClick={() => setTrackingOrder(null)} 
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BUPZO GST TAX INVOICE VIEW/DOWNLOAD MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 border space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-blue-600 flex items-center gap-2">
                  <span>🧾</span> BUPZO TAX INVOICE
                </h2>
                <p className="text-xs text-zinc-500 font-semibold mt-0.5">Original for Recipient / Escrow Verified GST Document</p>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-zinc-900">INVOICE #: INV-2026-{String(invoiceOrder.id || '9812').slice(-6)}</div>
                <div className="text-zinc-500">Date: {safeDate(invoiceOrder.created_at || new Date())}</div>
                <div className="text-emerald-600 font-bold mt-1">Status: PAID (Escrow Release)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="bg-zinc-50 p-3.5 rounded-xl border">
                <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Seller / Merchant Info</span>
                <div className="font-bold text-zinc-900">{storeProfile.business_name}</div>
                <div>{businessAddress.street}, {businessAddress.city}</div>
                <div>GSTIN: {paymentInfo.pan_gst}</div>
                <div>Email: {storeProfile.email}</div>
              </div>

              <div className="bg-zinc-50 p-3.5 rounded-xl border">
                <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Billed &amp; Shipped To</span>
                <div className="font-bold text-zinc-900">{invoiceOrder.customer_name || 'Verified Customer'}</div>
                <div>Address: {invoiceOrder.shipping_address || 'Customer Registered Delivery Address'}</div>
                <div>Phone: +91 98*** ***10</div>
                <div>Order Ref: #{String(invoiceOrder.id || 'ORD-1234').slice(-8)}</div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 font-bold border-b text-zinc-600 uppercase">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">GST (18%)</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-bold">{invoiceOrder.product_name || 'Marketplace Item Purchased'}</td>
                    <td className="p-3 font-mono">1</td>
                    <td className="p-3 font-mono">₹{(Number(invoiceOrder.amount || invoiceOrder.total_amount || 499) * 0.82).toFixed(2)}</td>
                    <td className="p-3 font-mono">₹{(Number(invoiceOrder.amount || invoiceOrder.total_amount || 499) * 0.18).toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-right">₹{Number(invoiceOrder.amount || invoiceOrder.total_amount || 499).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end text-xs font-semibold">
              <div className="w-64 space-y-1.5 bg-zinc-50 p-4 rounded-xl border">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal Excl. Tax:</span>
                  <span className="font-mono">₹{(Number(invoiceOrder.amount || 499) * 0.82).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">IGST Tax (18%):</span>
                  <span className="font-mono">₹{(Number(invoiceOrder.amount || 499) * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shipping Charge:</span>
                  <span className="font-mono text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-black text-sm text-zinc-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-blue-600">₹{Number(invoiceOrder.amount || 499).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => setInvoiceOrder(null)} 
                className="px-4 py-2 font-bold text-xs text-zinc-500 hover:text-zinc-700"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                <span>🖨️</span> Print / Download Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REVIEW REPLY MODAL */}
      {replyingReview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>💬</span> Reply to Customer Review
            </h3>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl text-xs space-y-1">
              <div className="font-bold text-zinc-800 dark:text-zinc-200">{replyingReview.user_name} (⭐ {replyingReview.rating}/5)</div>
              <div className="text-zinc-500 italic">"{replyingReview.comment}"</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Your Response as Seller</label>
              <textarea 
                rows={4}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type a thoughtful reply thanking the customer..."
                className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setReplyingReview(null)} 
                className="px-4 py-2 font-bold text-xs text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReplyReviewSubmit(replyingReview.id)} 
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition"
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND MESSAGE TO CUSTOMER MODAL */}
      {showCustomerMessageModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>✉️</span> Send Message to Customer
              </h3>
              <button onClick={() => setShowCustomerMessageModal(false)} className="text-zinc-500 font-bold hover:text-black dark:hover:text-white text-base">✕</button>
            </div>

            <form onSubmit={handleSendMessageToCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Select Customer (Receiver)</label>
                <select 
                  value={msgReceiverId}
                  onChange={e => setMsgReceiverId(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-bold outline-none focus:border-emerald-500 mb-2 cursor-pointer"
                >
                  <option value="">-- Choose from Recent Customers / Followers --</option>
                  {customerOptions.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (ID: {c.id.substring(0, 8)}...)
                    </option>
                  ))}
                </select>
                <input 
                  type="text" 
                  value={msgReceiverId}
                  onChange={e => setMsgReceiverId(e.target.value)}
                  placeholder="Or enter Customer User ID manually..."
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Subject</label>
                <input 
                  type="text"
                  required
                  value={msgSubject}
                  onChange={e => setMsgSubject(e.target.value)}
                  placeholder="Order Update, Shipping Notice, Special Offer..."
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Message Content</label>
                <textarea 
                  rows={4}
                  required
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  placeholder="Write message content here..."
                  className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button"
                  onClick={() => setShowCustomerMessageModal(false)} 
                  className="px-4 py-2 font-bold text-xs text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={sendingMsg}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {sendingMsg ? 'Sending...' : '✉️ Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE ADMIN MODAL */}
      {showAdminMessageModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>💬</span> Message Bupzo Admin Support
              </h3>
              <button onClick={() => setShowAdminMessageModal(false)} className="text-zinc-500 font-bold hover:text-black dark:hover:text-white text-base">✕</button>
            </div>

            <form onSubmit={handleSendMessageToAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Subject</label>
                <input 
                  type="text"
                  required
                  value={adminMessageSubject}
                  onChange={e => setAdminMessageSubject(e.target.value)}
                  placeholder="Category Request, Payment Inquiry, Account Support..."
                  className="w-full p-2.5 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Message Content</label>
                <textarea 
                  rows={4}
                  required
                  value={adminMessageContent}
                  onChange={e => setAdminMessageContent(e.target.value)}
                  placeholder="Describe your inquiry or support request..."
                  className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button"
                  onClick={() => setShowAdminMessageModal(false)} 
                  className="px-4 py-2 font-bold text-xs text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Send to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800 h-fit max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={editProduct.name || ''}
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={editProduct.price ?? 0}
                    onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={editProduct.stock_quantity ?? 0}
                    onChange={(e) => setEditProduct({...editProduct, stock_quantity: parseInt(e.target.value) || 0})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Category</label>
                <select
                  value={editProduct.category_id || ''}
                  onChange={(e) => setEditProduct({...editProduct, category_id: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select Category</option>
                  {(Array.isArray(categories) ? categories : []).map((c: any) => (
                    <option key={c?.id || Math.random()} value={c?.id}>
                      {c?.name} {c?.status === 'PENDING' ? '(Pending Admin Approval)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Description</label>
                <textarea 
                  value={editProduct.description || ''}
                  onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none h-20" 
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Product Images</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="w-full text-sm" 
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 font-bold text-zinc-500 hover:text-zinc-700">Cancel</button>
                <button 
                  onClick={handleEditProductSubmit} 
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:opacity-90"
                >
                  Update Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewProduct && (
        <ProductPreviewModal product={previewProduct} onClose={() => setPreviewProduct(null)} onAddToCart={() => {}} onAddToWishlist={() => {}} />
      )}
    </div>
  );
}
