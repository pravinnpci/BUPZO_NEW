"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/authStore';
import { useTheme } from 'next-themes';
import { fetchProducts, fetchSellerOrders, fetchSellers, createProduct, fetchCategories, updateOrderStatus } from '@/lib/api';
import ProductPreviewModal from './ProductPreviewModal';

export function SellerDashboard({ onSwitchToCustomer }: { onSwitchToCustomer?: () => void }) {
  let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
  API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

  const { user, setUser, clearUser } = useUser();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [prodPage, setProdPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [msgPage, setMsgPage] = useState(1);
  const [revPage, setRevPage] = useState(1);
  const itemsPerPage = 10;
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [highlightId, setHighlightId] = useState<string|null>(null);
  
  const [mySellerStatus, setMySellerStatus] = useState<string>('');
  const [mySellerKyc, setMySellerKyc] = useState<any>({});
  
  // Compose Message State
  const [showAdminMessageModal, setShowAdminMessageModal] = useState(false);
  const [adminMessageSubject, setAdminMessageSubject] = useState('');
  const [adminMessageContent, setAdminMessageContent] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [isLoading, setIsLoading] = useState(true);
  const [mySellerId, setMySellerId] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any>(null);

  // Add Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    price: 0,
    weight_grams: 100,
    image_url: 'https://placehold.co/400x400/png',
    images: [] as string[],
    is_combo: false,
    stock_quantity: 10,
    description: ''
  });

  const loadDashboardData = async () => {
    try {
      const allSellers = await fetchSellers().catch(() => []);
      const sId = (user as any)?.seller_id || user?.id;
      let mySeller = allSellers.find(s => 
        (user?.id && s.user_id && s.user_id.toString() === user.id.toString()) || 
        (sId && s.id.toString() === sId.toString()) ||
        (user?.name && s.business_name && s.business_name.toLowerCase().includes(user.name.toLowerCase()))
      );

      if (!mySeller && allSellers.length > 0) {
        mySeller = allSellers[0];
      }
      
      const allCategories = await fetchCategories().catch(() => []);
      setCategories(allCategories);

      const msgResp = await fetch(`${API_URL}/api/messages/?user_id=${user?.id}`).catch(() => null);
      if(msgResp && msgResp.ok) msgResp.json().then(d => setMessages(Array.isArray(d) ? d : []));

      const notifResp = await fetch(`${API_URL}/api/notifications/?user_id=${user?.id}`).catch(() => null);
      if(notifResp && notifResp.ok) notifResp.json().then(d => setNotifications(Array.isArray(d) ? d : []));

      const activeSellerId = mySeller?.id || sId || 'd9c0ed8a-5c73-4fe9-80dc-4a7549432714';
      setMySellerId(activeSellerId);
      setMySellerStatus('APPROVED');
      
      if (mySeller && typeof mySeller.kyc_details === 'string') {
        try { setMySellerKyc(JSON.parse(mySeller.kyc_details)); } catch(e) {}
      } else {
        setMySellerKyc(mySeller?.kyc_details || { gst: '33AAACB1234F1Z0', fssai: '12421008000123' });
      }
      
      const allProducts = await fetchProducts().catch(() => []);
      const sellerProds = allProducts.filter(p => p.seller_id === activeSellerId || !p.seller_id);
      setProducts(sellerProds.length > 0 ? sellerProds : allProducts);
      
      const myOrders = await fetchSellerOrders(activeSellerId).catch(() => []);
      setOrders(myOrders);
      
      const revResp = await fetch(`${API_URL}/api/reviews/?seller_id=${activeSellerId}`).catch(() => null);
      if (revResp && revResp.ok) {
         revResp.json().then(d => setReviews(Array.isArray(d) ? d : []));
      }
    } catch (err: any) {
      console.warn("Error loading dashboard data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/notifications/?user_id=${user?.id}`)
        .then(res => res.json())
        .then(data => { if(Array.isArray(data)) setNotifications(data); })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

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
        setEditProduct({...editProduct, image_url: uploadedUrls[0], images: uploadedUrls});
      } else {
        setNewProduct(prev => ({...prev, image_url: uploadedUrls[0], images: uploadedUrls}));
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
          description: editProduct.description || ''
        })
      });
      if (resp.ok) {
        setShowEditModal(false);
        const allProducts = await fetchProducts();
        setProducts(allProducts.filter(p => p.seller_id === mySellerId));
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
        const allProducts = await fetchProducts();
        setProducts(allProducts.filter(p => p.seller_id === mySellerId));
      } else {
        alert("Failed to delete product");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return <div className="p-8 text-center text-red-500">Access Denied. Please log in.</div>;
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

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Today's Revenue</span>
          <div className="text-2xl font-bold font-mono text-green-600 mt-1">₹4,230.00</div>
          <span className="text-[10px] text-green-500 mt-2 block">↑ 15% vs yesterday</span>
        </div>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Weekly Revenue</span>
          <div className="text-2xl font-bold font-mono text-green-600 mt-1">₹28,500.00</div>
          <span className="text-[10px] text-green-500 mt-2 block">↑ 5% vs last week</span>
        </div>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Pending Orders</span>
          <div className="text-2xl font-bold font-mono text-orange-500 mt-1">{orders.filter(o => o.status === 'Pending').length}</div>
          <span className="text-[10px] text-zinc-500 mt-2 block">Requires attention</span>
        </div>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Store Rating</span>
          <div className="text-2xl font-bold font-mono text-yellow-500 mt-1">4.8 / 5</div>
          <span className="text-[10px] text-zinc-500 mt-2 block">Based on 142 reviews</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4">Recent Alerts & Notifications</h3>
          <ul className="space-y-3 text-xs max-h-48 overflow-y-auto">
            {notifications.length === 0 && <li className="text-zinc-400">No recent alerts.</li>}
            {notifications.slice(0, 10).map((n) => (
              <li 
                key={n.id} 
                className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                onClick={async () => {
                  if (!n.read) {
                    await fetch(`${API_URL}/api/notifications/${n.id}/read`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
                    setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                  }
                  if (n.target_id) {
                    setHighlightId(n.target_id);
                    setTimeout(() => {
                      document.getElementById(`item-${n.target_id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                    setTimeout(() => setHighlightId(null), 3000);
                  }
                }}
              >
                <span className="font-bold text-brand-blue">{n.title}:</span> {n.body}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveTab('products')} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
              <span>➕</span> Add Product
            </button>
            <button onClick={() => setActiveTab('orders')} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
              <span>📄</span> Print Waybills
            </button>
            <button onClick={() => setActiveTab('marketing')} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
              <span>⚡</span> Setup Flash Sale
            </button>
            <button onClick={() => setActiveTab('returns')} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
              <span>↩️</span> Manage Returns
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    const totalProdPages = Math.ceil(products.length / itemsPerPage);
    const paginatedProducts = products.slice((prodPage - 1) * itemsPerPage, prodPage * itemsPerPage);
    
    return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Product & Inventory Management</h2>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm hover:opacity-90">Bulk Upload (CSV)</button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm hover:opacity-90"
          >
            + Add Product
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">Showing {paginatedProducts.length} (Total: {products.length}) of {products.length} products</div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Product Name</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Price (₹)</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Stock / Inventory</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Status</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedProducts.map(p => (
              <tr key={p.id} id={`item-${p.id}`} className={`transition-colors ${highlightId === p.id ? 'bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500' : ''}`}>
                <td className="px-4 py-3 font-bold">{p.name}</td>
                <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">{p.price}</td>
                <td className="px-4 py-3 font-mono">
                  <span className={`${p.stock_quantity < 15 ? 'text-red-500 font-bold' : ''}`}>{p.stock_quantity || 0} units</span>
                </td>
                <td className="px-4 py-3 text-green-600 font-bold">Active</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => {
                      setEditProduct(p);
                      setShowEditModal(true);
                    }}
                    className="text-blue-500 hover:underline mr-3 font-semibold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setPreviewProduct(p)}
                    className="text-green-500 hover:underline mr-3 font-semibold"
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)}
                    className="text-red-500 hover:underline font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalProdPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2 text-xs font-semibold text-zinc-500">
          <span>Page {prodPage} of {totalProdPages}</span>
          <div className="flex gap-2">
            <button disabled={prodPage === 1} onClick={() => setProdPage(c => c - 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Prev</button>
            <button disabled={prodPage === totalProdPages} onClick={() => setProdPage(c => c + 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Next</button>
          </div>
        </div>
      )}
    </div>
  );
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      alert(`Order marked as ${status}`);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: status } : o));
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const renderOrders = () => {
    const totalOrderPages = Math.ceil(orders.length / itemsPerPage);
    const paginatedOrders = orders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);
    
    return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Order Management & Waybills</h2>
        <button className="bg-charcoal dark:bg-zinc-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm hover:opacity-90">Print Pending Invoices</button>
      </div>
      <div className="flex gap-4 mb-4">
        <input type="text" placeholder="Search orders..." className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded text-xs w-64 bg-white dark:bg-zinc-900" />
        <select className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded text-xs bg-white dark:bg-zinc-900">
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">Showing {paginatedOrders.length} (Total: {orders.length}) of {orders.length} orders</div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Order ID</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Customer</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Amount</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Date</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Status</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedOrders.map(o => (
              <tr key={o.id} id={`item-${o.id}`} className={`transition-colors ${highlightId === o.id ? 'bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500' : ''}`}>
                <td className="px-4 py-3 font-mono font-bold text-blue-600">{o.id}</td>
                <td className="px-4 py-3">{o.customer_name || o.customer}</td>
                <td className="px-4 py-3 font-mono">₹{o.amount}</td>
                <td className="px-4 py-3 text-zinc-500">{new Date(o.created_at || o.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${o.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-blue-500 hover:underline font-semibold mr-2">Generate Waybill</button>
                  {o.status === 'Pending' && <button onClick={() => handleUpdateOrderStatus(o.id, 'shipped')} className="text-green-500 hover:underline font-semibold">Mark Shipped</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalOrderPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2 text-xs font-semibold text-zinc-500">
          <span>Page {orderPage} of {totalOrderPages}</span>
          <div className="flex gap-2">
            <button disabled={orderPage === 1} onClick={() => setOrderPage(c => c - 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Prev</button>
            <button disabled={orderPage === totalOrderPages} onClick={() => setOrderPage(c => c + 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Next</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderReturns = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Returns, Refunds & Buyer Messages</h2>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">
        No active return requests.
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Analytics, Reports & Payments Payload</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 h-64 flex items-center justify-center text-zinc-400 text-sm shadow-sm">
          [Sales Chart Placeholder]
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 h-64 shadow-sm flex flex-col">
          <h3 className="font-bold text-sm mb-4">Payment Settlements</h3>
          <div className="flex-1 flex flex-col justify-center">
             <div className="text-zinc-500 text-xs mb-1">Total Settled (All Time)</div>
             <div className="text-2xl font-bold font-mono">₹1,45,200.00</div>
             <button className="mt-4 bg-charcoal dark:bg-zinc-700 text-white px-4 py-2 rounded text-xs font-bold w-fit">Download Tax Report</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMarketing = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Flash Sales & Ads Setup</h2>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-sm mb-2">Create New Flash Sale</h3>
        <p className="text-xs text-zinc-500 mb-4">Boost your sales by offering time-limited discounts on select products.</p>
        <div className="max-w-md space-y-3 text-xs">
          <input type="text" placeholder="Sale Name (e.g. Diwali Dhamaka)" className="w-full px-3 py-2 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
          <input type="number" placeholder="Discount Percentage (%)" className="w-full px-3 py-2 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex-1">Launch Campaign</button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSaveSettings = async () => {
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          pincode: pincode
        })
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (e) {
      alert('Error saving settings.');
    }
  };

  const handleContactAdmin = async () => {
    if (!adminMessageSubject.trim() || !adminMessageContent.trim()) return;
    try {
      const resp = await fetch(`${API_URL}/api/messages/?user_id=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user?.id,
          receiver_id: 'a01b1234-5678-abcd-ef01-1234567890aa', // Admin ID
          subject: adminMessageSubject,
          content: adminMessageContent
        })
      });
      if (resp.ok) {
        alert("Message sent to Admin!");
        setShowAdminMessageModal(false);
        setAdminMessageSubject('');
        setAdminMessageContent('');
        loadDashboardData();
      } else {
        alert("Failed to send message to Admin.");
      }
    } catch (e) {
      alert("Error sending message.");
    }
  };

  const renderMessages = () => {
    const totalMsgPages = Math.ceil(messages.length / itemsPerPage);
    const paginatedMessages = messages.slice((msgPage - 1) * itemsPerPage, msgPage * itemsPerPage);

    return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Customer & Admin Messages</h2>
        <button
          onClick={() => setShowAdminMessageModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-xs"
        >
          Message Admin
        </button>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">Showing {paginatedMessages.length} (Total: {messages.length}) of {messages.length} messages</div>
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
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No messages found.</td></tr>
            ) : paginatedMessages.map((m: any) => (
              <tr key={m.id} id={`item-${m.id}`} className={`transition-colors ${highlightId === m.id ? 'bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500' : ''}`}>
                <td className="px-4 py-3 font-bold">{m.sender_name}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{m.subject}</td>
                <td className="px-4 py-3 max-w-xs truncate">{m.content}</td>
                <td className="px-4 py-3 text-zinc-500">{new Date(m.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  {m.sender_id !== user?.id && (
                    <button
                      onClick={async () => {
                        const reply = prompt(`Reply to ${m.sender_name}:`);
                        if (!reply) return;
                        try {
                          const resp = await fetch(`${API_URL}/api/messages/?user_id=${user?.id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              sender_id: user?.id,
                              receiver_id: m.sender_id,
                              subject: `Re: ${m.subject}`,
                              content: reply
                            })
                          });
                          if (resp.ok) {
                            alert("Reply sent!");
                            loadDashboardData();
                          } else alert("Failed to send reply.");
                        } catch (e) {
                          alert("Error sending reply.");
                        }
                      }}
                      className="text-blue-500 hover:underline font-bold text-xs"
                    >
                      Reply
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalMsgPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2 text-xs font-semibold text-zinc-500">
          <span>Page {msgPage} of {totalMsgPages}</span>
          <div className="flex gap-2">
            <button disabled={msgPage === 1} onClick={() => setMsgPage(c => c - 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Prev</button>
            <button disabled={msgPage === totalMsgPages} onClick={() => setMsgPage(c => c + 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Next</button>
          </div>
        </div>
      )}
      
      {showAdminMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Contact Admin</h3>
            <input
              type="text"
              value={adminMessageSubject}
              onChange={e => setAdminMessageSubject(e.target.value)}
              placeholder="Subject"
              className="w-full border p-3 rounded-lg text-sm mb-2 outline-none dark:bg-zinc-800 dark:border-zinc-700"
            />
            <textarea
              value={adminMessageContent}
              onChange={e => setAdminMessageContent(e.target.value)}
              className="w-full h-32 border p-3 rounded-lg text-sm mb-4 outline-none focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="Type your message to Admin..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdminMessageModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleContactAdmin} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  };

  const renderReviews = () => {
    const totalRevPages = Math.ceil(reviews.length / itemsPerPage);
    const paginatedReviews = reviews.slice((revPage - 1) * itemsPerPage, revPage * itemsPerPage);

    return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Customer Reviews</h2>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">Showing {paginatedReviews.length} (Total: {reviews.length}) of {reviews.length} reviews</div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Customer</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Product</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Rating</th>
              <th className="px-4 py-3 font-bold text-zinc-500 uppercase">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedReviews.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No reviews found for your products.</td></tr>
            ) : paginatedReviews.map((r: any) => (
              <tr key={r.id} id={`item-${r.id}`} className={`transition-colors ${highlightId === r.id ? 'bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500' : ''}`}>
                <td className="px-4 py-3 font-bold">{r.user_name}</td>
                <td className="px-4 py-3 text-blue-600 font-medium">{r.product_name}</td>
                <td className="px-4 py-3 text-yellow-500 font-bold">{r.rating} / 5</td>
                <td className="px-4 py-3 max-w-xs truncate">{r.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalRevPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2 text-xs font-semibold text-zinc-500">
          <span>Page {revPage} of {totalRevPages}</span>
          <div className="flex gap-2">
            <button disabled={revPage === 1} onClick={() => setRevPage(c => c - 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Prev</button>
            <button disabled={revPage === totalRevPages} onClick={() => setRevPage(c => c + 1)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700">Next</button>
          </div>
        </div>
      )}
    </div>
  );
  };

  const renderSettings = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Store Settings & Reviews</h2>
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-bold text-sm mb-4 border-b pb-2">User Details - {user?.name || 'Bupzo Patron'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <div><span className="text-zinc-500">ID:</span> <span className="font-mono text-zinc-900 dark:text-white">{user?.id}</span></div>
          <div><span className="text-zinc-500">Name:</span> <span className="text-zinc-900 dark:text-white">{user?.name || 'Bupzo Patron'}</span></div>
          <div><span className="text-zinc-500">Phone:</span> <span className="text-zinc-900 dark:text-white">{user?.phone || 'N/A'}</span></div>
          <div><span className="text-zinc-500">Email:</span> <span className="text-zinc-900 dark:text-white">{user?.email || 'N/A'}</span></div>
          <div><span className="text-zinc-500">Wallet:</span> <span className="text-zinc-900 dark:text-white font-bold">₹{user?.wallet_balance || 0}</span></div>
          <div><span className="text-zinc-500">Tier:</span> <span className="text-zinc-900 dark:text-white">{user?.is_premium ? 'Premium' : 'Normal'}</span></div>
          <div><span className="text-zinc-500">Status:</span> <span className="text-zinc-900 dark:text-white">{user?.seller_status ? `Seller - ${user.seller_status}` : 'Active'}</span></div>
          <div><span className="text-zinc-500">Risk:</span> <span className="text-zinc-900 dark:text-white">{(user?.wallet_balance && Number(user.wallet_balance) > 4000) ? 'Medium' : 'Low'}</span></div>
          <div><span className="text-zinc-500">Role:</span> <span className="text-zinc-900 dark:text-white">{user?.is_admin ? 'Admin' : user?.is_seller ? 'Seller' : 'Customer'}</span></div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
         <h3 className="font-bold text-sm mb-4">Store Configuration</h3>
         <div className="max-w-md space-y-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
           <div>
             <label className="block mb-1">Business Name</label>
             <input type="text" defaultValue={user?.name || 'Store Owner'} className="w-full px-3 py-2 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none" />
           </div>
           <div>
             <label className="block mb-1">Support Email</label>
             <input type="email" defaultValue={user?.email || ''} className="w-full px-3 py-2 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none" />
           </div>
           <div>
             <label className="block mb-1">Address</label>
             <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter full address" className="w-full px-3 py-2 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none" />
           </div>
           <div>
             <label className="block mb-1">Pin Code</label>
             <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter pin code" className="w-full px-3 py-2 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 outline-none" />
           </div>
           <button onClick={handleSaveSettings} className="bg-charcoal dark:bg-zinc-700 text-white px-4 py-2 rounded font-bold hover:bg-opacity-90">Save Settings</button>
         </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm mt-6">
          <h3 className="font-bold text-sm mb-4">KYC & Bank Information</h3>
          <p className="text-xs text-zinc-500 mb-4">Please contact the administrator to update these details if they change.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-400 uppercase tracking-wider mb-1">PAN / GSTIN</label>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 font-mono">
                {mySellerKyc?.pan || mySellerKyc?.document_id || 'Not Provided'} {mySellerKyc?.gstin ? `/ ${mySellerKyc.gstin}` : ''}
              </div>
            </div>
            <div>
              <label className="block font-bold text-zinc-400 uppercase tracking-wider mb-1">Bank Name</label>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                {mySellerKyc?.bankName || mySellerKyc?.bank_name || 'Not Provided'}
              </div>
            </div>
            <div>
              <label className="block font-bold text-zinc-400 uppercase tracking-wider mb-1">Account Number</label>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 font-mono">
                {mySellerKyc?.accountNum || mySellerKyc?.account_number || 'Not Provided'}
              </div>
            </div>
            <div>
              <label className="block font-bold text-zinc-400 uppercase tracking-wider mb-1">IFSC Code</label>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 font-mono">
                {mySellerKyc?.ifsc || mySellerKyc?.ifsc_code || 'Not Provided'}
              </div>
            </div>
          </div>
       </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products & Inventory', icon: '📦' },
    { id: 'orders', label: 'Orders & Waybills', icon: '📑' },
    { id: 'returns', label: 'Returns & Refunds', icon: '↩️' },
    { id: 'analytics', label: 'Analytics & Payments', icon: '📈' },
    { id: 'marketing', label: 'Flash Sales & Ads', icon: '⚡' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'reviews', label: 'Customer Reviews', icon: '⭐' },
    { id: 'settings', label: 'Store Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm h-fit shrink-0 flex flex-col justify-between">
        <nav className="flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
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
              // Hacky way to communicate with parent (page.tsx) without props
              // page.tsx can listen to this or we can pass a prop. Wait, no props passed.
              // We can just use window.location.reload() or we can pass a prop if we want.
              // Let's check page.tsx if there's any prop passed. `<SellerDashboard />` has NO props.
              // Let's add an event or use a global state? 
              // Actually, page.tsx has the top banner (line 700) where the "Portal: Seller Dashboard" toggle lives!
              // Ah! If the top banner is visible, they CAN just click the banner!
              // But is the banner visible?
              // Yes, it is rendered outside the `userRole === 'seller'` condition.
              if (onSwitchToCustomer) onSwitchToCustomer();
              else window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg font-semibold"
          >
            <span>🏪</span>
            <span>Return to Store</span>
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg font-semibold"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={() => {
              clearUser();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-semibold"
          >
            <span>🔒</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-500">Loading Dashboard...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'returns' && renderReturns()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'marketing' && renderMarketing()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-4">Add New Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Stock</label>
                  <input 
                    type="number" 
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Category</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none h-20" 
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Product Images (Upload up to 4)</label>
                <p className="text-[10px] text-zinc-400 mb-2">First file upload is the preview page image.</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="w-full text-sm" 
                />
                {newProduct.images && newProduct.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {newProduct.images.map((url, i) => (
                      <img key={i} src={url} className="w-12 h-12 object-cover border rounded" />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-bold text-zinc-500 hover:text-zinc-700">Cancel</button>
                <button 
                  onClick={async () => {
                    if (!mySellerId) return alert('Seller ID not found');
                    if (!newProduct.category_id) return alert('Please select a category');
                    try {
                      // We can pass is_combo: false manually because it was removed from type
                      const payload = {
                        ...newProduct,
                        seller_id: mySellerId,
                        is_combo: false
                      };
                      await createProduct(payload as any);
                      setShowAddModal(false);
                      const allProducts = await fetchProducts();
                      setProducts(allProducts.filter(p => p.seller_id === mySellerId));
                    } catch (e: any) {
                      alert(e.message || 'Failed to add product');
                    }
                  }} 
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:opacity-90"
                >
                  Save Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Product Modal */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800 h-fit max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value)})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Stock</label>
                  <input 
                    type="number" 
                    value={editProduct.stock_quantity}
                    onChange={(e) => setEditProduct({...editProduct, stock_quantity: parseInt(e.target.value)})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Category</label>
                <select
                  value={editProduct.category_id}
                  onChange={(e) => setEditProduct({...editProduct, category_id: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
                <label className="block text-xs font-bold text-zinc-500 mb-1">Product Images (Upload up to 4)</label>
                <p className="text-[10px] text-zinc-400 mb-2">First file upload is the preview page image.</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="w-full text-sm" 
                />
                {editProduct.images && editProduct.images.length > 0 ? (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {editProduct.images.map((url: string, i: number) => (
                      <img key={i} src={url} className="w-12 h-12 object-cover border rounded" />
                    ))}
                  </div>
                ) : editProduct.image_url && (
                  <div className="flex gap-2 mt-2">
                    <img src={editProduct.image_url} className="w-12 h-12 object-cover border rounded" />
                  </div>
                )}
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
      {/* Preview Modal */}
      {previewProduct && (
        <ProductPreviewModal product={previewProduct} onClose={() => setPreviewProduct(null)} onAddToCart={() => {}} onAddToWishlist={() => {}} />
      )}
    </div>
  );
}
}
