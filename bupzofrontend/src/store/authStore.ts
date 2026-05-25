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
  requestOTP: (phoneNumber: string) => Promise<any>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<any>;
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
  requestOTP: async (phoneNumber: string) => {
    return { success: true };
  },
  verifyOTP: async (phoneNumber: string, otp: string) => {
    return { success: true };
  },
}));