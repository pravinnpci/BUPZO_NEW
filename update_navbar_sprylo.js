const fs = require('fs');
const file = 'bupzo-frontend/components/Navbar.tsx';

const newNavbar = `import React from 'react';
import { useUser } from '@/lib/authStore';

type NavbarProps = {
  onTabChange: (tab: string) => void;
  onAuthClick: () => void;
  onCartClick: () => void;
  cartCount: number;
  wishlistCount: number;
  unreadMsgs: number;
};

export function Navbar({ onTabChange, onAuthClick, onCartClick, cartCount, wishlistCount, unreadMsgs }: NavbarProps) {
  const { user, clearUser } = useUser();

  return (
    <div className="w-full bg-white shadow-sm font-sans sticky top-0 z-50">
      {/* Topbar (Sprylo Style) */}
      <div className="bg-[#232f3e] text-gray-300 py-1.5 px-4 text-xs flex justify-between items-center hidden md:flex">
        <div className="flex gap-4">
          <span>Welcome to Bupzo Marketplace</span>
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span> +91 98765 43210</span>
        </div>
        <div className="flex gap-4 items-center">
          <select className="bg-transparent border-none outline-none text-gray-300 cursor-pointer">
            <option className="text-black">English</option>
            <option className="text-black">Tamil</option>
          </select>
          <select className="bg-transparent border-none outline-none text-gray-300 cursor-pointer">
            <option className="text-black">INR (₹)</option>
            <option className="text-black">USD ($)</option>
          </select>
          {!user && (
            <button onClick={onAuthClick} className="hover:text-white transition">Login / Register</button>
          )}
          {user && (
            <div className="flex gap-3">
              <span className="text-white font-medium">Hi, {user.name?.split(' ')[0] || 'User'}</span>
              <button onClick={() => { clearUser(); window.location.reload(); }} className="hover:text-red-400 transition">Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center cursor-pointer" onClick={() => onTabChange('home')}>
           <span className="text-3xl font-extrabold tracking-tighter text-[#e52e06]">BUPZO</span>
        </div>

        {/* Search Bar (Sprylo Style) */}
        <div className="flex-1 max-w-2xl hidden lg:flex border-2 border-[#e52e06] rounded-full overflow-hidden items-center h-12 relative">
           <select className="h-full px-4 border-r border-gray-200 bg-gray-50 text-sm outline-none cursor-pointer text-gray-600 font-medium">
             <option>All Categories</option>
             <option>Electronics</option>
             <option>Fashion</option>
           </select>
           <input type="text" placeholder="Search products..." className="flex-1 h-full px-4 outline-none text-sm" />
           <button className="h-full px-6 bg-[#e52e06] text-white hover:bg-[#cc2805] transition flex items-center justify-center">
             <span className="material-symbols-outlined text-lg">search</span>
           </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-6">
           <button onClick={() => user ? onTabChange('settings') : onAuthClick()} className="flex flex-col items-center group relative">
              <div className="relative">
                 <span className="material-symbols-outlined text-3xl text-gray-700 group-hover:text-[#e52e06] transition">person</span>
                 {user && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>}
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">Account</span>
           </button>
           
           <button onClick={() => user ? onTabChange('wishlist') : onAuthClick()} className="flex flex-col items-center group relative">
              <div className="relative">
                <span className="material-symbols-outlined text-3xl text-gray-700 group-hover:text-[#e52e06] transition">favorite</span>
                {wishlistCount > 0 && (
                   <span className="absolute -top-1.5 -right-2 bg-[#e52e06] text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] text-center">{wishlistCount}</span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">Wishlist</span>
           </button>

           <button onClick={onCartClick} className="flex flex-col items-center group relative">
              <div className="relative">
                <span className="material-symbols-outlined text-3xl text-gray-700 group-hover:text-[#e52e06] transition">shopping_cart</span>
                {cartCount > 0 && (
                   <span className="absolute -top-1.5 -right-2 bg-[#e52e06] text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] text-center">{cartCount}</span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">My Cart</span>
           </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
           <div className="flex items-center gap-8 h-full">
              {/* Category Dropdown Toggle */}
              <button onClick={() => onTabChange('categories')} className="bg-[#e52e06] text-white h-full px-6 flex items-center gap-2 font-bold uppercase tracking-wider text-sm hover:bg-[#cc2805] transition">
                 <span className="material-symbols-outlined">menu</span>
                 Browse Categories
              </button>

              <nav className="hidden lg:flex items-center gap-6 font-bold text-[13px] uppercase text-gray-700 tracking-wide">
                 <button onClick={() => onTabChange('home')} className="hover:text-[#e52e06] transition">Home</button>
                 <button onClick={() => onTabChange('categories')} className="hover:text-[#e52e06] transition">Shop</button>
                 {user && <button onClick={() => onTabChange('orders')} className="hover:text-[#e52e06] transition">Orders</button>}
                 {user && <button onClick={() => onTabChange('wallet')} className="hover:text-[#e52e06] transition">Wallet</button>}
                 {user && (
                    <button onClick={() => onTabChange('messages')} className="hover:text-[#e52e06] transition flex items-center gap-1 relative">
                      Messages
                      {unreadMsgs > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">{unreadMsgs}</span>}
                    </button>
                 )}
                 {!user?.is_seller && <button onClick={() => onTabChange('kyc')} className="text-[#e52e06] hover:text-red-700 transition">Become Seller</button>}
              </nav>
           </div>
           <div className="text-sm font-bold text-gray-600 hidden md:block">
              Free Shipping on Orders Over ₹999!
           </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(file, newNavbar);
console.log('Navbar updated to Sprylo theme!');
