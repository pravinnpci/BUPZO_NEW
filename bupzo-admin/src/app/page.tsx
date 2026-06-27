"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mock Data
const initialUsers = [
  { id: "USR-10293", phone: "+919876543210", email: "ravi@gmail.com", wallet: 450, tier: "Premium", status: "Active", risk: "Low" },
  { id: "USR-10294", phone: "+918876543210", email: "anitha@gmail.com", wallet: 50, tier: "Normal", status: "Active", risk: "Low" },
  { id: "USR-10295", phone: "+917876543210", email: "karthik@gmail.com", wallet: 1200, tier: "Premium", status: "Active", risk: "Medium" },
  { id: "USR-10296", phone: "+916876543210", email: "subha@gmail.com", wallet: 0, tier: "Normal", status: "Suspended", risk: "High" }
];

const initialSellers = [
  { id: "SEL-1029", businessName: "Nagore Halwa Palace", owner: "Mohamed R.", status: "Pending KYC", commission: 8, date: "2026-06-25", rating: 4.8 },
  { id: "SEL-8402", businessName: "ToyKingdom Pvt Ltd", owner: "Subash C.", status: "Pending KYC", commission: 10, date: "2026-06-26", rating: 4.2 },
  { id: "SEL-5541", businessName: "Siva Ceramics & Crafts", owner: "Sivakumar P.", status: "Approved", commission: 6, date: "2026-05-12", rating: 4.9 },
  { id: "SEL-3392", businessName: "Alpha Electronics", owner: "Arun K.", status: "Approved", commission: 9, date: "2026-06-01", rating: 3.9 }
];

const initialPayouts = [
  { id: "PAY-9921", sellerId: "SEL-5541", amount: 4250.00, balance: 12400.50, date: "2026-06-26 14:30", status: "Pending" },
  { id: "PAY-8832", sellerId: "SEL-3392", amount: 890.00, balance: 950.00, date: "2026-06-26 11:15", status: "Pending" }
];

