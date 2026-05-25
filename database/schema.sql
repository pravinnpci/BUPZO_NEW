-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    signup_platform TEXT CHECK (signup_platform IN ('WEB', 'APP')) NOT NULL,
    referred_by UUID REFERENCES users(id),
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT TRUE,
    bank_acc_for_refund TEXT,
    bank_ifsc_for_refund TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Sellers Table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    shop_name TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED')),
    commission_rate DECIMAL(5, 2) DEFAULT 0.05,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    price DECIMAL(10, 2) NOT NULL,
    weight_grams INT DEFAULT 500,
    image_url TEXT,
    is_combo BOOLEAN DEFAULT FALSE,
    stock_quantity INT DEFAULT 0,
    seller_id UUID REFERENCES sellers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES sellers(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
    tracking_id TEXT,
    order_source TEXT CHECK (order_source IN ('WEB', 'APP')) NOT NULL,
    shipping_partner TEXT,
    payment_gateway TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Wallets Table
CREATE TABLE wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Wallet Transactions Table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2),
    transaction_type TEXT CHECK (transaction_type IN ('REFERRAL', 'PURCHASE', 'TOPUP', 'REFUND', 'ADMIN_ADJUSTMENT', 'CASHBACK')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES users(id),
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Coupons Table
CREATE TABLE coupons (
    code TEXT PRIMARY KEY,
    discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100),
    is_premium_only BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    usage_limit INT DEFAULT 1,
    used_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Payment Logs Table
CREATE TABLE payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    gateway_name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    gateway_transaction_id TEXT
);

-- 12. Shipping Logs Table
CREATE TABLE shipping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    courier_partner TEXT NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL,
    delivery_status TEXT DEFAULT 'PENDING',
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Sales Stats Table
CREATE TABLE sales_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES sellers(id),
    date DATE NOT NULL,
    total_sales DECIMAL(10, 2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Banners Table
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    link_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Admin Settings Table
CREATE TABLE admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dummy Data Insertion

-- Categories
INSERT INTO categories (id, name, description, image_url) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Halwa', 'Delicious traditional Indian sweets from Nagore', 'https://picsum.photos/id/10/200/300'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Dry Fruits', 'Premium quality dry fruits and nuts', 'https://picsum.photos/id/11/200/300'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Toys', 'Educational and fun toys for all ages', 'https://picsum.photos/id/12/200/300'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Electronics', 'Latest gadgets and home electronics', 'https://picsum.photos/id/13/200/300'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Ceramics', 'Handcrafted ceramic items for home decor', 'https://picsum.photos/id/14/200/300'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Home Appliances', 'Essential home appliances for daily use', 'https://picsum.photos/id/15/200/300');

-- Users
INSERT INTO users (id, phone_number, email, full_name, is_premium, signup_platform, privacy_policy_accepted, marketing_consent) VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '+919876543210', 'superadmin@bupzo.com', 'BUPZO Super Admin', TRUE, 'WEB', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '+919876543211', 'halwaseller@bupzo.com', 'Halwa Seller', FALSE, 'WEB', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '+919876543212', 'toyseller@bupzo.com', 'Toy Seller', FALSE, 'APP', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '+919876543213', 'premiumuser@bupzo.com', 'Premium Customer', TRUE, 'APP', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '+919876543214', 'normaluser1@bupzo.com', 'Normal Customer 1', FALSE, 'WEB', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '+919876543215', 'normaluser2@bupzo.com', 'Normal Customer 2', FALSE, 'APP', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '+919876543216', 'normaluser3@bupzo.com', 'Normal Customer 3', FALSE, 'WEB', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '+919876543217', 'normaluser4@bupzo.com', 'Normal Customer 4', FALSE, 'APP', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '+919876543218', 'normaluser5@bupzo.com', 'Normal Customer 5', FALSE, 'WEB', TRUE, TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', '+919876543219', 'premiumuser2@bupzo.com', 'Premium Customer 2', TRUE, 'APP', TRUE, TRUE);

-- Wallets
INSERT INTO wallets (user_id, balance) VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 1000.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 50.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 25.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 150.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 5.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 0.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 0.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 0.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 0.00),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 100.00);

-- Sellers
INSERT INTO sellers (id, user_id, shop_name, status, commission_rate) VALUES
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Nagore Halwa House', 'ACTIVE', 0.07),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Funky Toys Store', 'ACTIVE', 0.08),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Premium Home Appliances', 'PENDING', 0.10);

