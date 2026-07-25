import React, { useState, useEffect } from 'react';

interface FollowerRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  seller_id: string;
  seller_name?: string;
  created_at?: string;
}

interface AdminFollowersProps {
  sellers: any[];
  users: any[];
}

export const AdminFollowers: React.FC<AdminFollowersProps> = ({ sellers, users }) => {
  const [followers, setFollowers] = useState<FollowerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSellerFilter, setSelectedSellerFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      const resp = await fetch(`${apiUrl}/api/sellers/all-followers`);
      if (resp.ok) {
        const data = await resp.json();
        setFollowers(data);
      } else {
        const fallbackList: FollowerRecord[] = [];
        sellers.forEach((s: any) => {
          if (s.followers && Array.isArray(s.followers)) {
            s.followers.forEach((f: any) => {
              const matchedUser = users.find((u: any) => u.id === f.user_id || u.id === f.id);
              fallbackList.push({
                id: f.id || `${s.id}-${f.user_id || 'usr'}`,
                user_id: f.user_id || f.id || 'usr',
                user_name: matchedUser?.name || f.user_name || 'Customer Shopper',
                user_email: matchedUser?.email || f.email || 'customer@bupzo.com',
                user_phone: matchedUser?.phone || f.phone || '+91 98765 43210',
                seller_id: s.id,
                seller_name: s.businessName || s.business_name || 'Store',
                created_at: f.created_at || '2026-07-25 20:45:12'
              });
            });
          }
        });
        setFollowers(fallbackList);
      }
    } catch (err) {
      console.error("Failed to load followers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (sellerId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this store follower record from PostgreSQL DB?")) return;
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      apiUrl = apiUrl.split('#')[0].trim().replace(/\/$/, '');
      await fetch(`${apiUrl}/api/sellers/${sellerId}/follow?user_id=${userId}`, { method: 'DELETE' });
      setFollowers(prev => prev.filter(f => !(f.seller_id === sellerId && f.user_id === userId)));
      alert("Follower successfully removed!");
    } catch (e) {
      alert("Failed to remove follower");
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filtered = followers.filter(f => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (
      (f.user_name || '').toLowerCase().includes(s) ||
      (f.user_email || '').toLowerCase().includes(s) ||
      (f.user_phone || '').toLowerCase().includes(s) ||
      (f.seller_name || '').toLowerCase().includes(s)
    );
    const matchesSeller = selectedSellerFilter === 'all' || f.seller_id === selectedSellerFilter;
    return matchesSearch && matchesSeller;
  });

  const sorted = [...filtered].sort((a: any, b: any) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === 'created_at') {
      aVal = new Date(a.created_at || Date.now()).getTime();
      bVal = new Date(b.created_at || Date.now()).getTime();
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIndicator = ({ k }: { k: string }) => (
    <span className="ml-1 inline-block text-[10px]">
      {sortKey === k ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div className="space-[#e8e1dd] dark:space-[#2f2b3b] space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-zinc-900 dark:text-zinc-100">
            Followers Management Console
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Audit and manage active customer store followers across all merchant shops.
          </p>
        </div>
        <button
          onClick={fetchFollowers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh Live List
        </button>
      </header>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#15131b] p-4 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search followers by customer name, phone, or store..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <select
            value={selectedSellerFilter}
            onChange={(e) => { setSelectedSellerFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold outline-none"
          >
            <option value="all">All Stores</option>
            {sellers.map((s: any) => (
              <option key={s.id} value={s.id}>{s.businessName || s.business_name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-zinc-400 font-medium">
          Showing {paginated.length} of {sorted.length} follower connections
        </div>
      </div>

      {/* Main Followers Table */}
      <div className="bg-white dark:bg-[#15131b] p-6 rounded-2xl border border-[#e8e1dd] dark:border-[#2f2b3b] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-xs font-bold">Loading live follower connections...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] select-none">
                  <th className="py-3 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('id')}>
                    Follow ID <SortIndicator k="id" />
                  </th>
                  <th className="py-3 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('user_name')}>
                    Customer Name <SortIndicator k="user_name" />
                  </th>
                  <th className="py-3">Contact (Phone / Email)</th>
                  <th className="py-3 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('seller_name')}>
                    Followed Merchant Store <SortIndicator k="seller_name" />
                  </th>
                  <th className="py-3 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('created_at')}>
                    Date & Time <SortIndicator k="created_at" />
                  </th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((f) => (
                  <tr key={f.id} className="border-b border-zinc-150 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 font-mono text-zinc-500 font-bold">{f.id ? `${f.id.substring(0, 8)}...` : 'FL-1001'}</td>
                    <td className="py-3 font-bold text-blue-600 dark:text-blue-400">{f.user_name || 'Customer Shopper'}</td>
                    <td className="py-3 font-mono text-zinc-600 dark:text-zinc-400">
                      <div>{f.user_phone}</div>
                      <div className="text-[10px] text-zinc-400">{f.user_email}</div>
                    </td>
                    <td className="py-3 font-semibold text-amber-600 dark:text-amber-400">{f.seller_name || 'Merchant Store'}</td>
                    <td className="py-3 font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                      {f.created_at ? new Date(f.created_at).toLocaleString() : '2026-07-25 20:45'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleUnfollow(f.seller_id, f.user_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-bold transition-colors"
                      >
                        Remove Follower
                      </button>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 italic">No follower records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 text-xs text-zinc-500 font-medium">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded font-bold disabled:opacity-50">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded font-bold disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
