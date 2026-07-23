import React, { useState } from 'react';
import { topUpWallet } from '@/lib/api';

export const CustomerWallet = ({ walletBalance, walletTransactions, user }: any) => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || amount <= 0) return;
    setShowTopUp(false);
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      await topUpWallet(user.id, amount);
      setShowPaymentGateway(false);
      alert(`Payment Successful! ₹${amount} added to your Bupzo Wallet.`);
      window.location.reload();
    } catch (err) {
      alert("Top up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white pb-20 font-sans">
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center mb-10">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">My Wallet</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Wallet</p>
      </div>
      <div className="container mx-auto px-4 max-w-4xl">
         <div className="bg-gradient-to-r from-[#232f3e] to-[#1a232e] rounded-xl p-8 text-white flex justify-between items-center shadow-xl mb-8 border border-gray-700">
            <div>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Available Escrow Balance</p>
               <h2 className="text-5xl font-extrabold text-[#e52e06]">₹{parseFloat(walletBalance || '0').toLocaleString()}</h2>
            </div>
            <div className="flex items-center gap-6">
               <button 
                 onClick={() => setShowTopUp(true)}
                 className="bg-[#e52e06] hover:bg-[#c92805] text-white px-6 py-3 rounded-lg font-extrabold transition flex items-center gap-2 shadow-lg hover:scale-105"
               >
                 <span className="material-symbols-outlined text-base">add_circle</span>
                 Top Up Wallet
               </button>
            </div>
         </div>

         <div className="bg-[#f8f8f8] rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h3 className="text-xl font-extrabold text-[#232f3e] uppercase mb-4 border-b border-gray-200 pb-2 flex justify-between items-center">
              <span>Order Settlement & Commission Tally</span>
              <span className="text-xs text-gray-500 font-normal">Escrow Rule: 90% Seller / 10% Platform</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500 uppercase text-[10px]">
                    <th className="py-2">Transaction / Order</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Seller Payout (90%)</th>
                    <th className="py-2">Platform Comm (10%)</th>
                    <th className="py-2 text-right">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {walletTransactions.map((tx: any) => {
                    const amt = Math.abs(tx.amount || 0);
                    const sellerShare = Math.round(amt * 0.90);
                    const platformShare = Math.round(amt * 0.10);
                    return (
                      <tr key={tx.id || Math.random()} className="hover:bg-gray-100/50">
                        <td className="py-3 font-bold text-gray-800">{tx.description || tx.type}</td>
                        <td className="py-3 font-extrabold text-gray-900">₹{amt.toLocaleString()}</td>
                        <td className="py-3 font-bold text-emerald-700">₹{sellerShare.toLocaleString()}</td>
                        <td className="py-3 font-bold text-blue-700">₹{platformShare.toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {tx.type === 'CREDIT' ? 'Settled to Wallet' : 'Escrow Released'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {walletTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">No order settlements recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
         </div>

         <div className="bg-[#f8f8f8] rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-extrabold text-[#232f3e] uppercase mb-4 border-b border-gray-200 pb-2">Live Transaction History</h3>
            {walletTransactions.length === 0 ? (
               <div className="text-center py-10 text-gray-500 font-medium">No transactions found in DB.</div>
            ) : (
               <div className="space-y-3">
                 {walletTransactions.map((tx: any) => (
                    <div key={tx.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm hover:border-gray-300 transition">
                       <div>
                         <p className="font-bold text-[#232f3e] text-sm">{tx.description || tx.type}</p>
                         <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.created_at).toLocaleString()}</p>
                       </div>
                       <div className={`font-extrabold text-base ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                         {tx.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                       </div>
                    </div>
                 ))}
               </div>
            )}
         </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-gray-200">
            <h3 className="text-xl font-extrabold text-[#232f3e] mb-4">Top Up Bupzo Wallet</h3>
            <form onSubmit={handleInitiatePayment}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Enter Amount (₹)</label>
                <input 
                  type="number" 
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg font-bold text-gray-900 outline-none focus:border-[#e52e06]"
                  required
                />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 2000].map((preset) => (
                    <button 
                      key={preset} 
                      type="button" 
                      onClick={() => setAmount(preset)}
                      className={`text-xs px-2.5 py-1 rounded border font-bold ${amount === preset ? 'bg-[#e52e06] text-white border-[#e52e06]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowTopUp(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#e52e06] text-white rounded-lg font-extrabold hover:bg-[#c92805] shadow transition text-sm flex items-center gap-1"
                >
                  Proceed to Payment →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 animate-scale-up">
            <div className="bg-gradient-to-r from-[#232f3e] to-[#1a232e] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Bupzo Escrow Gateway</span>
                <h3 className="text-xl font-black text-white">Razorpay / Stitch Payment</h3>
              </div>
              <span className="text-2xl font-black text-emerald-400">₹{amount}</span>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-semibold flex items-center gap-2">
                <span>🔒</span> Secure 256-Bit Encrypted Payment Transaction
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Select Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border-2 border-emerald-500 rounded-lg bg-emerald-50/50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="pay_method" defaultChecked className="accent-emerald-600 w-4 h-4" />
                      <span className="font-bold text-sm text-gray-800">UPI / QR (Google Pay, PhonePe, Paytm)</span>
                    </div>
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">Fast</span>
                  </label>
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="pay_method" className="w-4 h-4" />
                      <span className="font-bold text-sm text-gray-800">Credit / Debit Card</span>
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="pay_method" className="w-4 h-4" />
                      <span className="font-bold text-sm text-gray-800">Net Banking</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowPaymentGateway(false)}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePaymentSuccess}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-lg transition text-sm flex items-center justify-center gap-1"
                >
                  {loading ? 'Verifying...' : `Pay ₹${amount} Now`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
