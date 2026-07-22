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
  isSeller?: boolean;
  isAdmin?: boolean;
  address?: string;
  pincode?: string;
  state?: string;
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
  const UserAddressesViewer = ({ userId }: { userId: string }) => {
    const [addrs, setAddrs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    React.useEffect(() => {
      fetch(`${API_URL}/api/addresses/user/${userId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => { setAddrs(data); setLoading(false); })
        .catch(() => setLoading(false));
    }, [userId]);
    if (loading) return <span className="text-zinc-500 text-xs">Loading addresses...</span>;
    if (addrs.length === 0) return <span className="text-zinc-500 text-xs">No saved addresses.</span>;
    return (
      <>
        {addrs.map(a => (
          <div key={a.id} className="p-2 border border-zinc-200 dark:border-zinc-700 rounded text-xs">
            <p className="font-bold">{a.name}</p>
            <p>{a.street}, {a.city}, {a.state} - {a.zip_code}</p>
          </div>
        ))}
      </>
    );
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof User | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  
  // Messaging Modal States
  const [messageUser, setMessageUser] = useState<User | null>(null);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [isSending, setIsSending] = useState(false);

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
    let aVal: any = a[sortKey];
    let bVal: any = b[sortKey];

    if (sortKey === 'wallet') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else if (sortKey === 'isSeller') {
      aVal = a.isSeller ? 1 : 0;
      bVal = b.isSeller ? 1 : 0;
    } else if (sortKey === 'isAdmin') {
      aVal = a.isAdmin ? 1 : 0;
      bVal = b.isAdmin ? 1 : 0;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }

    return aVal < bVal ? (sortOrder === 'asc' ? -1 : 1) : aVal > bVal ? (sortOrder === 'asc' ? 1 : -1) : 0;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIndicator = ({ k }: { k: keyof User }) => {
    if (sortKey !== k) return <span className="ml-1 text-zinc-400 text-[10px] select-none">⇅</span>;
    return sortOrder === 'asc' ? <span className="ml-1 text-primary text-[10px] select-none">▲</span> : <span className="ml-1 text-primary text-[10px] select-none">▼</span>;
  };

  // Derive role label + style
  const getRoleBadge = (u: User) => {
    if (u.isAdmin) {
      return (
        <span className="px-2 py-0.5 rounded font-bold bg-purple-100/20 text-purple-400 border border-purple-500/30">
          Admin
        </span>
      );
    }
    if (u.isSeller) {
      return (
        <span className="px-2 py-0.5 rounded font-bold bg-amber-100/10 text-amber-500 border border-amber-500/30">
          Seller
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded font-bold bg-zinc-100/10 text-zinc-400 dark:text-zinc-500">
        Customer
      </span>
    );
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
        <div className="mb-4 text-xs font-semibold text-zinc-500">
          Total Users: {users.length} | Showing: {paginatedUsers.length}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400 select-none">
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('id')}>User ID <SortIndicator k="id" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>Name <SortIndicator k="name" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('phone')}>Phone <SortIndicator k="phone" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('email')}>Email <SortIndicator k="email" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('wallet')}>Wallet <SortIndicator k="wallet" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('tier')}>Tier <SortIndicator k="tier" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>Status <SortIndicator k="status" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('isSeller')}>Role <SortIndicator k="isSeller" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('isSeller')}>Seller <SortIndicator k="isSeller" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('risk')}>Risk <SortIndicator k="risk" /></th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(u => (
                <tr key={u.id} className="border-b border-zinc-150 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="py-3 font-mono text-zinc-500">{u.id ? `${u.id.substring(0, 8)}...` : ''}</td>
                  <td className="py-3 font-semibold text-[#3874ff] cursor-pointer hover:underline" onClick={() => setPreviewUser(u)}>{u.name || 'Bupzo Patron'}</td>
                  <td className="py-3">{u.phone?.startsWith('GOOG-') ? 'Not Provided' : u.phone}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3 font-mono font-bold">₹{u.wallet}</td>
                  <td className="py-3">{u.tier}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {getRoleBadge(u)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${u.isSeller ? 'bg-amber-100/10 text-amber-500' : 'bg-zinc-100/10 text-zinc-400 dark:text-zinc-500'}`}>
                      {u.isSeller ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3">
                     <span className={`px-2 py-0.5 rounded font-bold ${u.risk === 'Low' ? 'bg-green-100 text-green-700' : u.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {u.risk}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => setPreviewUser(u)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Preview
                      </button>
                      <button 
                        onClick={() => openEditUserModal(u)}
                        className="bg-charcoal hover:bg-opacity-95 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setMessageUser(u);
                          setMsgSubject(`Admin Notification`);
                          setMsgContent(`Important message regarding your account.`);
                        }}
                        title="Send Message"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-sm font-bold flex items-center justify-center h-[24px] w-[28px]"
                      >
                        <span className="material-symbols-outlined text-[14px]">mail</span>
                      </button>
                      <button 
                        onClick={() => setDeleteUser(u)}
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
                  <td colSpan={11} className="py-8 text-center text-zinc-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-xs font-semibold text-zinc-500">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {previewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 text-zinc-900 dark:text-zinc-100">
            <h3 className="text-xl font-bold mb-4">User Details - {previewUser.name}</h3>
            <div className="space-y-3 text-sm">
              <p><strong>ID:</strong> {previewUser.id}</p>
              <p><strong>Name:</strong> {previewUser.name}</p>
              <p><strong>Phone:</strong> {previewUser.phone?.startsWith('GOOG-') ? 'Not Provided' : previewUser.phone}</p>
              <p><strong>Email:</strong> {previewUser.email || 'N/A'}</p>
              <p><strong>Wallet:</strong> ₹{previewUser.wallet}</p>
              <p><strong>Tier:</strong> {previewUser.tier}</p>
              <p><strong>Status:</strong> {previewUser.status}</p>
              <p><strong>Risk:</strong> {previewUser.risk}</p>
              <p><strong>Role:</strong> {previewUser.isAdmin ? 'Admin' : previewUser.isSeller ? 'Seller' : 'Customer'}</p>
              <p><strong>Address:</strong> {previewUser.address || 'Not Provided'}</p>
              <p><strong>Pincode:</strong> {previewUser.pincode || 'Not Provided'}</p>
              <p><strong>State:</strong> {previewUser.state || 'Not Provided'}</p>
              {/* Address and Pincode are shown below in Saved Delivery Addresses */}
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <h4 className="font-bold text-sm mb-2">Saved Delivery Addresses</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  <UserAddressesViewer userId={previewUser.id} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setPreviewUser(null)} 
                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-6 text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold text-red-600 mb-2">Permanent Delete</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to permanently delete user "{deleteUser.name}"? This will cascade and delete all associated records (orders, wallet, etc). This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteUser(null)} 
                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onDeleteUser(deleteUser.id);
                  setDeleteUser(null);
                }} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {messageUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold font-heading">Message {messageUser.name || 'User'}</h3>
              <button onClick={() => setMessageUser(null)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Message Content</label>
                <textarea 
                  rows={4}
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setMessageUser(null)} 
                  className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!msgSubject || !msgContent) return alert('Please enter both subject and content.');
                    setIsSending(true);
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004'}/api/messages/?user_id=${messageUser.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          sender_id: 'admin',
                          receiver_id: messageUser.id,
                          subject: msgSubject,
                          content: msgContent
                        })
                      });
                      if(res.ok) {
                        alert('Message sent successfully!');
                        setMessageUser(null);
                      } else {
                        alert('Failed to send message.');
                      }
                    } catch (err) {
                      alert('Error sending message.');
                    } finally {
                      setIsSending(false);
                    }
                  }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                  disabled={isSending}
                >
                  {isSending ? 'Sending...' : <>Send Message <span className="material-symbols-outlined text-[16px]">send</span></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
