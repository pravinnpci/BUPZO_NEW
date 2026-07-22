const fs = require('fs');
const file = 'bupzo-frontend/components/CartModal.tsx';

const newCartModal = `import React from 'react';

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  updateQuantity: (id: string, qty: number) => void;
  user: any;
  onCheckout: () => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: string | null;
  handleApplyPromo: () => void;
};

export function CartModal({
  isOpen, onClose, cart, updateQuantity, user, onCheckout,
  promoCode, setPromoCode, appliedPromo, handleApplyPromo
}: CartModalProps) {
  if (!isOpen) return null;

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = appliedPromo === 'WELCOME10' ? cartTotal * 0.1 : 0;
  const finalTotal = cartTotal - discount;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Side Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="bg-[#232f3e] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">shopping_cart</span>
            My Cart
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f8f8]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-6xl text-gray-300">remove_shopping_cart</span>
              <p className="text-gray-500 font-medium">Your cart is currently empty.</p>
              <button onClick={onClose} className="bg-[#e52e06] text-white px-6 py-2 rounded-full font-bold uppercase hover:bg-[#cc2805] transition mt-4">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="bg-white p-4 rounded shadow-sm flex gap-4 relative">
                  <div className="w-20 h-20 bg-gray-100 rounded p-2 flex items-center justify-center">
                    <img src={item.product.image_url || 'https://via.placeholder.com/150'} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-[#232f3e] text-sm line-clamp-1">{item.product.name}</h3>
                    <p className="text-[#e52e06] font-extrabold text-sm">₹{item.product.price.toLocaleString()}</p>
                    
                    <div className="flex items-center gap-3 mt-2 border border-gray-200 w-max rounded overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="bg-gray-50 hover:bg-gray-100 px-3 py-1 text-gray-600 transition"
                      >-</button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="bg-gray-50 hover:bg-gray-100 px-3 py-1 text-gray-600 transition"
                      >+</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateQuantity(item.product.id, 0)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6 space-y-4">
            {/* Promo Code */}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Promo Code" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#e52e06]"
              />
              <button 
                onClick={handleApplyPromo}
                className="bg-[#232f3e] text-white px-4 py-2 rounded text-sm font-bold uppercase hover:bg-[#1a232e] transition"
              >Apply</button>
            </div>
            
            <div className="space-y-2 text-sm font-medium text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedPromo})</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-extrabold text-[#232f3e] border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!user) {
                  alert('Please login to checkout.');
                  return;
                }
                onCheckout();
              }}
              className="w-full bg-[#e52e06] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#cc2805] transition shadow-md"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(file, newCartModal);
console.log('CartModal updated to Sprylo theme!');
