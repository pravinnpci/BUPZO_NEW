import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  wallet: number | string;
  tier: string;
  status: string;
  risk: string;
}

interface AdminUsersProps {
  users: User[];
  openEditUserModal: (u: User) => void;
  setShowAddUserModal: (show: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  openEditUserModal,
  setShowAddUserModal,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof User | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof User) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(s) ||
      (u.phone || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.tier || '').toLowerCase().includes(s) ||
      (u.id || '').toLowerCase().includes(s)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (sortKey === 'wallet') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIndicator = ({ k }: { k: keyof User }) => {
    if (sortKey !== k) return <span className="ml-1 text-zinc-400 text-[10px] select-none">⇅</span>;
    return sortOrder === 'asc' ? <span className="ml-1 text-primary text-[10px] select-none">▲</span> : <span className="ml-1 text-primary text-[10px] select-none">▼</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Platform User Directory</h1>
          <p className="text-sm text-zinc-500 mt-1">Audit active profiles, wallet balances, and risk scores.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-64 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-primary"
            />
          </div>
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="bg-charcoal dark:bg-zinc-200 text-white dark:text-zinc-950 px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <span>👤</span> Add User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400 select-none">
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('id')}>User ID <SortIndicator k="id" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>Name <SortIndicator k="name" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('phone')}>Phone <SortIndicator k="phone" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('email')}>Email <SortIndicator k="email" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('wallet')}>Wallet <SortIndicator k="wallet" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('tier')}>Tier <SortIndicator k="tier" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>Status <SortIndicator k="status" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('risk')}>Risk <SortIndicator k="risk" /></th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(u => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 font-mono">{u.id ? `${u.id.substring(0, 8)}...` : ''}</td>
                  <td className="py-3 font-semibold text-[#3874ff]">{u.name || 'Bupzo Patron'}</td>
                  <td className="py-3">{u.phone}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3 font-mono font-bold">₹{u.wallet}</td>
                  <td className="py-3">{u.tier}</td>
                  <td className="py-3">{u.status}</td>
                  <td className="py-3">
                     <span className={`px-2 py-0.5 rounded font-bold ${u.risk === 'Low' ? 'bg-green-100 text-green-700' : u.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {u.risk}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => openEditUserModal(u)}
                        className="bg-charcoal hover:bg-opacity-95 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete user ${u.name}?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedUsers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
