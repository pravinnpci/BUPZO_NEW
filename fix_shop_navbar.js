const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/app/shop/[id]/page.tsx', 'utf8');

code = code.replace(
    '<Navbar cartCount={cartStore.cart.reduce((sum, i) => sum + i.quantity, 0)} wishlistCount={cartStore.wishlist.length} unreadMsgs={0} />',
    `<Navbar 
        cartCount={cartStore.cart.reduce((sum, i) => sum + i.quantity, 0)} 
        wishlistCount={cartStore.wishlist.length} 
        unreadMsgs={0} 
        onTabChange={(t) => router.push('/?tab=' + t)}
        onAuthClick={() => router.push('/')}
        onCartClick={() => router.push('/')}
      />`
);

fs.writeFileSync('bupzo-frontend/app/shop/[id]/page.tsx', code);
console.log("Fixed Navbar props in shop page");
