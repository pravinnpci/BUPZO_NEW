-- BUPZO Database Schema (PostgreSQL)
-- Port: 5433
-- Tables: users, categories, products, orders, wallet_transactions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    is_premium BOOLEAN DEFAULT FALSE,
    signup_platform VARCHAR(10) CHECK (signup_platform IN ('WEB', 'APP')),
    referred_by UUID REFERENCES users(id),
    wallet_balance DECIMAL(10, 2) DEFAULT 0,
    privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    weight_grams INTEGER NOT NULL,
    image_url TEXT,
    is_combo BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    seller_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    tracking_id VARCHAR(50),
    order_source VARCHAR(10) CHECK (order_source IN ('WEB', 'APP')),
    shipping_partner VARCHAR(50),
    payment_gateway VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Transactions Table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('REFERRAL', 'PURCHASE', 'TOPUP', 'REFUND')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Logs Table (for Super Admin analytics)
CREATE TABLE payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    gateway_response TEXT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shipping Logs Table (for Super Admin analytics)
CREATE TABLE shipping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    partner VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_wallet_user ON wallet_transactions(user_id);
CREATE INDEX idx_payment_order ON payment_logs(order_id);
CREATE INDEX idx_shipping_order ON shipping_logs(order_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp update triggers
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Insert sample data for testing
INSERT INTO categories (id, name, description) VALUES
(uuid_generate_v4(), 'Nagore Halwa', 'Authentic Halwa from Nagore, India'),
(uuid_generate_v4(), 'Dry Fruits', 'Organic Dry Fruits from Nagore'),
(uuid_generate_v4(), 'Electronics', 'Premium Electronics for Home'),
(uuid_generate_v4(), 'Home Appliances', 'Modern Home Appliances');

INSERT INTO users (id, phone, email, is_premium, signup_platform, wallet_balance, privacy_accepted) VALUES
(uuid_generate_v4(), '+919876543210', 'customer@example.com', FALSE, 'WEB', 500, TRUE),
(uuid_generate_v4(), '+919876543211', 'seller@example.com', TRUE, 'APP', 1000, TRUE),
(uuid_generate_v4(), '+919876543212', 'admin@example.com', TRUE, 'WEB', 10000, TRUE);

INSERT INTO products (id, name, category_id, price, weight_grams, image_url, stock_quantity, seller_id) VALUES
(uuid_generate_v4(), 'Kaju Katli', (SELECT id FROM categories WHERE name = 'Nagore Halwa'), 250, 250, 'https://example.com/kaju-katli.jpg', 50, (SELECT id FROM users WHERE phone = '+919876543211')),
(uuid_generate_v4(), 'Badam Halwa', (SELECT id FROM categories WHERE name = 'Nagore Halwa'), 180, 200, 'https://example.com/badam-halwa.jpg', 30, (SELECT id FROM users WHERE phone = '+919876543211')),
(uuid_generate_v4(), 'Cashew Fudge', (SELECT id FROM categories WHERE name = 'Dry Fruits'), 220, 150, 'https://example.com/cashew-fudge.jpg', 40, (SELECT id FROM users WHERE phone = '+919876543211'));