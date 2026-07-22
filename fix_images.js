

async function fixImages() {
  const API_URL = 'http://localhost:8004/api/products/';
  try {
    const res = await fetch(API_URL);
    const products = await res.json();
    let count = 0;
    for (const p of products) {
      if (p.image_url && p.image_url.includes('via.placeholder.com')) {
        const newUrl = p.image_url.replace(/via\.placeholder\.com\/([0-9A-Za-z\?=\+]+)/, 'placehold.co/$1/png');
        await fetch(API_URL + p.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...p, image_url: newUrl, images: p.images ? p.images.map(img => img.replace(/via\.placeholder\.com\/([0-9A-Za-z\?=\+]+)/, 'placehold.co/$1/png')) : [] })
        });
        count++;
      }
    }
    console.log(`Updated ${count} products.`);
  } catch(e) {
    console.error(e);
  }
}
fixImages();