const initialDisputes = [
  { id: "DISP-10482", customer: "Meera S.", seller: "Nagore Halwa Palace", amount: 2499, risk: 82, status: "Under Review", desc: "Mismatched shipping address + high quantity order of premium Halwa." },
  { id: "DISP-10480", customer: "Anitha P.", seller: "Siva Ceramics & Crafts", amount: 899, risk: 15, status: "Resolved", desc: "Minor crack in ceramic base, refund completed to wallet." },
  { id: "DISP-10485", customer: "Ravi K.", seller: "Alpha Electronics", amount: 5120, risk: 65, status: "Under Review", desc: "Third transaction failure follow-up." }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isAdminLoggedIn');
      if (!loggedIn) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }

      const savedTheme = localStorage.getItem('adminDarkMode') === 'true';
      setDarkMode(savedTheme);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminDarkMode', darkMode.toString());
    }
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fff8f4] dark:bg-[#0c0b11] flex items-center justify-center font-sans text-xs font-bold text-[#A6808C] dark:text-[#ccc6dc]">
        Verifying Security Authority...
      </div>
    );
  }
  
  // Data states
  const [users, setUsers] = useState(initialUsers);
  const [sellers, setSellers] = useState(initialSellers);
  const [payouts, setPayouts] = useState(initialPayouts);
  const [disputes, setDisputes] = useState(initialDisputes);
  
  // Interactive adjustment state
  const [adjustId, setAdjustId] = useState('');
  const [adjustType, setAdjustType] = useState('Credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [auditLogs, setAuditLogs] = useState([
    { time: "08:30:12", user: "Admin (Sys)", action: "System Health Telemetry Active", details: "All APIs operational" },
    { time: "08:15:00", user: "Admin (Sys)", action: "Commission split verified", details: "Auto-split active on PhonePe aggregator" }
  ]);

  // Live Telemetry simulation
  const [telemetryLogs, setTelemetryLogs] = useState([
    { time: "08:42:51", type: "DB", msg: "PostgreSQL connected on port 5435. Current pool usage: 2/15." },
    { time: "08:42:53", type: "REDIS", msg: "Upstash Redis cache ping: 8ms. Rate limiter sliding windows synchronized." },
    { time: "08:43:01", type: "API", msg: "FastAPI request successfully resolved: GET /api/users/ (200 OK - 12ms)" }
  ]);

  // WhatsApp Marketing campaign state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignTemplate, setCampaignTemplate] = useState('BUPZO Welcome Offer');
  const [campaignProgress, setCampaignProgress] = useState(0);
  const [isBlasting, setIsBlasting] = useState(false);

  useEffect(() => {
    // Poll telemetry logs every 5 seconds to simulate real-time updates
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const logs = [
        { time: timestamp, type: "API", msg: "GET /api/products/ resolved (200 OK - 18ms)" },
        { time: timestamp, type: "DB", msg: "MinIO bucket 'bupzo-assets' check: connection stable (0.01% quota)" },
        { time: timestamp, type: "SYS", msg: "Active user websocket connections: 1,429 sessions online" },
        { time: timestamp, type: "LOGISTICS", msg: "Shiprocket API check: 42ms. Delhivery API check: 112ms." }
      ];
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setTelemetryLogs(prev => [randomLog, ...prev.slice(0, 8)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWalletAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustId || !adjustAmount) {
      alert("Please fill in Target ID and Amount.");
      return;
    }
    
    const amt = parseFloat(adjustAmount);
    const userIndex = users.findIndex(u => u.id === adjustId);
    
    if (userIndex !== -1) {
      const updated = [...users];
      const change = adjustType === 'Credit' ? amt : -amt;
      updated[userIndex].wallet += change;
      setUsers(updated);
      
      const newLog = {
        time: new Date().toLocaleTimeString(),
        user: "Super Admin",
        action: `Wallet ${adjustType}`,
        details: `${adjustType}ed ${adjustId} with ₹${amt}. Reason: ${adjustReason || 'Manual Overwrite'}`
      };
      setAuditLogs(prev => [newLog, ...prev]);
      alert(`Wallet of ${adjustId} successfully updated by ₹${change}.`);
    } else {
      const newLog = {
        time: new Date().toLocaleTimeString(),
        user: "Super Admin",
        action: `Adjustment Failed`,
        details: `Target ${adjustId} not found in user directory.`
      };
      setAuditLogs(prev => [newLog, ...prev]);
      alert(`User ID ${adjustId} not found in directory. Action logged.`);
    }

    setAdjustId('');
    setAdjustAmount('');
    setAdjustReason('');
  };

  const handleApproveKYC = (sellerId: string) => {
    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: 'Approved' } : s));
    const newLog = {
      time: new Date().toLocaleTimeString(),
      user: "Super Admin",
      action: "KYC Approved",
      details: `Approved seller profile for ${sellerId}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handlePayout = (payoutId: string) => {
    setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'Approved' } : p));
    const payout = payouts.find(p => p.id === payoutId);
    const newLog = {
      time: new Date().toLocaleTimeString(),
      user: "Super Admin",
      action: "Payout Disbursed",
      details: `Disbursed ₹${payout?.amount} to seller ${payout?.sellerId} via Connected Wallet Router`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const startWhatsAppBlast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle) {
      alert("Please enter a campaign title.");
      return;
    }
    setIsBlasting(true);
    setCampaignProgress(0);
    
    const interval = setInterval(() => {
      setCampaignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBlasting(false);
          alert("WhatsApp Campaign blasted successfully to all active sellers & users!");
          
          const newLog = {
            time: new Date().toLocaleTimeString(),
            user: "MarketingAgent",
            action: "WhatsApp Blast Complete",
            details: `Campaign: ${campaignTitle} sent using Template: ${campaignTemplate}`
          };
          setAuditLogs(logs => [newLog, ...logs]);
          setCampaignTitle('');
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className={`${darkMode ? 'dark bg-[#0c0b11]' : 'bg-[#fff8f4]'} min-h-screen text-[#1e1b19] dark:text-zinc-100 font-sans transition-colors duration-300 flex overflow-hidden`}>
      
      {/* Sidebar Navigation */}
      <aside className="w-[280px] bg-white dark:bg-[#15131b] border-r border-[#e8e1dd] dark:border-[#2f2b3b] flex flex-col p-6 z-50 h-screen transition-colors duration-300">
        <div className="mb-8 px-4 flex items-center gap-3">
          <img src="/Bupzo-logo.png" alt="BUPZO Logo" className="w-10 h-10 object-contain rounded" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary dark:text-[#ccc6dc] font-heading">BUPZO</h1>
            <p className="text-[10px] text-[#706677] dark:text-[#c9c5cc] uppercase tracking-wider font-semibold">Phoenix Pro Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-semibold ${activeTab === 'dashboard' ? 'border-[#3f3b4c] dark:border-[#ccc6dc] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('users')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-semibold ${activeTab === 'users' ? 'border-[#3f3b4c] dark:border-[#ccc6dc] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            User Directory
          </button>

          <button 
            onClick={() => setActiveTab('kyc')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-semibold ${activeTab === 'kyc' ? 'border-[#3f3b4c] dark:border-[#ccc6dc] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            Seller KYC
          </button>

          <button 
            onClick={() => setActiveTab('financials')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-semibold ${activeTab === 'financials' ? 'border-[#3f3b4c] dark:border-[#ccc6dc] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            Wallet & Audits
          </button>

          <button 
            onClick={() => setActiveTab('logistics')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-semibold ${activeTab === 'logistics' ? 'border-[#3f3b4c] dark:border-[#ccc6dc] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            Logistics API
          </button>

          <button 
            onClick={() => setActiveTab('disputes')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-semibold ${activeTab === 'disputes' ? 'border-[#3f3b4c] dark:border-[#ccc6dc] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            AI Fraud Center
          </button>

          <button 
            onClick={() => setActiveTab('whatsapp')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-semibold ${activeTab === 'whatsapp' ? 'border-[#3f3b4c] dark:border-[#ccc6dc] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            Marketing Blaster
          </button>

          <button 
            onClick={() => setActiveTab('health')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-semibold ${activeTab === 'health' ? 'border-[#3f3b4c] dark:border-[#ccc6dc] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            System Telemetry
          </button>
        </nav>

        <div className="pt-4 border-t border-[#e8e1dd] dark:border-[#2f2b3b] mt-auto space-y-1">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg font-semibold"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('isAdminLoggedIn');
                router.push('/login');
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-bold transition-all"
          >
            🔒 Logout Console
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#e8e1dd] dark:border-[#2f2b3b] bg-white/80 dark:bg-[#15131b]/80 backdrop-blur-xl flex items-center justify-between px-8 transition-colors duration-300">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#3f3b4c] dark:text-[#ccc6dc] font-heading">Phoenix Telemetry</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold">Admin Console</p>
              <p className="text-[10px] text-[#32D74B] font-mono flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 bg-[#32D74B] rounded-full animate-ping"></span> Live Status
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable Panel Area */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
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
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">ZAR (R) Volume</span>
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
                        <line x1="50" y1="40" x2="560" y2="40" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
                        <line x1="50" y1="90" x2="560" y2="90" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
                        <line x1="50" y1="140" x2="560" y2="140" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
                        <line x1="50" y1="190" x2="560" y2="190" stroke="#e8e1dd" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
                        
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
                  <table className="w-full text-left text-xs font-sans">
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
                        <td className="py-3 font-mono">R598.00</td>
                        <td className="py-3"><span className="bg-yellow-100/10 text-yellow-500 font-bold px-2 py-0.5 rounded text-[10px]">Pending</span></td>
                      </tr>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                        <td className="py-3 font-mono font-bold">BUP-99280</td>
                        <td className="py-3">Meera S.</td>
                        <td className="py-3 font-mono">Shiprocket SLA</td>
                        <td className="py-3">Stitch Money</td>
                        <td className="py-3 font-mono">R399.00</td>
                        <td className="py-3"><span className="bg-blue-100/10 text-blue-500 font-bold px-2 py-0.5 rounded text-[10px]">Processing</span></td>
                      </tr>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                        <td className="py-3 font-mono font-bold">BUP-99275</td>
                        <td className="py-3">Anitha P.</td>
                        <td className="py-3 font-mono">NimbusPost SLA</td>
                        <td className="py-3">Stripe Wallet</td>
                        <td className="py-3 font-mono">R799.00</td>
                        <td className="py-3"><span className="bg-indigo-100/10 text-indigo-500 font-bold px-2 py-0.5 rounded text-[10px]">Dispatched</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-mono font-bold">BUP-99270</td>
                        <td className="py-3">Karthik G.</td>
                        <td className="py-3 font-mono">Delhivery SLA</td>
                        <td className="py-3">Razorpay</td>
                        <td className="py-3 font-mono">R1,299.00</td>
                        <td className="py-3"><span className="bg-green-100/10 text-green-500 font-bold px-2 py-0.5 rounded text-[10px]">Delivered</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">Platform User Directory</h1>
                <p className="text-sm text-zinc-500 mt-1">Audit active profiles, wallet balances, and risk scores.</p>
              </div>

              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400">
                      <th className="py-2">User ID</th>
                      <th className="py-2">Phone</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Wallet</th>
                      <th className="py-2">Tier</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-3 font-mono">{u.id}</td>
                        <td className="py-3">{u.phone}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3 font-mono font-bold">₹{u.wallet}</td>
                        <td className="py-3">{u.tier}</td>
                        <td className="py-3">{u.status}</td>
                        <td className="py-3"><span className={`px-2 py-0.5 rounded font-bold ${u.risk === 'Low' ? 'bg-green-100 text-green-700' : u.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{u.risk}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SELLER KYC */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">KYC Verification Queue</h1>
                <p className="text-sm text-zinc-500 mt-1">Review business credentials, licenses, and approve vendors.</p>
              </div>

              <div className="space-y-4">
                {sellers.filter(s => s.status === 'Pending KYC').map(s => (
                  <div key={s.id} className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-sm">{s.businessName}</h4>
                      <p className="text-zinc-500 mt-1">Owner: {s.owner} | Applied: {s.date}</p>
                    </div>
                    <button 
                      onClick={() => handleApproveKYC(s.id)}
                      className="bg-charcoal text-white px-3 py-1.5 rounded hover:bg-opacity-90 font-bold"
                    >
                      Approve Merchant
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WALLLETS & AUDITS */}
          {activeTab === 'financials' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Manual Wallet Adjustment Override</h3>
                  <form onSubmit={handleWalletAdjustment} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 font-bold uppercase mb-1">Target Account ID (User or Seller)</label>
                      <input 
                        type="text" 
                        value={adjustId} 
                        onChange={(e) => setAdjustId(e.target.value)} 
                        placeholder="USR-10293" 
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none font-mono" 
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-zinc-400 font-bold uppercase mb-1">Type</label>
                        <select 
                          value={adjustType} 
                          onChange={(e) => setAdjustType(e.target.value)} 
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none"
                        >
                          <option>Credit</option>
                          <option>Debit</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-zinc-400 font-bold uppercase mb-1">Amount (INR)</label>
                        <input 
                          type="number" 
                          value={adjustAmount} 
                          onChange={(e) => setAdjustAmount(e.target.value)} 
                          placeholder="250" 
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none font-mono" 
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-charcoal text-white py-2 rounded-lg font-bold">Apply Override</button>
                  </form>
                </div>
              </div>

              {/* Payouts queue */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Pending Seller Payouts</h3>
                  <div className="space-y-4">
                    {payouts.filter(p => p.status === 'Pending').map(p => (
                      <div key={p.id} className="border-b pb-3 text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{p.id}</span>
                          <span>₹{p.amount}</span>
                        </div>
                        <p className="text-zinc-500 text-[10px]">Seller: {p.sellerId}</p>
                        <button 
                          onClick={() => handlePayout(p.id)}
                          className="bg-charcoal text-white px-2 py-1 rounded text-[10px] font-bold"
                        >
                          Release Funds
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LOGISTICS API */}
          {activeTab === 'logistics' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">Smart Carrier Routing Engine</h1>
                <p className="text-sm text-zinc-500 mt-1">Multi-routing comparison logic based on pincode efficiency metrics.</p>
              </div>

              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] space-y-4 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">Shiprocket Hub</span>
                  <span className="text-green-500 font-bold">98.4% uptime</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">Delhivery API</span>
                  <span className="text-green-500 font-bold">96.1% uptime</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">NimbusPost Hub</span>
                  <span className="text-green-500 font-bold">99.1% uptime</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AI FRAUD CENTER */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">AI Dispute &amp; Anomaly Center</h1>
                <p className="text-sm text-zinc-500 mt-1">Real-time risk scoring and payment holding portal.</p>
              </div>

              <div className="space-y-4">
                {disputes.map(d => (
                  <div key={d.id} className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{d.id}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${d.risk > 70 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>Risk: {d.risk}%</span>
                    </div>
                    <p className="text-zinc-500">{d.desc}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">Customer: {d.customer} | Seller: {d.seller}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: MARKETING BLASTER */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">WhatsApp Marketing Blaster</h1>
                <p className="text-sm text-zinc-500 mt-1">Broadcast Meta-approved message templates to select customer cohorts.</p>
              </div>

              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] max-w-xl">
                <form onSubmit={startWhatsAppBlast} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-bold uppercase mb-1">Campaign Title</label>
                    <input 
                      type="text" 
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      placeholder="e.g. Nagore Halwa Special Offer" 
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold uppercase mb-1">Template Select (Approved by Meta)</label>
                    <select 
                      value={campaignTemplate}
                      onChange={(e) => setCampaignTemplate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-lg px-3 py-2 outline-none"
                    >
                      <option>BUPZO Welcome Offer</option>
                      <option>Festival Discount Alert</option>
                      <option>Seller Restock Notification</option>
                    </select>
                  </div>

                  {isBlasting && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-400">
                        <span>Blasting templates...</span>
                        <span>{campaignProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${campaignProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full bg-charcoal text-white py-2 rounded-lg font-bold disabled:opacity-50" disabled={isBlasting}>Send Broadcast</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: SYSTEM TELEMETRY */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading">System Health &amp; Telemetry</h1>
                <p className="text-sm text-zinc-500 mt-1">Track asyncpg db connection pools, Redis latency, and API Gateway status.</p>
              </div>

              {/* Logger */}
              <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b] space-y-4">
                <h3 className="font-bold text-sm">Live API Gateway logs (FastAPI backend on port 8004)</h3>
                <div className="bg-zinc-950 text-green-400 p-4 rounded-lg font-mono text-xs space-y-2 h-64 overflow-y-auto scrollbar-hide">
                  {telemetryLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-zinc-500">[{log.time}]</span>
                      <span className="font-bold text-[#007AFF]">{log.type}</span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
