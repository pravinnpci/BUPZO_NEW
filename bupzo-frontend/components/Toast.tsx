'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          let bgStyle = "bg-[#0055D4] text-white border-blue-400/40";
          let icon = "🎉";
          if (t.type === 'success') {
            bgStyle = "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-300/40 shadow-emerald-950/20";
            icon = "✨";
          } else if (t.type === 'error') {
            bgStyle = "bg-gradient-to-r from-red-600 to-rose-700 text-white border-rose-300/40 shadow-rose-950/20";
            icon = "⚠️";
          } else if (t.type === 'warning') {
            bgStyle = "bg-gradient-to-r from-amber-600 to-orange-700 text-white border-amber-300/40 shadow-amber-950/20";
            icon = "🔔";
          }
          return (
            <div
              key={t.id}
              className={`${bgStyle} border-2 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 font-sans font-bold text-xs pointer-events-auto transition-all animate-bounce`}
            >
              <span className="text-base shrink-0">{icon}</span>
              <span className="flex-1 leading-snug">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const showCustomToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
  if (typeof window !== 'undefined') {
    const existing = document.getElementById('bupzo-global-toast');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'bupzo-global-toast';
    banner.className = 'fixed top-5 right-5 z-[99999] bg-[#0055D4] text-white px-6 py-3.5 rounded-xl shadow-2xl font-bold text-xs border-2 border-white animate-bounce flex items-center gap-3 transition-all';
    banner.innerHTML = `<span style="font-size:16px;">${type === 'error' ? '⚠️' : '✨'}</span> <span>${msg}</span>`;
    document.body.appendChild(banner);
    setTimeout(() => {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    }, 3500);
  }
};
