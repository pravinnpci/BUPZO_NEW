import React from 'react';

interface WalletTransaction {
  id: string;
  amount: number;
  transaction_type: 'CREDIT' | 'DEBIT';
  description: string;
  created_at: string;
}

interface CustomerWalletProps {
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  user: any;
  mockUserId: string;
  theme: string;
}

export const CustomerWallet: React.FC<CustomerWalletProps> = ({
  walletBalance,
  walletTransactions,
  user,
  mockUserId,
  theme
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading">Stitch Escrow Wallet</h2>
        <p className="text-sm text-zinc-500 mt-1">Manage sandbox token allocations, credit refunds, and trigger simulated pay-outs.</p>
      </div>

      {/* Wallet Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3874ff] to-[#1d52cc] text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between h-44">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">Available Sandbox Balance</span>
            <div className="text-4xl font-extrabold font-heading mt-1">₹{walletBalance.toFixed(2)}</div>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">Stitch Pay Shield</span>
        </div>
        
        <div className="flex justify-between items-end border-t border-white/10 pt-4">
          <div>
            <span className="text-[8px] uppercase font-bold tracking-wider text-white/60">Virtual Vault ID</span>
            <p className="font-mono text-xs font-bold">{user?.id ? user.id.slice(0, 18) : mockUserId.slice(0, 18)}...</p>
          </div>
          <span className="text-[10px] font-bold text-white/90">Escrow Secured</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#3f3b4c] dark:text-[#ccc6dc]">Audit Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {walletTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-3 font-mono text-[10px] font-bold text-[#3874ff]">{tx.id.substring(0, 8)}...</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${tx.transaction_type === 'CREDIT' ? 'bg-green-100/10 text-green-500' : 'bg-red-100/10 text-red-500'}`}>
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold">₹{tx.amount}</td>
                  <td className="py-3 text-zinc-600 dark:text-zinc-400 font-medium">{tx.description}</td>
                  <td className="py-3 text-zinc-400 font-mono text-[10px]">{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {walletTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400 font-medium">No ledger records found for this account.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
