const { Pool } = require('pg');
const Redis = require('ioredis');
const mcp = require('@modelcontextprotocol/server');
const { getGenerativeModel } = require('./agent');
// Environment variables are loaded via docker-compose
// require('dotenv').config({ path: '../../.env.local' });

// Database connection pool
const pool = new Pool({
  user: 'bupzo_user',
  host: 'db', // Docker service name
  database: 'bupzo_db',
  password: 'bupzo_password',
  port: 5432, // Default PostgreSQL port inside Docker
});

// Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379'); // Docker service name

// Connection event listeners
pool.on('connect', () => {
  console.log('MCP: PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('MCP: PostgreSQL error:', err);
});

redis.on('connect', () => {
  console.log('MCP: Redis connected');
});

redis.on('error', (err) => {
  console.error('MCP: Redis error:', err);
});

const server = mcp.createServer({
  model: getGenerativeModel(),
  tools: [
    {
      name: 'get_bupzo_orders',
      description: 'Get orders from BUPZO database for a given user, optionally filtered by status.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'The UUID of the user' },
          status: { type: 'string', description: 'Optional: Filter orders by status (e.g., PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED)' },
        },
        required: ['user_id'],
      },
      execute: async ({ user_id, status }) => {
        try {
          let query = `
            SELECT o.id, o.user_id, o.seller_id, o.total_amount, o.status,
                   o.tracking_id, o.order_source, o.shipping_partner,
                   o.payment_gateway, o.created_at, o.updated_at,
                   json_agg(
                     json_build_object(
                       'id', oi.id,
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price
                     )
                   ) as order_items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = $1
          `;
          const params = [user_id];
          if (status) {
            query += ` AND o.status = $${params.length + 1}`;
            params.push(status);
          }
          query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

          const { rows } = await pool.query(query, params);

          return {
            success: true,
            orders: rows.map(row => ({
              id: row.id,
              user_id: row.user_id,
              seller_id: row.seller_id,
              total_amount: parseFloat(row.total_amount),
              status: row.status,
              tracking_id: row.tracking_id,
              order_source: row.order_source,
              shipping_partner: row.shipping_partner,
              payment_gateway: row.payment_gateway,
              created_at: row.created_at,
              updated_at: row.updated_at,
              order_items: row.order_items || []
            }))
          };
        } catch (error) {
          console.error('MCP Tool Error: get_bupzo_orders', error);
          return { success: false, error: error.message };
        }
      },
    },
    {
      name: 'get_wallet_balance',
      description: 'Get a user\'s current wallet balance from the BUPZO database.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'The UUID of the user' },
        },
        required: ['user_id'],
      },
      execute: async ({ user_id }) => {
        try {
          const { rows } = await pool.query('SELECT balance FROM wallets WHERE user_id = $1', [user_id]);
          if (rows.length === 0) {
            return { success: false, error: 'Wallet not found for user.' };
          }
          return { success: true, balance: parseFloat(rows[0].balance) };
        } catch (error) {
          console.error('MCP Tool Error: get_wallet_balance', error);
          return { success: false, error: error.message };
        }
      },
    },
    {
      name: 'apply_coupon',
      description: 'Applies a coupon code to an order amount, considering user premium status and coupon validity. Returns the discounted amount.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'The UUID of the user applying the coupon' },
          coupon_code: { type: 'string', description: 'The coupon code to apply' },
          order_amount: { type: 'number', description: 'The original total amount of the order before discount' },
        },
        required: ['user_id', 'coupon_code', 'order_amount'],
      },
      execute: async ({ user_id, coupon_code, order_amount }) => {
        try {
          const couponRes = await pool.query('SELECT * FROM coupons WHERE code = $1', [coupon_code]);
          if (couponRes.rows.length === 0) {
            return { success: false, error: 'Coupon not found or invalid.' };
          }
          const coupon = couponRes.rows[0];

          if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return { success: false, error: 'Coupon has expired.' };
          }
          if (coupon.used_count >= coupon.usage_limit) {
            return { success: false, error: 'Coupon has reached its usage limit.' };
          }

          const userRes = await pool.query('SELECT is_premium FROM users WHERE id = $1', [user_id]);
          const isPremiumUser = userRes.rows[0]?.is_premium || false;

          if (coupon.is_premium_only && !isPremiumUser) {
            return { success: false, error: 'This coupon is for premium users only.' };
          }

          const discountAmount = (order_amount * coupon.discount_percent) / 100;
          const finalAmount = order_amount - discountAmount;

          return {
            success: true,
            original_amount: order_amount,
            discount_percent: coupon.discount_percent,
            discount_amount: discountAmount,
            final_amount: finalAmount,
          };
        } catch (error) {
          console.error('MCP Tool Error: apply_coupon', error);
          return { success: false, error: error.message };
        }
      },
    },
    {
      name: 'get_shipping_rates',
      description: 'Get shipping rates from multiple aggregators based on weight, pincode, and user premium status. Premium users get 50% discount.',
      parameters: {
        type: 'object',
        properties: {
          weight_grams: { type: 'number', description: 'Total weight of the order in grams' },
          pincode: { type: 'string', description: 'Destination pincode for delivery' },
          user_id: { type: 'string', description: 'The UUID of the user to check premium status' },
        },
        required: ['weight_grams', 'pincode', 'user_id'],
      },
      execute: async ({ weight_grams, pincode, user_id }) => {
        try {
          const userRes = await pool.query('SELECT is_premium FROM users WHERE id = $1', [user_id]);
          const isPremiumUser = userRes.rows[0]?.is_premium || false;

          const baseRate = Math.max(50, weight_grams / 100) * 10; // Example base rate calculation
          const discountFactor = isPremiumUser ? 0.5 : 1; // 50% discount for premium

          const rates = [
            { partner: 'Shiprocket', cost: baseRate * 0.9 * discountFactor, delivery_time: '3-5 days' },
            { partner: 'NimbusPost', cost: baseRate * 0.95 * discountFactor, delivery_time: '4-6 days' },
            { partner: 'Delhivery', cost: baseRate * 0.85 * discountFactor, delivery_time: '5-7 days' },
          ];

          return { success: true, rates };
        } catch (error) {
          console.error('MCP Tool Error: get_shipping_rates', error);
          return { success: false, error: error.message };
        }
      },
    },
    {
      name: 'send_whatsapp_update',
      description: 'Sends a WhatsApp message to a user using Meta Cloud API. Used for order updates.',
      parameters: {
        type: 'object',
        properties: {
          phone_number: { type: 'string', description: 'Recipient\'s phone number with country code (e.g., +919876543210)' },
          message: { type: 'string', description: 'The message content to send' },
        },
        required: ['phone_number', 'message'],
      },
      execute: async ({ phone_number, message }) => {
        // This is a mock implementation. In a real scenario, you would integrate with Meta Cloud API.
        console.log(`MCP Tool: Sending WhatsApp to ${phone_number}: "${message}"`);
        return { success: true, status: 'Message sent (mock)', phone_number, message };
      },
    },
    {
      name: 'find_products',
      description: 'Searches for products in the BUPZO database with various filters.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term for product name or description' },
          category_id: { type: 'string', description: 'Optional: Filter by category UUID' },
          price_min: { type: 'number', description: 'Optional: Minimum price' },
          price_max: { type: 'number', description: 'Optional: Maximum price' },
          is_combo: { type: 'boolean', description: 'Optional: Filter for combo products' },
          seller_id: { type: 'string', description: 'Optional: Filter by seller UUID' },
          sort_by: { type: 'string', enum: ['new_arrivals', 'price_asc', 'price_desc', 'name_asc', 'name_desc'], description: 'Optional: Sort order' },
        },
        required: ['query'],
      },
      execute: async ({ query, category_id, price_min, price_max, is_combo, seller_id, sort_by }) => {
        try {
          let sql = `SELECT id, name, description, price, weight_grams, image_url, is_combo, category_id, seller_id FROM products WHERE name ILIKE $1 OR description ILIKE $1`;
          const params = [`%${query}%`];
          let paramIndex = 2;

          if (category_id) { sql += ` AND category_id = $${paramIndex++}`; params.push(category_id); }
          if (price_min !== undefined) { sql += ` AND price >= $${paramIndex++}`; params.push(price_min); }
          if (price_max !== undefined) { sql += ` AND price <= $${paramIndex++}`; params.push(price_max); }
          if (is_combo !== undefined) { sql += ` AND is_combo = $${paramIndex++}`; params.push(is_combo); }
          if (seller_id) { sql += ` AND seller_id = $${paramIndex++}`; params.push(seller_id); }

          switch (sort_by) {
            case 'new_arrivals': sql += ` ORDER BY created_at DESC`; break;
            case 'price_asc': sql += ` ORDER BY price ASC`; break;
            case 'price_desc': sql += ` ORDER BY price DESC`; break;
            case 'name_asc': sql += ` ORDER BY name ASC`; break;
            case 'name_desc': sql += ` ORDER BY name DESC`; break;
            default: sql += ` ORDER BY created_at DESC`; break;
          }

          const { rows } = await pool.query(sql, params);
          return { success: true, products: rows.map(p => ({ ...p, price: parseFloat(p.price) })) };
        } catch (error) {
          console.error('MCP Tool Error: find_products', error);
          return { success: false, error: error.message };
        }
      },
    },
  ],
});

// Start the server
server.listen(3004, () => {
  console.log('BUPZO MCP server running on port 3004');
});