from pydantic import BaseModel, ValidationError
from typing import List, Optional
from uuid import UUID, uuid4

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int

class OrderCreate(BaseModel):
    user_id: UUID
    seller_id: UUID
    items: List[OrderItemCreate]
    total_amount: float
    order_source: str # 'WEB' or 'APP'
    shipping_partner: Optional[str] = None
    payment_gateway: Optional[str] = None
    trust_donation_amount: float = 0.00
    currency: str = "ZAR"
    exchange_rate: float = 1.000000

payload = {
    "user_id": str(uuid4()),
    "seller_id": str(uuid4()),
    "items": [{"product_id": str(uuid4()), "quantity": 1}],
    "total_amount": 845.46,
    "order_source": "WEB",
    "payment_gateway": "Razorpay"
}

try:
    OrderCreate(**payload)
    print("Payload is valid!")
except ValidationError as e:
    print(e.json())
