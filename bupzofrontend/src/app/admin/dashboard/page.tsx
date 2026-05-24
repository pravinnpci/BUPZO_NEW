"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// Phoenix UI Components
const SalesChart = () => {
  // Mock data for the line chart
  const salesData = [
    { month: "Jan", sales: 120000 },
    { month: "Feb", sales: 150000 },
    { month: "Mar", sales: 180000 },
    { month: "Apr", sales: 210000 },
    { month: "May", sales: 240000 },
    { month: "Jun", sales: 270000 },
  ];

  const maxSales = Math.max(...salesData.map(d => d.sales));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Total Sales Overview</h3>
      <div className="relative h-52">
        <svg className="w-full h-full" viewBox={`0 0 600 ${chartHeight}`}>
          {/* Grid lines */}
          <g stroke="#e5e7eb" strokeWidth="1">
            {[1, 2, 3, 4].map((line) => (
              <line key={line} x1="0" y1={chartHeight - line * 50} x2="550" y2={chartHeight - line * 50} />
            ))}
          </g>

          {/* Sales line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points={salesData.map((data, index) => {
              const x = 50 + index * 90;
              const y = chartHeight - (data.sales / maxSales) * (chartHeight - 40);
              return `${x},${y}`;
            }).join(" ")}
          />

          {/* Data points */}
          {salesData.map((data, index) => {
            const x = 50 + index * 90;
            const y = chartHeight - (data.sales / maxSales) * (chartHeight - 40);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* X-axis labels */}
          {salesData.map((data, index) => (
            <text
              key={index}
              x={50 + index * 90}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-slate-500"
            >
              {data.month}
            </text>
          ))}

          {/* Y-axis labels */}
          {[50000, 100000, 150000, 200000, 250000].map((value, index) => (
            <text
              key={index}
              x="20"
              y={chartHeight - index * 50 - 5}
              textAnchor="end"
              className="text-xs fill-slate-500"
            >
              ${value.toLocaleString()}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

const WorldMapWidget = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Regions by Revenue</h3>
      <div className="relative h-48 bg-slate-50 rounded-lg flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Simplified world map outline */}
          <path d="M50 80 Q100 60 150 80 Q200 100 250 80 Q300 60 350 80 L350 120 Q300 140 250 120 Q200 100 150 120 Q100 140 50 120 Z"
                fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>

          {/* Region markers with revenue */}
          <circle cx="100" cy="90" r="8" fill="#ef4444"/>
          <text x="100" cy="90" textAnchor="middle" className="text-xs fill-white font-bold" dy="3">$240K</text>

          <circle cx="200" cy="80" r="12" fill="#3b82f6"/>
          <text x="200" cy="80" textAnchor="middle" className="text-xs fill-white font-bold" dy="3">$420K</text>

          <circle cx="300" cy="100" r="6" fill="#10b981"/>
          <text x="300" cy="100" textAnchor="middle" className="text-xs fill-white font-bold" dy="3">$180K</text>

          {/* Region labels */}
          <text x="100" y="110" textAnchor="middle" className="text-xs fill-slate-600">North America</text>
          <text x="200" y="100" textAnchor="middle" className="text-xs fill-slate-600">Europe</text>
          <text x="300" y="120" textAnchor="middle" className="text-xs fill-slate-600">Asia</text>
        </svg>
      </div>
      <div className="mt-4 flex justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span>North America</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
          <span>Europe</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span>Asia</span>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-5 flex items-center space-x-4">
      <div className="bg-indigo-100 p-3 rounded-lg">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      </div>
    </div>
  );
};

type Banner = {
  id: string;
  title: string;
  image: string;
  active: boolean;
};

export default function AdminDashboard() {
  const [banners, setBanners] = useState<Banner[]>([
    { id: "b1", title: "Spring Sale - Up to 50%", image: "/images/banner1.jpg", active: true },
    { id: "b2", title: "Electronics Fest", image: "/images/banner2.jpg", active: false },
  ]);

  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function addBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!newBannerTitle.trim()) return;
    const b: Banner = { id: Date.now().toString(), title: newBannerTitle.trim(), image: "/images/placeholder.png", active: true };
    setBanners([b, ...banners]);
    setNewBannerTitle("");
  }

  function toggleBanner(id: string) {
    setBanners(banners.map(b => (b.id === id ? { ...b, active: !b.active } : b)));
  }

async function generateBannerSuggestions() {
    setIsGenerating(true);
    try {
      const res = await axios.post('/api/agents/admin', {
        context: 'Homepage banners, spring season, electronics push',
        task: 'banner_suggestions',
        format: 'text-only'
      });
      alert('Mistral AI Banner Suggestions:\n' + String(res.data.result).slice(0, 800));
    } catch (err: any) {
      alert('Mistral AI Error: ' + (err?.message || err));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Phoenix Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">Marketplace analytics and management center</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Production</span>
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Revenue"
          value="$1,242,450"
          subtitle="+12% this month"
          icon={<span className="text-indigo-600">💰</span>}
        />
        <StatsCard
          title="Active Sellers"
          value="3,742"
          subtitle="3,210 active / 532 pending"
          icon={<span className="text-indigo-600">🛒</span>}
        />
        <StatsCard
          title="Active Banners"
          value={banners.filter(b => b.active).length.toString()}
          subtitle="Homepage promotions"
          icon={<span className="text-indigo-600">🎨</span>}
        />
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Chart */}
          <SalesChart />

          {/* Banner Manager */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Banner Management</h2>
              <button
                onClick={generateBannerSuggestions}
                disabled={isGenerating}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center space-x-2"
              >
                <span>🤖</span>
                <span>{isGenerating ? 'Generating...' : 'AI Suggestions'}</span>
              </button>
            </div>

            <form onSubmit={addBanner} className="flex gap-3 items-center mb-4">
              <input
                value={newBannerTitle}
                onChange={e => setNewBannerTitle(e.target.value)}
                placeholder="New banner title"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                Add Banner
              </button>
            </form>

            <div className="space-y-3">
              {banners.map(b => (
                <div key={b.id} className="flex items-center justify-between border border-slate-100 p-3 rounded-lg bg-white">
                  <div className="flex items-center gap-4">
                    <img src={b.image} alt={b.title} className="w-20 h-12 object-cover rounded-md" />
                    <div>
                      <div className="font-medium text-slate-800">{b.title}</div>
                      <div className="text-xs text-slate-500">ID: {b.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleBanner(b.id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        b.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.active ? 'Active' : 'Inactive'}
                    </button>
                    <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {/* World Map Widget */}
          <WorldMapWidget />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-slate-700 hover:text-indigo-600 cursor-pointer">
                <span className="mr-2">⚡</span> Create Promotion
              </li>
              <li className="flex items-center text-sm text-slate-700 hover:text-indigo-600 cursor-pointer">
                <span className="mr-2">💳</span> Payouts & Remittances
              </li>
              <li className="flex items-center text-sm text-slate-700 hover:text-indigo-600 cursor-pointer">
                <span className="mr-2">👥</span> Review Seller Requests
              </li>
              <li className="flex items-center text-sm text-slate-700 hover:text-indigo-600 cursor-pointer">
                <span className="mr-2">📊</span> Analytics Report
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
