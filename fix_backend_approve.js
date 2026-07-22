const fs = require('fs');

let mainCode = fs.readFileSync('bupzo-backend/app/main.py', 'utf8');

const approveEndpoint = `
@app.put("/api/products/{product_id}/approve", response_model=dict)
async def approve_product(product_id: UUID, is_approved: bool = True):
    async with pool.acquire() as conn:
        result = await conn.execute("UPDATE products SET is_approved = $1 WHERE id = $2", is_approved, product_id)
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Product not found")
        return {"success": True, "is_approved": is_approved}
`;

mainCode = mainCode.replace(
    '@app.delete("/api/products/{product_id}")', 
    approveEndpoint + '\n@app.delete("/api/products/{product_id}")'
);
fs.writeFileSync('bupzo-backend/app/main.py', mainCode);
console.log("Added product approve endpoint");
