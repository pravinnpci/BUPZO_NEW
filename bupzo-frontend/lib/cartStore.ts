import { create } from 'zustand';
import { Product } from './api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  wishlist: any[];
  setCart: (cart: CartItem[]) => void;
  setWishlist: (wishlist: any[]) => void;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, amount: number) => void;
  clearCart: () => void;
}

const readStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const useCartStore = create<CartState>((set) => ({
  cart: readStorage('bupzo_cart', []),
  wishlist: [],
  setCart: (cart) => {
    if (typeof window !== 'undefined') localStorage.setItem('bupzo_cart', JSON.stringify(cart));
    set({ cart });
  },
  setWishlist: (wishlist) => set({ wishlist }),
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.product.id === product.id);
    let newCart;
    if (existing) {
      newCart = state.cart.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...state.cart, { product, quantity: 1 }];
    }
    if (typeof window !== 'undefined') localStorage.setItem('bupzo_cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  updateQuantity: (productId, amount) => set((state) => {
    const newCart = state.cart.map(item => {
      if (item.product.id === productId) {
        const nextQty = item.quantity + amount;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    if (typeof window !== 'undefined') localStorage.setItem('bupzo_cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  clearCart: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('bupzo_cart');
    set({ cart: [] });
  }
}));
