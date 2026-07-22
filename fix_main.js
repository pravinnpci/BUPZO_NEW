const fs = require('fs');

let content = fs.readFileSync('bupzo-backend/app/main.py', 'utf8');
let lines = content.split('\n');

let newLines = [];
for (let i = 0; i < lines.length; i++) {
    if (i >= 2200 && i <= 2206) {
        continue;
    }
    newLines.push(lines[i]);
}

const replacement = `
@app.post("/api/notifications/{id}/read")
async def mark_notification_read(id: str):
    async with pool.acquire() as conn:
        await conn.execute("UPDATE notifications SET read = TRUE WHERE id = $1;", id)
    await clear_cache_keys("cache:notifications")
    return {"success": True}

class AddressCreate(BaseModel):
    name: str
    street: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.get("/api/addresses/user/{user_id}")
async def get_user_addresses(user_id: str):
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM addresses WHERE user_id = $1", user_id)
        return [dict(row) for row in rows]

@app.post("/api/addresses/")
async def create_address(user_id: str, addr: AddressCreate):
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO addresses (user_id, name, street, city, state, zip_code)
            VALUES ($1::uuid, $2, $3, $4, $5, $6)
            """, user_id, addr.name, addr.street, addr.city, addr.state, addr.zip_code
        )
        return {"success": True}

class MessageCreate(BaseModel):
    receiver_id: str
    order_id: Optional[str] = None
    subject: str
    content: str

@app.get("/api/messages/")
async def get_messages(user_id: Optional[str] = None):
    async with pool.acquire() as conn:
        if user_id:
            rows = await conn.fetch("SELECT m.*, u1.name as sender_name, u2.name as receiver_name FROM messages m JOIN users u1 ON m.sender_id = u1.id JOIN users u2 ON m.receiver_id = u2.id WHERE m.sender_id = $1 OR m.receiver_id = $1 ORDER BY m.created_at DESC", user_id)
        else:
            rows = await conn.fetch("SELECT m.*, u1.name as sender_name, u2.name as receiver_name FROM messages m JOIN users u1 ON m.sender_id = u1.id JOIN users u2 ON m.receiver_id = u2.id ORDER BY m.created_at DESC")
        return [dict(row) for row in rows]

@app.post("/api/messages/")
async def create_message(user_id: str, msg: MessageCreate):
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO messages (sender_id, receiver_id, order_id, subject, content)
            VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5) RETURNING *
            """, user_id, msg.receiver_id, msg.order_id, msg.subject, msg.content
        )
        return dict(row)
`;

newLines.splice(2200, 0, replacement);

fs.writeFileSync('bupzo-backend/app/main.py', newLines.join('\n'));
