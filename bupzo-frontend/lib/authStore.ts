import { create } from 'zustand';

interface User {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  isPremium?: boolean;
  signupPlatform?: string;
  walletBalance?: number;
  createdAt?: string;
  isSeller?: boolean;
  isAdmin?: boolean;
  address?: string;
  pincode?: string;
  avatar_url?: string;
  is_premium?: boolean;
  signup_platform?: string;
  wallet_balance?: number;
  created_at?: string;
  is_seller?: boolean;
  is_admin?: boolean;
  seller_status?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  clearUser: () => void;
}

const readStorageJson = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
};

const normalizeUser = (user: any): User | null => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name || user.full_name || user.display_name || undefined,
    phone: user.phone,
    email: user.email || undefined,
    isPremium: user.is_premium ?? user.isPremium ?? false,
    signupPlatform: user.signup_platform || user.signupPlatform || undefined,
    walletBalance: Number(user.wallet_balance ?? user.walletBalance ?? 0),
    wallet_balance: Number(user.wallet_balance ?? user.walletBalance ?? 0),
    createdAt: user.created_at || user.createdAt || undefined,
    created_at: user.created_at || user.createdAt || undefined,
    isSeller: user.is_seller ?? user.isSeller ?? false,
    is_seller: user.is_seller ?? user.isSeller ?? false,
    isAdmin: user.is_admin ?? user.isAdmin ?? false,
    is_admin: user.is_admin ?? user.isAdmin ?? false,
    seller_status: user.seller_status || undefined,
    address: user.address,
    pincode: user.pincode,
  };
};

const storedUser = normalizeUser(readStorageJson<any>('bupzo_user'));

export const useUser = create<AuthState>((set) => ({
  user: storedUser,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('bupzo_access_token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('bupzo_refresh_token') : null,
  setUser: (user: User | null) => {
    const normalized = normalizeUser(user);
    if (typeof window !== 'undefined') {
      if (normalized) {
        localStorage.setItem('bupzo_user', JSON.stringify(normalized));
      } else {
        localStorage.removeItem('bupzo_user');
      }
    }
    set({ user: normalized });
  },
  setTokens: (accessToken: string | null, refreshToken: string | null) => {
    if (typeof window !== 'undefined') {
      if (accessToken) {
        localStorage.setItem('bupzo_access_token', accessToken);
      } else {
        localStorage.removeItem('bupzo_access_token');
      }
      if (refreshToken) {
        localStorage.setItem('bupzo_refresh_token', refreshToken);
      } else {
        localStorage.removeItem('bupzo_refresh_token');
      }
    }
    set({ accessToken, refreshToken });
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bupzo_user');
      localStorage.removeItem('bupzo_access_token');
      localStorage.removeItem('bupzo_refresh_token');
      localStorage.removeItem('bupzo_cart');
      localStorage.removeItem('bupzo_wishlist');
    }
    set({ user: null, accessToken: null, refreshToken: null });
    // Attempt to clear cart store if loaded, using optional chaining or dynamic import to avoid circular dep
    try {
      const { useCartStore } = require('./cartStore');
      useCartStore.getState().clearCart();
    } catch(e) {}
  },
}));

// Helper function to get token from localStorage
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bupzo_access_token');
  }
  return null;
};

// Helper function to set token in localStorage
export const setAccessToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bupzo_access_token', token);
  }
};

// Helper function to get refresh token from localStorage
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bupzo_refresh_token');
  }
  return null;
};

// Helper function to set refresh token from localStorage
export const setRefreshToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bupzo_refresh_token', token);
  }
};

// Helper function to clear tokens from localStorage
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bupzo_access_token');
    localStorage.removeItem('bupzo_refresh_token');
  }
};
