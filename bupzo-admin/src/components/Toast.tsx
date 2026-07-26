'use client';

import React from 'react';

export const showAdminToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
  if (typeof window !== 'undefined') {
    const existing = document.getElementById('bupzo-admin-toast');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'bupzo-admin-toast';
    banner.className = 'fixed top-5 right-5 z-[99999] bg-[#0055D4] text-white px-6 py-3.5 rounded-xl shadow-2xl font-bold text-xs border-2 border-white animate-bounce flex items-center gap-3 transition-all';
    banner.innerHTML = `<span style="font-size:16px;">${type === 'error' ? '⚠️' : '✨'}</span> <span>${msg}</span>`;
    document.body.appendChild(banner);
    setTimeout(() => {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    }, 3500);
  }
};
