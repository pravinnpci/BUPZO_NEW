import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity?: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  trustFund: number;
  addToCart: (item: CartItem) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,
  trustFund: 0,
  addToCart: (item) => set((state) => ({ items: [...state.items, { ...item, quantity: item.quantity || 1 }], total: state.total + item.price })),
}));