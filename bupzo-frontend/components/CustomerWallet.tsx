import React, { useState } from 'react';
import { topUpWallet } from '@/lib/api';

export const CustomerWallet = ({ walletBalance, walletTransactions, user }: any) => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || amount <= 0) return;
    setLoading(true);
    try {
      await topUpWallet(user.id, amount);
      setShowTopUp(false);
      alert("Wallet topped up successfully! Balance updated.");
      window.location.reload();
    } catch (err) {
      alert("Top up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white pb-20">
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center mb-10">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">My Wallet</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Wallet</p>
      </div>
      <div className="container mx-auto px-4 max-w-4xl">
         <div className="bg-[#232f3e] rounded-lg p-8 text-white flex justify-between items-center shadow-lg mb-8">
            <div>
               <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Available Balance</p>
               <h2 className="text-5xl font-extrabold text-[#e52e06]">₹{walletBalance.toLocaleString()}</h2>
            </div>
            <div className="flex items-center gap-6">
               <button 
                 onClick={() => setShowTopUp(true)}
                 className="bg-[#e52e06] hover:bg-[#c92805] text-white px-6 py-3 rounded font-bold transition flex items-center gap-2 shadow-md"
               >
                 <span className="material-symbols-outlined text-sm">add_circle</span>
                 Top Up Wallet
               </button>
               <span className="material-symbols-outlined text-6xl text-[#e52e06] opacity-80 hidden md:block">account_balance_wallet</span>
            </div>
         </div>

         <div className="bg-[#f8f8f8] rounded p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#232f3e] uppercase mb-4 border-b border-gray-200 pb-2">Transaction History</h3>
            {walletTransactions.length === 0 ? (
               <div className="text-center py-10 text-gray-500 font-medium">No transactions found.</div>
            ) : (
               <div className="space-y-4">
                 {walletTransactions.map((tx: any) => (
                    <div key={tx.id} className="bg-white border border-gray-200 rounded p-4 flex justify-between items-center">
                       <div>
                         <p className="font-bold text-[#232f3e]">{tx.description || tx.type}</p>
                         <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                       </div>
                       <div className={`font-extrabold text-lg ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                         {tx.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                       </div>
                    </div>
                 ))}
               </div>
            )}
         </div>
      </div>

      {showTopUp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#232f3e] mb-4">Top Up Wallet</h3>
            <form onSubmit={handleTopUp}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 outline-none focus:border-[#e52e06]"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowTopUp(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-[#e52e06] text-white rounded font-bold hover:bg-[#c92805] disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Top Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
