const http = require('http');

const data = JSON.stringify({
    name: "test",
    category_id: "d04b1234-5678-abcd-ef01-1234567890ab",
    price: 100,
    weight_grams: 100,
    is_combo: false,
    stock_quantity: 10,
    seller_id: "60f0baa7-dd45-46b5-b998-d46978f38890",
    description: "test"
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
  console.log('statusCode:', res.statusCode);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
