-- Seed Categories
INSERT INTO categories (id, name) VALUES 
('d04b1234-5678-abcd-ef01-1234567890ab', 'Nagore Specialties')
ON CONFLICT (name) DO NOTHING;

-- Seed Users
INSERT INTO users (id, phone, email, is_premium, signup_platform, referred_by, wallet_balance, privacy_accepted) VALUES 
('a01b1234-5678-abcd-ef01-1234567890aa', '+919876543210', 'admin@bupzo.com', true, 'WEB', null, 0.00, true),
('a01b1234-5678-abcd-ef01-1234567890ab', '+919876543211', 'seller@bupzo.com', false, 'WEB', null, 5000.00, true),
('a01b1234-5678-abcd-ef01-1234567890ac', '+919876543212', 'customer@bupzo.com', false, 'WEB', null, 250.00, true)
ON CONFLICT (phone) DO NOTHING;

-- Seed Sellers
INSERT INTO sellers (id, user_id, business_name, commission_rate, status, kyc_details) VALUES 
('c03b1234-5678-abcd-ef01-1234567890ab', 'a01b1234-5678-abcd-ef01-1234567890ab', 'Nagore Halwa Palace', 8.00, 'APPROVED', '{"gstin": "33AAAAA1111A1Z1", "fssai": "10022020000001"}')
ON CONFLICT (business_name) DO NOTHING;

-- Seed Products
INSERT INTO products (id, name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id, description) VALUES 
('e05b1234-5678-abcd-ef01-1234567890aa', 'Nagore Ghee Halwa', 'd04b1234-5678-abcd-ef01-1234567890ab', 299.00, 500.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', false, 150, 'c03b1234-5678-abcd-ef01-1234567890ab', 'Traditional wheat halwa loaded with cashew nuts and pure ghee.'),
('e05b1234-5678-abcd-ef01-1234567890ab', 'Premium Dry Fruit Combo', 'd04b1234-5678-abcd-ef01-1234567890ab', 799.00, 1000.00, 'https://images.unsplash.com/photo-1596560548464-f010689b771a?auto=format&fit=crop&w=400&q=80', true, 80, 'c03b1234-5678-abcd-ef01-1234567890ab', 'Perfect mix of almonds, cashews, raisins, and walnuts.')
ON CONFLICT DO NOTHING;
