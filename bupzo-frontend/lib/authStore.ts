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
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUser = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? (() => {
    try {
      const stored = localStorage.getItem('bupzo_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })() : null,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('bupzo_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('bupzo_user');
      }
    }
    set({ user });
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bupzo_user');
    }
    set({ user: null });
  },
}));
