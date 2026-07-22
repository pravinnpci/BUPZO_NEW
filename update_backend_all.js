const fs = require('fs');
const file = 'bupzo-backend/app/main.py';
let content = fs.readFileSync(file, 'utf8');

// 1. Add avatar_url to UserResponse
content = content.replace(
  "    password: Optional[str] = None\n    status: Optional[str] = None",
  "    password: Optional[str] = None\n    avatar_url: Optional[str] = None\n    status: Optional[str] = None"
);

// 2. Add avatar_url to UserUpdate
content = content.replace(
  "    pincode: Optional[str] = None\n\n# Dispute Pydantic Models",
  "    pincode: Optional[str] = None\n    avatar_url: Optional[str] = None\n\n# Dispute Pydantic Models"
);

// 3. Update get_user_by_id
content = content.replace(
  "SELECT u.id, u.name, u.phone, u.email, u.is_premium, u.signup_platform, u.wallet_balance, u.privacy_accepted, u.created_at,\n           CASE WHEN s.status = 'APPROVED' THEN TRUE ELSE FALSE END AS is_seller,",
  "SELECT u.id, u.name, u.phone, u.email, u.is_premium, u.signup_platform, u.wallet_balance, u.privacy_accepted, u.created_at, u.address, u.pincode, u.avatar_url,\n           CASE WHEN s.status = 'APPROVED' THEN TRUE ELSE FALSE END AS is_seller,"
);

// 4. Update /api/users/ GET
content = content.replace(
  "u.wallet_balance, u.privacy_accepted, u.created_at, u.address, u.pincode,\n        CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_seller",
  "u.wallet_balance, u.privacy_accepted, u.created_at, u.address, u.pincode, u.avatar_url,\n        CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_seller"
);

// 5. Update update_user
content = content.replace(
  "    if payload.pincode is not None:\n        fields.append(f\"pincode = ${counter}\")\n        values.append(payload.pincode)\n        counter += 1\n        \n    if not fields:",
  "    if payload.pincode is not None:\n        fields.append(f\"pincode = ${counter}\")\n        values.append(payload.pincode)\n        counter += 1\n    if payload.avatar_url is not None:\n        fields.append(f\"avatar_url = ${counter}\")\n        values.append(payload.avatar_url)\n        counter += 1\n        \n    if not fields:"
);

content = content.replace(
  "RETURNING id, name, phone, email, is_premium, signup_platform, wallet_balance, privacy_accepted, created_at, address, pincode\"",
  "RETURNING id, name, phone, email, is_premium, signup_platform, wallet_balance, privacy_accepted, created_at, address, pincode, avatar_url\""
);

// 6. DB Migration
content = content.replace(
  "        # Product images support\n        await conn.execute(\"ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;\")\n        \n        # Create disputes table",
  "        # Product images support\n        await conn.execute(\"ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;\")\n        \n        # User Avatar support\n        await conn.execute(\"ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1024);\")\n        \n        # Create disputes table"
);

// 7 & 8. Add Product Routes
const productRoutes = `
@app.put("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: UUID, product: ProductUpdate):
    query = "SELECT id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at, is_approved FROM products WHERE id = $1"
    existing = await execute_query_one(query, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = []
    values = []
    idx = 1
    
    if product.name is not None:
        updates.append(f"name = $\\{idx\\}")
        values.append(product.name)
        idx += 1
    if product.category_id is not None:
        updates.append(f"category_id = $\\{idx\\}")
        values.append(product.category_id)
        idx += 1
    if product.price is not None:
        updates.append(f"price = $\\{idx\\}")
        values.append(product.price)
        idx += 1
    if product.weight_grams is not None:
        updates.append(f"weight_grams = $\\{idx\\}")
        values.append(product.weight_grams)
        idx += 1
    if product.image_url is not None:
        updates.append(f"image_url = $\\{idx\\}")
        values.append(product.image_url)
        idx += 1
    if product.images is not None:
        updates.append(f"images = $\\{idx\\}")
        values.append(json.dumps(product.images))
        idx += 1
    if product.is_combo is not None:
        updates.append(f"is_combo = $\\{idx\\}")
        values.append(product.is_combo)
        idx += 1
    if product.stock_quantity is not None:
        updates.append(f"stock_quantity = $\\{idx\\}")
        values.append(product.stock_quantity)
        idx += 1
    if product.description is not None:
        updates.append(f"description = $\\{idx\\}")
        values.append(product.description)
        idx += 1
    
    if not updates:
        return existing
        
    values.append(product_id)
    update_query = f"UPDATE products SET {', '.join(updates)} WHERE id = $\\{idx\\} RETURNING id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at, is_approved"
    
    result = await execute_query_one(update_query, *values)
    if result and isinstance(result.get('images'), str):
        result = dict(result)
        try: result['images'] = json.loads(result['images'])
        except: result['images'] = []
    return result

@app.put("/api/products/{product_id}/approve")
async def approve_product(product_id: UUID, is_approved: bool):
    result = await execute_query_one("UPDATE products SET is_approved = $1 WHERE id = $2 RETURNING id", is_approved, product_id)
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product approval status updated"}

@app.delete("/api/products/{product_id}")`;

content = content.replace("@app.delete(\"/api/products/{product_id}\")", productRoutes);

fs.writeFileSync(file, content);
console.log("main.py updated");
