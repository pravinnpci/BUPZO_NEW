import React, { useState, useEffect } from 'react';
import { showAdminToast } from './Toast';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  wallet: number | string;
  tier: string;
  status: string;
  risk: string;
  isSeller?: boolean;
  isAdmin?: boolean;
  address?: string;
  pincode?: string;
  state?: string;
  created_at?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  last_login?: string;
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
  
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [previewTab, setPreviewTab] = useState<'overview' | 'orders' | 'activity'>('overview');
  const [previewOrders, setPreviewOrders] = useState<any[]>([]);
  const [previewActivity, setPreviewActivity] = useState<any[]>([]);

  const handleSuspend = async (userId: string, suspend: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend })
      });
      if (res.ok) {
        showAdminToast(`User ${suspend ? 'suspended' : 'unsuspended'} successfully!`);
        setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, status: suspend ? 'Suspended' : 'Active' } : u));
        if (previewUser && previewUser.id === userId) {
          setPreviewUser({ ...previewUser, status: suspend ? 'Suspended' : 'Active' });
        }
      } else {
        alert('Failed to update user status.');
      }
    } catch (e) {
      alert('Error updating user status.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Wallet', 'Joined Date'];
    const rows = filteredUsers.map(u => [
      u.id,
      u.name || '',
      u.email || '',
      u.phone || '',
      u.isAdmin ? 'Admin' : u.isSeller ? 'Seller' : 'Customer',
      u.status || 'Active',
      u.wallet || 0,
      u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'bupzo_users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = localUsers.filter(u => {
    const s = searchTerm.toLowerCase();
    const matchSearch = (u.name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s) || (u.phone || '').toLowerCase().includes(s);
    
    let matchRole = true;
    if (roleFilter === 'Customer') matchRole = !u.isAdmin && !u.isSeller;
    if (roleFilter === 'Seller') matchRole = !!u.isSeller;
    if (roleFilter === 'Admin') matchRole = !!u.isAdmin;
    
    let matchStatus = true;
    if (statusFilter === 'Active') matchStatus = u.status === 'Active';
    if (statusFilter === 'Suspended') matchStatus = u.status === 'Suspended';
    
    return matchSearch && matchRole && matchStatus;
  });

  const getRoleBadge = (u: User) => {
    if (u.isAdmin) return <span className="px-2 py-0.5 rounded font-bold bg-violet-100/20 text-violet-400 border border-violet-500/30">Admin</span>;
    if (u.isSeller) return <span className="px-2 py-0.5 rounded font-bold bg-emerald-100/10 text-emerald-500 border border-emerald-500/30">Seller</span>;
    return <span className="px-2 py-0.5 rounded font-bold bg-blue-100/10 text-blue-400 border border-blue-500/30">Customer</span>;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const loadUserDetails = async (u: User) => {
    setPreviewUser(u);
    setPreviewTab('overview');
    setPreviewOrders([]);
    setPreviewActivity([]);
    
    try {
      const oRes = await fetch(`${API_URL}/api/orders/?user_id=${u.id}`);
      if (oRes.ok) {
        const oData = await oRes.json();
        setPreviewOrders(Array.isArray(oData) ? oData : []);
      }
    } catch(e) {}
    
    try {
      const aRes = await fetch(`${API_URL}/api/notifications/?user_id=${u.id}`);
      if (aRes.ok) {
        const aData = await aRes.json();
        setPreviewActivity(Array.isArray(aData) ? aData : []);
      }
    } catch(e) {}
  };

  // Stats
  const totalUsers = localUsers.length;
  const activeUsers = localUsers.filter(u => u.status !== 'Suspended').length;
  const sellersCount = localUsers.filter(u => u.isSeller).length;
  const suspendedUsers = localUsers.filter(u => u.status === 'Suspended').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Users Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage customers, sellers, and platform administrators.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-charcoal dark:bg-zinc-800 text-white dark:text-zinc-200 px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
          <p className="text-xs text-zinc-500 font-semibold mb-1">Total Users</p>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
          <p className="text-xs text-zinc-500 font-semibold mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-500">{activeUsers}</p>
        </div>
        <div className="bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
          <p className="text-xs text-zinc-500 font-semibold mb-1">Sellers</p>
          <p className="text-2xl font-bold text-emerald-500">{sellersCount}</p>
        </div>
        <div className="bg-white dark:bg-[#15131b] p-4 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
          <p className="text-xs text-zinc-500 font-semibold mb-1">Suspended Users</p>
          <p className="text-2xl font-bold text-red-500">{suspendedUsers}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#15131b] rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
        <div className="p-4 border-b border-[#e8e1dd] dark:border-[#2f2b3b] flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
            >
              <option value="All">All Roles</option>
              <option value="Customer">Customer</option>
              <option value="Seller">Seller</option>
              <option value="Admin">Admin</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-64 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400 select-none">
                <th className="py-2.5">User</th>
                <th className="py-2.5">Phone</th>
                <th className="py-2.5">Role</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Email Ver.</th>
                <th className="py-2.5">Phone Ver.</th>
                <th className="py-2.5">Joined Date</th>
                <th className="py-2.5">Last Login</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-zinc-150 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="font-bold">{u.name || 'Bupzo Patron'}</p>
                        <p className="text-[10px] text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{u.phone?.startsWith('GOOG-') ? 'N/A' : u.phone}</td>
                  <td className="py-3">{getRoleBadge(u)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-lg">{u.email_verified ? <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>}</td>
                  <td className="py-3 font-bold text-lg">{u.phone_verified ? <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>}</td>
                  <td className="py-3 font-mono text-[10px] text-zinc-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 font-mono text-[10px] text-zinc-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => loadUserDetails(u)}
                        className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleSuspend(u.id, u.status !== 'Suspended')}
                        className={`${u.status === 'Suspended' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white px-2.5 py-1 rounded text-[10px] font-bold`}
                      >
                        {u.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-400">No users found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="font-bold text-lg font-heading">User Profile</h2>
              <button onClick={() => setPreviewUser(null)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-bold text-xl">✕</button>
            </div>
            
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-2xl text-zinc-500 dark:text-zinc-400 mb-3">
                {getInitials(previewUser.name)}
              </div>
              <h3 className="font-bold text-xl">{previewUser.name || 'Unknown User'}</h3>
              <p className="text-sm text-zinc-500 mb-2">{previewUser.email}</p>
              <div className="flex gap-2">
                {getRoleBadge(previewUser)}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewUser.status === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {previewUser.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-sm font-bold">
              <button 
                className={`flex-1 py-3 border-b-2 ${previewTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                onClick={() => setPreviewTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`flex-1 py-3 border-b-2 ${previewTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                onClick={() => setPreviewTab('orders')}
              >
                Orders
              </button>
              <button 
                className={`flex-1 py-3 border-b-2 ${previewTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                onClick={() => setPreviewTab('activity')}
              >
                Activity
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {previewTab === 'overview' && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Total Spent</p>
                      <p className="font-bold">₹{previewUser.wallet || 0}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Total Orders</p>
                      <p className="font-bold">{previewOrders.length}</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider mb-2">Contact Information</h4>
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                    <p className="flex justify-between"><span className="text-zinc-500">Phone:</span> <span className="font-medium">{previewUser.phone?.startsWith('GOOG-') ? 'N/A' : previewUser.phone}</span></p>
                    <p className="flex justify-between"><span className="text-zinc-500">Email:</span> <span className="font-medium">{previewUser.email || 'N/A'}</span></p>
                    <p className="flex justify-between"><span className="text-zinc-500">Joined:</span> <span className="font-medium">{previewUser.created_at ? new Date(previewUser.created_at).toLocaleDateString() : 'N/A'}</span></p>
                    <p className="flex justify-between"><span className="text-zinc-500">Last Login:</span> <span className="font-medium">{previewUser.last_login ? new Date(previewUser.last_login).toLocaleDateString() : 'N/A'}</span></p>
                  </div>
                </div>
              )}
              {previewTab === 'orders' && (
                <div className="space-y-3">
                  {previewOrders.length > 0 ? previewOrders.map((o: any, idx) => (
                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm">
                      <div className="flex justify-between font-bold mb-1">
                        <span>{o.id || `ORD-${idx+1000}`}</span>
                        <span>₹{o.total || o.amount || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'}</span>
                        <span className="capitalize">{o.status || 'Completed'}</span>
                      </div>
                    </div>
                  )) : <p className="text-zinc-500 text-sm text-center py-4">No orders found.</p>}
                </div>
              )}
              {previewTab === 'activity' && (
                <div className="space-y-3">
                  {previewActivity.length > 0 ? previewActivity.map((a: any, idx) => (
                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm flex gap-3 items-start">
                      <div className="mt-0.5 text-primary">●</div>
                      <div>
                        <p className="font-medium">{a.message || a.action}</p>
                        <p className="text-xs text-zinc-500">{a.created_at ? new Date(a.created_at).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                  )) : <p className="text-zinc-500 text-sm text-center py-4">No recent activity.</p>}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
              <button 
                onClick={() => setPreviewUser(null)}
                className="bg-zinc-200 dark:bg-zinc-800 px-4 py-2 rounded-lg font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
