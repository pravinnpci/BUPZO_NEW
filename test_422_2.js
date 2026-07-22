const http = require('http');

const data = JSON.stringify({
    name: "test product",
    price: null,
    stock_quantity: 10,
    weight_grams: 50,
    description: "test description",
    category_id: "d04b1234-5678-abcd-ef01-1234567890ab",
    seller_id: "60f0baa7-dd45-46b5-b998-d46978f38890",
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
