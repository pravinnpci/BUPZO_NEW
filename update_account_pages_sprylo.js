const fs = require('fs');

const writeSpryloComponent = (filePath, content) => {
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
};

// 1. CustomerOrders
writeSpryloComponent('bupzo-frontend/components/CustomerOrders.tsx', `import React from 'react';

export const CustomerOrders = ({ customerOrders, user }: any) => {
  return (
    <div className="w-full bg-white pb-20">
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center mb-10">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">My Orders</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Orders</p>
      </div>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-[#f8f8f8] rounded p-6 shadow-sm">
          {customerOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-medium">You have no orders yet.</div>
          ) : (
            <div className="space-y-6">
              {customerOrders.map((ord: any) => (
                <div key={ord.id} className="bg-white border border-gray-200 rounded p-6 relative">
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-[#232f3e] font-bold text-lg mb-1">Order #{ord.id.split('-')[0].toUpperCase()}</h3>
                      <p className="text-sm text-gray-500">{new Date(ord.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#e52e06] font-extrabold text-xl">₹{ord.total_amount.toLocaleString()}</p>
                      <span className={\`text-xs font-bold px-2 py-1 rounded \${ord.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}\`}>{ord.status}</span>
                    </div>
                  </div>
                  {Array.isArray(ord.items) && ord.items.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {ord.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-700">
                          <span>{item.quantity || 1}x {item.name}</span>
                          <span className="font-bold">₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {ord.tracking_id && (
                     <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded">
                        <strong>Tracking ID:</strong> {ord.tracking_id} ({ord.shipping_partner})
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
`);

// 2. CustomerWishlist
writeSpryloComponent('bupzo-frontend/components/CustomerWishlist.tsx', `import React from 'react';

export const CustomerWishlist = ({ wishlist, removeFromWishlist, handleAddToCart, onProductClick }: any) => {
  return (
    <div className="w-full bg-white pb-20">
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center mb-10">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">Wishlist</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Wishlist</p>
      </div>
      <div className="container mx-auto px-4">
        {wishlist.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium">Your wishlist is empty.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item: any) => (
               <div key={item.id} className="bg-[#f8f8f8] p-4 rounded group relative transition hover:shadow-xl flex flex-col justify-between h-[420px]">
                  <div className="bg-white rounded h-[220px] mb-4 flex items-center justify-center p-4 relative overflow-hidden">
                     <img src={item.image_url || 'https://via.placeholder.com/300'} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-500" />
                     <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <button onClick={() => handleAddToCart(item)} className="bg-[#e52e06] text-white w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#232f3e] transition" title="Add to Cart"><span className="material-symbols-outlined text-sm">shopping_cart</span></button>
                        <button onClick={() => removeFromWishlist(item.id)} className="bg-white text-red-500 w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#e52e06] hover:text-white transition shadow" title="Remove"><span className="material-symbols-outlined text-sm">delete</span></button>
                        <button onClick={() => onProductClick(item)} className="bg-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center mx-1 hover:bg-[#232f3e] hover:text-white transition shadow" title="View"><span className="material-symbols-outlined text-sm">visibility</span></button>
                     </div>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-end">
                     <h3 className="text-lg font-bold text-[#232f3e] mb-2 cursor-pointer transition line-clamp-2" onClick={() => onProductClick(item)}>{item.name}</h3>
                     <p className="text-[#e52e06] font-extrabold text-xl">₹{item.price?.toLocaleString()}</p>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
`);

// 3. CustomerWallet
writeSpryloComponent('bupzo-frontend/components/CustomerWallet.tsx', `import React from 'react';

export const CustomerWallet = ({ walletBalance, walletTransactions, user }: any) => {
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
            <div className="text-right">
               <span className="material-symbols-outlined text-6xl text-[#e52e06] opacity-80">account_balance_wallet</span>
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
                       <div className={\`font-extrabold text-lg \${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}\`}>
                         {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                       </div>
                    </div>
                 ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
`);

// 4. CustomerSettings (basic wrapping to match)
let settingsContent = fs.readFileSync('bupzo-frontend/components/CustomerSettings.tsx', 'utf8');
if (!settingsContent.includes('bg-[#fce5df]')) {
  settingsContent = settingsContent.replace(
    '<div className="space-y-6">',
    `<div className="w-full bg-white pb-20">
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center mb-10">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">Profile Settings</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Profile</p>
      </div>
      <div className="container mx-auto px-4 max-w-4xl bg-[#f8f8f8] p-8 rounded shadow-sm">`
  );
  settingsContent = settingsContent.replace(/<\/div>\s*$/i, '</div></div>');
  writeSpryloComponent('bupzo-frontend/components/CustomerSettings.tsx', settingsContent);
}

// 5. CustomerMessages (basic wrapping to match)
let messagesContent = fs.readFileSync('bupzo-frontend/components/CustomerMessages.tsx', 'utf8');
if (!messagesContent.includes('bg-[#fce5df]')) {
  messagesContent = messagesContent.replace(
    '<div className="bg-white dark:bg-[#15131b] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden h-[600px] flex text-xs flex-col md:flex-row relative">',
    `<div className="w-full bg-white pb-20">
      <div className="w-full bg-[#fce5df] py-12 flex flex-col items-center justify-center text-center mb-10">
         <h1 className="text-4xl font-extrabold text-[#232f3e] uppercase tracking-wide mb-2">Messages</h1>
         <p className="text-[#e52e06] font-bold text-sm uppercase">Home / Messages</p>
      </div>
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white border border-gray-200 rounded overflow-hidden h-[600px] flex flex-col md:flex-row relative shadow-lg text-sm">`
  );
  messagesContent = messagesContent.replace(/<\/div>\s*$/i, '</div></div></div>');
  writeSpryloComponent('bupzo-frontend/components/CustomerMessages.tsx', messagesContent);
}

console.log('Account pages updated to Sprylo theme!');
