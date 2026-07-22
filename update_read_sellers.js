const fs = require('fs');
let content = fs.readFileSync('bupzo-backend/app/main.py', 'utf8');

// Find the query in read_sellers
content = content.replace(
    'query = "SELECT id, user_id, business_name, commission_rate, status, kyc_details, created_at, updated_at FROM sellers"',
    'query = "SELECT s.id, s.user_id, s.business_name, s.commission_rate, s.status, s.kyc_details, s.created_at, s.updated_at, u.name as user_name, u.email as user_email, u.phone as user_phone FROM sellers s JOIN users u ON s.user_id = u.id"'
);

// Add the fields to the processed list
content = content.replace(
    /(\s+)"status": row\['status'\],(\s+)"kyc_details": kyc,/g,
    '$1"status": row[\'status\'],$2"kyc_details": kyc,$2"user_name": row["user_name"],$2"user_email": row["user_email"],$2"user_phone": row["user_phone"],'
);

fs.writeFileSync('bupzo-backend/app/main.py', content);
