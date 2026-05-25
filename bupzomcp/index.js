const { Pool } = require('pg');
const Redis = require('ioredis');
const axios = require('axios');

// Database connection pool
const pool = new Pool({
  user: 'bupzo_user',
  host: 'db',
  database: 'bupzo_db',
  password: 'bupzo_password',
  port: 5432,
});

// Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Connection event listeners
pool.on('connect', () => {
  console.log('PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Initialize MCP server
const mcp = require('@modelcontextprotocol/server');
const { getGenerativeModel } = require('./agent');

const server = mcp.createServer({
  model: getGenerativeModel(),
  tools: [
    {
      name: 'get_bupzo_orders',
      description: 'Get orders from BUPZO database',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'User ID' },
          status: { type: 'string', description: 'Order status (optional)' },
        },
        required: ['user_id'],
      },
      execute: async ({ user_id, status }) => {
        try {
          const query = `
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
            ${status ? 'AND o.status = $2' : ''}
            GROUP BY o.id
            ORDER BY o.created_at DESC
          `;

          const params = [user_id];
          if (status) params.push(status);

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
          console.error('Error fetching orders:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    {
      name: 'get_wallet_balance',
      description: 'Get a user\'s wallet balance from the database',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'User ID' },
        },
        required: ['user_id'],
      },
      execute: async ({ user_id }) => {
        try {
          const query = `
            SELECT balance
            FROM wallets
            WHERE user_id = $1
          `;

          const { rows } = await pool.query(query, [user_id]);

          if (rows.length === 0) {
            return {
              success: false,
              error: 'Wallet not found for user'
            };
          }

          return {
            success: true,
            balance: parseFloat(rows[0].balance)
          };
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    {
      name: 'apply_coupon',
      description: 'Apply a coupon to an order and calculate the discounted amount',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'User ID' },
          coupon_code: { type: 'string', description: 'Coupon code' },
          order_amount: { type: 'number', description: 'Original order amount' },
        },
        required: ['user_id', 'coupon_code', 'order_amount'],
      },
      execute: async ({ user_id, coupon_code, order_amount }) => {
        try {
          // Check if coupon exists and is valid
          const couponQuery = `
            SELECT code, discount_percent, is_premium_only, expiry_date, used_count, usage_limit
            FROM coupons
            WHERE code = $1
          `;

          const { rows: couponRows } = await pool.query(couponQuery, [coupon_code]);

          if (couponRows.length === 0) {
            return {
              success: false,
              error: 'Coupon not found'
            };
          }

          const coupon = couponRows[0];

          // Check if coupon is premium only and user is not premium
          const userQuery = `
            SELECT is_premium
            FROM users
            WHERE id = $1
          `;

          const { rows: userRows } = await pool.query(userQuery, [user_id]);

          if (userRows.length === 0) {
            return {
              success: false,
              error: 'User not found'
            };
          }

          const user = userRows[0];

          if (coupon.is_premium_only && !user.is_premium) {
            return {
              success: false,
              error: 'This coupon is for premium users only'
            };
          }

          // Check if coupon is expired
          const today = new Date().toISOString().split('T')[0];
          if (coupon.expiry_date && coupon.expiry_date < today) {
            return {
              success: false,
              error: 'Coupon has expired'
            };
          }

          // Check if coupon has reached usage limit
          if (coupon.used_count >= coupon.usage_limit) {
            return {
              success: false,
              error: 'Coupon has reached its usage limit'
            };
          }

          // Calculate discounted amount
          const discount = (order_amount * coupon.discount_percent) / 100;
          const discountedAmount = order_amount - discount;

          // Return the result
          return {
            success: true,
            original_amount: order_amount,
            discount_amount: discount,
            discounted_amount: discountedAmount,
            coupon_code: coupon.code,
            discount_percent: coupon.discount_percent
          };
        } catch (error) {
          console.error('Error applying coupon:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    {
      name: 'get_cached_value',
      description: 'Get a value from Redis cache',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Cache key' },
        },
        required: ['key'],
      },
      execute: async ({ key }) => {
        try {
          const value = await redis.get(key);
          return {
            success: true,
            value: value
          };
        } catch (error) {
          console.error('Error getting cached value:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    {
      name: 'get_shipping_rates',
      description: 'Get shipping rates for an order',
      parameters: {
        type: 'object',
        properties: {
          weight_grams: { type: 'number', description: 'Total weight of the order in grams' },
          pincode: { type: 'string', description: 'Destination pincode' },
          is_premium: { type: 'boolean', description: 'Whether the user is premium' },
        },
        required: ['weight_grams', 'pincode', 'is_premium'],
      },
      execute: async ({ weight_grams, pincode, is_premium }) => {
        // Mock shipping rates based on weight and pincode
        const baseRate = Math.max(50, weight_grams / 100) * 10;
        const premiumDiscount = is_premium ? 0.1 : 0;

        const rates = [
          {
            partner: 'Shiprocket',
            cost: baseRate * 0.9,
            delivery_time: '3-5 days',
            tracking: true
          },
          {
            partner: 'NimbusPost',
            cost: baseRate * 0.95,
            delivery_time: '4-6 days',
            tracking: true
          },
          {
            partner: 'Delhivery',
            cost: baseRate * 0.85,
            delivery_time: '5-7 days',
            tracking: true
          }
        ];

        // Apply premium discount
        const discountedRates = rates.map(rate => ({
          ...rate,
          cost: rate.cost * (1 - premiumDiscount)
        }));

        return {
          success: true,
          rates: discountedRates
        };
      }
    },
    {
      name: 'send_whatsapp_update',
      description: 'Send WhatsApp update using Meta Cloud API',
      parameters: {
        type: 'object',
        properties: {
          phone_number: { type: 'string', description: 'Recipient phone number' },
          message: { type: 'string', description: 'Message to send' },
        },
        required: ['phone_number', 'message'],
      },
      execute: async ({ phone_number, message }) => {
        try {
          // In a real implementation, this would make an HTTP request to Meta Cloud API
          // For now, we'll simulate the API call
          console.log(`[WhatsApp] Sending to ${phone_number}: ${message}`);

          // Mock API response
          const mockResponse = {
            messaging_product: "whatsapp",
            contacts: [{
              input: phone_number,
              wa_id: phone_number
            }],
            statuses: [{
              recipient_id: phone_number,
              id: "wamid.IN." + phone_number.replace(/\D/g, ''),
              status: "sent"
            }]
          };

          return {
            success: true,
            message: `Message sent to ${phone_number} via WhatsApp`,
            response: mockResponse
          };
        } catch (error) {
          console.error('Error sending WhatsApp message:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    {
      name: 'send_push_notification',
      description: 'Send push notification using Firebase Cloud Messaging',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'User ID' },
          title: { type: 'string', description: 'Notification title' },
          body: { type: 'string', description: 'Notification body' },
        },
        required: ['user_id', 'title', 'body'],
      },
      execute: async ({ user_id, title, body }) => {
        try {
          // In a real implementation, this would make an HTTP request to Firebase FCM
          // For now, we'll simulate the API call

          // Get user's phone number from database
          const userQuery = `
            SELECT phone_number
            FROM users
            WHERE id = $1
          `;

          const { rows: userRows } = await pool.query(userQuery, [user_id]);

          if (userRows.length === 0) {
            return {
              success: false,
              error: 'User not found'
            };
          }

          const phoneNumber = userRows[0].phone_number;

          // Mock FCM API response
          console.log(`[Push Notification] Sending to user ${user_id} (${phoneNumber}): ${title} - ${body}`);

          const mockResponse = {
            multicast_id: user_id,
            success: 1,
            failure: 0,
            canonical_ids: 0,
            results: [{
              message_id: user_id + Date.now(),
              error: null
            }]
          };

          return {
            success: true,
            message: `Push notification sent to user ${user_id}`,
            response: mockResponse
          };
        } catch (error) {
          console.error('Error sending push notification:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }
    },
    {
      name: 'find_products',
      description: 'Find products in BUPZO database',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          category_id: { type: 'string', description: 'Category ID (optional)' },
          price_min: { type: 'number', description: 'Minimum price (optional)' },
          price_max: { type: 'number', description: 'Maximum price (optional)' },
          is_combo: { type: 'boolean', description: 'Filter by combo products (optional)' },
          seller_id: { type: 'string', description: 'Filter by seller ID (optional)' },
          sort_by: { type: 'string', description: 'Sort by (new_arrivals, price_asc, price_desc) (optional)' },
        },
        required: ['query'],
      },
      execute: async ({ query, category_id, price_min, price_max, is_combo, seller_id, sort_by }) => {
        try {
          let sql = `
            SELECT id, name, description, price, weight_grams, image_url, is_combo, category_id, seller_id
            FROM products
            WHERE name ILIKE $1
            OR description ILIKE $1
          `;

          const params = [`%${query}%`];
          let paramIndex = 2;

          if (category_id) {
            sql += ` AND category_id = $${paramIndex}`;
            params.push(category_id);
            paramIndex++;
          }

          if (seller_id) {
            sql += ` AND seller_id = $${paramIndex}`;
            params.push(seller_id);
            paramIndex++;
          }

          if (is_combo !== undefined) {
            sql += ` AND is_combo = $${paramIndex}`;
            params.push(is_combo);
            paramIndex++;
          }

          if (price_min !== undefined) {
            sql += ` AND price >= $${paramIndex}`;
            params.push(price_min);
            paramIndex++;
          }

          if (price_max !== undefined) {
            sql += ` AND price <= $${paramIndex}`;
            params.push(price_max);
            paramIndex++;
          }

          if (sort_by) {
            if (sort_by === 'new_arrivals') {
              sql += ' ORDER BY created_at DESC';
            } else if (sort_by === 'price_asc') {
              sql += ' ORDER BY price ASC';
            } else if (sort_by === 'price_desc') {
              sql += ' ORDER BY price DESC';
            }
          } else {
            sql += ' ORDER BY created_at DESC';
          }

          const { rows } = await pool.query(sql, params);

          return {
            success: true,
            products: rows.map(row => ({
              id: row.id,
              name: row.name,
              description: row.description,
              price: parseFloat(row.price),
              weight_grams: row.weight_grams,
              image_url: row.image_url,
              is_combo: row.is_combo,
              category_id: row.category_id,
              seller_id: row.seller_id
            }))
          };
        } catch (error) {
          console.error('Error finding products:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }
    }
  ]
});

// Start the server
server.listen(3004, () => {
  console.log('MCP server running on port 3004');
});