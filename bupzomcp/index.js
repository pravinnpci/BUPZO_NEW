require('dotenv').config();
const { MCPServer } = require('@modelcontextprotocol/sdk');
const { Pool } = require('pg');

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Define MCP Server tools
const tools = {
  get_shipping_rates: {
    description: 'Calculates shipping rates across multiple aggregators',
    parameters: {
      type: 'object',
      properties: {
        pincode: { type: 'string' },
        weight: { type: 'number' },
      },
      required: ['pincode', 'weight'],
    },
    execute: async ({ pincode, weight }) => {
      try {
        // Mock logic for shipping rates
        return {
          success: true,
          rates: [
            { provider: 'Shiprocket', cost: 100, estimatedDelivery: '3-5 days' },
            { provider: 'NimbusPost', cost: 120, estimatedDelivery: '5-7 days' },
            { provider: 'Delhivery', cost: 90, estimatedDelivery: '2-4 days' }
          ]
        };
      } catch (error) {
        console.error('Error fetching shipping rates:', error);
        throw new Error('Failed to fetch shipping rates');
      }
    },
  },
  get_bupzo_orders: {
    description: 'Fetches real order status from the PostgreSQL database',
    parameters: {
      type: 'object',
      properties: {
        user_id: { type: 'number' },
      },
      required: ['user_id'],
    },
    execute: async ({ user_id }) => {
      try {
        const query = 'SELECT * FROM orders WHERE user_id = $1';
        const { rows } = await pool.query(query, [user_id]);
        return { success: true, orders: rows };
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
      }
    },
  },
  send_whatsapp_update: {
    description: 'Triggers WhatsApp API to send updates',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        phone: { type: 'string' },
      },
      required: ['message', 'phone'],
    },
    execute: async ({ message, phone }) => {
      try {
        // Mock WhatsApp API call
        console.log(`Sending WhatsApp message to ${phone}: ${message}`);
        return { success: true, message: 'WhatsApp update sent' };
      } catch (error) {
        console.error('Error sending WhatsApp update:', error);
        throw new Error('Failed to send WhatsApp update');
      }
    },
  },
  get_product_recommendations: {
    description: 'Fetches personalized product recommendations based on user history',
    parameters: {
      type: 'object',
      properties: {
        user_id: { type: 'number' },
      },
      required: ['user_id'],
    },
    execute: async ({ user_id }) => {
      try {
        const query = `
          SELECT p.id, p.name, p.price, p.image_url
          FROM products p
          JOIN product_views pv ON p.id = pv.product_id
          WHERE pv.user_id = $1
          ORDER BY pv.timestamp DESC
          LIMIT 5;
        `;
        const { rows } = await pool.query(query, [user_id]);
        return { success: true, recommendations: rows };
      } catch (error) {
        console.error('Error fetching product recommendations:', error);
        throw new Error('Failed to fetch product recommendations');
      }
    },
  },
  get_seller_products: {
    description: 'Fetches products for a specific seller',
    parameters: {
      type: 'object',
      properties: {
        seller_id: { type: 'number' },
      },
      required: ['seller_id'],
    },
    execute: async ({ seller_id }) => {
      try {
        const query = 'SELECT * FROM products WHERE seller_id = $1';
        const { rows } = await pool.query(query, [seller_id]);
        return { success: true, products: rows };
      } catch (error) {
        console.error('Error fetching seller products:', error);
        throw new Error('Failed to fetch seller products');
      }
    },
  },
  get_banner_images: {
    description: 'Fetches active banner images for the homepage',
    parameters: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      try {
        const query = 'SELECT * FROM banners WHERE is_active = TRUE';
        const { rows } = await pool.query(query);
        return { success: true, banners: rows };
      } catch (error) {
        console.error('Error fetching banner images:', error);
        throw new Error('Failed to fetch banner images');
      }
    },
  },
  get_flash_sale_products: {
    description: 'Fetches active flash sale products',
    parameters: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      try {
        const query = `
          SELECT p.id, p.name, p.price, fs.discount_percent, p.image_url
          FROM products p
          JOIN flash_sales fs ON p.id = fs.product_id
          WHERE fs.start_time < NOW() AND fs.end_time > NOW();
        `;
        const { rows } = await pool.query(query);
        return { success: true, products: rows };
      } catch (error) {
        console.error('Error fetching flash sale products:', error);
        throw new Error('Failed to fetch flash sale products');
      }
    },
  },
  get_spin_win_reward: {
    description: 'Logic for daily spin & win',
    parameters: {
      type: 'object',
      properties: {
        user_id: { type: 'number' },
      },
      required: ['user_id'],
    },
    execute: async ({ user_id }) => {
      try {
        // Generate a random reward
        const rewards = [
          { type: 'DISCOUNT', value: 10, description: '10% Discount' },
          { type: 'CASHBACK', value: 50, description: '₹50 Cashback' },
          { type: 'FREE_SHIPPING', value: 0, description: 'Free Shipping' },
        ];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

        // Insert into spin_win_rewards table
        const insertQuery = `
          INSERT INTO spin_win_rewards (user_id, reward_type, reward_value)
          VALUES ($1, $2, $3)
          RETURNING id, user_id, reward_type, reward_value;
        `;
        const { rows } = await pool.query(insertQuery, [
          user_id,
          randomReward.type,
          randomReward.value
        ]);

        return {
          success: true,
          reward: {
            id: rows[0].id,
            type: randomReward.type,
            value: randomReward.value,
            description: randomReward.description
          }
        };
      } catch (error) {
        console.error('Error generating spin win reward:', error);
        throw new Error('Failed to generate spin win reward');
      }
    },
  },
};

// Initialize MCP Server
const server = new MCPServer({
  port: process.env.MCP_PORT || 3004,
  tools,
});

server.listen().then(() => {
  console.log(`MCP Server running on port ${process.env.MCP_PORT || 3004}`);
});