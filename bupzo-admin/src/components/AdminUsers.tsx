import React from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  wallet: string;
  tier: string;
  status: string;
  risk: string;
}

interface AdminUsersProps {
  users: User[];
  openEditUserModal: (u: User) => void;
  setShowAddUserModal: (show: boolean) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  openEditUserModal,
  setShowAddUserModal
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading">Platform User Directory</h1>
          <p className="text-sm text-zinc-500 mt-1">Audit active profiles, wallet balances, and risk scores.</p>
        </div>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="bg-charcoal dark:bg-zinc-200 text-white dark:text-zinc-950 px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-sm"
        >
          <span>👤</span> Add User
        </button>
      </div>

      <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400">
                <th className="py-2">User ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Email</th>
                <th className="py-2">Wallet</th>
                <th className="py-2">Tier</th>
                <th className="py-2">Status</th>
                <th className="py-2">Risk</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
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
                    <button 
                      onClick={() => openEditUserModal(u)}
                      className="bg-charcoal hover:bg-opacity-95 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded text-[10px] font-bold"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
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
