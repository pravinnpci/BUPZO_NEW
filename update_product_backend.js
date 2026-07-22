const fs = require('fs');
const file = 'bupzo-backend/app/main.py';
let content = fs.readFileSync(file, 'utf8');

const approveEndpoint = `
# Approve/Reject Product
@app.put("/api/products/{product_id}/approve")
async def approve_product(product_id: UUID, is_approved: bool):
    query = "UPDATE products SET is_approved = $1 WHERE id = $2 RETURNING id"
    res = await execute_query_one(query, is_approved, product_id)
    if not res:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "is_approved": is_approved}
`;

content = content.replace(
  "# Update Product\n@app.put(\"/api/products/{product_id}\", response_model=ProductResponse)",
  `${approveEndpoint}\n# Update Product\n@app.put("/api/products/{product_id}", response_model=ProductResponse)`
);

// We also need to return the seller's business name when fetching products in Admin?
// Let's check read_products
content = content.replace(
  "    query = \"SELECT id, name, category_id, price, weight_grams, image_url, images, is_combo, stock_quantity, seller_id, description, created_at FROM products\"",
  "    query = \"SELECT p.id, p.name, p.category_id, p.price, p.weight_grams, p.image_url, p.images, p.is_combo, p.stock_quantity, p.seller_id, p.description, p.created_at, p.is_approved, s.business_name as store_name FROM products p LEFT JOIN sellers s ON p.seller_id = s.id\""
);

// We need to return is_approved and store_name in ProductResponse!
content = content.replace(
  "    description: Optional[str] = None\n    created_at: datetime\n\n    class Config:",
  "    description: Optional[str] = None\n    created_at: datetime\n    is_approved: Optional[bool] = True\n    store_name: Optional[str] = None\n\n    class Config:"
);

fs.writeFileSync(file, content);
