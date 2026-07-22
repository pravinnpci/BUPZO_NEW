import asyncio
import asyncpg
import os
import uuid
import random

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db")

async def seed_data():
    conn = await asyncpg.connect(DATABASE_URL)
    
    # 1. Fetch Users and Products
    users = await conn.fetch("SELECT id FROM users LIMIT 10")
    if not users:
        print("No users found to seed.")
        await conn.close()
        return

    products = await conn.fetch("SELECT id FROM products LIMIT 10")
    if not products:
        print("No products found to seed.")
        await conn.close()
        return

    orders = await conn.fetch("SELECT id FROM orders LIMIT 10")
    
    print(f"Fetched {len(users)} users, {len(products)} products, {len(orders)} orders.")
    
    user_ids = [u['id'] for u in users]
    product_ids = [p['id'] for p in products]
    order_ids = [o['id'] for o in orders] if orders else [None]

    # Drop and recreate tables
    await conn.execute("DROP TABLE IF EXISTS messages CASCADE;")
    await conn.execute("DROP TABLE IF EXISTS reviews CASCADE;")

    await conn.execute("""
        CREATE TABLE messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
            subject VARCHAR(255),
            content TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)

    await conn.execute("""
        CREATE TABLE reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            title VARCHAR(255),
            content TEXT,
            helpful_votes INT DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(product_id, user_id)
        );
    """)

    # Seed Reviews
    print("Seeding Reviews...")
    for prod_id in product_ids:
        # 3 reviews per product
        for i in range(3):
            u_id = random.choice(user_ids)
            rating = random.choice([4, 5, 5, 3, 4])
            try:
                await conn.execute(
                    """
                    INSERT INTO reviews (id, product_id, user_id, rating, title, content)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (product_id, user_id) DO NOTHING
                    """,
                    uuid.uuid4(), prod_id, u_id, rating, "Great Product!", "I really enjoyed using this product. Highly recommend!"
                )
            except Exception as e:
                print(f"Error inserting review: {e}")

    # Seed Messages
    print("Seeding Messages...")
    for i in range(10):
        sender_id = random.choice(user_ids)
        receiver_id = random.choice([u for u in user_ids if u != sender_id] or user_ids)
        order_id = random.choice(order_ids)
        try:
            await conn.execute(
                """
                INSERT INTO messages (id, sender_id, receiver_id, order_id, subject, content)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                uuid.uuid4(), sender_id, receiver_id, order_id, f"Inquiry regarding Order {order_id}", "Hello, I have a question about my order. Please get back to me."
            )
        except Exception as e:
            print(f"Error inserting message: {e}")
            
    print("Seeding completed successfully.")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
