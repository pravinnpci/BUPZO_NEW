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
      // Logic to fetch shipping rates from aggregators
      return { rates: [{ provider: 'Shiprocket', cost: 100 }, { provider: 'NimbusPost', cost: 120 }] };
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
      const query = 'SELECT * FROM orders WHERE user_id = $1';
      const { rows } = await pool.query(query, [user_id]);
      return { orders: rows };
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
      // Logic to send WhatsApp message
      return { success: true, message: 'WhatsApp update sent' };
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
      const query = `
        SELECT p.id, p.name, p.price
        FROM products p
        JOIN product_views pv ON p.id = pv.product_id
        WHERE pv.user_id = $1
        ORDER BY pv.timestamp DESC
        LIMIT 5;
      `;
      const { rows } = await pool.query(query, [user_id]);
      return { recommendations: rows };
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
      const query = 'SELECT * FROM products WHERE seller_id = $1';
      const { rows } = await pool.query(query, [seller_id]);
      return { products: rows };
    },
  },
  get_banner_images: {
    description: 'Fetches active banner images for the homepage',
    parameters: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      const query = 'SELECT * FROM banners WHERE is_active = TRUE';
      const { rows } = await pool.query(query);
      return { banners: rows };
    },
  },
  get_flash_sale_products: {
    description: 'Fetches active flash sale products',
    parameters: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      const query = `
        SELECT p.id, p.name, p.price, fs.discount_percent
        FROM products p
        JOIN flash_sales fs ON p.id = fs.product_id
        WHERE fs.start_time < NOW() AND fs.end_time > NOW();
      `;
      const { rows } = await pool.query(query);
      return { products: rows };
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
      // Logic for spin & win rewards
      return { reward: { type: 'DISCOUNT', value: 10 } };
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