const fs = require('fs');
const file = 'bupzo-backend/app/main.py';
let content = fs.readFileSync(file, 'utf8');

// Fix get_user_orders oi.price -> p.price
content = content.replace(
  "SELECT json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name))",
  "SELECT json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', p.price, 'name', p.name))"
);

fs.writeFileSync(file, content);
