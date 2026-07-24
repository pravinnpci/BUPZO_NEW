import asyncio
import asyncpg
import uuid

async def main():
    conn = await asyncpg.connect('postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db')
    
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS seller_followers (
            id UUID PRIMARY KEY,
            seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    
    sellers = await conn.fetch("SELECT id FROM sellers")
    users = await conn.fetch("SELECT id FROM users")
    
    print(f"Found {len(sellers)} sellers and {len(users)} users.")
    
    if sellers and users:
        for idx, s in enumerate(sellers):
            # Add 2 to 4 followers per seller from real users table
            num_followers = (idx % 3) + 2
            for u_idx in range(min(num_followers, len(users))):
                u = users[(idx + u_idx) % len(users)]
                try:
                    await conn.execute(
                        "INSERT INTO seller_followers (id, seller_id, user_id) VALUES ($1, $2, $3)",
                        uuid.uuid4(), s['id'], u['id']
                    )
                except Exception as e:
                    pass
                    
    total = await conn.fetchval("SELECT COUNT(*) FROM seller_followers")
    print(f"Successfully initialized seller_followers table with {total} real database rows!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
