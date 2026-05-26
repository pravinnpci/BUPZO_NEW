import { create } from 'zustand';

interface User {
  id: string;
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
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));