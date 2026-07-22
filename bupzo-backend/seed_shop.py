import asyncio
import os
from dotenv import load_dotenv
import asyncpg
import uuid
import random

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/bupzo")

async def seed_shop():
    conn = await asyncpg.connect(DATABASE_URL)
    
    # 1. Create a dummy user who will own the shop
    user_id = str(uuid.uuid4())
    await conn.execute("""
        INSERT INTO users (id, phone, name, email, is_premium, signup_platform) 
        VALUES ($1, $2, $3, $4, true, 'WEB')
    """, user_id, '+919999999999', 'Falcon Fateh Admin', 'falcon@example.com')
    
    # 2. Create the Seller shop
    seller_id = str(uuid.uuid4())
    await conn.execute("""
        INSERT INTO sellers (id, user_id, business_name)
        VALUES ($1, $2, $3)
    """, seller_id, user_id, 'Falcon_Fateh')
    
    # 3. Add products to the shop
    images = [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
        "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=500",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500"
    ]
    product_names = [
        "Elegant Bedsheets", "Alluring Bedsheets", "Stylish Bedsheets", "Voguish Bedsheets",
        "Gorgeous Bedsheets", "Ravishing Bedsheets", "Fashionable Bedsheets", "Elite Bedsheets"
    ]
    prices = [309, 210, 281, 221, 294, 321, 227, 301]
    
    product_ids = []
    
    for i in range(8):
        pid = str(uuid.uuid4())
        product_ids.append(pid)
        await conn.execute("""
            INSERT INTO products (id, seller_id, name, description, price, stock, category_id, image_url, is_approved)
            VALUES ($1, $2, $3, $4, $5, $6, (SELECT id FROM categories LIMIT 1), $7, true)
        """, pid, seller_id, product_names[i], f"High quality {product_names[i]}", prices[i], 100, images[i%5])
    
    # 4. Add fake reviews to these products so the stats page looks lively
    reviewer_ids = []
    for i in range(5):
        rid = str(uuid.uuid4())
        reviewer_ids.append(rid)
        await conn.execute("""
            INSERT INTO users (id, phone, name, email, signup_platform) 
            VALUES ($1, $2, $3, $4, 'WEB')
        """, rid, f'+91888888888{i}', f'Customer {i}', f'cust{i}@test.com')
        
    for pid in product_ids:
        # Give 5-10 random reviews per product
        for _ in range(random.randint(3, 7)):
            reviewer = random.choice(reviewer_ids)
            rating = random.choices([5, 4, 3, 2, 1], weights=[50, 30, 10, 5, 5])[0]
            try:
                await conn.execute("""
                    INSERT INTO reviews (user_id, product_id, rating, content)
                    VALUES ($1, $2, $3, $4)
                """, reviewer, pid, rating, f"Great product! Rating: {rating}")
            except Exception:
                pass # ignore duplicates

    print(f"Seed complete. Shop ID: {seller_id}")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(seed_shop())
