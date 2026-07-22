import requests
import sys

res = requests.post("http://localhost:8004/api/products/", json={
    "name": "test",
    "category_id": "d04b1234-5678-abcd-ef01-1234567890ab",
    "price": 100,
    "weight_grams": 100,
    "is_combo": False,
    "stock_quantity": 10,
    "seller_id": "60f0baa7-dd45-46b5-b998-d46978f38890",
    "description": "test"
})
print(res.status_code)
print(res.text)
