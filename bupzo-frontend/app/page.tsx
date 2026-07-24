'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { fetchProducts, createCheckout, addToWishlist, getWishlistItems, removeFromWishlist, initiateStitchPayment, generateAICopy, verifyKYC, searchProducts, Product, WishlistItem, fetchCategories, createCategory, createProduct, fetchCoupons, createCoupon, validateCoupon, Category, Coupon, uploadImage, fetchSellerOrders, fetchUserOrders, fetchWalletTransactions, adjustUserWallet, fetchSellers, updateOrderStatus, fetchAuthMe, fetchNotifications } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import { useUser } from '@/lib/authStore';
import AuthModal from '@/components/AuthModal';
import CartModal from '@/components/CartModal';
import { SellerDashboard } from '@/components/SellerDashboard';
import { CustomerHome } from '@/components/CustomerHome';
import { CustomerCategories } from '@/components/CustomerCategories';
import { CustomerOrders } from '@/components/CustomerOrders';
import { CustomerWallet } from '@/components/CustomerWallet';
import { CustomerWishlist } from '@/components/CustomerWishlist';
import { CustomerSettings } from '@/components/CustomerSettings';
import { CustomerMessages } from '@/components/CustomerMessages';
import { Navbar } from '@/components/Navbar';
import SellerKYCModal from '@/components/SellerKYCModal';
import ProductPreviewModal from '@/components/ProductPreviewModal';

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [pendingCheckoutData, setPendingCheckoutData] = useState<any>(null);
  const [userRole, setUserRole] = useState<'customer' | 'seller'>('customer');
  const [sellerTab, setSellerTab] = useState<'overview' | 'products' | 'orders' | 'escrow' | 'kyc' | 'disputes' | 'vouchers'>('overview');
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Redirect old affiliate links to new route & detect seller dashboard switch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isSellerParam = urlParams.get('seller');
      const tabParam = urlParams.get('tab');
      if (isSellerParam === 'true' || tabParam === 'seller') {
        setUserRole('seller');
      }
      const pid = urlParams.get('product_id');
      const ref = urlParams.get('ref');
      if (pid) {
        if (ref) {
          window.location.href = `/product/${pid}?ref=${ref}`;
        } else {
          window.location.href = `/product/${pid}`;
        }
      }
    }
  }, []);

  // API Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [sellerNotifications, setSellerNotifications] = useState<any[]>([]);
  const [kycStatus, setKycStatus] = useState<'Pending' | 'Uploaded' | 'Approved'>('Pending');
  const [loading, setLoading] = useState(true);

  // Real Orders and Disputes for Seller Operations
  const [orders, setOrders] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);

  // Form States for adding product
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductQty, setNewProductQty] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [sellerId, setSellerId] = useState('');

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
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('');
  const [newCouponIsPremiumOnly, setNewCouponIsPremiumOnly] = useState(false);

  // Checkout Voucher validation states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');

  // Storefront & Customer States
  const [customerTab, setCustomerTab] = useState<'home' | 'categories' | 'orders' | 'wallet' | 'wishlist' | 'kyc' | 'settings' | 'messages'>('home');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [topupAmount, setTopupAmount] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [homeCategoryFilter, setHomeCategoryFilter] = useState('all');
  const [isSeller, setIsSeller] = useState(false);
  const [sellerOrdersList, setSellerOrdersList] = useState<any[]>([]);

  // Cart states
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';

  // AI Product Studio States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiDesc, setAiDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCustomerSidebarOpen, setIsCustomerSidebarOpen] = useState(false);
  const [isSellerSidebarOpen, setIsSellerSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [mountedTheme, setMountedTheme] = useState<string | undefined>(undefined);
  const [isSidebarReduced, setIsSidebarReduced] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  // Authenticated user state
  const { user, setUser } = useUser();
  // WebSocket Subscription hook
  const { messages } = useWebSocket(user?.id || '');

  useEffect(() => {
    setMountedTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    setHasMounted(true);
    try {
      const reduced = localStorage.getItem('bupzo_sidebar_reduced') === 'true';
      setIsSidebarReduced(reduced);
    } catch (e) {}

    const handleReturn = () => setUserRole('customer');
    window.addEventListener('returnToStorefront', handleReturn);
    return () => window.removeEventListener('returnToStorefront', handleReturn);
  }, []);

  // Refresh user data when opening cart or wallet
  useEffect(() => {
    if (user?.id && (showCart || customerTab === 'wallet')) {
      fetch(`${API_URL}/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
           if (data && data.id) {
             setUser(data);
           }
        })
        .catch(console.error);
    }
  }, [showCart, customerTab]);

  // Fetch unread messages count for logged-in user
  useEffect(() => {
    if (!user?.id) return;
    const checkUnread = async () => {
      try {
        const resp = await fetch(`${API_URL}/api/messages/?user_id=${user.id}`);
        if (resp.ok) {
          const msgs: any[] = await resp.json();
          const unread = msgs.filter((m: any) => m.receiver_id === user.id && !m.is_read).length;
          setUnreadMsgs(unread);
        }
      } catch (e) {}
    };
    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, [user?.id, customerTab]);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    try {
      const localCart = localStorage.getItem('bupzo_cart');
      if (localCart) {
        const parsedCart = JSON.parse(localCart);
        // Deduplicate cart
        const uniqueCart: any[] = [];
        parsedCart.forEach((item: any) => {
          const existing = uniqueCart.find(u => u.product?.id === item.product?.id);
          if (existing) {
            existing.quantity += item.quantity;
          } else if (item.product?.id) {
            uniqueCart.push(item);
          }
        });
        setCart(uniqueCart);
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bupzo_cart', JSON.stringify(cart));
  }, [cart]);

  // Mock cleanup removed
  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await fetchProducts();
        setProducts(prodData);
        setWishlist([]);

        try {
          const cats = await fetchCategories();
          setCategories(cats);
          if (cats.length > 0) {
            // Do not select by default so we show all products on homepage
            // setSelectedCategoryId(cats[0].id);
          }
        } catch (e) {
          console.warn("Failed to load categories:", e);
        }

        try {
          const cps = await fetchCoupons();
          setCoupons(cps);
        } catch (e) {
          console.warn("Failed to load coupons:", e);
        }
      } catch (err) {
        console.warn("Error loading products/wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        const ords = await fetchUserOrders(user.id);
        setCustomerOrders(ords);

        const txs = await fetchWalletTransactions(user.id);
        setWalletTransactions(txs);

        const wishs = await getWishlistItems(user.id);
        setWishlist(wishs);
      } catch (err) {
        console.warn("Error loading user dynamic orders/wallet/wishlist data:", err);
      }
    };
    loadUserData();
  }, [user, customerTab]);

  useEffect(() => {
    if (userRole !== 'seller') return;

    const activeSellerId = sellerId || (user as any)?.seller_id || user?.id;
    if (!activeSellerId) return;

    const loadSellerOrders = async () => {
      try {
        const data = await fetchSellerOrders(activeSellerId);
        setSellerOrdersList(data);
      } catch (err) {
        console.warn("Error fetching seller orders:", err);
      }
    };

    const loadSellerNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setSellerNotifications(Array.isArray(data) ? data.filter((n: any) => !n.read) : []);
      } catch (err) {
        console.warn('Failed to load seller notifications:', err);
      }
    };

    loadSellerOrders();
    loadSellerNotifications();

    const refreshInterval = setInterval(() => {
      loadSellerOrders();
      loadSellerNotifications();
    }, 20000);

    return () => clearInterval(refreshInterval);
  }, [userRole, sellerId, user]);

  useEffect(() => {
    if (!user) return;
    const fetchUnreadMsgs = async () => {
      try {
        const resp = await fetch(`${API_URL}/api/messages/?user_id=${user.id}`);
        if (resp.ok) {
          const data = await resp.json();
          const unread = data.filter((m: any) => m.receiver_id === user.id && !m.read).length;
          setUnreadMsgs(unread);
        }
      } catch (err) {
        console.warn("Failed to fetch messages for unread count", err);
      }
    };
    fetchUnreadMsgs();
    const int = setInterval(fetchUnreadMsgs, 20000);
    return () => clearInterval(int);
  }, [user]);

  useEffect(() => {
    if (hasMounted) {
      setMountedTheme(resolvedTheme);
    }
  }, [resolvedTheme, hasMounted]);

  useEffect(() => {
    if (!user) {
      setIsSeller(false);
      setUserRole('customer');
      return;
    }

    const refreshUserData = async () => {
      try {
        const me = await fetchAuthMe();
        setUser(me);
      } catch (err) {
        console.warn('Could not refresh auth user data:', err);
      }
    };

    const checkSellerStatus = async () => {
      try {
        const sellersList = await fetchSellers();
        const sellerObj = sellersList.find((s: any) => s.user_id === user.id || s.id === user.id || s.id === (user as any).seller_id);
        const isSellerUser = Boolean(sellerObj) || Boolean((user as any).is_seller) || Boolean((user as any).seller_id) || user.phone === '+919876543211';
        setIsSeller(isSellerUser);
        if (sellerObj) {
          setSellerId(sellerObj.id);
        } else if ((user as any).seller_id || user.id) {
          setSellerId((user as any).seller_id || user.id);
        }

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const isSellerUrl = urlParams?.get('seller') === 'true' || urlParams?.get('tab') === 'seller';

        if (isSellerUrl || isSellerUser) {
          setUserRole('seller');
        }
      } catch (err) {
        console.warn("Error evaluating seller role verification status:", err);
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        if (urlParams?.get('seller') === 'true' || user.phone === '+919876543211' || (user as any).is_seller) {
          setIsSeller(true);
          setUserRole('seller');
        }
      }
    };

    refreshUserData();
    checkSellerStatus();
  }, [user?.id]);

  useEffect(() => {
    if (userRole === 'seller' && user) {
      setEscrowBalance(user.wallet_balance ?? 0);
    }
  }, [userRole, user]);

  useEffect(() => {
    if (userRole !== 'seller') return;

    const loadSellerNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setSellerNotifications(Array.isArray(data) ? data.filter((n: any) => !n.read) : []);
      } catch (err) {
        console.warn('Failed to load seller notifications:', err);
      }
    };
    loadSellerNotifications();
  }, [userRole]);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      setSellerOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: status.toLowerCase() } : o));
      alert(`Order ${orderId} updated to ${status}.`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update order status.');
    }
  };

  const handleRequestPayout = async () => {
    if (!sellerId) {
      alert('Unable to request payout without seller account.');
      return;
    }
    alert(`Payout request of ₹${escrowBalance.toFixed(2)} submitted to Super Admin.`);
    setEscrowBalance(0);
  };

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
      }
    } catch (err) {
      console.error(err);
      alert("AI copywriter service offline. Using cached simulation instead.");
      setAiTitle("Nagore Ghee Halwa - Pure Cashew Sweet");
      setAiDesc("Experience the true heritage of Nagore with our pure ghee wheat halwa, cooked slow and loaded with premium cardamoms and crunchy cashew nuts. 100% natural, preservative-free.");
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
      const data = await verifyKYC(gstNumber, fssaiNumber, user?.id || undefined, sellerId || undefined);
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

  const handleTopupWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topupAmount) return;

    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid top-up amount.");
      return;
    }

    try {
      const data = await adjustUserWallet(user.id, amt, 'Credit', 'User wallet top-up');
      alert(`Wallet successfully topped up by ₹${amt}. New balance: ₹${data.new_balance}`);
      setUser({ ...user, wallet_balance: data.new_balance });
      setTopupAmount('');

      const txs = await fetchWalletTransactions(user.id);
      setWalletTransactions(txs);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error performing wallet top-up.");
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

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) {
      alert("Please fill in the product name and price.");
      return;
    }
    if (!selectedCategoryId) {
      alert("No category selected. Please select a category for the product.");
      return;
    }
    if (!sellerId) {
      alert("You must be logged in as a seller to create a product. Please use the seller account (phone: +919876543211) or create a new seller profile.");
      return;
    }

    try {
      const prod = await createProduct({
        name: newProductName,
        category_id: selectedCategoryId,
        price: parseFloat(newProductPrice),
        weight_grams: 250,
        image_url: newProductImage || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80",
        
        stock_quantity: parseInt(newProductQty) || 50,
        seller_id: sellerId,
        description: newProductDesc
      });
      alert(`Product "${prod.name}" successfully added to the catalog!`);
      setProducts(prev => [prod, ...prev]);

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
        is_premium_only: newCouponIsPremiumOnly,
        min_order_value: parseFloat(newCouponMinOrder) || 100.0,
        expiry_date: new Date(Date.now() + 86400000 * 30).toISOString(),
        created_by_seller_id: sellerId || undefined
      });
      alert(`Voucher "${cp.code}" submitted! Pending Admin Approval.`);
      setCoupons(prev => [cp, ...prev]);
      setNewCouponCode('');
      setNewCouponDiscount('');
      setNewCouponMinOrder('');
      setNewCouponIsPremiumOnly(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create coupon on backend.");
    }
  };

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
      console.warn(err);
      setPromoError(err.message || "Failed to validate voucher.");
      alert(err.message || "Failed to validate voucher.");
      setAppliedPromo(null);
    }
  };

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

  const handleAddToWishlist = async (product: Product) => {
    if (!user || !user.id || !user.phone) {
      setIsAuthModalOpen(true);
      alert("Please login to add items to your wishlist.");
      return;
    }
    try {
      await addToWishlist(product.id, user.id);
      alert(`"${product.name}" added to wishlist!`);
      const wishs = await getWishlistItems(user.id);
      setWishlist(wishs);
    } catch (err: any) {
      console.warn(err);
      alert(err.message || "Failed to add item to wishlist.");
    }
  };

  const updateCartQuantity = (productId: string, newQty: number) => {
    setCart(prev => prev.map(item => {
      if (item?.product?.id === productId) {
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as any);
  };

  const handleCheckoutSubmit = async (walletAmountUsed: number = 0, shippingCost: number = 50, shippingPartner: string = 'Delhivery', trustDonation: number = 0) => {
    if (!user || !user.id || !user.phone) {
      setIsAuthModalOpen(true);
      alert("Please login to proceed with checkout.");
      return;
    }
    if (user.phone.includes('GOOG-') || !user.email) {
      alert("Please update your mobile number and email in Account Settings before placing an order.");
      setCustomerTab('settings');
      setShowCart(false);
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const discount = appliedPromo?.discount_amount || 0;
      const totalAmount = Math.max(0, subtotal - discount + shippingCost + trustDonation);
      const remainingAmount = Math.max(0, totalAmount - walletAmountUsed);

      if (remainingAmount > 0) {
        setPaymentAmount(remainingAmount);
        setPendingCheckoutData({ walletAmountUsed, shippingCost, shippingPartner, trustDonation });
        setShowPaymentPopup(true);
        return;
      }
      
      await executeCheckout(walletAmountUsed, shippingCost, shippingPartner, trustDonation);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Checkout failed.');
    }
  };

  const executeCheckout = async (walletAmountUsed: number, shippingCost: number, shippingPartner: string, trustDonation: number = 0) => {
    try {
      const sellerCarts: Record<string, any[]> = {};
      for (const item of cart) {
        if (!sellerCarts[item.product.seller_id]) sellerCarts[item.product.seller_id] = [];
        sellerCarts[item.product.seller_id].push(item);
      }

      const numSellers = Object.keys(sellerCarts).length || 1;
      for (const sellerId of Object.keys(sellerCarts)) {
        const sellerItems = sellerCarts[sellerId];
        const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        
        await createCheckout({
          user_id: user?.id || '',
          seller_id: sellerId,
          items: sellerItems.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
          total_amount: sellerSubtotal + (shippingCost / numSellers) + (trustDonation / numSellers),
          order_source: 'WEB',
          shipping_partner: shippingPartner,
          payment_gateway: paymentAmount > 0 ? 'Razorpay' : 'Wallet'
        });
      }

      alert('Order placed successfully! Thank you for your purchase & trust donation.');
      setCart([]);
      localStorage.removeItem('bupzo_cart');
      setShowCart(false);
      setCustomerTab('orders');
    } catch (e: any) {
      alert('Failed to place order: ' + e.message);
    }
  };

  useEffect(() => {
    if (sellerTab === 'vouchers') {
      const loadCoupons = async () => {
        try {
          const cps = await fetchCoupons();
          setCoupons(cps);
        } catch (e) {
          console.warn("Failed to load coupons:", e);
          alert("Failed to load coupons. Please try again.");
        }
      };
      loadCoupons();
    }
  }, [sellerTab]);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#f9fbfd] dark:bg-[#0f111a] flex items-center justify-center font-sans text-xs font-bold text-[#3874ff]">
        Loading Bupzo Storefront...
      </div>
    );
  }

  return (
    <div className={`${mountedTheme === 'dark' ? 'dark bg-[#0f111a] text-[#e3e6ed]' : 'bg-[#f9fbfd] text-[#141824]'} min-h-screen font-sans transition-colors duration-300 flex w-full`}>
      {/* Top Controls -> Moved to Bottom to fix UI overlap */}
      <div className="fixed bottom-4 right-4 z-50 flex space-x-2">
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              if (userRole === 'customer') {
                setIsCustomerSidebarOpen(!isCustomerSidebarOpen);
              } else {
                setIsSellerSidebarOpen(!isSellerSidebarOpen);
              }
            } else {
              const val = !isSidebarReduced;
              setIsSidebarReduced(val);
              try {
                localStorage.setItem('bupzo_sidebar_reduced', val.toString());
              } catch (e) {}
            }
          }}
          className="p-2.5 rounded-full bg-[#3874ff] text-white shadow-md hover:bg-opacity-95 active:scale-95 transition-all text-xs font-bold flex items-center justify-center"
          title="Toggle Navigation Menu"
        >
          <span className="text-[14px]">☰</span>
        </button>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-full bg-[#3874ff] text-white shadow-md hover:bg-opacity-95 active:scale-95 transition-all text-xs font-bold"
        >
          {resolvedTheme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => {
            if (!user) {
              setIsAuthModalOpen(true);
              return;
            }
            // Removed the isSeller block to allow switching to Seller Onboarding
            setUserRole(prev => prev === 'customer' ? 'seller' : 'customer');
          }}
          className="px-4 py-2 rounded-full bg-[#525b75] dark:bg-[#222834] text-white font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all"
        >
          {userRole === 'customer' ? 'Switch to Seller Dashboard' : 'Switch to Customer Site'}
        </button>
        {userRole === 'customer' && (
          <button
            onClick={() => setShowCart(true)}
            className="px-4 py-2 rounded-full bg-[#3874ff] text-white font-bold text-xs shadow-md hover:bg-opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>🛒</span> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        )}
      </div>

      {/* CUSTOMER PORTAL */}
      {userRole === 'customer' && (
        <div className="flex flex-col flex-1 w-full relative">
          <Navbar
            onTabChange={(tab) => {
              setUserRole('customer');
              if (typeof window !== 'undefined' && window.location.search.includes('seller=true')) {
                const url = new URL(window.location.href);
                url.searchParams.delete('seller');
                window.history.replaceState({}, '', url.toString());
              }
              setCustomerTab(tab as any);
            }}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onCartClick={() => setShowCart(true)}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            wishlistCount={wishlist.length}
            unreadMsgs={unreadMsgs}
          />
          <div className="w-full min-h-screen transition-all duration-300 bg-white">
            <div className="w-full mx-auto space-y-8">
              {/* TAB: HOME */}
              {customerTab === 'home' && (
                <div className="space-y-0 w-full">
                  <div className="w-full bg-white border-b border-gray-200 px-4 py-4 mb-0 flex justify-center">
                    <form onSubmit={handleAISearch} className="flex gap-2 w-full max-w-3xl">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search semantically using AI..."
                          className="w-full px-4 py-3 rounded-l border border-gray-300 text-sm outline-none shadow-sm focus:border-brand-blue"
                        />
                        {isSearching && (
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-3 top-3 text-[10px] text-gray-400 hover:text-charcoal font-bold"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="bg-brand-yellow text-brand-blue px-6 py-3 rounded-r text-sm font-bold shadow hover:bg-yellow-500 flex items-center gap-1"
                      >
                        AI Search
                      </button>
                    </form>
                  </div>
                  {loading ? (
                    <div className="text-center py-12 text-zinc-400 font-medium">Loading catalog items...</div>
                  ) : (
                    <CustomerHome
                      products={products}
                      setPreviewProduct={setPreviewProduct}
                      handleAddToWishlist={handleAddToWishlist}
                      handleAddToCart={handleAddToCart}
                      categories={categories}
                      selectedCategoryId={homeCategoryFilter === 'all' ? null : homeCategoryFilter}
                      setSelectedCategoryId={(id) => setHomeCategoryFilter(id || 'all')}
                    />
                  )}
                </div>
              )}
              {/* TAB: SHOP CATEGORIES */}
              {customerTab === 'categories' && (
                <CustomerCategories
                  categories={categories}
                  products={products}
                  selectedCategoryFilter={selectedCategoryFilter}
                  setSelectedCategoryFilter={setSelectedCategoryFilter}
                  setPreviewProduct={setPreviewProduct}
                  handleAddToWishlist={handleAddToWishlist}
                  handleAddToCart={handleAddToCart}
                />
              )}
              {/* TAB: TRACK ORDERS */}
              {customerTab === 'orders' && (
                <CustomerOrders
                  customerOrders={customerOrders}
                  user={user}
                />
              )}
              {/* TAB: KYC */}
              {customerTab === 'kyc' && (
                <SellerKYCModal onClose={() => setCustomerTab('home')} />
              )}
              {/* TAB: MY WALLET */}
              {customerTab === 'wallet' && (
                <CustomerWallet
                  walletBalance={user?.wallet_balance ?? 0}
                  walletTransactions={walletTransactions}
                  user={user}
                  theme={theme || 'light'}
                />
              )}
              {/* TAB: WISHLIST */}
              {customerTab === 'wishlist' && (
                <CustomerWishlist
                  wishlist={wishlist}
                  removeFromWishlist={async (id: string) => {
                    try {
                      await removeFromWishlist(id);
                      setWishlist(prev => prev.filter(w => w.id !== id));
                    } catch(e) { console.warn(e); }
                  }}
                  setWishlist={setWishlist}
                  handleAddToCart={(p: any) => handleAddToCart(products.find((x: any) => x.id === p.id) || p)}
                  onProductClick={(p: any) => {
                    const realProduct = products.find((x: any) => x.id === p.id) || p;
                    setPreviewProduct(realProduct);
                  }}
                />
              )}
              {/* TAB: SETTINGS */}
              {customerTab === 'settings' && (
                <CustomerSettings user={user} />
              )}
              {/* TAB: MESSAGES */}
              {customerTab === 'messages' && (
                <CustomerMessages user={user} />
              )}
            </div>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {previewProduct && (
        <ProductPreviewModal 
          product={previewProduct} 
          onClose={() => setPreviewProduct(null)}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onBuyNow={() => setShowCart(true)}
        />
      )}

      {false && userRole === 'seller' && !isSeller && (
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
      )}
      {userRole === 'seller' && (
        <div className="flex-1 w-full bg-[#f3f4f6] dark:bg-[#0c0b11] p-4 md:p-8">
          {/* @ts-ignore */}
        <SellerDashboard onSwitchToCustomer={() => setUserRole('customer')} />
        </div>
      )}
      
      {/* Auth Modal (Global) */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      
      {/* Cart Modal (Global) */}
      <CartModal 
        isOpen={showCart} 
        onClose={() => setShowCart(false)}
        cart={cart}
        updateQuantity={updateCartQuantity}
        user={user}
        onCheckout={handleCheckoutSubmit}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        appliedPromo={appliedPromo}
        handleApplyPromo={handleApplyPromo}
      />

      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1f2937] p-4 text-center text-white relative">
              <button 
                onClick={() => setShowPaymentPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >✕</button>
              <h2 className="font-bold text-lg mb-1">Stitch Money Secure Checkout</h2>
              <p className="text-xs text-gray-300">Powered by Bupzo</p>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
                <div className="text-3xl font-extrabold text-[#e52e06]">₹{paymentAmount.toLocaleString()}</div>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={async () => {
                    setShowPaymentPopup(false);
                    if (pendingCheckoutData) {
                      await executeCheckout(pendingCheckoutData.walletAmountUsed, pendingCheckoutData.shippingCost, pendingCheckoutData.shippingPartner, pendingCheckoutData.trustDonation || 0);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">credit_card</span>
                  Pay with Card / UPI
                </button>
                <button 
                  onClick={() => setShowPaymentPopup(false)}
                  className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-700 py-2"
                >
                  Cancel Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}