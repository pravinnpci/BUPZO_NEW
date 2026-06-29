import React from 'react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Global Command Center</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time telemetry and network oversight for BUPZO operations.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-36">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Orders</span>
          <div>
            <span className="text-3xl font-extrabold font-heading">1,42,837</span>
            <p className="text-[10px] text-[#32D74B] font-semibold mt-1">↑ 12% today</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-36">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">GMV Today</span>
          <div>
            <span className="text-3xl font-extrabold font-heading">₹38.4L</span>
            <p className="text-[10px] text-[#32D74B] font-semibold mt-1">↑ 8.2% vs yesterday</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-36">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Sellers</span>
          <div>
            <span className="text-3xl font-extrabold font-heading">4,219</span>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">23 pending KYC</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between h-36">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Fraud Flags</span>
          <div>
            <span className="text-3xl font-extrabold font-heading text-red-500">12</span>
            <p className="text-[10px] text-red-500 font-semibold mt-1">↑ 3 new alerts</p>
          </div>
        </div>
      </div>

      {/* GMV Graph & Tabular Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Graph Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal dark:text-[#f3f4f6]">GMV Sales Trend (Past 7 Days)</h3>
                <p className="text-[10px] text-zinc-400">Total gross merchandise value synchronized across gateways.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#A6808C] rounded-full"></span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono">GMV Volume</span>
              </div>
            </div>

            {/* Area Graph using SVG */}
            <div className="relative h-64 w-full">
              <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A6808C" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#A6808C" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid lines */}
                <line x1="50" y1="40" x2="560" y2="40" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-850" />
                <line x1="50" y1="90" x2="560" y2="90" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-850" />
                <line x1="50" y1="140" x2="560" y2="140" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-850" />
                <line x1="50" y1="190" x2="560" y2="190" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-850" />
                
                {/* Axis Labels */}
                <text x="20" y="45" className="text-[10px] fill-zinc-400 font-mono">50K</text>
                <text x="20" y="95" className="text-[10px] fill-zinc-400 font-mono">30K</text>
                <text x="20" y="145" className="text-[10px] fill-zinc-400 font-mono">15K</text>
                <text x="20" y="195" className="text-[10px] fill-zinc-400 font-mono">0</text>
                
                {/* Area Path */}
                <path d="M 50,190 Q 120,130 190,110 T 330,60 T 470,120 T 560,40 L 560,190 Z" fill="url(#chartGradient)" />
                
                {/* Line Path */}
                <path d="M 50,190 Q 120,130 190,110 T 330,60 T 470,120 T 560,40" fill="none" stroke="#A6808C" strokeWidth="3" />
                
                {/* Data Points */}
                <circle cx="50" cy="190" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="130" cy="142" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="212" cy="105" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="330" cy="60" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="438" cy="100" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="560" cy="40" r="4" fill="#565264" stroke="#ffffff" strokeWidth="1.5" />
                
                {/* Day labels */}
                <text x="45" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Mon</text>
                <text x="125" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Tue</text>
                <text x="207" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Wed</text>
                <text x="325" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Thu</text>
                <text x="433" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Fri</text>
                <text x="548" y="215" className="text-[10px] fill-zinc-400 font-semibold font-heading">Sat</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Logistics SLA Distribution Tracker */}
        <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-charcoal dark:text-[#f3f4f6]">Logistics SLA Breakdown</h3>
            <p className="text-[10px] text-zinc-400 mb-6">Delivery times aggregated across carriers.</p>
            
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Delhivery Express (1-3 Days)</span>
                  <span className="font-mono">82%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-charcoal dark:bg-almond-silk" style={{ width: '82%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Shiprocket Smart-Route (2-4 Days)</span>
                  <span className="font-mono">91%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#A6808C]" style={{ width: '91%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>NimbusPost Air Courier (1-2 Days)</span>
                  <span className="font-mono">68%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#CCB7AE]" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono">
            Routing Optimization: Auto-balancing active
          </div>
        </div>

      </div>

      {/* Tabular Orders Registry */}
      <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal dark:text-[#f3f4f6]">Recent Transactions Registry</h3>
            <p className="text-[10px] text-zinc-400">Ledger audit of orders synced from checkout aggregators.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[600px]">
            <thead>
              <tr className="border-b border-[#e8e1dd] dark:border-zinc-800 text-zinc-400 uppercase font-bold text-[9px] tracking-widest">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Courier SLA</th>
                <th className="pb-3">Gateway</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                <td className="py-3 font-mono font-bold">BUP-99283</td>
                <td className="py-3">Ravi K.</td>
                <td className="py-3 font-mono">Delhivery SLA</td>
                <td className="py-3">Stitch Money</td>
                <td className="py-3 font-mono">₹598.00</td>
                <td className="py-3"><span className="bg-yellow-100/10 text-yellow-500 font-bold px-2 py-0.5 rounded text-[10px]">Pending</span></td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                <td className="py-3 font-mono font-bold">BUP-99280</td>
                <td className="py-3">Meera S.</td>
                <td className="py-3 font-mono">Shiprocket SLA</td>
                <td className="py-3">Stitch Money</td>
                <td className="py-3 font-mono">₹399.00</td>
                <td className="py-3"><span className="bg-blue-100/10 text-blue-500 font-bold px-2 py-0.5 rounded text-[10px]">Processing</span></td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                <td className="py-3 font-mono font-bold">BUP-99275</td>
                <td className="py-3">Anitha P.</td>
                <td className="py-3 font-mono">NimbusPost SLA</td>
                <td className="py-3">Stripe Wallet</td>
                <td className="py-3 font-mono">₹799.00</td>
                <td className="py-3"><span className="bg-indigo-100/10 text-indigo-500 font-bold px-2 py-0.5 rounded text-[10px]">Dispatched</span></td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold">BUP-99270</td>
                <td className="py-3">Karthik G.</td>
                <td className="py-3 font-mono">Delhivery SLA</td>
                <td className="py-3">Razorpay</td>
                <td className="py-3 font-mono">₹1,299.00</td>
                <td className="py-3"><span className="bg-green-100/10 text-green-500 font-bold px-2 py-0.5 rounded text-[10px]">Delivered</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
