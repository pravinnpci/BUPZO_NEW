const http = require('http');

const data = JSON.stringify({
    name: "test product",
    price: 122,
    stock_quantity: 10,
    weight_grams: 50,
    description: "test description",
    image_url: "url1,url2",
    category_id: "d04b1234-5678-abcd-ef01-1234567890ab",
    seller_id: "not-a-uuid", // wait, what if seller_id is missing?
    is_combo: false
});

const options = {
  hostname: 'localhost',
  port: 8004,
  path: '/api/products/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => { console.log(res.statusCode, body); });
});

req.write(data);
req.end();
