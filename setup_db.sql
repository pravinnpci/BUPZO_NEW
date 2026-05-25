-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_timestamp function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    is_premium BOOLEAN DEFAULT FALSE,
    signup_platform VARCHAR(10) CHECK (signup_platform IN ('WEB', 'APP')),
    referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    privacy_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    weight_grams INTEGER NOT NULL,
    image_url TEXT,
    is_combo BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
    tracking_id VARCHAR(100),
    order_source VARCHAR(10) CHECK (order_source IN ('WEB', 'APP')),
    shipping_partner VARCHAR(50),
    payment_gateway VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('REFERRAL', 'PURCHASE', 'TOPUP', 'REFUND', 'CASHBACK')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment logs table for super admin analytics
CREATE TABLE payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    gateway VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    response_code VARCHAR(20),
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping logs table for super admin analytics
CREATE TABLE shipping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    partner VARCHAR(50) NOT NULL,
    tracking_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    estimated_delivery DATE,
    actual_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_users_is_premium ON users(is_premium);
CREATE INDEX idx_products_is_combo ON products(is_combo);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX idx_shipping_logs_order_id ON shipping_logs(order_id);

-- Create triggers for automatic timestamp updates
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

CREATE TRIGGER update_shipping_logs_timestamp
BEFORE UPDATE ON shipping_logs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Seed sample data for local development
INSERT INTO users (id, phone, email, is_premium, signup_platform, wallet_balance, privacy_accepted)
VALUES
    ('11111111-1111-1111-1111-111111111111', '+919876543210', 'customer@bupzo.com', FALSE, 'WEB', 150.00, TRUE),
    ('22222222-2222-2222-2222-222222222222', '+919812345678', 'seller@bupzo.com', TRUE, 'WEB', 0.00, TRUE);

INSERT INTO categories (id, name, description)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dry Fruits', 'Premium imported dry fruits and packed nuts.'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Halwa', 'Artisanal halwa made with traditional recipes.'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Spices', 'Freshly ground herbs and spice blends for every recipe.'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Gift Sets', 'Curated gourmet gift packages for every celebration.');

INSERT INTO products (id, name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Premium Mixed Dry Fruits Gift Box', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 349.00, 500, 'https://images.unsplash.com/photo-1598214886806-c2896e899622?auto=format&fit=crop&w=600&q=80', FALSE, 120, '22222222-2222-2222-2222-222222222222'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Traditional Gajar Halwa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 199.00, 400, 'https://images.unsplash.com/photo-1604328108342-234b40f09003?auto=format&fit=crop&w=600&q=80', FALSE, 80, '22222222-2222-2222-2222-222222222222'),
    ('11111111-2222-3333-4444-555555555555', 'Saffron-Infused Spice Kit', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 179.00, 250, 'https://images.unsplash.com/photo-1581092580960-959e007056c9?auto=format&fit=crop&w=600&q=80', FALSE, 150, '22222222-2222-2222-2222-222222222222'),
    ('66666666-7777-8888-9999-000000000000', 'Festive Gourmet Gift Hamper', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 699.00, 1200, 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=600&q=80', FALSE, 40, '22222222-2222-2222-2222-222222222222');

INSERT INTO orders (id, user_id, total_amount, status, tracking_id, order_source, shipping_partner, payment_gateway)
VALUES
    ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 548.00, 'DELIVERED', 'BUPZO2345', 'WEB', 'Shiprocket', 'Razorpay');

INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase)
VALUES
    ('88888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1, 349.00),
    ('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 199.00);

INSERT INTO payment_logs (id, order_id, gateway, transaction_id, amount, status, response_code, response_message)
VALUES
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'Razorpay', 'TRX-784321', 548.00, 'SUCCESS', '00', 'Payment processed successfully.');

INSERT INTO shipping_logs (id, order_id, partner, tracking_id, status, estimated_delivery, actual_delivery)
VALUES
    ('ffffeeee-dddd-cccc-bbbb-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777777', 'Shiprocket', 'SR123456789', 'DELIVERED', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days');

INSERT INTO wallet_transactions (id, user_id, amount, type, description)
VALUES
    ('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '11111111-1111-1111-1111-111111111111', 150.00, 'CASHBACK', 'Festival cashback bonus.');