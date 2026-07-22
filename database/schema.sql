-- CreateTable users
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "phone" VARCHAR(20) UNIQUE NOT NULL,
    "email" VARCHAR(255) UNIQUE,
    "is_premium" BOOLEAN NOT NULL DEFAULT FALSE,
    "signup_platform" VARCHAR(50) NOT NULL, -- WEB/APP
    "referred_by" INTEGER,
    "wallet_balance" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "privacy_accepted" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("referred_by") REFERENCES "users"("id")
);

-- CreateTable categories
CREATE TABLE "categories" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) UNIQUE NOT NULL
);

-- CreateTable sellers
CREATE TABLE "sellers" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER UNIQUE NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "commission_rate" DECIMAL(5, 2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING/APPROVED/REJECTED
    "kyc_details" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

-- CreateTable products
CREATE TABLE "products" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "weight_grams" INTEGER NOT NULL,
    "image_url" TEXT, -- S3 link
    "is_combo" BOOLEAN NOT NULL DEFAULT FALSE,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "seller_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id"),
    FOREIGN KEY ("seller_id") REFERENCES "sellers"("id")
);

-- CreateTable orders
CREATE TABLE "orders" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(10, 2) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "tracking_id" VARCHAR(255),
    "order_source" VARCHAR(50) NOT NULL, -- WEB/APP
    "shipping_partner" VARCHAR(100),
    "payment_gateway" VARCHAR(100),
    "trust_donation_amount" DECIMAL(10, 2) DEFAULT 0.00,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "exchange_rate" DECIMAL(10, 4) DEFAULT 1.0000,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id"),
    FOREIGN KEY ("seller_id") REFERENCES "sellers"("id")
);

-- CreateTable wallet_transactions
CREATE TABLE "wallet_transactions" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "type" VARCHAR(50) NOT NULL, -- REFERRAL, PURCHASE, TOPUP, REFUND, ADMIN_ADJUSTMENT
    "description" TEXT,
    "transaction_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

-- CreateTable payment_logs
CREATE TABLE "payment_logs" (
    "id" SERIAL PRIMARY KEY,
    "order_id" INTEGER NOT NULL,
    "gateway_name" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "transaction_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("order_id") REFERENCES "orders"("id")
);

-- CreateTable shipping_logs
CREATE TABLE "shipping_logs" (
    "id" SERIAL PRIMARY KEY,
    "order_id" INTEGER NOT NULL,
    "courier_partner" VARCHAR(100) NOT NULL,
    "shipping_cost" DECIMAL(10, 2) NOT NULL,
    "delivery_status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("order_id") REFERENCES "orders"("id")
);

-- Additional tables from requirements (simplified for boilerplate)
-- reviews, banners, system_alerts, coupons, audit_logs, seller_products, seller_payouts, referrals, product_views, spin_win_rewards, wishlist, flash_sales, admin_settings

CREATE TABLE "reviews" (
    "id" SERIAL PRIMARY KEY,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" TEXT,
    "image_urls" TEXT[], -- Array of S3 links
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("product_id") REFERENCES "products"("id"),
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE "banners" (
    "id" SERIAL PRIMARY KEY,
    "image_url" TEXT NOT NULL, -- S3
    "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "link_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "system_alerts" (
    "id" SERIAL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "start_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "coupons" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "discount_percent" DECIMAL(5, 2) NOT NULL,
    "is_premium_only" BOOLEAN NOT NULL DEFAULT FALSE,
    "expiry_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "usage_limit" INTEGER,
    "min_order_value" DECIMAL(10, 2)
);

CREATE TABLE "audit_logs" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER,
    "action" VARCHAR(255) NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many if a product can have multiple sellers, or if products are unique to sellers.
-- The current 'products' table design implies a product belongs to a single seller.
-- If a product can be sold by multiple sellers with different prices/stock, a 'seller_products' table would be needed.
-- For now, sticking to the 'products' table having a direct seller_id.

CREATE TABLE "seller_payouts" (
    "id" SERIAL PRIMARY KEY,
    "seller_id" INTEGER NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "status" VARCHAR(50) NOT NULL, -- PENDING, PROCESSED, FAILED
    "request_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "processed_date" TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY ("seller_id") REFERENCES "sellers"("id")
);

CREATE TABLE "referrals" (
    "id" SERIAL PRIMARY KEY,
    "referrer_id" INTEGER NOT NULL,
    "referee_id" INTEGER UNIQUE NOT NULL,
    "bonus_amount" DECIMAL(10, 2) NOT NULL,
    "status" VARCHAR(50) NOT NULL, -- PENDING, CLAIMED
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("referrer_id") REFERENCES "users"("id"),
    FOREIGN KEY ("referee_id") REFERENCES "users"("id")
);

CREATE TABLE "product_views" (
    "id" SERIAL PRIMARY KEY,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER, -- Can be NULL for anonymous views
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("product_id") REFERENCES "products"("id"),
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE "spin_win_rewards" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "reward_type" VARCHAR(100) NOT NULL, -- e.g., 'DISCOUNT', 'WALLET_CREDIT', 'FREE_SHIPPING'
    "reward_value" TEXT NOT NULL, -- e.g., '10%', '50.00', 'true'
    "claimed_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE "wishlist" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("user_id", "product_id"), -- A user can only add a product once to wishlist
    FOREIGN KEY ("user_id") REFERENCES "users"("id"),
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

CREATE TABLE "flash_sales" (
    "id" SERIAL PRIMARY KEY,
    "product_id" INTEGER NOT NULL,
    "discount_percent" DECIMAL(5, 2) NOT NULL,
    "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_time" TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

CREATE TABLE "admin_settings" (
    "key" VARCHAR(255) PRIMARY KEY,
    "value" TEXT NOT NULL
);