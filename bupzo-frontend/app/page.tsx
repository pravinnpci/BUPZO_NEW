'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { fetchProducts, createCheckout, addToWishlist, getWishlistItems, removeFromWishlist, initiateStitchPayment, generateAICopy, verifyKYC, searchProducts, Product, WishlistItem, fetchCategories, createCategory, createProduct, fetchCoupons, createCoupon, validateCoupon, Category, Coupon, uploadImage } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import { useUser } from '@/lib/authStore';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const [userRole, setUserRole] = useState<'customer' | 'seller'>('seller');
  const [sellerTab, setSellerTab] = useState<'overview' | 'products' | 'orders' | 'escrow' | 'kyc' | 'disputes' | 'vouchers'>('overview');
  const { theme, setTheme } = useTheme();

  // API Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [escrowBalance, setEscrowBalance] = useState(12400.50);
  const [kycStatus, setKycStatus] = useState<'Pending' | 'Uploaded' | 'Approved'>('Pending');
  const [loading, setLoading] = useState(true);

  // Mock Orders and Disputes for Seller Operations
  const [orders, setOrders] = useState([
    { id: "BUP-99283", customer: "Ravi K.", product: "Nagore Ghee Halwa", quantity: 2, total: 598, status: "Pending", date: "2026-06-27" },
    { id: "BUP-99280", customer: "Meera S.", product: "Handcrafted Ceramic Mug", quantity: 1, total: 399, status: "Processing", date: "2026-06-26" },
    { id: "BUP-99275", customer: "Anitha P.", product: "Premium Dry Fruit Combo", quantity: 1, total: 799, status: "Dispatched", date: "2026-06-25" },
    { id: "BUP-99270", customer: "Karthik G.", product: "Educational Robot Toy", quantity: 1, total: 1299, status: "Delivered", date: "2026-06-24" }
  ]);
  const [disputes, setDisputes] = useState([
    { id: "DISP-5421", orderId: "BUP-99280", customer: "Meera S.", reason: "Slight crack on mug handle", status: "Open", date: "2026-06-27" }
  ]);

  // Form States for adding product
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductQty, setNewProductQty] = useState('');
  const [newProductCat, setNewProductCat] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [sellerId, setSellerId] = useState('c03b1234-5678-abcd-ef01-1234567890ab');
  const [categoryId, setCategoryId] = useState('d04b1234-5678-abcd-ef01-1234567890ab');

  // Categories and Vouchers States
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Voucher Creation States
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponMaxAmount, setNewCouponMaxAmount] = useState('');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('');

  // Checkout Voucher validation states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');

  // Cart states
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);

  // AI Product Studio States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiDesc, setAiDesc] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Authenticated user state
  const { user, setUser } = useUser();
  const mockUserId = 'a01b1234-5678-abcd-ef01-1234567890ab';

  // WebSocket Subscription hook
  const { messages } = useWebSocket(user?.id || mockUserId);

  useEffect(() => {
    // Authenticate default mock user for local first dev
    setUser({
      id: mockUserId,
      phone: "+919876543210",
      email: "localadmin@bupzo.com",
      isPremium: true,
      signupPlatform: "WEB",
      walletBalance: 2500.00,
      createdAt: new Date().toISOString()
    });

    async function loadData() {
      try {
        const prodData = await fetchProducts();
        setProducts(prodData);
        const wishData = await getWishlistItems(mockUserId);
        setWishlist(wishData);
        
        // Fetch categories
        try {
          const cats = await fetchCategories();
          setCategories(cats);
          if (cats.length > 0) {
            setSelectedCategoryId(cats[0].id);
          }
        } catch (e) {
          console.error("Failed to load categories:", e);
        }

        // Fetch coupons
        try {
          const cps = await fetchCoupons();
          setCoupons(cps);
        } catch (e) {
          console.error("Failed to load coupons:", e);
        }
      } catch (err) {
        console.error("Error loading products/wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Dispatch Order Action
  const handleUpdateOrderStatus = (orderId: string, nextStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    alert(`Order ${orderId} status updated to ${nextStatus}.`);
  };

  // Request Payout Action
  const handleRequestPayout = () => {
    if (escrowBalance <= 0) {
      alert("Your escrow wallet balance is zero.");
      return;
    }
    alert(`Payout request of ₹${escrowBalance.toFixed(2)} submitted to Super Admin.`);
    setEscrowBalance(0);
  };

  // Simulated AI Description Generation
  const handleGenerateAIDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) {
      alert("Please enter a description prompt.");
      return;
    }
    setIsGenerating(true);
    try {
      const data = await generateAICopy(aiPrompt);
      if (data.success) {
        setAiTitle(data.title);
        setAiDesc(data.description);
        setAiTags(data.tags);
      }
    } catch (err) {
      console.error(err);
      alert("AI copywriter service offline. Using cached simulation instead.");
      setAiTitle("Nagore Ghee Halwa - Pure Cashew Sweet");
      setAiDesc("Experience the true heritage of Nagore with our pure ghee wheat halwa, cooked slow and loaded with premium cardamoms and crunchy cashew nuts. 100% natural, preservative-free.");
      setAiTags(["nagore specialties", "halwa", "ghee sweets", "traditional dessert", "cashew halwa"]);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAISuggestions = () => {
    setNewProductName(aiTitle);
    setNewProductDesc(aiDesc);
    alert("AI suggestions applied to product input fields!");
  };

  const handleKYCVerifySubmit = async () => {
    if (!gstNumber || !fssaiNumber) {
      alert("Please fill GSTIN and FSSAI license numbers.");
      return;
    }
    try {
      const data = await verifyKYC(gstNumber, fssaiNumber);
      if (data.status === "APPROVED") {
        setKycStatus("Approved");
        alert("KYC Auto-Approved! Score: " + (data.verification_score * 100).toFixed(0) + "%\n" + data.reason);
      } else {
        setKycStatus("Uploaded");
        alert("KYC Auto-Rejected but uploaded for review! Reason: " + data.reason);
      }
    } catch (err) {
      console.error(err);
      setKycStatus("Uploaded");
      alert("Verification service offline. Submitted for manual review.");
    }
  };

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) {
      setLoading(true);
      try {
        const prodData = await fetchProducts();
        setProducts(prodData);
        setIsSearching(false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    setLoading(true);
    setIsSearching(true);
    try {
      const data = await searchProducts(searchQuery);
      if (data.success) {
        setProducts(data.results);
      }
    } catch (err) {
      console.error(err);
      alert("AI Search offline. Database pgvector embedding similarity failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery('');
    setLoading(true);
    setIsSearching(false);
    try {
      const prodData = await fetchProducts();
      setProducts(prodData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add Category Submit
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const cat = await createCategory(newCatName, newCatDesc);
      alert(`Category "${cat.name}" created successfully!`);
      setCategories(prev => [...prev, cat]);
      setSelectedCategoryId(cat.id);
      setNewCatName('');
      setNewCatDesc('');
      setShowAddCategoryForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create category on backend.");
    }
  };

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      if (res.success) {
        setNewProductImage(res.url);
        alert("Image uploaded to MinIO successfully!");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload image.");
    }
  };

  // Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !selectedCategoryId) {
      alert("Please fill in name, price, and category.");
      return;
    }

    try {
      const prod = await createProduct({
        name: newProductName,
        category_id: selectedCategoryId,
        price: parseFloat(newProductPrice),
        weight_grams: 250, // Default weight
        image_url: newProductImage || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80",
        is_combo: false,
        stock_quantity: parseInt(newProductQty) || 50,
        seller_id: sellerId,
        description: newProductDesc
      });
      alert(`Product "${prod.name}" successfully added to the catalog!`);
      setProducts(prev => [prod, ...prev]);

      // Reset fields
      setNewProductName('');
      setNewProductPrice('');
      setNewProductQty('');
      setNewProductDesc('');
      setNewProductImage('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add product to backend database.");
    }
  };

  // Create Coupon/Voucher Submit
  const handleAddCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) {
      alert("Please fill in coupon code and discount percentage.");
      return;
    }
    try {
      const cp = await createCoupon({
        code: newCouponCode,
        discount_percent: parseFloat(newCouponDiscount),
        is_premium_only: false,
        min_order_value: parseFloat(newCouponMinOrder) || 100.0,
        expiry_date: new Date(Date.now() + 86400000 * 30).toISOString() // 30 days default expiry
      });
      alert(`Coupon "${cp.code}" created successfully!`);
      setCoupons(prev => [cp, ...prev]);
      setNewCouponCode('');
      setNewCouponDiscount('');
      setNewCouponMinOrder('');
    } catch (err) {
      console.error(err);
      alert("Failed to create coupon on backend.");
    }
  };

  // Apply Coupon at Checkout
  const handleApplyPromo = async (e: React.FormEvent, cartTotal: number) => {
    e.preventDefault();
    if (!promoCode) return;
    setPromoError('');
    try {
      const res = await validateCoupon(promoCode, cartTotal);
      if (res.success) {
        setAppliedPromo(res);
        alert(`Voucher "${res.code}" applied! Discount: ₹${res.discount_amount}`);
      }
    } catch (err: any) {
      console.error(err);
      setPromoError(err.message || "Failed to validate voucher.");
      setAppliedPromo(null);
    }
  };

  // Add to Cart
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    alert(`"${product.name}" added to cart!`);
  };

  // Update Cart Qty
  const updateCartQuantity = (productId: string, amount: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const nextQty = item.quantity + amount;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean) as any);
  };

  // Submit Checkout
  const handleCheckoutSubmit = async () => {
    if (!user) {
      alert("Please login first to complete your purchase.");
      setIsAuthModalOpen(true);
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discount = appliedPromo ? appliedPromo.discount_amount : 0;
    const finalAmount = Math.max(0, subtotal - discount + 50); // ₹50 shipping

    try {
      const resp = await createCheckout({
        user_id: user.id,
        seller_id: sellerId,
        items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
        total_amount: finalAmount,
        order_source: 'WEB',
        shipping_partner: 'Delhivery SLA',
        payment_gateway: 'Razorpay',
        trust_donation_amount: 2.00
      });

      if (resp.success) {
        alert(`Checkout completed! Order ID: ${resp.order_id}\nTotal Paid: ₹${finalAmount.toFixed(2)}`);
        
        // Deduct from local wallet
        setUser(prev => prev ? {
          ...prev,
          walletBalance: Math.max(0, (prev.walletBalance ?? 0) - finalAmount)
        } : null);
        
        // Clear cart
        setCart([]);
        setAppliedPromo(null);
        setPromoCode('');
        setShowCart(false);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to submit checkout.");
    }
  };

  return (
    <div className="min-h-screen bg-dust-grey dark:bg-[#1a191e] text-charcoal dark:text-[#f3f4f6] font-sans transition-colors duration-300 flex">
      
      {/* Top Controls */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-full bg-charcoal text-white shadow-md hover:bg-opacity-90 active:scale-95 transition-all text-xs"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => setUserRole(userRole === 'customer' ? 'seller' : 'customer')}
          className="px-4 py-2 rounded-full bg-dusty-mauve text-white font-bold text-xs shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
        >
          Portal: {userRole === 'customer' ? 'Customer Site' : 'Seller Dashboard'}
        </button>
        {userRole === 'customer' && (
          <button
            onClick={() => setShowCart(true)}
            className="px-4 py-2 rounded-full bg-electric-blue text-white font-bold text-xs shadow-md hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>🛒</span> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        )}
      </div>

      {/* CUSTOMER PORTAL */}
      {userRole === 'customer' && (
        <div className="flex flex-1">
          {/* Customer Left Sidebar */}
          <aside className="w-64 bg-charcoal text-white p-6 flex flex-col justify-between h-screen fixed">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src="/Bupzo-logo.png" alt="BUPZO Logo" className="w-8 h-8 object-contain rounded" />
                <span className="font-extrabold tracking-wider font-heading">BUPZO STORE</span>
              </div>
              <nav className="space-y-2">
                <a href="#" className="block px-4 py-2 bg-white/10 rounded-lg text-almond-silk font-semibold text-sm">Home</a>
                <a href="#" className="block px-4 py-2 hover:bg-white/10 rounded-lg text-white text-sm">Shop Categories</a>
                <a href="#" className="block px-4 py-2 hover:bg-white/10 rounded-lg text-white text-sm">Track Orders</a>
                <a href="#" className="block px-4 py-2 hover:bg-white/10 rounded-lg text-white text-sm">My Wallet</a>
              </nav>
              
              <div className="space-y-4 pt-4 border-t border-white/10">
                {user ? (
                  <div className="space-y-1.5 text-xs">
                    <p className="text-zinc-400 font-mono text-[9px]">Logged In:</p>
                    <p className="font-bold text-[11px] truncate">{user.phone}</p>
                    <p className="text-almond-silk font-semibold text-[10px]">Wallet: ₹{user.walletBalance ?? 0}</p>
                    <button 
                      onClick={() => setUser(null)}
                      className="text-[10px] text-red-400 font-bold hover:underline"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full bg-almond-silk text-charcoal py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 active:scale-95 transition"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </div>
            <div className="text-[10px] text-zinc-400">© 2026 BUPZO Ecom</div>
          </aside>

          {/* Customer Content */}
          <div className="ml-64 p-8 flex-1">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg bg-dusty-mauve flex items-center justify-center">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-70">
                  <source src="/Bupzo-gif.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <div className="relative z-20 text-center space-y-2 text-white">
                  <h1 className="text-4xl font-extrabold font-heading">Discover Nagore Specialties</h1>
                  <p className="text-sm">Authentic Halwa, premium Dry Fruits, and handcrafted items delivered directly.</p>
                </div>
              </div>

              {/* AI Semantic Search bar */}
              <form onSubmit={handleAISearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search specialties semantically... (e.g. delicious ghee wheat sweets)"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 text-xs outline-none shadow-sm focus:border-dusty-mauve"
                  />
                  {isSearching && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-3 text-[10px] text-zinc-400 hover:text-charcoal font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-charcoal text-white px-6 py-3 rounded-xl text-xs font-bold shadow hover:bg-opacity-95 flex items-center gap-1"
                >
                  AI Search
                </button>
              </form>

              {/* Products Catalog */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-heading">Featured New Arrivals</h3>
                {loading ? (
                  <div className="text-center py-12 text-zinc-400 font-medium">Loading catalog items...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                      <div key={p.id} className="bg-white dark:bg-[#15131b] rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col">
                        <div className="relative h-48 bg-zinc-100">
                          <img src={p.image_url || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-dusty-mauve">Nagore Specialties</span>
                            <h4 className="font-bold text-sm mt-1">{p.name}</h4>
                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{p.description}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-sm">₹{p.price}</span>
                            <button 
                              onClick={() => handleAddToCart(p)}
                              className="bg-charcoal dark:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-opacity-90 active:scale-95 transition-all"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELLER PORTAL */}
      {userRole === 'seller' && (
        (!user || user.phone !== '+919876543211') ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] p-8 text-center space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 text-3xl shadow-lg">
              🔒
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-charcoal dark:text-[#f3f4f6]">Merchant Console Restricted</h2>
              <p className="text-xs text-zinc-400 font-sans">Please sign in with registered merchant credentials to access your sweet store telemetry and payment escrows.</p>
            </div>
            <div className="flex flex-col w-full gap-2 pt-4">
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full bg-charcoal dark:bg-zinc-800 text-white py-3 rounded-xl font-bold text-xs hover:bg-opacity-90 transition active:scale-95 shadow"
              >
                Authenticate as Seller
              </button>
              <button 
                onClick={() => setUserRole('customer')}
                className="w-full bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-charcoal dark:text-zinc-300 py-3 rounded-xl font-bold text-xs hover:bg-opacity-95 transition active:scale-95"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1">
          {/* Seller Left Navigation Sidebar */}
          <aside className="w-64 bg-white dark:bg-[#15131b] border-r border-[#e8e1dd] dark:border-[#2f2b3b] p-6 flex flex-col h-screen fixed transition-colors duration-300">
            <div className="mb-8 px-4 flex items-center gap-3">
              <img src="/Bupzo-logo.png" alt="BUPZO Logo" className="w-8 h-8 object-contain rounded" />
              <div>
                <h1 className="text-md font-bold tracking-tight text-charcoal dark:text-[#f3f4f6]">Seller Portal</h1>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold font-heading">Bupzo Merchant</p>
              </div>
            </div>

            <nav className="space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
              <button 
                onClick={() => setSellerTab('overview')} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold border-l-4 transition-all ${sellerTab === 'overview' ? 'border-charcoal dark:border-[#f3f4f6] bg-almond-silk/10 text-black dark:text-white' : 'border-transparent text-zinc-400 hover:bg-almond-silk/5'}`}
              >
                📊 Dashboard
              </button>
              <button 
                onClick={() => setSellerTab('products')} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold border-l-4 transition-all ${sellerTab === 'products' ? 'border-charcoal dark:border-[#f3f4f6] bg-almond-silk/10 text-black dark:text-white' : 'border-transparent text-zinc-400 hover:bg-almond-silk/5'}`}
              >
                📦 Products &amp; Studio
              </button>
              <button 
                onClick={() => setSellerTab('orders')} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold border-l-4 transition-all ${sellerTab === 'orders' ? 'border-charcoal dark:border-[#f3f4f6] bg-almond-silk/10 text-black dark:text-white' : 'border-transparent text-zinc-400 hover:bg-almond-silk/5'}`}
              >
                🛒 Orders Pipeline
              </button>
              <button 
                onClick={() => setSellerTab('escrow')} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold border-l-4 transition-all ${sellerTab === 'escrow' ? 'border-charcoal dark:border-[#f3f4f6] bg-almond-silk/10 text-black dark:text-white' : 'border-transparent text-zinc-400 hover:bg-almond-silk/5'}`}
              >
                💰 Escrow Wallet
              </button>
              <button 
                onClick={() => setSellerTab('kyc')} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold border-l-4 transition-all ${sellerTab === 'kyc' ? 'border-charcoal dark:border-[#f3f4f6] bg-almond-silk/10 text-black dark:text-white' : 'border-transparent text-zinc-400 hover:bg-almond-silk/5'}`}
              >
                🛡️ KYC Profile
              </button>
              <button 
                onClick={() => setSellerTab('disputes')} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold border-l-4 transition-all ${sellerTab === 'disputes' ? 'border-charcoal dark:border-[#f3f4f6] bg-almond-silk/10 text-black dark:text-white' : 'border-transparent text-zinc-400 hover:bg-almond-silk/5'}`}
              >
                ⚖️ Disputes Center
              </button>
              <button 
                onClick={() => setSellerTab('vouchers')} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold border-l-4 transition-all ${sellerTab === 'vouchers' ? 'border-charcoal dark:border-[#f3f4f6] bg-almond-silk/10 text-black dark:text-white' : 'border-transparent text-zinc-400 hover:bg-almond-silk/5'}`}
              >
                🎟️ Promo Vouchers
              </button>
            </nav>
            
            <div className="pt-4 border-t border-[#e8e1dd] dark:border-[#2f2b3b] mt-auto">
              <button 
                onClick={() => setUser(null)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-bold transition-all"
              >
                🔒 Logout Store
              </button>
            </div>
          </aside>

          {/* Seller Content Panel */}
          <div className="ml-64 p-8 flex-1 h-screen overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-6 pb-24">
              
              {/* TAB 1: OVERVIEW */}
              {sellerTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-heading">Merchant Command Center</h2>
                    <p className="text-xs text-zinc-400 font-sans">Real-time telemetry of your sweets shop sales and delivery pipeline.</p>
                  </div>

                  {/* Metrics Bento Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-28">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Gross Income</span>
                      <div>
                        <div className="text-2xl font-extrabold font-heading">₹34,800</div>
                        <p className="text-[9px] text-[#32D74B] font-semibold mt-1">↑ 12% vs last month</p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-28">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Orders Dispatched</span>
                      <div>
                        <div className="text-2xl font-extrabold font-heading">85</div>
                        <p className="text-[9px] text-zinc-400 font-semibold mt-1">100% SLA fulfillment</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-28">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Escrow Balance</span>
                      <div>
                        <div className="text-2xl font-extrabold font-heading">₹{escrowBalance.toFixed(2)}</div>
                        <p className="text-[9px] text-[#007AFF] font-semibold mt-1">Ready for settlement</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-28">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Disputes Score</span>
                      <div>
                        <div className="text-2xl font-extrabold font-heading">0.45%</div>
                        <p className="text-[9px] text-green-500 font-semibold mt-1">Excellent (Low risk)</p>
                      </div>
                    </div>
                  </div>

                  {/* Seller GMV Analytics Graph */}
                  <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-[#f3f4f6]">Store Sales Performance (ZAR)</h3>
                        <p className="text-[10px] text-zinc-400 font-sans">Total volume processed through checkout aggregators over past week.</p>
                      </div>
                    </div>
                    
                    <div className="relative h-48 w-full">
                      <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="sellerChartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#CCB7AE" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#CCB7AE" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        <line x1="50" y1="30" x2="560" y2="30" stroke="#e8e1dd" strokeDasharray="3 3" className="dark:stroke-zinc-800" />
                        <line x1="50" y1="75" x2="560" y2="75" stroke="#e8e1dd" strokeDasharray="3 3" className="dark:stroke-zinc-800" />
                        <line x1="50" y1="120" x2="560" y2="120" stroke="#e8e1dd" strokeDasharray="3 3" className="dark:stroke-zinc-800" />
                        
                        <text x="20" y="35" className="text-[9px] fill-zinc-400 font-mono">10K</text>
                        <text x="20" y="80" className="text-[9px] fill-zinc-400 font-mono">5K</text>
                        <text x="20" y="125" className="text-[9px] fill-zinc-400 font-mono">0</text>
                        
                        <path d="M 50,120 Q 130,90 210,60 T 370,40 T 490,90 T 560,30 L 560,120 Z" fill="url(#sellerChartGrad)" />
                        <path d="M 50,120 Q 130,90 210,60 T 370,40 T 490,90 T 560,30" fill="none" stroke="#CCB7AE" strokeWidth="2.5" />
                        
                        <circle cx="50" cy="120" r="3" fill="#A6808C" />
                        <circle cx="150" cy="85" r="3" fill="#A6808C" />
                        <circle cx="270" cy="50" r="3" fill="#A6808C" />
                        <circle cx="390" cy="35" r="3" fill="#A6808C" />
                        <circle cx="560" cy="30" r="3" fill="#A6808C" />
                        
                        <text x="45" y="145" className="text-[9px] fill-zinc-400 font-semibold font-heading">Mon</text>
                        <text x="145" y="145" className="text-[9px] fill-zinc-400 font-semibold font-heading">Wed</text>
                        <text x="265" y="145" className="text-[9px] fill-zinc-400 font-semibold font-heading">Fri</text>
                        <text x="385" y="145" className="text-[9px] fill-zinc-400 font-semibold font-heading">Sun</text>
                      </svg>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PRODUCTS & STUDIO */}
              {sellerTab === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Product Builder */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Add Sweet/Specialty Product</h3>
                      <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
                        <div>
                          <label className="block text-zinc-400 font-bold uppercase mb-1">Product Title</label>
                          <input 
                            type="text" 
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder="e.g. Traditional Nagore Wheat Sweet Halwa" 
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none" 
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 font-bold uppercase mb-1">Product Category</label>
                          <div className="flex gap-2">
                            <select 
                              value={selectedCategoryId}
                              onChange={(e) => setSelectedCategoryId(e.target.value)}
                              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none"
                              required
                            >
                              <option value="">-- Select Category --</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                            <button 
                              type="button" 
                              onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                              className="bg-zinc-200 dark:bg-zinc-800 text-charcoal dark:text-zinc-300 px-3 py-2 rounded-lg font-bold hover:bg-opacity-90"
                            >
                              {showAddCategoryForm ? "Close" : "+ New"}
                            </button>
                          </div>
                        </div>

                        {showAddCategoryForm && (
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg space-y-3">
                            <h4 className="font-bold text-xs">Create Inline Specialty Category</h4>
                            <div>
                              <input 
                                type="text"
                                placeholder="Category Name (e.g. Traditional Sweets)"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded px-2 py-1 outline-none text-xs"
                              />
                            </div>
                            <div>
                              <input 
                                type="text"
                                placeholder="Short Description"
                                value={newCatDesc}
                                onChange={(e) => setNewCatDesc(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded px-2 py-1 outline-none text-xs"
                              />
                            </div>
                            <button 
                              type="button"
                              onClick={handleAddCategorySubmit}
                              className="bg-charcoal text-white px-3 py-1.5 rounded font-bold text-[10px] hover:opacity-90"
                            >
                              Create Category
                            </button>
                          </div>
                        )}

                        <div>
                          <label className="block text-zinc-400 font-bold uppercase mb-1">Regular Price (INR)</label>
                          <input 
                            type="number" 
                            value={newProductPrice}
                            onChange={(e) => setNewProductPrice(e.target.value)}
                            placeholder="299" 
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none font-mono" 
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 font-bold uppercase mb-1">Stock Quantity</label>
                          <input 
                            type="number" 
                            value={newProductQty}
                            onChange={(e) => setNewProductQty(e.target.value)}
                            placeholder="50" 
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none font-mono" 
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 font-bold uppercase mb-1">SEO Description</label>
                          <textarea 
                            value={newProductDesc}
                            onChange={(e) => setNewProductDesc(e.target.value)}
                            placeholder="Add product description..." 
                            rows={4}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 font-bold uppercase mb-1">Product Image (Upload to MinIO)</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleLocalImageUpload}
                            className="w-full text-xs text-zinc-500 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg p-2 bg-zinc-50 dark:bg-zinc-800"
                          />
                          {newProductImage && (
                            <div className="mt-2 flex items-center gap-2">
                              <img src={newProductImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-[#e8e1dd] dark:border-[#2f2b3b]" />
                              <span className="text-[10px] text-zinc-500 truncate max-w-[250px]">{newProductImage}</span>
                            </div>
                          )}
                        </div>

                        <button 
                          type="submit" 
                          className="w-full bg-charcoal text-white py-2.5 rounded-lg font-bold hover:bg-opacity-95"
                        >
                          Add to Catalog
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* AI Copywriting Assistant */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-electric-blue/20 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-electric-blue/5 rounded-full blur-xl pointer-events-none"></div>
                      <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-electric-blue text-lg">auto_awesome</span>
                        AI Copywriter Studio
                      </h3>
                      <form onSubmit={handleGenerateAIDescription} className="space-y-4 text-xs">
                        <div>
                          <label className="block text-zinc-400 font-bold uppercase mb-1">Product keyword</label>
                          <input 
                            type="text" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. ghee sweet cashew halwa" 
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none" 
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={isGenerating}
                          className="w-full bg-[#007AFF] text-white py-2 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50"
                        >
                          {isGenerating ? 'Generating...' : 'Generate Catalog Copy'}
                        </button>
                      </form>

                      {aiTitle && (
                        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-2 border border-zinc-200 dark:border-zinc-700">
                          <h4 className="font-bold text-xs">{aiTitle}</h4>
                          <p className="text-[10px] text-zinc-400 leading-relaxed">{aiDesc}</p>
                          <button 
                            onClick={applyAISuggestions}
                            className="text-electric-blue font-bold text-[10px] hover:underline"
                          >
                            Apply Copy Suggestions
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: ORDERS PIPELINE */}
              {sellerTab === 'orders' && (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-sm">{o.id}</h4>
                          <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-mono">{o.date}</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : o.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{o.status}</span>
                        </div>
                        <p className="text-zinc-500 mt-2">{o.product} (x{o.quantity})</p>
                        <p className="text-zinc-400 text-[10px] mt-1 font-mono">Customer: {o.customer} | Total: ₹{o.total}</p>
                      </div>
                      <div className="flex gap-2">
                        {o.status === 'Pending' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(o.id, 'Processing')}
                            className="bg-charcoal text-white px-3 py-1.5 rounded hover:bg-opacity-90 font-bold"
                          >
                            Accept Order
                          </button>
                        )}
                        {o.status === 'Processing' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(o.id, 'Dispatched')}
                            className="bg-[#775560] text-white px-3 py-1.5 rounded hover:bg-opacity-90 font-bold"
                          >
                            Ship Aggregator
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: ESCROW WALLET */}
              {sellerTab === 'escrow' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-heading">Escrow &amp; Wallet Tracker</h2>
                    <p className="text-xs text-zinc-400">Track incoming payouts locked in escrow until delivery verification.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] flex flex-col justify-between h-48">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Escrow Balance</h4>
                        <p className="text-3xl font-extrabold mt-2 font-heading">₹{escrowBalance.toFixed(2)}</p>
                        <p className="text-[10px] text-zinc-400 mt-1">Settles immediately upon order confirmation.</p>
                      </div>
                      <button 
                        onClick={handleRequestPayout}
                        className="w-full bg-charcoal text-white py-2 rounded-lg text-xs font-bold hover:bg-opacity-95"
                      >
                        Request Instant Payout
                      </button>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Payout Transaction History</h3>
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center py-2 border-b">
                          <div>
                            <p className="font-bold">CREDIT - Order #BUP-99270</p>
                            <p className="text-[10px] text-zinc-400">2026-06-24</p>
                          </div>
                          <span className="text-[#32D74B] font-bold">+₹1,299.00</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <div>
                            <p className="font-bold">DEBIT - Payout Disbursed</p>
                            <p className="text-[10px] text-zinc-400">2026-06-22</p>
                          </div>
                          <span className="text-red-500 font-bold">-₹15,400.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: KYC PROFILE */}
              {sellerTab === 'kyc' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-heading">Seller KYC &amp; Verification</h2>
                    <p className="text-xs text-zinc-400">Upload business credentials (GST, FSSAI) to qualify for instant payouts.</p>
                  </div>

                  <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] max-w-xl">
                    <h3 className="text-sm font-bold mb-4">GST/FSSAI Document Portal</h3>
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-zinc-400 font-bold uppercase mb-1">GSTIN Number</label>
                        <input 
                          type="text" 
                          value={gstNumber} 
                          onChange={(e) => setGstNumber(e.target.value)} 
                          placeholder="33AAAAA1111A1Z1" 
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-bold uppercase mb-1">FSSAI License Number</label>
                        <input 
                          type="text" 
                          value={fssaiNumber} 
                          onChange={(e) => setFssaiNumber(e.target.value)} 
                          placeholder="10022020000001" 
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-bold uppercase mb-1">Upload Certificate (PDF/PNG)</label>
                        <div className="border-2 border-dashed border-[#CCB7AE] rounded-lg p-6 text-center hover:bg-[#CCB7AE]/5 transition-all cursor-pointer">
                          <p className="text-zinc-500">Drag files here or click to upload</p>
                        </div>
                      </div>

                      <button 
                        onClick={handleKYCVerifySubmit}
                        className="w-full bg-charcoal text-white py-2.5 rounded-lg font-bold hover:bg-opacity-95"
                      >
                        Submit Documents
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: DISPUTES */}
              {sellerTab === 'disputes' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-heading">Customer Dispute Resolution</h2>
                    <p className="text-xs text-zinc-400">Resolve items flagged by buyers. Unresolved disputes remain held in escrow.</p>
                  </div>

                  <div className="space-y-4">
                    {disputes.map(d => (
                      <div key={d.id} className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-sm">{d.id}</h4>
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono text-zinc-500">Order: {d.orderId}</span>
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">{d.status}</span>
                          </div>
                          <p className="text-zinc-500 mt-2">{d.reason}</p>
                          <p className="text-zinc-400 text-[10px] mt-1 font-mono">Raised: {d.date} | Customer: {d.customer}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setDisputes(prev => prev.map(item => item.id === d.id ? { ...item, status: 'Resolved' } : item)); alert('Refund approved to customer wallet.'); }}
                            className="bg-[#775560] text-white px-3 py-1.5 rounded hover:bg-opacity-90 font-bold"
                          >
                            Approve Refund
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: PROMO VOUCHERS */}
              {sellerTab === 'vouchers' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Voucher Creator Form */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Create Promo Voucher</h3>
                      <form onSubmit={handleAddCouponSubmit} className="space-y-4 text-xs font-semibold">
                        <div>
                          <label className="block text-zinc-400 uppercase mb-1">Voucher/Coupon Code</label>
                          <input 
                            type="text" 
                            placeholder="e.g. WELCOME50" 
                            value={newCouponCode}
                            onChange={(e) => setNewCouponCode(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none uppercase" 
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 uppercase mb-1">Discount (%)</label>
                          <input 
                            type="number" 
                            min="0"
                            max="100"
                            placeholder="15" 
                            value={newCouponDiscount}
                            onChange={(e) => setNewCouponDiscount(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none font-mono" 
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 uppercase mb-1">Min Order Value (₹)</label>
                          <input 
                            type="number" 
                            placeholder="200" 
                            value={newCouponMinOrder}
                            onChange={(e) => setNewCouponMinOrder(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none font-mono" 
                          />
                        </div>
                        <button 
                          type="submit" 
                          className="w-full bg-charcoal text-white py-2.5 rounded-lg font-bold hover:bg-opacity-95"
                        >
                          Generate Voucher
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Vouchers Directory List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Active Shop Vouchers</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400 font-bold">
                              <th className="py-2">Code</th>
                              <th className="py-2">Discount %</th>
                              <th className="py-2">Min Spend</th>
                              <th className="py-2">Expires At</th>
                              <th className="py-2">Premium Only</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coupons.map(cp => (
                              <tr key={cp.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                                <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">{cp.code}</td>
                                <td className="py-3 font-mono">{cp.discount_percent}%</td>
                                <td className="py-3 font-mono">₹{cp.min_order_value}</td>
                                <td className="py-3 text-zinc-500">{new Date(cp.expiry_date).toLocaleDateString()}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded font-bold ${cp.is_premium_only ? 'bg-amber-100/10 text-amber-500' : 'bg-green-100/10 text-green-500'}`}>
                                    {cp.is_premium_only ? 'Yes' : 'No'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {coupons.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-zinc-400">No promo vouchers generated yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        )
      )}

      {/* Cart Slide-over Panel */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white dark:bg-[#15131b] shadow-xl flex flex-col h-full border-l border-[#e8e1dd] dark:border-[#2f2b3b]">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-md font-bold flex items-center gap-2">
                  <span>🛒</span> Shopping Cart
                </h2>
                <button onClick={() => setShowCart(false)} className="text-zinc-400 hover:text-zinc-600 font-bold text-sm">
                  ✕ Close
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800 text-xs">
                    <img 
                      src={item.product.image_url || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"} 
                      alt={item.product.name} 
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{item.product.name}</h4>
                      <p className="text-zinc-500 font-semibold mt-0.5">₹{item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="text-center py-20 text-zinc-400 font-medium">
                    Your cart is empty. Add specialties from the catalog.
                  </div>
                )}
              </div>

              {/* Bottom Calculations & Voucher & Checkout */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-4 text-xs font-semibold">
                  
                  {/* Applied promo display */}
                  {appliedPromo && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-3 py-2 rounded-lg flex items-center justify-between">
                      <span>Voucher <b>{appliedPromo.code}</b> Applied ({appliedPromo.discount_percentage}%)</span>
                      <span>- ₹{appliedPromo.discount_amount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Promo Input Form */}
                  <form onSubmit={(e) => handleApplyPromo(e, cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0))} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Voucher Code" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-white dark:bg-zinc-900 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none uppercase font-bold text-[11px]"
                    />
                    <button 
                      type="submit" 
                      className="bg-charcoal text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-95"
                    >
                      Apply
                    </button>
                  </form>
                  {promoError && <p className="text-red-500 text-[10px] mt-1">{promoError}</p>}

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal</span>
                      <span>₹{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-500">
                        <span>Voucher Discount</span>
                        <span>- ₹{appliedPromo.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-500">
                      <span>Shipping Delivery</span>
                      <span>₹50.00</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Artisan Trust Fund</span>
                      <span>₹2.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-zinc-800 dark:text-zinc-100 border-t border-zinc-200 dark:border-zinc-800 pt-2">
                      <span>Total Amount</span>
                      <span>
                        ₹{(
                          Math.max(
                            0,
                            cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0) -
                            (appliedPromo ? appliedPromo.discount_amount : 0) +
                            52
                          )
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckoutSubmit}
                    className="w-full bg-[#007AFF] text-white py-3 rounded-xl font-bold hover:bg-opacity-90 active:scale-95 transition-all text-center block"
                  >
                    Confirm &amp; Place Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}