-- Products
INSERT INTO products (id, name, description, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id) VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Nagore Special Ghee Halwa 500g', 'Rich and authentic ghee halwa from Nagore', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 450.00, 500, 'https://picsum.photos/id/101/200/300', FALSE, 100, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Premium Mixed Dry Fruits 1kg', 'Assorted dry fruits for a healthy snack', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 999.00, 1000, 'https://picsum.photos/id/102/200/300', FALSE, 50, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Educational Building Blocks Set', 'Colorful blocks for creative learning', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 750.00, 1200, 'https://picsum.photos/id/103/200/300', FALSE, 200, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Wireless Bluetooth Earbuds', 'High-quality sound with long battery life', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 1299.00, 150, 'https://picsum.photos/id/104/200/300', FALSE, 300, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Halwa & Dry Fruits Combo', 'Special combo pack of Nagore Halwa and Dry Fruits', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1300.00, 1500, 'https://picsum.photos/id/105/200/300', TRUE, 30, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'Smart LED Bulb', 'Energy-efficient LED bulb with smart features', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 499.00, 200, 'https://picsum.photos/id/106/200/300', FALSE, 150, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'Ceramic Wall Art', 'Handcrafted ceramic piece for home decor', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 299.00, 800, 'https://picsum.photos/id/107/200/300', FALSE, 75, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'Induction Cooktop', 'Fast and efficient cooking with induction technology', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 3999.00, 15000, 'https://picsum.photos/id/108/200/300', FALSE, 10, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'Kids Learning Tablet', 'Educational tablet for children with interactive games', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1499.00, 400, 'https://picsum.photos/id/109/200/300', FALSE, 40, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Ghee Roasted Cashews 250g', 'Premium quality cashews roasted in ghee', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 350.00, 250, 'https://picsum.photos/id/110/200/300', FALSE, 80, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01');

-- Orders
INSERT INTO orders (id, user_id, seller_id, total_amount, status, tracking_id, order_source, shipping_partner, payment_gateway) VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 1300.00, 'DELIVERED', 'TRK123456789', 'APP', 'Shiprocket', 'Razorpay'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 450.00, 'SHIPPED', 'TRK987654321', 'WEB', 'NimbusPost', 'Cashfree'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 750.00, 'PROCESSING', 'TRK112233445', 'APP', 'Delhivery', 'PhonePe'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 1299.00, 'PENDING', 'TRK556677889', 'WEB', 'Shiprocket', 'Razorpay');

-- Order Items
INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 1, 1300.00),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 1, 450.00),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 1, 750.00),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 1, 1299.00);

-- Wallet Transactions
INSERT INTO wallet_transactions (user_id, amount, transaction_type, description) VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 10.00, 'REFERRAL', 'Referral bonus from friend'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 5.00, 'REFERRAL', 'Welcome referral bonus'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 100.00, 'ADMIN_ADJUSTMENT', 'Admin top-up'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 1300.00, 'PURCHASE', 'Order #e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 450.00, 'PURCHASE', 'Order #e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02');

-- Reviews
INSERT INTO reviews (product_id, user_id, rating, comment, image_urls) VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 5, 'Absolutely delicious! Authentic Nagore taste.', '{}'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 4, 'My kids love these blocks. Good quality.', '{}'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 5, 'Great sound quality and comfortable fit.', '{}'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 3, 'Combo is okay, but could be better.', '{}');

-- Coupons
INSERT INTO coupons (code, discount_percent, is_premium_only, expiry_date, usage_limit) VALUES
    ('PREMIUMHALWA10', 10, TRUE, '2025-12-31', 100),
    ('BUPZOWELCOME5', 5, FALSE, '2024-12-31', 500),
    ('SUMMER2024', 15, FALSE, '2024-08-31', 200),
    ('PREMIUMELECTRONICS10', 10, TRUE, '2025-06-30', 50);

-- Payment Logs
INSERT INTO payment_logs (order_id, gateway_name, amount, status, gateway_transaction_id) VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Razorpay', 1300.00, 'SUCCESS', 'PAYID12345'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Cashfree', 450.00, 'SUCCESS', 'CFID67890'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'PhonePe', 750.00, 'PENDING', 'PPID12345'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Razorpay', 1299.00, 'PENDING', 'PAYID67890');

-- Shipping Logs
INSERT INTO shipping_logs (order_id, courier_partner, shipping_cost, delivery_status, tracking_url) VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Shiprocket', 55.00, 'DELIVERED', 'https://shiprocket.com/track/TRK123456789'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'NimbusPost', 45.00, 'SHIPPED', 'https://nimbuspost.com/track/TRK987654321'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Delhivery', 60.00, 'PENDING', 'https://delhivery.com/track/TRK112233445'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Shiprocket', 75.00, 'PENDING', 'https://shiprocket.com/track/TRK556677889');

-- Banners
INSERT INTO banners (image_url, title, description, link_url, start_date, end_date, is_active) VALUES
    ('https://picsum.photos/id/200/1200/400', 'Grand Diwali Sale!', 'Get up to 50% off on all Nagore sweets.', '/category/halwa', '2024-10-01 00:00:00+00', '2024-11-15 23:59:59+00', TRUE),
    ('https://picsum.photos/id/201/1200/400', 'New Arrivals: Smart Toys', 'Explore the latest collection of educational toys.', '/category/toys', '2024-09-01 00:00:00+00', '2025-01-01 00:00:00+00', TRUE),
    ('https://picsum.photos/id/202/1200/400', 'Summer Discounts', 'Enjoy special discounts on electronics and home appliances.', '/category/electronics', '2024-06-01 00:00:00+00', '2024-09-30 23:59:59+00', TRUE);

-- Admin Settings
INSERT INTO admin_settings (key, value) VALUES
    ('site_name', 'BUPZO'),
    ('site_tagline', 'Your Trusted Multi-Vendor Marketplace'),
    ('site_logo_url', 'https://picsum.photos/id/100/200/200'),
    ('site_favicon_url', 'https://picsum.photos/id/100/32/32'),
    ('default_currency', 'INR'),
    ('default_language', 'en'),
    ('support_email', 'support@bupzo.com'),
    ('support_phone', '+919876543210');