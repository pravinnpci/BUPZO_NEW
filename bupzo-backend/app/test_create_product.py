import asyncio
from uuid import uuid4
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        payload = {
            "name": "Test Product",
            "category_id": "00000000-0000-0000-0000-000000000000",
            "price": 100,
            "weight_grams": 100,
            "image_url": "test",
            "is_combo": False,
            "stock_quantity": 10,
            "seller_id": "00000000-0000-0000-0000-000000000000",
            "description": "test"
        }
        res = await client.post("http://localhost:8004/api/products/", json=payload)
        print("Status:", res.status_code)
        print("Body:", res.text)

asyncio.run(main())
