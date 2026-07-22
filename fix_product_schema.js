const fs = require('fs');
let code = fs.readFileSync('bupzo-backend/app/main.py', 'utf8');

// Add is_approved to ProductUpdate
code = code.replace(
    'stock_quantity: Optional[int] = None',
    'stock_quantity: Optional[int] = None\n    is_approved: Optional[bool] = None'
);

// Add is_approved handling to update_product
const oldUpdate = `    stock_quantity = payload.stock_quantity if payload.stock_quantity is not None else current['stock_quantity']
    description = payload.description if payload.description is not None else current['description']
    images = json.dumps(payload.images) if payload.images is not None else (current['images'] if isinstance(current['images'], str) else json.dumps(current['images'] or []))`;

const newUpdate = `    stock_quantity = payload.stock_quantity if payload.stock_quantity is not None else current['stock_quantity']
    description = payload.description if payload.description is not None else current['description']
    images = json.dumps(payload.images) if payload.images is not None else (current['images'] if isinstance(current['images'], str) else json.dumps(current['images'] or []))
    is_approved = payload.is_approved if payload.is_approved is not None else current.get('is_approved', False)`;

code = code.replace(oldUpdate, newUpdate);

// Update query in update_product
const oldQuery = `    UPDATE products 
    SET name = $1, category_id = $2, price = $3, weight_grams = $4, image_url = $5, images = $6, is_combo = $7, stock_quantity = $8, description = $9 
    WHERE id = $10`;

const newQuery = `    UPDATE products 
    SET name = $1, category_id = $2, price = $3, weight_grams = $4, image_url = $5, images = $6, is_combo = $7, stock_quantity = $8, description = $9, is_approved = $10 
    WHERE id = $11`;

code = code.replace(oldQuery, newQuery);

// Update execute_query_one call
const oldExec = `    result = await execute_query_one(query_update, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, description, product_id)`;
const newExec = `    result = await execute_query_one(query_update, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, description, is_approved, product_id)`;

code = code.replace(oldExec, newExec);

fs.writeFileSync('bupzo-backend/app/main.py', code);
console.log("Updated ProductUpdate schema in main.py");
