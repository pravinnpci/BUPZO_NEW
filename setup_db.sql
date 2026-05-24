-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database user
CREATE USER bupzo_user WITH PASSWORD '${DB_PASSWORD:-bupzo_password}';
CREATE DATABASE bupzo_db WITH OWNER bupzo_user;

-- Create tables with optimized schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_premium BOOLEAN DEFAULT FALSE,
    signup_platform VARCHAR(50),
    referred_by UUID REFERENCES users(id),
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    privacy_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_phone CHECK (phone ~ '^[+]?[0-9\s\-()]{10,}$')
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    price DECIMAL(10, 2) NOT NULL,
    weight_grams INTEGER,
    image_url VARCHAR(512),
    is_combo BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    seller_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_price CHECK (price > 0)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    tracking_id VARCHAR(255),
    order_source VARCHAR(50),
    shipping_partner VARCHAR(50),
    payment_gateway VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_amount CHECK (total_amount > 0)
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_amount CHECK (amount BETWEEN -9999999999.99 AND 9999999999.99)
);

CREATE TABLE payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    gateway VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_payment_amount CHECK (amount > 0)
);

CREATE TABLE shipping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE RESTRICT,
    tracking_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    carrier VARCHAR(50) NOT NULL,
    estimated_delivery DATE,
    actual_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_delivery_date CHECK (estimated_delivery IS NOT NULL)
);

-- Create update_timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_wallet_transactions_timestamp
BEFORE UPDATE ON wallet_transactions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_payment_logs_timestamp
BEFORE UPDATE ON payment_logs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_shipping_logs_timestamp
BEFORE UPDATE ON shipping_logs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create indexes for performance optimization
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX idx_shipping_logs_order_id ON shipping_logs(order_id);
CREATE INDEX idx_shipping_logs_status ON shipping_logs(status);

-- Create sample data for testing
INSERT INTO users (phone, email, is_premium, signup_platform, wallet_balance)
VALUES
    ('+91 1234567890', 'user1@example.com', FALSE, 'web', 0.00),
    ('+91 9876543210', 'user2@example.com', TRUE, 'mobile', 500.00);

INSERT INTO categories (name, description)
VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Clothing', 'Men and women clothing'),
    ('Home & Kitchen', 'Home appliances and kitchenware');

INSERT INTO products (name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id)
VALUES
    ('Smartphone X', (SELECT id FROM categories WHERE name = 'Electronics'), 999.99, 150, 'https://example.com/smartphone.jpg', FALSE, 100, (SELECT id FROM users WHERE phone = '+91 1234567890')),
    ('Wireless Headphones', (SELECT id FROM categories WHERE name = 'Electronics'), 149.99, 100, 'https://example.com/headphones.jpg', FALSE, 50, (SELECT id FROM users WHERE phone = '+91 1234567890')),
    ('Cotton T-Shirt', (SELECT id FROM categories WHERE name = 'Clothing'), 49.99, 200, 'https://example.com/tshirt.jpg', FALSE, 200, (SELECT id FROM users WHERE phone = '+91 9876543210'));

INSERT INTO orders (user_id, total_amount, status, tracking_id, order_source, shipping_partner, payment_gateway)
VALUES
    ((SELECT id FROM users WHERE phone = '+91 1234567890'), 1000.00, 'Shipped', 'TRK-123456789', 'web', 'Shiprocket', 'Razorpay'),
    ((SELECT id FROM users WHERE phone = '+91 9876543210'), 500.00, 'Pending', 'TRK-987654321', 'mobile', 'NimbusPost', 'Cashfree');

INSERT INTO wallet_transactions (user_id, amount, type, description)
VALUES
    ((SELECT id FROM users WHERE phone = '+91 1234567890'), 100.00, 'deposit', 'Initial deposit'),
    ((SELECT id FROM users WHERE phone = '+91 1234567890'), -100.00, 'withdrawal', 'Order payment'),
    ((SELECT id FROM users WHERE phone = '+91 9876543210'), 500.00, 'deposit', 'Premium upgrade');

INSERT INTO payment_logs (order_id, user_id, amount, gateway, status, transaction_id)
VALUES
    ((SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE phone = '+91 1234567890') AND status = 'Shipped'), (SELECT id FROM users WHERE phone = '+91 1234567890'), 1000.00, 'Razorpay', 'completed', 'PAY-1234567890');

INSERT INTO shipping_logs (order_id, tracking_number, status, carrier, estimated_delivery)
VALUES
    ((SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE phone = '+91 1234567890') AND status = 'Shipped'), 'TRK-123456789', 'shipped', 'Shiprocket', '2023-12-15');