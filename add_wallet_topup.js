const fs = require('fs');

const content = fs.readFileSync('bupzo-backend/app/main.py', 'utf8');

const topUpCode = `
class TopUpRequest(BaseModel):
    user_id: str
    amount: float

@app.post("/api/wallet/topup")
async def topup_wallet(req: TopUpRequest):
    user_id_uuid = uuid.UUID(req.user_id)
    # Check user exists
    user = await execute_query_one("SELECT * FROM users WHERE id = $1", user_id_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update balance
    new_balance = float(user['wallet_balance']) + req.amount
    await execute_query(
        "UPDATE users SET wallet_balance = $1 WHERE id = $2",
        new_balance, user_id_uuid
    )
    
    # Insert transaction
    await execute_query(
        """
        INSERT INTO wallet_transactions (id, user_id, type, amount, status, description, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        """,
        uuid.uuid4(), user_id_uuid, 'CREDIT', req.amount, 'COMPLETED', 'Wallet Top Up via UI'
    )
    
    return {"success": True, "new_balance": new_balance}
`;

if (!content.includes('/api/wallet/topup')) {
    const lines = content.split('\n');
    const index = lines.findIndex(line => line.includes('@app.get("/api/wallet/transactions/{user_id}"'));
    if (index !== -1) {
        lines.splice(index, 0, topUpCode);
        fs.writeFileSync('bupzo-backend/app/main.py', lines.join('\n'));
        console.log("Added /api/wallet/topup endpoint");
    } else {
        console.error("Could not find insertion point");
    }
} else {
    console.log("Endpoint already exists");
}
