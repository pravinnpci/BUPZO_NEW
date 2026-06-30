import React from 'react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-on-surface">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-heading text-on-surface tracking-tight">Global Command Center</h2>
        <p className="text-sm text-on-surface-variant/80">Real-time telemetry and network oversight for BUPZO operations.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card: Total Orders */}
        <div className="bg-surface-container-lowest dark:bg-[#15131b] rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden group hover:border-primary/60 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-outline">Total Orders</span>
            <span className="text-3xl font-black font-heading text-on-surface mt-1">1,42,837</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-3 relative z-10">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            <span>12% today</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-container/10 rounded-full blur-xl group-hover:bg-primary-container/20 transition-all duration-300"></div>
        </div>

        {/* Card: GMV Today */}
        <div className="bg-surface-container-lowest dark:bg-[#15131b] rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden group hover:border-primary/60 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-outline">GMV Today</span>
            <span className="text-3xl font-black font-heading text-on-surface mt-1">₹38.4L</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-3 relative z-10">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            <span>8.2% vs yesterday</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-container/10 rounded-full blur-xl group-hover:bg-primary-container/20 transition-all duration-300"></div>
        </div>

        {/* Card: Active Sellers */}
        <div className="bg-surface-container-lowest dark:bg-[#15131b] rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden group hover:border-primary/60 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-outline">Active Sellers</span>
            <span className="text-3xl font-black font-heading text-on-surface mt-1">4,219</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs font-bold mt-3 relative z-10">
            <span>23 pending KYC</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-container/10 rounded-full blur-xl group-hover:bg-primary-container/20 transition-all duration-300"></div>
        </div>

        {/* Card: Fraud Flags */}
        <div className="bg-error-container/10 rounded-2xl border border-error/20 p-6 flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden group hover:border-error/40 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-error">Fraud Flags</span>
            <span className="text-3xl font-black font-heading text-error mt-1">12</span>
          </div>
          <div className="flex items-center gap-1 text-error text-xs font-extrabold mt-3 relative z-10">
            <span className="material-symbols-outlined text-[16px] fill-current">warning</span>
            <span>3 new alerts</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-error/5 rounded-full blur-xl group-hover:bg-error/10 transition-all duration-300"></div>
        </div>
      </div>

      {/* GMV Sales Trend & Logistics SLA Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GMV Sales Trend Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-[#15131b] rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-outline">GMV Sales Trend (Past 7 Days)</h3>
            <span className="material-symbols-outlined text-outline-variant text-[20px] cursor-pointer">more_horiz</span>
          </div>
          
          <div className="w-full h-48 relative mt-2">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[9px] text-outline font-mono pb-2">
              <span>50K</span>
              <span>30K</span>
              <span>15K</span>
              <span>0</span>
            </div>
            {/* Grid lines */}
            <div className="absolute left-8 right-0 top-0 bottom-8 flex flex-col justify-between">
              <div className="w-full h-[1px] bg-outline-variant/20 border-dashed border-t border-outline-variant/20"></div>
              <div className="w-full h-[1px] bg-outline-variant/20 border-dashed border-t border-outline-variant/20"></div>
              <div className="w-full h-[1px] bg-outline-variant/20 border-dashed border-t border-outline-variant/20"></div>
              <div className="w-full h-[1px] bg-outline-variant/20 border-dashed border-t border-outline-variant/20"></div>
            </div>
            {/* SVG Chart Area */}
            <svg className="absolute left-8 right-0 top-0 bottom-8 w-[calc(100%-32px)] h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
              <defs>
                <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#0052cc" stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor="#0052cc" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              {/* Area Fill */}
              <path d="M0,90 C40,90 60,60 100,50 C140,40 160,20 200,30 C240,40 260,90 300,10 L300,100 L0,100 Z" fill="url(#chartGradient)"></path>
              {/* Line */}
              <path d="M0,90 C40,90 60,60 100,50 C140,40 160,20 200,30 C240,40 260,90 300,10" fill="none" stroke="#0052cc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              {/* Data Points */}
              <circle cx="100" cy="50" fill="#ffffff" r="3" stroke="#0052cc" strokeWidth="2"></circle>
              <circle cx="200" cy="30" fill="#ffffff" r="3" stroke="#0052cc" strokeWidth="2"></circle>
              <circle cx="300" cy="10" fill="#ffffff" r="3" stroke="#0052cc" strokeWidth="2"></circle>
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[9px] text-outline font-mono pt-2 border-t border-outline-variant/20">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Logistics SLA Breakdown */}
        <div className="bg-surface-container-lowest dark:bg-[#15131b] rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 shadow-sm flex flex-col gap-6 justify-between">
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-outline mb-4">Logistics SLA Breakdown</h3>
            <div className="flex flex-col gap-4">
              {/* Progress Bar 1 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end text-xs">
                  <span className="font-semibold text-on-surface">Delhivery Express (1-3 Days)</span>
                  <span className="font-bold text-on-surface">82%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '82%' }}></div>
                </div>
              </div>
              {/* Progress Bar 2 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end text-xs">
                  <span className="font-semibold text-on-surface">Shiprocket Smart-Route (2-4 Days)</span>
                  <span className="font-bold text-on-surface">91%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '91%' }}></div>
                </div>
              </div>
              {/* Progress Bar 3 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end text-xs">
                  <span className="font-semibold text-on-surface">NimbusPost Air (1-2 Days)</span>
                  <span className="font-bold text-on-surface">68%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-outline-variant/20 text-[9px] text-zinc-400 font-mono">
            Routing Optimization: Auto-balancing active
          </div>
        </div>
      </div>

      {/* Recent Transactions Registry */}
      <div className="bg-surface-container-lowest dark:bg-[#15131b] rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-outline">Recent Transactions Registry</h3>
          <p className="text-[10px] text-zinc-400 font-sans mt-0.5">Ledger audit of orders synced from checkout aggregators.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant text-outline uppercase font-extrabold text-[9px] tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Courier SLA</th>
                <th className="pb-3">Gateway</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-outline-variant/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 font-mono font-bold text-primary">BUP-99283</td>
                <td className="py-3 font-medium">Ravi K.</td>
                <td className="py-3 font-mono text-on-surface-variant">Delhivery SLA</td>
                <td className="py-3 font-medium">Stitch Money</td>
                <td className="py-3 font-mono font-bold">₹598.00</td>
                <td className="py-3"><span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Pending</span></td>
              </tr>
              <tr className="border-b border-outline-variant/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 font-mono font-bold text-primary">BUP-99280</td>
                <td className="py-3 font-medium">Meera S.</td>
                <td className="py-3 font-mono text-on-surface-variant">Shiprocket SLA</td>
                <td className="py-3 font-medium">Stitch Money</td>
                <td className="py-3 font-mono font-bold">₹399.00</td>
                <td className="py-3"><span className="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Processing</span></td>
              </tr>
              <tr className="border-b border-outline-variant/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 font-mono font-bold text-primary">BUP-99275</td>
                <td className="py-3 font-medium">Anitha P.</td>
                <td className="py-3 font-mono text-on-surface-variant">NimbusPost SLA</td>
                <td className="py-3 font-medium">Stripe Wallet</td>
                <td className="py-3 font-mono font-bold">₹799.00</td>
                <td className="py-3"><span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Dispatched</span></td>
              </tr>
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 font-mono font-bold text-primary">BUP-99270</td>
                <td className="py-3 font-medium">Karthik G.</td>
                <td className="py-3 font-mono text-on-surface-variant">Delhivery SLA</td>
                <td className="py-3 font-medium">Razorpay</td>
                <td className="py-3 font-mono font-bold">₹1,299.00</td>
                <td className="py-3"><span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Delivered</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
