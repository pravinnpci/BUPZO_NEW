const fs = require('fs');
const file = 'bupzo-frontend/components/Navbar.tsx';

const newNavbarContent = `"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@/lib/authStore";
import { useTheme } from "next-themes";
import { authFetch } from "@/lib/api";
import { ProfileSettingsModal } from "./ProfileSettingsModal";

interface NavbarProps {
  onTabChange?: (tab: string, targetId?: string) => void;
  onAuthClick?: () => void;
  onCartClick?: () => void;
  cartCount?: number;
  wishlistCount?: number;
  unreadMsgs?: number;
}

export function Navbar({ onTabChange, onAuthClick, onCartClick, cartCount = 0, wishlistCount = 0, unreadMsgs = 0 }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, clearUser } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState('Online');

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        try {
          const resp = await authFetch(\`/api/notifications/?user_id=\${user.id}\`);
          if (resp && resp.ok) setNotifications(await resp.json());
        } catch (e) {}
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return (
    <>
      <nav className="w-full bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 z-[90] relative shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-[68px] flex items-center justify-between gap-6">
          
          {/* Left: Logo & Search */}
          <div className="flex items-center gap-8 flex-1">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/Bupzo-logo.png" alt="Bupzo" className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm" />
              <span className="font-extrabold text-blue-600 tracking-wider text-lg hidden sm:block">BUPZO</span>
            </Link>

            <div className="relative w-full max-w-xl hidden md:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search products, brands, or categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            )}

            <button onClick={() => onTabChange && onTabChange('wishlist')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white">{wishlistCount}</span>}
            </button>

            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {notifications.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white">{notifications.filter(n => !n.read).length}</span>}
            </button>

            <button onClick={onCartClick} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative transition-colors pr-4 border-r border-gray-200 dark:border-zinc-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1 right-2.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white">{cartCount}</span>}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 bg-gray-50/80 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-1.5 px-2.5 rounded-full border border-gray-200 dark:border-zinc-700 transition-colors"
                >
                  <div className="relative">
                    <img src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user.id}\`} alt="Avatar" className="w-7 h-7 rounded-full bg-white border border-gray-200" />
                    <span className={\`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full \${status === 'Online' ? 'bg-green-500' : status === 'Away' ? 'bg-orange-400' : 'bg-gray-400'}\`}></span>
                  </div>
                  <div className="flex flex-col text-left pr-2 hidden sm:flex">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">{user.name || user.phone}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tracking-tight">{user.isSeller ? 'Merchant' : 'Customer'}</span>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-[9999] overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800 mb-2">
                      <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">Set Workspace Status</p>
                      <div className="space-y-1">
                        {['Online', 'Away', 'Offline'].map(s => (
                          <button key={s} onClick={() => setStatus(s)} className="w-full text-left px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={\`w-2 h-2 rounded-full \${s === 'Online' ? 'bg-green-500' : s === 'Away' ? 'bg-orange-400' : 'bg-gray-400'}\`}></span>
                              {s}
                            </div>
                            {status === s && <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button onClick={() => { setShowDropdown(false); setShowSettingsModal(true); }} className="w-full text-left px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile Settings
                    </button>
                    
                    <button onClick={() => { setShowDropdown(false); if(onTabChange) onTabChange('orders'); }} className="w-full text-left px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      My Orders
                    </button>

                    <button onClick={() => { setShowDropdown(false); if(onTabChange) onTabChange('messages'); }} className="w-full text-left px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Messages
                    </button>

                    <div className="border-t border-gray-100 dark:border-zinc-800 mt-1 pt-1">
                      <button onClick={() => { setShowDropdown(false); clearUser(); }} className="w-full text-left px-6 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onAuthClick} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-colors">
                Sign In
              </button>
            )}

          </div>
        </div>
      </nav>

      {showSettingsModal && (
        <ProfileSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </>
  );
}
`;

fs.writeFileSync(file, newNavbarContent);
`;

fs.writeFileSync('bupzo-frontend/update_navbar.js', newNavbarContent);
