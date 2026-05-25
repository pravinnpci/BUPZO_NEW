import { create } from 'zustand';

interface AuthStore {
  user: any;
  isLoggedIn: boolean;
  role: string;
  userId: string;
  walletBalance: number;
  login: (user: any) => void;
  logout: () => void;
  fetchWalletBalance: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: true,
  role: 'Customer',
  userId: '1',
  walletBalance: 1500,
  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
  fetchWalletBalance: async () => {},
}));