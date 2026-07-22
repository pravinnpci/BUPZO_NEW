const fs = require('fs');

let content = fs.readFileSync('bupzo-frontend/components/SellerDashboard.tsx', 'utf8');

// Fix API loading to ensure array
content = content.replace(
  /const allSellers = await fetchSellers\(\)\.catch\(\(\) => \[\]\);\s*const mySeller = allSellers\.find\(s => s\.user_id\.toString\(\) === user\?\.id\.toString\(\)\);/g,
  `const rawSellers = await fetchSellers().catch(() => []);
      const allSellers = Array.isArray(rawSellers) ? rawSellers : [];
      const mySeller = allSellers.find(s => s.user_id.toString() === user?.id.toString());`
);

content = content.replace(
  /const allCategories = await fetchCategories\(\)\.catch\(\(\) => \[\]\);\s*setCategories\(allCategories\);/g,
  `const rawCategories = await fetchCategories().catch(() => []);
      setCategories(Array.isArray(rawCategories) ? rawCategories : []);`
);

content = content.replace(
  /const allProducts = await fetchProducts\(\)\.catch\(\(\) => \[\]\);\s*setProducts\(allProducts\.filter\(p => p\.seller_id === mySeller\.id\)\);/g,
  `const rawProducts = await fetchProducts().catch(() => []);
        const allProducts = Array.isArray(rawProducts) ? rawProducts : [];
        setProducts(allProducts.filter(p => p.seller_id === mySeller.id));`
);

content = content.replace(
  /const myOrders = await fetchSellerOrders\(mySeller\.id\)\.catch\(\(\) => \[\]\);\s*setOrders\(myOrders\);/g,
  `const rawOrders = await fetchSellerOrders(mySeller.id).catch(() => []);
        setOrders(Array.isArray(rawOrders) ? rawOrders : []);`
);

// Fix trailing double braces
content = content.replace(/}\r?\n}\r?\n?$/g, "}\n");

fs.writeFileSync('bupzo-frontend/components/SellerDashboard.tsx', content);
console.log("SellerDashboard.tsx updated");
