const fs = require('fs');
const file = 'bupzo-frontend/app/checkout/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add mounted state to fix hydration error
content = content.replace(
  "  const [walletAmountToUse, setWalletAmountToUse] = useState(0);",
  "  const [walletAmountToUse, setWalletAmountToUse] = useState(0);\n  const [mounted, setMounted] = useState(false);\n\n  useEffect(() => setMounted(true), []);"
);

// 2. Add return null if not mounted
content = content.replace(
  "  if (success) {",
  "  if (!mounted) return null;\n\n  if (success) {"
);

// 3. Add simulated shipping logic
content = content.replace(
  "  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);\n  const totalAmountDue = subtotal; \n  const maxWalletUsable = Math.min(totalAmountDue, user?.walletBalance || 0);",
  `  const [shippingCost, setShippingCost] = useState(0);
  const [shippingProvider, setShippingProvider] = useState('');

  useEffect(() => {
    if (cart.length > 0) {
      // Simulate multiple shipping APIs
      const dhl = 50 + Math.random() * 20;
      const bluedart = 45 + Math.random() * 25;
      const delhivery = 40 + Math.random() * 15;
      
      const minRate = Math.min(dhl, bluedart, delhivery);
      setShippingCost(Math.round(minRate));
      setShippingProvider(minRate === dhl ? 'DHL' : minRate === bluedart ? 'BlueDart' : 'Delhivery');
    }
  }, [cart.length]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmountDue = subtotal + shippingCost; 
  const maxWalletUsable = Math.min(totalAmountDue, user?.walletBalance || 0);`
);

// 4. Update the checkout summary UI to show shipping
content = content.replace(
  "              <div className=\"flex justify-between mb-4\">\n                <span className=\"text-gray-600\">Total Item Price</span>\n                <span className=\"font-bold\">₹{subtotal.toFixed(2)}</span>\n              </div>",
  `              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Item Price</span>
                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Shipping ({shippingProvider})</span>
                <span className="font-bold text-green-600">+₹{shippingCost.toFixed(2)}</span>
              </div>`
);

fs.writeFileSync(file, content);
