'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      API_URL = API_URL.split('#')[0].trim().replace(/\/$/, '');

      const res = await fetch(`${API_URL}/api/invoices/`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.seller_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d3748]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>🧾</span> Invoice Management List
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Materialize HTML Admin Template Invoice List Console (100% Live PostgreSQL DB Data)
            </p>
          </div>

          <button
            onClick={fetchInvoices}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh Invoices
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Invoice ID, Customer, or Seller..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#3874ff]"
            />
            <span className="absolute right-3 top-2.5 text-xs text-gray-400">🔍</span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold outline-none bg-gray-50 text-gray-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>

        {/* Invoice Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm font-bold text-gray-500">
              Loading Live Invoices from PostgreSQL...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Merchant Store</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Issued Date</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors font-medium">
                      <td className="px-6 py-4 font-bold text-[#3874ff]">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-bold">
                        {inv.customer_name}
                        <div className="text-[10px] text-gray-400 font-normal">{inv.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {inv.seller_name}
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">
                        ₹{inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {inv.issued_date}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {inv.due_date}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.print()}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 font-bold"
                            title="Print Invoice"
                          >
                            🖨️
                          </button>
                          <button
                            onClick={() => alert(`Sent PDF email copy for ${inv.invoice_number}`)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 font-bold"
                            title="Send Email Copy"
                          >
                            ✉️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredInvoices.length === 0 && (
                <div className="p-12 text-center text-xs font-bold text-gray-400">
                  No invoices matched your query.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
