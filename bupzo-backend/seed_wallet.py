import asyncio
import os
import asyncpg
from uuid import uuid4

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bupzo_user:bupzo_password@localhost:5435/bupzo_db")

async def seed():
    conn = await asyncpg.connect(DATABASE_URL)
    # Get a user
    user = await conn.fetchrow("SELECT id FROM users LIMIT 1")
    if not user:
        print("No users found. Please create a user first.")
        return
    user_id = user['id']

    for i in range(5):
        await conn.execute("""
            INSERT INTO wallet_transactions (id, user_id, amount, type, description)
            VALUES ($1, $2, $3, $4, $5)
        """, str(uuid4()), user_id, 100.0 * (i+1), "TOPUP", f"Sample Wallet Load {i+1}")
        
    print("5 sample wallet transactions added!")
    await conn.close()

asyncio.run(seed())
