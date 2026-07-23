export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8004';
    }
  }
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
  return rawApiUrl.split('#')[0].trim().replace(/\/$/, '');
};

export const API_BASE_URL = getApiBaseUrl();

const buildUrl = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
};

const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bupzo_access_token');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bupzo_refresh_token');
};

const saveTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('bupzo_access_token', accessToken);
  localStorage.setItem('bupzo_refresh_token', refreshToken);
};

const saveUser = (user: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('bupzo_user', JSON.stringify(user));
};

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('bupzo_access_token');
  localStorage.removeItem('bupzo_refresh_token');
  localStorage.removeItem('bupzo_user');
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  let json: any = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON response from API');
    }
  }

  if (!response.ok) {
    const errorMessage = (typeof json.detail === 'object' ? JSON.stringify(json.detail) : json.detail) || json.message || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return json as T;
};

export const fetchShippingRates = async (deliveryPincode: string, weightKg: number = 1.0) => {
  const resp = await fetch(buildUrl(`/api/shipping-rates/?delivery_pincode=${deliveryPincode}&weight_kg=${weightKg}`));
  return parseJsonResponse<any[]>(resp);
};

const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(buildUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearAuthStorage();
      return false;
    }

    const data = await response.json();
    saveTokens(data.access_token, data.refresh_token);
    if (data.user) saveUser(data.user);
    return true;
  } catch {
    clearAuthStorage();
    return false;
  }
};

export const authFetch = async (path: string, init: RequestInit = {}, retry = true): Promise<Response> => {
  const headers = init.headers ? { ...(init.headers as Record<string, string>) } : {};
  if (!(init.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(buildUrl(path), { ...init, headers });

  if (response.status === 401 && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return authFetch(path, init, false);
    }
  }

  return response;
};

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  weight_grams: number;
  image_url?: string;
  stock_quantity: number;
  seller_id: string;
  description?: string;
  category_name?: string;
  seller_name?: string;
  images?: string[];
  created_at: string;
  is_approved?: boolean;
  rejection_reason?: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  added_at: string;
  product_name: string;
  product_price: number;
  product_image_url?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  is_premium_only: boolean;
  min_order_value: number;
  expiry_date: string;
  usage_limit?: number;
  created_at: string;
  created_by_seller_id?: string;
  status: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: any;
}

export async function loginUser(payload: {
  username: string;
  password?: string;
}): Promise<AuthTokenResponse> {
  const response = await fetch(buildUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse<AuthTokenResponse>(response);
  saveTokens(data.access_token, data.refresh_token);
  saveUser(data.user);
  return data;
}

export async function fetchProducts(sellerId?: string): Promise<Product[]> {
  const url = sellerId ? `/api/products/?seller_id=${sellerId}` : '/api/products/';
  const response = await fetch(buildUrl(url));
  return parseJsonResponse<Product[]>(response);
}

export async function createCheckout(order: {
  user_id: string;
  seller_id: string;
  items: { product_id: string; quantity: number }[];
  total_amount: number;
  order_source: string;
  shipping_partner?: string;
  payment_gateway?: string;
  trust_donation_amount?: number;
}): Promise<{ success: boolean; message: string; order_id: string }> {
  const response = await authFetch('/api/checkout/', {
    method: 'POST',
    body: JSON.stringify(order),
  });
  return parseJsonResponse(response);
}

export async function addToWishlist(productId: string, userId: string): Promise<WishlistItem> {
  const response = await authFetch('/api/wishlist/', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, user_id: userId }),
  });
  return parseJsonResponse(response);
}

export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  const response = await authFetch(`/api/wishlist/${userId}`);
  return parseJsonResponse(response);
}

export async function removeFromWishlist(wishlistId: string): Promise<{ success: boolean }> {
  const response = await authFetch(`/api/wishlist/${wishlistId}`, {
    method: 'DELETE',
  });
  return parseJsonResponse(response);
}

export const deleteProduct = async (productId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete product');
  }
};

export const fetchUserAddresses = async (userId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/addresses/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch addresses');
  return res.json();
};

