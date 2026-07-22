import re

with open('bupzo-backend/app/main.py', 'r') as f:
    content = f.read()

# Fix uuid4() -> str(uuid4()) for all INSERT INTO notifications
content = re.sub(
    r'(INSERT INTO notifications.*?VALUES \(\$1.*?\n\s+)uuid4\(\),',
    r'\1str(uuid4()),',
    content,
    flags=re.MULTILINE
)

# Also fix str(order_id) in create_checkout specifically
content = content.replace(
    'f"{seller_name} has a paid order {order_id} ready to process.",\n                "orders",\n                order_id,',
    'f"{seller_name} has a paid order {order_id} ready to process.",\n                "orders",\n                str(order_id),'
)

with open('bupzo-backend/app/main.py', 'w') as f:
    f.write(content)
