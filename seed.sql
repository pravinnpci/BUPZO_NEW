ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_approved" BOOLEAN DEFAULT TRUE;

-- Insert 5 Categories
INSERT INTO "categories" (name) VALUES 
('Electronics'),
('Fashion'),
('Home & Kitchen'),
('Beauty'),
('Sports & Outdoors')
ON CONFLICT DO NOTHING;

-- Insert 5 Users
INSERT INTO "users" (phone, email, signup_platform, password_hash, is_premium, wallet_balance, privacy_accepted) VALUES
('+918888888881', 'cust1@example.com', 'WEB', '$2b$12$R.K1eZ12sW4QO5L/v3.0.ee8q15E9u2s62.T9C0.h2QyN9qL93YmC', true, 1500.00, true),
('+918888888882', 'cust2@example.com', 'WEB', '$2b$12$R.K1eZ12sW4QO5L/v3.0.ee8q15E9u2s62.T9C0.h2QyN9qL93YmC', false, 100.00, true),
('+918888888883', 'cust3@example.com', 'WEB', '$2b$12$R.K1eZ12sW4QO5L/v3.0.ee8q15E9u2s62.T9C0.h2QyN9qL93YmC', true, 2000.00, true),
('+918888888884', 'cust4@example.com', 'WEB', '$2b$12$R.K1eZ12sW4QO5L/v3.0.ee8q15E9u2s62.T9C0.h2QyN9qL93YmC', false, 0.00, true),
('+918888888885', 'cust5@example.com', 'WEB', '$2b$12$R.K1eZ12sW4QO5L/v3.0.ee8q15E9u2s62.T9C0.h2QyN9qL93YmC', true, 500.00, true)
ON CONFLICT DO NOTHING;

-- Get User IDs and insert 5 Sellers
INSERT INTO "sellers" (user_id, business_name, commission_rate, status)
SELECT id, 'Store ' || id, 5.00, 'APPROVED'
FROM "users"
WHERE email LIKE 'cust%@example.com'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert 5 Products
INSERT INTO "products" (name, category_id, price, weight_grams, image_url, stock_quantity, seller_id, is_approved)
SELECT 'Product ' || s.id, (SELECT id FROM categories LIMIT 1), 999.00, 500, 'https://via.placeholder.com/400x400.png', 100, s.id, TRUE
FROM sellers s
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert 5 Orders
INSERT INTO "orders" (user_id, seller_id, total_amount, status, order_source, shipping_partner, payment_gateway, trust_donation_amount)
SELECT u.id, s.id, 999.00, 'paid', 'WEB', 'Delhivery', 'Stitch', 2.00
FROM users u
JOIN sellers s ON s.id = (SELECT id FROM sellers LIMIT 1)
WHERE u.email LIKE 'cust%@example.com'
LIMIT 5
ON CONFLICT DO NOTHING;