export const createAddress = async (userId: string, data: any) => {
  const res = await fetch(`${API_BASE_URL}/api/addresses/?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create address');
  return res.json();
};

export const updateAddress = async (addressId: number, data: any) => {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${addressId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update address');
  return res.json();
};

export const deleteAddress = async (addressId: number) => {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${addressId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete address');
  return res.json();
};

export async function initiateStitchPayment(orderId: string, amount: number): Promise<{ success: boolean; payment_url: string; mode: string }> {
  const response = await authFetch('/api/payment/stitch', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, amount }),
  });
  return parseJsonResponse(response);
}

export async function searchProducts(query: string, limit?: number): Promise<{ success: boolean; results: Product[] }> {
  const response = await fetch(buildUrl('/api/products/search/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit }),
  });
  return parseJsonResponse(response);
}

export async function generateAICopy(prompt: string): Promise<{ success: boolean; title: string; description: string; tags: string[] }> {
  const response = await authFetch('/api/ai/copywriter/', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  return parseJsonResponse(response);
}

export async function verifyKYC(gstNumber: string, fssaiNumber: string, userId?: string, sellerId?: string): Promise<{
  status: string;
  gst_check: string;
  fssai_check: string;
  reason: string;
  verification_score: number;
}> {
  const response = await authFetch('/api/ai/kyc/', {
    method: 'POST',
    body: JSON.stringify({
      gst_number: gstNumber,
      fssai_number: fssaiNumber,
      user_id: userId || null,
      seller_id: sellerId || null,
    }),
  });
  return parseJsonResponse(response);
}

export async function checkFraud(orderId: string, userId: string, amount: number, orderSource: string): Promise<{
  status: string;
  risk_score_percent: number;
  reasons: string[];
}> {
  const response = await authFetch('/api/ai/fraud/', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, user_id: userId, amount, order_source: orderSource }),
  });
  return parseJsonResponse(response);
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(buildUrl('/api/categories/'));
  return parseJsonResponse(response);
}

export async function createCategory(name: string, description?: string): Promise<Category> {
  const response = await authFetch('/api/categories/', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
  return parseJsonResponse(response);
}

export async function createProduct(product: {
  name: string;
  category_id: string;
  price: number;
  weight_grams: number;
  image_url?: string;
  stock_quantity: number;
  seller_id: string;
  description?: string;
  images?: string[];
}): Promise<Product> {
  const response = await authFetch('/api/products/', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  return parseJsonResponse(response);
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const response = await fetch(buildUrl('/api/coupons/'));
  return parseJsonResponse(response);
}

export async function createCoupon(coupon: {
  code: string;
  discount_percent: number;
  is_premium_only: boolean;
  min_order_value: number;
  expiry_date: string;
  created_by_seller_id?: string;
}): Promise<Coupon> {
  const response = await authFetch('/api/coupons/', {
    method: 'POST',
    body: JSON.stringify(coupon),
  });
  return parseJsonResponse(response);
}

export async function validateCoupon(code: string, orderValue: number): Promise<{
  success: boolean;
  code: string;
  discount_amount: number;
  discount_percentage: number;
}> {
  const response = await authFetch('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, order_value: orderValue }),
  });
  return parseJsonResponse(response);
}

export async function uploadImage(file: File): Promise<{ success: boolean; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await authFetch('/api/upload/', {
    method: 'POST',
    body: formData,
  });
  return parseJsonResponse(response);
}

export async function fetchSellerOrders(sellerId: string): Promise<any[]> {
  const response = await authFetch(`/api/orders/seller/${sellerId}`);
  return parseJsonResponse(response);
}

export async function fetchUserOrders(userId: string): Promise<any[]> {
  const response = await authFetch(`/api/orders/user/${userId}`);
  return parseJsonResponse(response);
}

export async function fetchWalletTransactions(userId: string): Promise<any[]> {
  const response = await authFetch(`/api/wallet/transactions/${userId}`);
  return parseJsonResponse(response);
}

export async function fetchNotifications(): Promise<any[]> {
  const response = await authFetch('/api/notifications/');
  return parseJsonResponse(response);
}

export async function adjustUserWallet(userId: string, amount: number, type: string, reason: string): Promise<any> {
  const response = await authFetch(`/api/users/${userId}/wallet/adjust`, {
    method: 'POST',
    body: JSON.stringify({ amount, type, reason }),
  });
  return parseJsonResponse(response);
}

export async function fetchSellers(): Promise<any[]> {
  const response = await authFetch('/api/sellers/');
  return parseJsonResponse(response);
}

export async function updateOrderStatus(orderId: string, status: string): Promise<any> {
  const response = await authFetch(`/api/orders/${orderId}/status?status=${encodeURIComponent(status)}`, {
    method: 'PUT',
  });
  return parseJsonResponse(response);
}

export async function fetchAuthMe(): Promise<any> {
  const response = await authFetch('/api/auth/me');
  return parseJsonResponse(response);
}

export async function fetchMessages(userId?: string): Promise<any[]> {
  const url = userId ? `/api/messages/?user_id=${userId}` : '/api/messages/';
  const response = await authFetch(url);
  return parseJsonResponse(response);
}

export async function createMessage(msg: { receiver_id: string, order_id?: string, subject?: string, content: string }, userId: string): Promise<any> {
  const response = await authFetch(`/api/messages/?user_id=${userId}`, {
    method: 'POST',
    body: JSON.stringify(msg),
  });
  return parseJsonResponse(response);
}

export async function fetchReviews(productId?: string, sellerId?: string): Promise<any[]> {
  let url = '/api/reviews/';
  if (productId) url += `?product_id=${productId}`;
  else if (sellerId) url += `?seller_id=${sellerId}`;
  const response = await fetch(buildUrl(url));
  return parseJsonResponse(response);
}

export async function fetchSellerDetails(sellerId: string): Promise<any> {
  const response = await fetch(buildUrl(`/api/sellers/${sellerId}`));
  return parseJsonResponse(response);
}

export async function fetchSellerProducts(sellerId: string): Promise<Product[]> {
  const response = await fetch(buildUrl(`/api/products/?seller_id=${sellerId}`));
  return parseJsonResponse(response);
}

export async function fetchProductStats(productId: string): Promise<any> {
  const response = await fetch(buildUrl(`/api/products/${productId}/stats`));
  return parseJsonResponse(response);
}


export async function fetchSellerFollowers(sellerId: string): Promise<any> {
  const response = await fetch(buildUrl(`/api/sellers/${sellerId}/followers`));
  return parseJsonResponse(response);
}

export async function followSeller(sellerId: string, userId: string): Promise<any> {
  const response = await fetch(buildUrl(`/api/sellers/${sellerId}/follow?user_id=${userId}`), { method: 'POST' });
  return parseJsonResponse(response);
}

export async function unfollowSeller(sellerId: string, userId: string): Promise<any> {
  const response = await fetch(buildUrl(`/api/sellers/${sellerId}/follow?user_id=${userId}`), { method: 'DELETE' });
  return parseJsonResponse(response);
}

export async function fetchSellerReviews(sellerId: string): Promise<any[]> {
  const response = await fetch(buildUrl(`/api/reviews/?seller_id=${sellerId}`));
  return parseJsonResponse(response);
}

export async function topUpWallet(userId: string, amount: number): Promise<any> {
  const response = await fetch(buildUrl('/api/wallet/topup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, amount }),
  });
  return parseJsonResponse(response);
}
