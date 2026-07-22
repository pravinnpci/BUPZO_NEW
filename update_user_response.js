const fs = require('fs');
let content = fs.readFileSync('bupzo-backend/app/main.py', 'utf8');

content = content.replace(
    '           CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_seller',
    '           CASE WHEN s.status = \'APPROVED\' THEN TRUE ELSE FALSE END AS is_seller,\n           s.status as seller_status'
);

content = content.replace(
    'class UserResponse(BaseModel):',
    'class UserResponse(BaseModel):\n    seller_status: Optional[str] = None'
);

fs.writeFileSync('bupzo-backend/app/main.py', content);
